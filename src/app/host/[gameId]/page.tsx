"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useSocket } from "@/hooks/useSocket";
import { useContract } from "@/hooks/useContract";
import { useStacks } from "@/providers/StacksProvider";
import { useGameStore } from "@/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerList } from "@/components/game/PlayerList";
import {
  Copy,
  ExternalLink,
  Play,
  Monitor,
  Users,
  Trophy,
  Check,
  Loader2,
  Blocks,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function HostGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const { address } = useStacks();
  const { startGame, isConnected, joinGameAsHost, leaveGame } = useSocket();
  const { cancelGame, emergencyRefund } = useContract();
  const { players, gameStatus } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [gameUrl, setGameUrl] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch game data on mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`/api/game/${gameId}`);
        if (response.ok) {
          const data = await response.json();
          setGameData(data);
        }
      } catch (error) {
        console.error("Failed to fetch game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/join/${gameId}`;
      setGameUrl(url);
    }
  }, [gameId]);

  // Host joins the socket room to receive updates WITHOUT being added as a player
  useEffect(() => {
    if (gameId && isConnected && !hasJoined) {
      // Join as observer to receive events without being added as a player
      joinGameAsHost(gameId);
      setHasJoined(true);
    }
  }, [gameId, isConnected, hasJoined, joinGameAsHost]);

  // Auto-redirect to display page when game starts
  useEffect(() => {
    if (gameStatus === "active" || gameStatus === "question") {
      console.log("🎮 Game started, redirecting to display page...");
      router.push(`/display/${gameId}`);
    }
  }, [gameStatus, gameId, router]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      alert("Need at least 3 players to start the game (for 1st, 2nd, and 3rd place prizes)");
      return;
    }

    if (!gameData || !gameData.questions) {
      alert("Game data not loaded. Please refresh the page.");
      return;
    }

    setIsStarting(true);
    try {
      startGame(gameId, gameData.questions, gameData.prizePool);
      // Auto-redirect will happen via useEffect when gameStatus changes
    } catch (err) {
      console.error("Failed to start game:", err);
      setIsStarting(false);
    }
  };

  const handleOpenDisplay = () => {
    window.open(`/display/${gameId}`, "_blank", "width=1920,height=1080");
  };

  const handleCancelGame = async () => {
    if (!confirm("Are you sure you want to cancel this game? All funds will be refunded to you.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const txId = await cancelGame(gameId);
      alert(`Game cancelled successfully! Your funds will be refunded. Transaction ID: ${txId}`);
      router.push("/");
    } catch (error: any) {
      console.error("Failed to cancel game:", error);
      alert(`Failed to cancel game: ${error.message || "Unknown error"}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEmergencyRefund = async () => {
    if (!confirm("⚠️ EMERGENCY REFUND: This will force-cancel the game and refund all funds. Use only if the game is stuck. Continue?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const txId = await emergencyRefund(gameId);
      alert(`Emergency refund successful! Your funds have been returned. Transaction ID: ${txId}`);
      router.push("/");
    } catch (error: any) {
      console.error("Failed to execute emergency refund:", error);
      alert(`Failed to execute emergency refund: ${error.message || "Unknown error"}`);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    if (gameStatus === "active") {
      // Redirect to display when game starts
      router.push(`/display/${gameId}`);
    }
  }, [gameStatus, gameId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Decorative glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-lab-blue/5 rounded-full blur-3xl -z-10"></div>

        {/* Header */}
        <div className="mb-8 pb-6">
          <div className="flex items-center gap-3 mb-3 group">
            <Blocks className="w-10 h-10 text-lab-blue drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300" />
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lab-white via-lab-blue to-lab-white bg-clip-text text-transparent">Session Control</h1>
          </div>
          <p className="text-lab-grey pl-13">
            Session ID: <span className="font-mono text-lab-blue drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">{gameId}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - QR Code & Join Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* QR Code */}
            <Card className="group p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-500 border-0">
              <h2 className="text-xl font-display font-bold text-lab-white mb-4 group-hover:text-lab-blue transition-colors duration-300">Learner Access</h2>
              <div className="bg-lab-white p-6 rounded-lg shadow-lg shadow-lab-blue/20">
                <QRCodeSVG
                  value={gameUrl}
                  size={256}
                  level="H"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-lab-grey text-center mt-4">
                Scan to join the learning session
              </p>
            </Card>

            {/* Share Options */}
            <Card className="group p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-500 border-0">
              <h3 className="font-display font-semibold text-lab-white mb-4">Share Session</h3>

              <div className="space-y-4">
                {/* Game ID */}
                <div>
                  <label className="text-xs text-lab-blue mb-1 block">Session ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gameId}
                      readOnly
                      className="flex-1 px-3 py-2 bg-[#070B1A] border-0 rounded-lg text-lab-white font-mono text-sm shadow-inner"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopyGameId}
                      className="px-3 bg-lab-blue/20 text-lab-blue hover:bg-lab-blue hover:text-lab-black border-0 shadow-lg shadow-lab-blue/20 hover:shadow-xl hover:shadow-lab-blue/30 hover:scale-105 transition-all duration-300"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Full URL */}
                <div>
                  <label className="text-xs text-lab-blue mb-1 block">Join URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={gameUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-[#070B1A] border-0 rounded-lg text-lab-white text-sm truncate shadow-inner"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopyLink}
                      className="px-3 bg-lab-blue/20 text-lab-blue hover:bg-lab-blue hover:text-lab-black border-0 shadow-lg shadow-lab-blue/20 hover:shadow-xl hover:shadow-lab-blue/30 hover:scale-105 transition-all duration-300"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Open Display Button */}
                <Button
                  onClick={handleOpenDisplay}
                  className="w-full gap-2 bg-lab-blue/20 text-lab-blue hover:bg-lab-blue hover:text-lab-black border-0 shadow-lg shadow-lab-blue/20 hover:shadow-xl hover:shadow-lab-blue/30 hover:scale-105 transition-all duration-300"
                >
                  <Monitor className="w-4 h-4" />
                  Open Display Screen
                </Button>
              </div>
            </Card>

            {/* Prize Pool Info */}
            <Card className="group p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-500 border-0">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-lab-blue group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                <h3 className="font-display font-semibold text-lab-white group-hover:text-lab-blue transition-colors duration-300">Reward Distribution</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded shadow-sm hover:shadow-md hover:shadow-lab-blue/20 transition-all duration-300 border-0">
                  <span className="text-lab-grey">1st Place</span>
                  <span className="text-lab-blue font-mono font-bold">50%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded shadow-sm hover:shadow-md hover:shadow-lab-blue/20 transition-all duration-300 border-0">
                  <span className="text-lab-grey">2nd Place</span>
                  <span className="text-lab-blue font-mono font-bold">30%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded shadow-sm hover:shadow-md hover:shadow-lab-blue/20 transition-all duration-300 border-0">
                  <span className="text-lab-grey">3rd Place</span>
                  <span className="text-lab-blue font-mono font-bold">20%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Players & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Status */}
            <Card className="p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-lab-white mb-1">
                    Waiting for Learners
                  </h2>
                  <p className="text-lab-grey">
                    {players.length} / 3 minimum learners joined
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lab-blue/15 to-lab-blue/5 rounded-lg shadow-lg shadow-lab-blue/20 border-0">
                  <div className="w-2 h-2 bg-lab-blue rounded-full animate-pulse drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]"></div>
                  <span className="text-lab-blue text-sm font-mono font-medium drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">LOBBY</span>
                </div>
              </div>

              {/* Start Game Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleStartGame}
                  className="w-full gap-2 bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-xl hover:shadow-lab-blue/40 hover:scale-105 transition-all duration-300"
                  size="lg"
                  disabled={players.length < 3 || isStarting}
                  loading={isStarting}
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Learning Session ({players.length} Learners)
                    </>
                  )}
                </Button>

                {players.length < 3 && (
                  <p className="text-sm text-lab-blue text-center font-mono">
                    Minimum 3 learners required (for top 3 rewards)
                  </p>
                )}

                {/* Cancel Game Button */}
                <Button
                  onClick={handleCancelGame}
                  variant="destructive"
                  className="w-full gap-2 bg-gradient-to-r from-error/20 to-error/10 text-error hover:bg-error hover:text-lab-white shadow-lg shadow-error/20 hover:shadow-xl hover:shadow-error/30 hover:scale-105 transition-all duration-300 border-0"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Session & Get Refund"
                  )}
                </Button>

                {/* Emergency Refund Button - only show if there are issues */}
                <details className="text-xs text-lab-grey-dark">
                  <summary className="cursor-pointer hover:text-lab-grey">
                    ⚠️ Emergency Options
                  </summary>
                  <div className="mt-2 p-3 bg-gradient-to-r from-error/20 to-error/10 rounded shadow-lg shadow-error/20 border-0">
                    <p className="text-error mb-2">
                      Use only if session is stuck or not responding
                    </p>
                    <Button
                      onClick={handleEmergencyRefund}
                      variant="destructive"
                      size="sm"
                      className="w-full bg-error text-lab-white hover:bg-error/80 shadow-lg shadow-error/30 hover:shadow-xl hover:shadow-error/40 hover:scale-105 transition-all duration-300"
                      disabled={isCancelling}
                    >
                      Emergency Refund
                    </Button>
                  </div>
                </details>
              </div>
            </Card>

            {/* Player List */}
            <Card className="p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border-0">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-lab-blue" />
                <h3 className="text-xl font-display font-bold text-lab-white">Learners</h3>
              </div>

              {players.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 text-lab-blue/30 mx-auto mb-4" />
                  <p className="text-lab-grey">Waiting for learners to join...</p>
                  <p className="text-sm text-lab-grey-dark mt-2">
                    Share the Session ID or QR code
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div
                      key={player.address}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#080D1F] to-[#070B1A] rounded-lg hover:from-lab-blue/10 hover:to-lab-blue/5 shadow-md hover:shadow-lg hover:shadow-lab-blue/20 hover:-translate-y-0.5 transition-all duration-300 border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-lab-blue to-lab-blue-dark flex items-center justify-center rounded shadow-lg shadow-lab-blue/30">
                          <span className="text-lab-black font-bold font-mono">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-lab-white font-semibold">{player.nickname}</p>
                          <p className="text-xs text-lab-grey-dark font-mono">
                            {player.address.slice(0, 8)}...{player.address.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.connected ? (
                          <div className="flex items-center gap-1 text-success text-sm">
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                            Online
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-lab-grey-dark text-sm">
                            <div className="w-2 h-2 bg-lab-grey-dark rounded-full"></div>
                            Offline
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Instructions */}
            <Card className="group p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-500 border-0">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-lab-blue group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                <h3 className="font-display font-semibold text-lab-white group-hover:text-lab-blue transition-colors duration-300">Facilitator Guide</h3>
              </div>
              <ol className="text-sm text-lab-grey space-y-2 list-decimal list-inside">
                <li>Share the Session ID or QR code with learners</li>
                <li>Wait for learners to join (minimum 3 required)</li>
                <li>
                  Click "Open Display Screen" for projector/TV view (optional)
                </li>
                <li>Click "Start Learning Session" when ready to begin</li>
                <li>Top 3 performers will automatically receive Bitcoin rewards via smart contract</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
