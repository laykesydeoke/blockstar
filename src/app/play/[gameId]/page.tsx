"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useGameStore } from "@/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Timer } from "@/components/game/Timer";
import { AnswerButtons } from "@/components/game/AnswerButtons";
import { Leaderboard } from "@/components/game/Leaderboard";
import { WinnerReveal } from "@/components/game/WinnerReveal";
import { Users, Trophy, Clock, Zap } from "lucide-react";

export default function PlayerGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const { submitAnswer, isConnected, joinGame, leaveGame } = useSocket();
  const {
    gameStatus,
    currentQuestion,
    currentQuestionIndex,
    questionStartTime,
    leaderboard,
    winners,
    players,
  } = useGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [hasJoined, setHasJoined] = useState(false);

  // Rejoin game room when page loads (player might have navigated here)
  useEffect(() => {
    if (isConnected && gameId && !hasJoined) {
      // Get player info from sessionStorage (set during join flow)
      const playerNickname = sessionStorage.getItem(`player_nickname_${gameId}`);
      const playerAddress = sessionStorage.getItem(`player_address_${gameId}`);

      if (playerNickname && playerAddress) {
        joinGame(gameId, playerAddress, playerNickname);
        setHasJoined(true);
      }
    }
  }, [isConnected, gameId, hasJoined, joinGame]);

  // Reset answer state when new question starts
  useEffect(() => {
    if (gameStatus === "question") {
      setSelectedAnswer(null);
      setHasAnswered(false);
      if (currentQuestion) {
        setTimeRemaining(currentQuestion.timeLimit);
      }
    }
  }, [currentQuestionIndex, gameStatus, currentQuestion]);

  const handleAnswerSelect = (index: number) => {
    if (hasAnswered || gameStatus !== "question") return;

    setSelectedAnswer(index);
    setHasAnswered(true);

    // Submit answer to server
    if (currentQuestionIndex !== null) {
      submitAnswer(gameId, currentQuestionIndex, index);
    }
  };

  const renderGameStatus = () => {
    switch (gameStatus) {
      case "waiting":
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] flex items-center justify-center p-8">
            <Card className="p-12 max-w-md text-center bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-2xl shadow-lab-blue/10 border-0">
              <Users className="w-16 h-16 text-lab-blue mx-auto mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
              <h1 className="text-3xl font-bold text-lab-white mb-4">
                Waiting for Game to Start
              </h1>
              <p className="text-lab-grey mb-6">
                The host will start the game soon. Get ready!
              </p>
              <div className="p-4 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded-lg shadow-inner border-0">
                <p className="text-sm text-lab-grey mb-2">Players in lobby:</p>
                <p className="text-2xl font-bold text-lab-blue drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">{players.length}</p>
              </div>
            </Card>
          </div>
        );

      case "active":
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] flex items-center justify-center p-8">
            <Card className="p-12 max-w-md text-center bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-2xl shadow-lab-blue/10 border-0">
              <Zap className="w-16 h-16 text-lab-blue mx-auto mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <h1 className="text-3xl font-bold text-lab-white mb-4">
                Game Starting!
              </h1>
              <p className="text-lab-grey">Get ready for the first question...</p>
            </Card>
          </div>
        );

      case "question":
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] flex flex-col p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
              {/* Header - Minimal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lab-blue to-lab-blue-dark flex items-center justify-center shadow-lg shadow-lab-blue/30">
                    <span className="text-lab-black font-bold text-lg">
                      {(currentQuestionIndex ?? 0) + 1}
                    </span>
                  </div>
                  <span className="text-lab-white font-semibold">
                    Question {(currentQuestionIndex ?? 0) + 1}
                  </span>
                </div>

                {currentQuestion && (
                  <Timer
                    duration={currentQuestion.timeLimit}
                    onComplete={() => {}}
                    isActive={!hasAnswered}
                    serverStartTime={questionStartTime || undefined}
                  />
                )}
              </div>

              {/* Answer Options ONLY - No Question Text (it's on the big screen) */}
              {currentQuestion && (
                <div className="space-y-4">
                  <AnswerButtons
                    options={currentQuestion.options}
                    selectedIndex={selectedAnswer}
                    correctIndex={null} // Don't show correct answer yet
                    disabled={hasAnswered}
                    onSelect={handleAnswerSelect}
                  />

                  {hasAnswered && (
                    <div className="text-center animate-in fade-in duration-300">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success/20 to-success/10 rounded-lg shadow-lg shadow-success/20 border-0">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-success text-lg font-medium">
                          Answer Submitted!
                        </span>
                      </div>
                      <p className="text-lab-grey mt-3">
                        Waiting for other players...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status message when no question */}
              {!currentQuestion && (
                <Card className="p-8 text-center bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl border-0">
                  <Clock className="w-12 h-12 text-lab-blue mx-auto mb-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                  <p className="text-lab-grey">Look at the big screen!</p>
                </Card>
              )}
            </div>
          </div>
        );

      case "results":
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Question Result */}
              {currentQuestion && (
                <Card className="p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-2xl shadow-lab-blue/10 border-0">
                  <h2 className="text-2xl font-bold text-lab-white text-center mb-8">
                    {currentQuestion.text}
                  </h2>

                  <AnswerButtons
                    options={currentQuestion.options}
                    selectedIndex={selectedAnswer}
                    correctIndex={currentQuestion.correctIndex}
                    disabled={true}
                    onSelect={() => {}}
                  />

                  {selectedAnswer === currentQuestion.correctIndex ? (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success/20 to-success/10 rounded-lg shadow-lg shadow-success/20 border-0">
                        <Trophy className="w-5 h-5 text-success" />
                        <span className="text-success text-lg font-bold">
                          Correct! 🎉
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 border-2 border-red-500 rounded-lg">
                        <span className="text-red-400 text-lg font-bold">
                          Wrong Answer
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Leaderboard */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Current Standings
                </h3>
                <Leaderboard rankings={leaderboard} />
              </Card>
            </div>
          </div>
        );

      case "finished":
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {winners && winners.length >= 3 && (
                <WinnerReveal
                  winners={[winners[0], winners[1], winners[2]]}
                  onComplete={() => {}}
                />
              )}

              <Card className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Final Rankings
                </h3>
                <Leaderboard rankings={leaderboard} />
              </Card>

              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Thanks for playing! Prizes have been automatically distributed.
                </p>
                <Button
                  onClick={() => {
                    useGameStore.getState().reset();
                    window.location.href = "/";
                  }}
                  size="lg"
                  className="gap-2"
                >
                  <Users className="w-5 h-5" />
                  Play Another Game
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center">
            <Card className="p-12 max-w-md text-center">
              <Clock className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">
                Connecting to Game...
              </h1>
              <p className="text-gray-400">Please wait</p>
            </Card>
          </div>
        );
    }
  };

  return <>{renderGameStatus()}</>;
}
