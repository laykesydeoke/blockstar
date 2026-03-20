"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "@/stores/gameStore";
import type {
  JoinGamePayload,
  SubmitAnswerPayload,
  PlayerJoinedPayload,
  QuestionStartPayload,
  QuestionEndPayload,
  LeaderboardUpdatePayload,
  GameFinishedPayload,
} from "@/types/game";

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const {
    addPlayer,
    removePlayer,
    setCurrentQuestion,
    updateLeaderboard,
    setGameStatus,
    setWinners,
    setPlayers,
  } = useGameStore();

  useEffect(() => {
    // Prevent duplicate connections
    if (socketRef.current?.connected) {
      console.log("Socket already connected, skipping initialization");
      return;
    }

    // Initialize socket connection
    console.log("🔌 Initializing socket connection...");
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    // Game events
    socket.on("game-state", ({ game, players }: any) => {
      console.log("Received game state:", game, players);
      // game-state is the source of truth for player list
      setPlayers(players.map((p: any) => ({
        address: p.address,
        nickname: p.nickname,
        score: p.score || 0,
        answers: p.answers || [],
        connected: p.connected !== false,
        socketId: p.socketId || "",
      })));

      if (game.status) {
        setGameStatus(game.status);
      }
    });

    socket.on("player-joined", (payload: any) => {
      console.log("Player joined:", payload);
      // Update the full player list when a player joins for real-time updates
      if (payload.players) {
        setPlayers(payload.players.map((p: any) => ({
          address: p.address,
          nickname: p.nickname,
          score: p.score || 0,
          answers: p.answers || [],
          connected: p.connected !== false,
          socketId: p.socketId || "",
        })));
      }
    });

    socket.on("player-left", ({ address }: { address: string }) => {
      console.log("Player left:", address);
      removePlayer(address);
    });

    socket.on("game-started", ({ totalQuestions }: { totalQuestions: number }) => {
      console.log("Game started with", totalQuestions, "questions");
      setGameStatus("active");
    });

    socket.on("question-start", (payload: any) => {
      console.log("Question started:", payload);
      setGameStatus("question");
      setCurrentQuestion(
        {
          ...payload.question,
          correctIndex: 0, // Will be revealed later
        },
        payload.questionIndex,
        payload.startTime // Pass server timestamp for synchronized timers
      );
    });

    socket.on("question-end", (payload: QuestionEndPayload) => {
      console.log("Question ended:", payload);
      setGameStatus("results");
      // Update the store with the correct answer index
      // The store needs to update the current question's correctIndex
      const store = useGameStore.getState();
      if (store.currentQuestion) {
        store.setCurrentQuestion(
          {
            ...store.currentQuestion,
            correctIndex: payload.correctIndex as 0 | 1 | 2 | 3,
          },
          store.currentQuestionIndex
        );
      }
    });

    socket.on("leaderboard-update", (payload: any) => {
      console.log("Leaderboard updated:", payload);
      // Server sends "leaderboard" not "rankings"
      updateLeaderboard(payload.leaderboard || payload.rankings || []);
    });

    socket.on("game-finished", (payload: GameFinishedPayload) => {
      console.log("Game finished:", payload);
      setGameStatus("finished");
      setWinners(payload.winners);
      updateLeaderboard(payload.finalRankings || []);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.error("Socket error:", message);
      // Handle error (could emit to a global error state)
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [addPlayer, removePlayer, setCurrentQuestion, updateLeaderboard, setGameStatus, setWinners, setPlayers]);

  // Socket action functions
  const joinGameAsHost = (gameId: string) => {
    if (!socketRef.current) return;
    console.log("🎮 Joining game as host (observer):", gameId);
    socketRef.current.emit("join-game-as-host", { gameId });
  };

  const joinGame = (gameId: string, address: string, nickname: string) => {
    if (!socketRef.current) return;

    const payload: JoinGamePayload = {
      gameId,
      address,
      nickname,
    };

    socketRef.current.emit("join-game", payload);
  };

  const leaveGame = (gameId: string) => {
    if (!socketRef.current) return;
    console.log("🚪 Leaving game room:", gameId);
    socketRef.current.emit("leave-game", { gameId });
  };

  const submitAnswer = (gameId: string, questionIndex: number, answerIndex: number) => {
    if (!socketRef.current) return;

    const payload: SubmitAnswerPayload = {
      gameId,
      questionIndex,
      answerIndex,
    };

    socketRef.current.emit("submit-answer", payload);
  };

  const startGame = (gameId: string, questions: any[], prizePool?: number) => {
    if (!socketRef.current) return;
    console.log(`🎮 Starting game ${gameId} with ${questions.length} questions, prize pool: ${prizePool || 0} microSTX`);
    socketRef.current.emit("start-game", { gameId, questions, prizePool });
  };

  const finalizeGame = (gameId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("finalize-game", { gameId });
  };

  const nextQuestion = (gameId: string) => {
    if (!socketRef.current) return;
    console.log("Emitting next-question for game:", gameId);
    socketRef.current.emit("next-question", { gameId });
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinGameAsHost,
    joinGame,
    leaveGame,
    submitAnswer,
    startGame,
    finalizeGame,
    nextQuestion,
  };
}
