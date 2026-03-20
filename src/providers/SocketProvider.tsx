"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "@/stores/gameStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create single persistent socket connection
    console.log("🔌 Creating persistent socket connection to:", SOCKET_URL);
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    // Register all game event handlers at provider level
    // so they persist across page navigations

    socket.on("game-state", ({ game, players }: any) => {
      console.log("Received game state:", game, players);
      const store = useGameStore.getState();
      store.setPlayers(
        players.map((p: any) => ({
          address: p.address,
          nickname: p.nickname,
          score: p.score || 0,
          answers: p.answers || [],
          connected: p.connected !== false,
          socketId: p.socketId || "",
        }))
      );
      if (game.status) {
        store.setGameStatus(game.status);
      }
    });

    socket.on("player-joined", (payload: any) => {
      console.log("Player joined:", payload);
      if (payload.players) {
        useGameStore.getState().setPlayers(
          payload.players.map((p: any) => ({
            address: p.address,
            nickname: p.nickname,
            score: p.score || 0,
            answers: p.answers || [],
            connected: p.connected !== false,
            socketId: p.socketId || "",
          }))
        );
      }
    });

    socket.on("player-left", ({ socketId, nickname }: any) => {
      console.log("Player left:", nickname || socketId);
      // Server sends socketId, not address — find and remove by socketId
      const store = useGameStore.getState();
      const updatedPlayers = store.players.filter((p) => p.socketId !== socketId);
      store.setPlayers(updatedPlayers);
    });

    socket.on("game-started", ({ totalQuestions }: { totalQuestions: number }) => {
      console.log("Game started with", totalQuestions, "questions");
      useGameStore.getState().setGameStatus("active");
    });

    socket.on("question-start", (payload: any) => {
      console.log("Question started:", payload);
      const store = useGameStore.getState();
      store.setGameStatus("question");
      store.setCurrentQuestion(
        {
          ...payload.question,
          correctIndex: 0, // Will be revealed later
        },
        payload.questionIndex,
        payload.startTime
      );
    });

    socket.on("question-end", (payload: any) => {
      console.log("Question ended:", payload);
      const store = useGameStore.getState();
      store.setGameStatus("results");
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
      useGameStore.getState().updateLeaderboard(payload.leaderboard || payload.rankings || []);
    });

    socket.on("game-finished", (payload: any) => {
      console.log("Game finished:", payload);
      const store = useGameStore.getState();
      store.setGameStatus("finished");
      store.setWinners(payload.winners);
      store.updateLeaderboard(payload.finalRankings || []);
    });

    socket.on("error", ({ message }: { message: string }) => {
      console.error("Socket error:", message);
    });

    // Only disconnect when the entire app unmounts (browser close/refresh)
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
}
