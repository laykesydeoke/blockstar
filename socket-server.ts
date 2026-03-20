import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Simplified types for standalone server
interface Player {
  socketId: string;
  address: string;
  nickname: string;
  score: number;
  isReady: boolean;
  answers?: number[]; // Track answers for each question
  isObserver?: boolean; // Flag for host/display observers who don't play
  prize?: number; // Prize amount in microSTX (for winners)
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

interface Game {
  id: string;
  hostSocketId: string;
  status: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  leaderboard: Player[];
  prizePool?: number; // Total prize pool in microSTX
  questionStartTime?: number; // Server timestamp when current question started
}

interface JoinGamePayload {
  gameId: string;
  address: string;
  nickname: string;
}

interface SubmitAnswerPayload {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}

interface StartGamePayload {
  gameId: string;
  questions: Question[];
  prizePool?: number; // Total prize pool in microSTX
}

interface FinalizeGamePayload {
  gameId: string;
  winners: any[];
}

const port = parseInt(process.env.PORT || "3001", 10);

// In-memory game state
const games = new Map<string, Game>();

// Helper functions
function calculatePoints(timeRemaining: number, totalTime: number): number {
  const basePoints = 1000;
  const speedBonus = Math.floor(500 * (timeRemaining / totalTime));
  return basePoints + speedBonus;
}

function getTopPlayers(players: Player[], count: number = 3): Player[] {
  return [...players].sort((a, b) => b.score - a.score).slice(0, count);
}

// Calculate prize distribution for winners (50/30/20 split)
function calculatePrizes(prizePool: number, winners: Player[]) {
  if (winners.length < 3) {
    console.warn(`⚠️ Not enough winners (${winners.length}/3) to calculate prizes`);
    return winners;
  }

  const firstPrize = Math.floor(prizePool * 0.5);  // 50%
  const secondPrize = Math.floor(prizePool * 0.3); // 30%
  const thirdPrize = Math.floor(prizePool * 0.2);  // 20%

  return [
    { ...winners[0], prize: firstPrize },
    { ...winners[1], prize: secondPrize },
    { ...winners[2], prize: thirdPrize },
  ];
}

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", games: games.size }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("BlockStar Socket.io Server");
});

// Create Socket.io server with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

