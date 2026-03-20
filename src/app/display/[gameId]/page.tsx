"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useContract } from "@/hooks/useContract";
import { useStacks } from "@/providers/StacksProvider";
import { useGameStore } from "@/stores/gameStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionDisplay } from "@/components/game/QuestionDisplay";
import { Leaderboard } from "@/components/game/Leaderboard";
import { WinnerReveal } from "@/components/game/WinnerReveal";
import { Users, Trophy, Zap, Clock, ChevronRight, Coins, Loader2, CheckCircle, Blocks, GraduationCap, BookOpen, Network } from "lucide-react";
import { stxToMicroSTX } from "@/lib/utils";

export default function DisplayScreenPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const { address } = useStacks();
  const { joinGameAsHost, isConnected, nextQuestion } = useSocket();
  const { finalizeGame, getPrizeDistribution } = useContract();
  const {
    gameStatus,
    currentQuestion,
    currentQuestionIndex,
    questionStartTime,
    leaderboard,
    winners,
    players,
  } = useGameStore();

  const [isDistributing, setIsDistributing] = useState(false);
  const [isDistributed, setIsDistributed] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  // Join game room to receive updates as observer (ONCE)
  useEffect(() => {
    if (gameId && isConnected && !hasJoined) {
      joinGameAsHost(gameId); // Join as observer, not as player
      setHasJoined(true);
    }
  }, [gameId, isConnected, hasJoined, joinGameAsHost]);

  const handleDistributePrizes = async () => {
    if (!winners || winners.length < 3) {
      alert("Need at least 3 winners to distribute prizes");
      return;
    }

    setIsDistributing(true);
    try {
      // Get prize amounts from winner data (already in microSTX from server)
      const firstPrize = winners[0].prize;
      const secondPrize = winners[1].prize;
      const thirdPrize = winners[2].prize;

      // Call blockchain to finalize and distribute
      const transactionId = await finalizeGame(
        gameId,
        winners[0].address,
        winners[1].address,
        winners[2].address,
        firstPrize,
        secondPrize,
        thirdPrize
      );

      setTxId(transactionId);
      setIsDistributed(true);
      alert(`Prizes distributed! Transaction ID: ${transactionId}`);
    } catch (error: any) {
      console.error("Failed to distribute prizes:", error);
      alert(`Failed to distribute prizes: ${error.message || "Unknown error"}`);
    } finally {
      setIsDistributing(false);
    }
  };

  const renderDisplayContent = () => {
    switch (gameStatus) {
      case "waiting":
        return (
          <div className="min-h-screen bg-lab-black flex items-center justify-center p-8">
            <div className="text-center max-w-5xl w-full">
              <div className="mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Blocks className="w-32 h-32 text-lab-blue animate-pulse" />
                </div>
                <h1 className="text-8xl font-display font-bold text-lab-white mb-4">
                  BlockStar
                </h1>
                <p className="text-2xl text-lab-blue font-display mb-2">
                  I have knowledge of Blockchain and Stacks
                </p>
                <p className="text-3xl text-lab-grey">
                  Waiting for learners to join...
                </p>
              </div>

              <Card className="p-12 bg-lab-black border-2 border-lab-blue/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="text-center">
                    <GraduationCap className="w-12 h-12 text-lab-blue mx-auto mb-3" />
                    <p className="text-5xl font-display font-bold text-lab-blue mb-2">
                      {players.length}
                    </p>
                    <p className="text-lab-grey">Learners Joined</p>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-lab-blue mx-auto mb-3" />
                    <p className="text-5xl font-display font-bold text-lab-blue mb-2">
                      50/30/20
                    </p>
                    <p className="text-lab-grey">Reward Split</p>
                  </div>
                  <div className="text-center">
                    <Network className="w-12 h-12 text-lab-blue mx-auto mb-3" />
                    <p className="text-5xl font-display font-bold text-lab-blue mb-2">
                      Live
                    </p>
                    <p className="text-lab-grey">Blockchain Scoring</p>
                  </div>
                </div>

                {players.length > 0 && (
                  <div>
                    <h3 className="text-3xl font-display font-bold text-lab-white mb-8">
                      Learners in Lobby
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {players.map((player, index) => (
                        <div
                          key={player.address}
                          className="p-4 bg-lab-black border-2 border-lab-blue/30 hover:border-lab-blue transition-colors text-center"
                        >
                          <div className="w-12 h-12 bg-lab-blue/10 border-2 border-lab-blue flex items-center justify-center mx-auto mb-2">
                            <span className="text-lab-blue font-bold font-mono text-lg">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-lab-white font-semibold truncate">
                            {player.nickname}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      case "active":
        return (
          <div className="min-h-screen bg-lab-black flex items-center justify-center">
            <div className="text-center">
              <Blocks className="w-32 h-32 text-lab-blue mx-auto mb-8 animate-pulse" />
              <h1 className="text-7xl font-display font-bold text-lab-white mb-4 animate-reveal">
                Session Starting!
              </h1>
              <p className="text-3xl text-lab-blue">Prepare to demonstrate your knowledge...</p>
            </div>
          </div>
        );

      case "question":
        return (
          <div className="min-h-screen bg-lab-black p-8">
            <div className="max-w-7xl mx-auto">
              {currentQuestion && (
                <QuestionDisplay
                  question={currentQuestion}
                  questionNumber={(currentQuestionIndex ?? 0) + 1}
                  totalQuestions={10}
                  timeLimit={currentQuestion.timeLimit || 30}
                  showAnswer={false}
                  onTimeComplete={() => {}}
                  serverStartTime={questionStartTime || undefined}
                />
              )}
            </div>
          </div>
        );

      case "results":
        return (
          <div className="min-h-screen bg-lab-black p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Question with Answer */}
                <div>
                  {currentQuestion && (
                    <QuestionDisplay
                      question={currentQuestion}
                      questionNumber={(currentQuestionIndex ?? 0) + 1}
                      totalQuestions={10}
                      timeLimit={currentQuestion.timeLimit || 30}
                      showAnswer={true}
                      correctIndex={currentQuestion.correctIndex}
                      onTimeComplete={() => {}}
                      serverStartTime={questionStartTime || undefined}
                    />
                  )}
                </div>

                {/* Leaderboard */}
                <Card className="p-8 bg-lab-black border-2 border-lab-blue/30">
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-8 h-8 text-lab-blue" />
                    <h2 className="text-3xl font-display font-bold text-lab-white">Rankings</h2>
                  </div>
                  <Leaderboard rankings={leaderboard} />
                </Card>
              </div>

              {/* Next Question Button - Centered below leaderboard */}
              <div className="flex justify-center">
                <Button
                  onClick={() => nextQuestion(gameId)}
                  size="lg"
                  className="gap-3 px-12 py-8 text-2xl font-semibold bg-lab-blue text-lab-black hover:bg-lab-blue-dark hover:scale-105 transition-transform shadow-2xl"
                >
                  Next Block
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>
        );

      case "finished":
        return (
          <div className="min-h-screen bg-lab-black p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <h1 className="text-7xl font-display font-bold text-center text-lab-blue mb-12">
                Session Complete!
              </h1>

              {winners && winners.length >= 3 && (
                <WinnerReveal
                  winners={[winners[0], winners[1], winners[2]]}
                  onComplete={() => {}}
                />
              )}

              <Card className="p-12 bg-lab-black border-2 border-lab-blue/30">
                <h2 className="text-4xl font-display font-bold text-lab-white mb-8 text-center">
                  Final Rankings
                </h2>
                <Leaderboard rankings={leaderboard} />
              </Card>

              {/* Prize Distribution Section */}
              <Card className="p-8 bg-lab-blue/5 border-2 border-lab-blue/30">
                <div className="text-center space-y-6">
                  {!isDistributed ? (
                    <>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Coins className="w-12 h-12 text-lab-blue" />
                        <h3 className="text-3xl font-display font-bold text-lab-white">
                          Reward Distribution
                        </h3>
                      </div>
                      <p className="text-xl text-lab-grey mb-6">
                        Execute blockchain transaction to distribute Bitcoin rewards to top learners
                      </p>
                      <Button
                        onClick={handleDistributePrizes}
                        disabled={isDistributing}
                        size="lg"
                        className="gap-3 px-12 py-8 text-2xl font-semibold bg-lab-blue text-lab-black hover:bg-lab-blue-dark hover:scale-105 transition-transform shadow-2xl"
                      >
                        {isDistributing ? (
                          <>
                            <Loader2 className="w-8 h-8 animate-spin" />
                            Distributing Rewards...
                          </>
                        ) : (
                          <>
                            <Coins className="w-8 h-8" />
                            Distribute Rewards Now
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-lab-grey-dark mt-4 font-mono">
                        Smart contract will send STX directly to winner wallets
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <CheckCircle className="w-12 h-12 text-success" />
                        <h3 className="text-3xl font-display font-bold text-success">
                          Rewards Distributed!
                        </h3>
                      </div>
                      <p className="text-xl text-lab-grey">
                        Top learners have received their Bitcoin rewards
                      </p>
                      {txId && (
                        <a
                          href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-4 px-6 py-3 bg-lab-blue/20 hover:bg-lab-blue/30 rounded-lg text-lab-blue font-mono text-sm transition-colors border border-lab-blue/50"
                        >
                          View Transaction: {txId.slice(0, 8)}...{txId.slice(-8)}
                        </a>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-lab-black flex items-center justify-center">
            <div className="text-center">
              <Blocks className="w-24 h-24 text-lab-blue mx-auto mb-6 animate-pulse" />
              <h1 className="text-4xl font-display font-bold text-lab-white mb-4">
                Connecting to Session...
              </h1>
              <p className="text-xl text-lab-grey">Please wait</p>
            </div>
          </div>
        );
    }
  };

  return <div className="overflow-hidden">{renderDisplayContent()}</div>;
}
