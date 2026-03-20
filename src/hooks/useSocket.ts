"use client";

import { useSocketContext } from "@/providers/SocketProvider";
import type { JoinGamePayload, SubmitAnswerPayload } from "@/types/game";

export function useSocket() {
  const { socket, isConnected } = useSocketContext();

  const joinGameAsHost = (gameId: string) => {
    if (!socket) return;
    console.log("🎮 Joining game as host (observer):", gameId);
    socket.emit("join-game-as-host", { gameId });
  };

  const joinGame = (gameId: string, address: string, nickname: string) => {
    if (!socket) return;

    const payload: JoinGamePayload = {
      gameId,
      address,
      nickname,
    };

    socket.emit("join-game", payload);
  };

  const leaveGame = (gameId: string) => {
    if (!socket) return;
    console.log("🚪 Leaving game room:", gameId);
    socket.emit("leave-game", { gameId });
  };

  const submitAnswer = (gameId: string, questionIndex: number, answerIndex: number) => {
    if (!socket) return;

    const payload: SubmitAnswerPayload = {
      gameId,
      questionIndex,
      answerIndex,
    };

    socket.emit("submit-answer", payload);
  };

  const startGame = (gameId: string, questions: any[], prizePool?: number) => {
    if (!socket) return;
    console.log(`🎮 Starting game ${gameId} with ${questions.length} questions, prize pool: ${prizePool || 0} microSTX`);
    socket.emit("start-game", { gameId, questions, prizePool });
  };

  const finalizeGame = (gameId: string) => {
    if (!socket) return;
    socket.emit("finalize-game", { gameId });
  };

  const nextQuestion = (gameId: string) => {
    if (!socket) return;
    console.log("Emitting next-question for game:", gameId);
    socket.emit("next-question", { gameId });
  };

  return {
    socket,
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