console.log("🚀 Socket.io server starting...");
console.log("📡 Allowed origin:", process.env.FRONTEND_URL || "*");

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Join game room as host (observer only, not a player)
  socket.on("join-game-as-host", ({ gameId }: { gameId: string }) => {
    console.log(`🎮 Observer joining game room ${gameId}`);
    socket.join(gameId);

    let game = games.get(gameId);
    if (!game) {
      // Create new game if it doesn't exist
      game = {
        id: gameId,
        hostSocketId: socket.id,
        status: "waiting",
        players: [],
        questions: [],
        currentQuestionIndex: 0,
        leaderboard: [],
      };
      games.set(gameId, game);
    } else {
      // Update host socket ID if game already exists
      game.hostSocketId = socket.id;
    }

    // Send current game state to observer (only real players, not observers)
    const realPlayers = game.players.filter(p => !p.isObserver);
    socket.emit("game-state", {
      game: {
        id: game.id,
        status: game.status,
        currentQuestionIndex: game.currentQuestionIndex,
      },
      players: realPlayers,
    });

    console.log(`✅ Observer joined game ${gameId}`);
  });

  // Join game room
  socket.on("join-game", ({ gameId, address, nickname }: JoinGamePayload) => {
    console.log(`👤 ${nickname} joining game ${gameId}`);

    socket.join(gameId);

    let game = games.get(gameId);
    if (!game) {
      // Create new game if it doesn't exist
      game = {
        id: gameId,
        hostSocketId: socket.id,
        status: "waiting",
        players: [],
        questions: [],
        currentQuestionIndex: 0,
        leaderboard: [],
      };
      games.set(gameId, game);
    }

    // Add or update player
    const existingPlayerIndex = game.players.findIndex((p) => p.address === address);
    if (existingPlayerIndex >= 0) {
      game.players[existingPlayerIndex].socketId = socket.id;
      game.players[existingPlayerIndex].nickname = nickname;
    } else {
      game.players.push({
        socketId: socket.id,
        address,
        nickname,
        score: 0,
        isReady: false,
      });
    }

    // Emit current game state to the joining player (only real players, not observers)
    const realPlayers = game.players.filter(p => !p.isObserver);
    socket.emit("game-state", {
      game: {
        id: game.id,
        status: game.status,
        currentQuestionIndex: game.currentQuestionIndex,
      },
      players: realPlayers,
    });

    // Notify all players in the room (including host/observers) with updated real player list
    io.to(gameId).emit("player-joined", {
      player: game.players[game.players.length - 1],
      totalPlayers: realPlayers.length,
      players: realPlayers, // Send only real players for real-time updates
    });

    console.log(`✅ Player joined: ${nickname} (${realPlayers.length} real players, ${game.players.length} total)`);
  });

  // Leave game room
  socket.on("leave-game", ({ gameId }) => {
    console.log(`👋 Client leaving game ${gameId}`);
    socket.leave(gameId);

    const game = games.get(gameId);
    if (game) {
      game.players = game.players.filter((p) => p.socketId !== socket.id);
      io.to(gameId).emit("player-left", {
        socketId: socket.id,
        remainingPlayers: game.players.length,
      });
    }
  });

  // Start game
  socket.on("start-game", ({ gameId, questions, prizePool }: StartGamePayload) => {
    console.log(`🎮 Starting game ${gameId} with ${questions.length} questions, prize pool: ${prizePool || 0} microSTX`);

    const game = games.get(gameId);
    if (!game) {
      console.error(`❌ Game ${gameId} not found`);
      return;
    }

    game.questions = questions;
    game.prizePool = prizePool || 0; // Store prize pool
    game.status = "active";
    game.currentQuestionIndex = 0;

    // Start first question
    const firstQuestion = questions[0];
    game.status = "question";

    io.to(gameId).emit("game-started", {
      totalQuestions: questions.length,
    });

    // Send question with server timestamp for synchronized timers
    const startTime = Date.now();
    game.questionStartTime = startTime; // Store for calculating time remaining
    io.to(gameId).emit("question-start", {
      question: firstQuestion,
      questionIndex: 0,
      totalQuestions: questions.length,
      startTime, // Server timestamp when question started
    });

    console.log(`✅ Game ${gameId} started - Question 1 at ${startTime}`);
  });

  // Submit answer
  socket.on("submit-answer", ({ gameId, questionIndex, answerIndex }: SubmitAnswerPayload) => {
    const game = games.get(gameId);
    if (!game) return;

    const player = game.players.find((p) => p.socketId === socket.id);
    if (!player) return;

    const question = game.questions[questionIndex];
    if (!question) return;

    // Mark player as answered (track answers per question)
    if (!player.answers) player.answers = [];
    player.answers[questionIndex] = answerIndex;

    const isCorrect = answerIndex === question.correctIndex;

    // Calculate time remaining based on server start time
    const questionStartTime = game.questionStartTime || Date.now();
    const timeElapsed = (Date.now() - questionStartTime) / 1000;
    const timeRemaining = Math.max(0, question.timeLimit - timeElapsed);

    if (isCorrect) {
      const basePoints = 1000;
      const speedBonus = Math.floor(500 * (timeRemaining / question.timeLimit));
      const points = basePoints + speedBonus;
      player.score += points;

      // Store last question performance for display
      (player as any).lastQuestionPoints = points;
      (player as any).lastQuestionBase = basePoints;
      (player as any).lastQuestionBonus = speedBonus;

      console.log(`✅ Correct answer from ${player.nickname}: ${basePoints} base + ${speedBonus} speed = ${points} points`);
    } else {
      (player as any).lastQuestionPoints = 0;
      (player as any).lastQuestionBase = 0;
      (player as any).lastQuestionBonus = 0;
      console.log(`❌ Wrong answer from ${player.nickname}`);
    }

    // Update leaderboard and check if all players answered (only real players, not observers)
    const realPlayers = game.players.filter(p => !p.isObserver);
    game.leaderboard = getTopPlayers(realPlayers);

    io.to(gameId).emit("leaderboard-update", {
      leaderboard: game.leaderboard.map((p) => ({
        address: p.address,
        nickname: p.nickname,
        score: p.score,
        lastQuestionPoints: (p as any).lastQuestionPoints || 0,
        lastQuestionBase: (p as any).lastQuestionBase || 0,
        lastQuestionBonus: (p as any).lastQuestionBonus || 0,
      })),
    });

    // Check if all REAL players have answered
    const playersAnswered = realPlayers.filter(p => p.answers && p.answers[questionIndex] !== undefined).length;
    console.log(`📊 Players answered: ${playersAnswered}/${realPlayers.length} (total in game: ${game.players.length})`);

    if (playersAnswered === realPlayers.length && realPlayers.length > 0) {
      // All real players answered, show results
      game.status = "results";
      io.to(gameId).emit("question-end", {
        correctIndex: question.correctIndex,
        leaderboard: game.leaderboard,
      });
      console.log(`✅ All ${realPlayers.length} players answered question ${questionIndex + 1}, showing results`);
    }
  });

  // Next question
  socket.on("next-question", ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;

    game.currentQuestionIndex++;

    if (game.currentQuestionIndex >= game.questions.length) {
      // Game finished - get top 3 from real players only
      game.status = "finished";
      const realPlayers = game.players.filter(p => !p.isObserver);
      const topPlayers = getTopPlayers(realPlayers, 3);

      // Calculate prizes based on prize pool
      const winnersWithPrizes = calculatePrizes(game.prizePool || 0, topPlayers);

      io.to(gameId).emit("game-finished", {
        winners: winnersWithPrizes.map((p) => ({
          address: p.address,
          nickname: p.nickname,
          score: p.score,
          prize: p.prize,
        })),
        finalRankings: game.leaderboard,
      });

      console.log(`🏁 Game ${gameId} finished. Winners:`, winnersWithPrizes.map(w => `${w.nickname}: ${w.prize} microSTX`));
    } else {
      // Send next question with server timestamp
      game.status = "question"; // Change status back to question
      const nextQuestion = game.questions[game.currentQuestionIndex];
      const startTime = Date.now();
      game.questionStartTime = startTime; // Store for calculating time remaining
      io.to(gameId).emit("question-start", {
        question: nextQuestion,
        questionIndex: game.currentQuestionIndex,
        totalQuestions: game.questions.length,
        startTime, // Server timestamp for synchronized timers
      });

      console.log(`➡️ Game ${gameId} - Question ${game.currentQuestionIndex + 1} at ${startTime}`);
    }
  });

  // Finalize game (distribute prizes)
  socket.on("finalize-game", ({ gameId, winners }: FinalizeGamePayload) => {
    console.log(`💰 Finalizing game ${gameId} - distributing prizes`);

    io.to(gameId).emit("prizes-distributed", {
      winners,
    });

    // Clean up game after some time
    setTimeout(() => {
      games.delete(gameId);
      console.log(`🗑️ Game ${gameId} cleaned up`);
    }, 60000); // 1 minute
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);

    // Remove player from all games
    games.forEach((game, gameId) => {
      const playerIndex = game.players.findIndex((p) => p.socketId === socket.id);
      if (playerIndex >= 0) {
        const player = game.players[playerIndex];
        game.players.splice(playerIndex, 1);

        io.to(gameId).emit("player-left", {
          socketId: socket.id,
          nickname: player.nickname,
          remainingPlayers: game.players.length,
        });

        console.log(`👋 ${player.nickname} left game ${gameId}`);
      }
    });
  });
});

httpServer.listen(port, () => {
  console.log(`✅ Socket.io server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});
