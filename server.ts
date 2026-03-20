import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import type {
  Game,
  Player,
  Question,
  JoinGamePayload,
  SubmitAnswerPayload,
  StartGamePayload,
  FinalizeGamePayload,
  GameStatus,
} from "./src/types/game";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

// In-memory game state
const games = new Map<string, Game>();

// Helper functions
function calculatePoints(timeRemaining: number, totalTime: number): number {
  const basePoints = 1000;
  const speedBonus = Math.floor(500 * (timeRemaining / totalTime));
  return basePoints + speedBonus;
}

function getLeaderboard(game: Game) {
  const rankings = Array.from(game.players.values())
    .map((player, index) => ({
      address: player.address,
      nickname: player.nickname,
      score: player.score,
      rank: index + 1,
    }))
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  return rankings;
}

function getWinners(game: Game) {
  const sorted = Array.from(game.players.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const firstPrize = Math.floor(game.prizePool * 0.5);
  const secondPrize = Math.floor(game.prizePool * 0.3);
  const thirdPrize = Math.floor(game.prizePool * 0.2);

  return [
    { ...sorted[0], prize: firstPrize },
    { ...sorted[1], prize: secondPrize },
    { ...sorted[2], prize: thirdPrize },
  ];
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Join game
    socket.on("join-game", (payload: JoinGamePayload) => {
      const { gameId, address, nickname } = payload;

      const game = games.get(gameId);

      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      // Check if joining as Host or Display (observers, not players)
      const isObserver = nickname === "Display" || nickname === "Host";

      if (game.status !== "waiting" && !isObserver) {
        socket.emit("error", { message: "Game already started" });
        return;
      }

      // Only add to players map if they are actual players (NOT Host or Display)
      if (!isObserver) {
        // Check if player already exists (prevent duplicates)
        const existingPlayer = game.players.get(address);
        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
          existingPlayer.connected = true;
        } else {
          // Add new player to game
          const player: Player = {
            address,
            nickname,
            score: 0,
            answers: [],
            connected: true,
            socketId: socket.id,
          };
          game.players.set(address, player);

          // Broadcast player-joined only for actual players
          io.to(gameId).emit("player-joined", {
            address,
            nickname,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
          });
        }
      } else {
        // If Host or Display is joining with host address, update socket ID for control verification
        if ((nickname === "Host" || nickname === "Display") && address === game.hostAddress) {
          game.hostSocketId = socket.id;
        } else if (nickname === "Host") {
          // Fallback: Set hostSocketId anyway if someone joined as "Host"
          game.hostSocketId = socket.id;
        }
      }

      // Join the socket.io room to receive events
      socket.join(gameId);

      // Send updated game state to ALL in the room
      const playersList = Array.from(game.players.values()).map((p) => ({
        address: p.address,
        nickname: p.nickname,
        connected: p.connected,
        score: p.score,
        answers: p.answers,
        socketId: p.socketId,
      }));
      io.to(gameId).emit("game-state", {
        game: {
          id: game.id,
          title: game.title,
          status: game.status,
          playerCount: game.players.size,
          prizePool: game.prizePool,
        },
        players: playersList,
      });
    });

    // Leave game
    socket.on("leave-game", ({ gameId }: { gameId: string }) => {
      const game = games.get(gameId);
      if (!game) return;

      const player = Array.from(game.players.values()).find(
        (p) => p.socketId === socket.id
      );

      if (player) {
        player.connected = false;
        io.to(gameId).emit("player-left", { address: player.address });
      }

      socket.leave(gameId);
    });

    // Start game
    socket.on("start-game", ({ gameId }: StartGamePayload) => {
      const game = games.get(gameId);
      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      // Verify sender is host (check socket ID matches)
      if (game.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only host can start game" });
        return;
      }

      if (game.players.size < game.settings.minPlayers) {
        socket.emit("error", {
          message: `Need at least ${game.settings.minPlayers} players`,
        });
        return;
      }

      game.status = "active";
      io.to(gameId).emit("game-started", {
        totalQuestions: game.questions.length,
      });

      // Start first question after 3 second delay
      setTimeout(() => startQuestion(gameId, 0), 3000);
    });

    // Submit answer
    socket.on("submit-answer", (payload: SubmitAnswerPayload) => {
      const { gameId, questionIndex, answerIndex } = payload;
      const game = games.get(gameId);
      if (!game) return;

      const player = Array.from(game.players.values()).find(
        (p) => p.socketId === socket.id
      );
      if (!player) return;

      const question = game.questions[questionIndex];
      if (!question) return;

      // Prevent multiple submissions for the same question
      const alreadyAnswered = player.answers.find(
        (a) => a.questionId === question.id
      );
      if (alreadyAnswered) {
        return;
      }

      const answeredAt = Date.now();
      const timeElapsed = (answeredAt - game.questionStartTime) / 1000;
      const timeRemaining = Math.max(0, question.timeLimit - timeElapsed);
      const correct = answerIndex === question.correctIndex;
      const points = correct ? calculatePoints(timeRemaining, question.timeLimit) : 0;

      // Record answer
      player.answers.push({
        questionId: question.id,
        selectedIndex: answerIndex,
        answeredAt,
        correct,
        pointsEarned: points,
      });

      player.score += points;
    });

    // Next question (manual progression)
    socket.on("next-question", ({ gameId }: { gameId: string }) => {
      const game = games.get(gameId);
      if (!game) {
        socket.emit("error", { message: "Game not found" });
        return;
      }

      // Verify sender is host (check socket ID matches)
      if (game.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only host can advance questions" });
        return;
      }

      const currentIndex = game.currentQuestionIndex;

      if (currentIndex + 1 < game.questions.length) {
        // Move to next question
        startQuestion(gameId, currentIndex + 1);
      } else {
        // No more questions, finish the game
        game.status = "finished";

        const winners = getWinners(game);
        const finalRankings = getLeaderboard(game);

        io.to(gameId).emit("game-finished", {
          winners,
          prizeDistribution: {
            first: winners[0]?.prize || 0,
            second: winners[1]?.prize || 0,
            third: winners[2]?.prize || 0,
          },
          finalRankings,
        });
      }
    });

    // Finalize game
    socket.on("finalize-game", ({ gameId }: FinalizeGamePayload) => {
      const game = games.get(gameId);
      if (!game) return;

      // Verify sender is host (check socket ID matches)
      if (game.hostSocketId !== socket.id) {
        socket.emit("error", { message: "Only host can finalize game" });
        return;
      }

      const winners = getWinners(game);
      const finalRankings = getLeaderboard(game);
      io.to(gameId).emit("game-finished", {
        winners,
        prizeDistribution: {
          first: winners[0].prize,
          second: winners[1].prize,
          third: winners[2].prize,
        },
        finalRankings,
      });

      game.status = "finished";
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      // Mark player as disconnected in all games
      for (const game of games.values()) {
        const player = Array.from(game.players.values()).find(
          (p) => p.socketId === socket.id
        );
        if (player) {
          player.connected = false;
          io.to(game.id).emit("player-left", { address: player.address });
        }
      }
    });
  });

  // Helper function to start a question
  function startQuestion(gameId: string, questionIndex: number) {
    const game = games.get(gameId);
    if (!game) return;

    const question = game.questions[questionIndex];
    if (!question) return;

    game.currentQuestionIndex = questionIndex;
    game.status = "question";
    game.questionStartTime = Date.now();

    // Send question without correct answer to clients
    io.to(gameId).emit("question-start", {
      question: {
        id: question.id,
        text: question.text,
        options: question.options,
        timeLimit: question.timeLimit,
      },
      questionIndex,
      timeLimit: question.timeLimit,
    });

    // End question after time limit
    setTimeout(() => {
      endQuestion(gameId, questionIndex);
    }, question.timeLimit * 1000);
  }

  // Helper function to end a question
  function endQuestion(gameId: string, questionIndex: number) {
    const game = games.get(gameId);
    if (!game) return;

    const question = game.questions[questionIndex];
    if (!question) return;

    game.status = "results";

    // Calculate answer statistics
    const stats: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (const player of game.players.values()) {
      const answer = player.answers.find((a) => a.questionId === question.id);
      if (answer && answer.selectedIndex !== null) {
        stats[answer.selectedIndex]++;
      }
    }

    // Send results
    io.to(gameId).emit("question-end", {
      correctIndex: question.correctIndex,
      stats,
    });

    // Send updated leaderboard
    const leaderboard = getLeaderboard(game);
    io.to(gameId).emit("leaderboard-update", {
      rankings: leaderboard,
    });

    // DO NOT automatically move to next question
    // Host must click "Next Question" button to continue
  }

  // API endpoint to create a game (called from frontend)
  server.on("request", (req, res) => {
    if (req.url?.startsWith("/api/create-game") && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const game: Game = {
            id: data.gameId,
            hostAddress: data.hostAddress,
            hostSocketId: "",
            title: data.title,
            status: "waiting",
            currentQuestionIndex: -1,
            questions: data.questions,
            players: new Map(),
            prizePool: data.prizePool,
            settings: data.settings,
            createdAt: Date.now(),
            questionStartTime: 0,
          };

          games.set(game.id, game);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, gameId: game.id }));
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: "Invalid request" }));
        }
      });
      return;
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server running`);
  });
});
