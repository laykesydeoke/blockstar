"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStacks } from "@/providers/StacksProvider";
import { useSocket } from "@/hooks/useSocket";
import { useContract } from "@/hooks/useContract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Loader2, GraduationCap, Trophy, Blocks } from "lucide-react";
import Link from "next/link";

export default function JoinGameWithIdPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const { isConnected, address, connect } = useStacks();
  const { joinGame } = useSocket();
  const { registerPlayer } = useContract();

  const [nickname, setNickname] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<any>(null);
  const [registrationStep, setRegistrationStep] = useState<"idle" | "blockchain" | "socket">("idle");

  useEffect(() => {
    // Fetch game info
    const fetchGameInfo = async () => {
      try {
        const response = await fetch(`/api/game/${gameId}`);
        if (response.ok) {
          const data = await response.json();
          setGameInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch game info:", err);
      }
    };

    if (gameId) {
      fetchGameInfo();
    }
  }, [gameId]);

  const handleJoin = async () => {
    if (!isConnected || !address) {
      await connect();
      return;
    }

    if (!nickname.trim()) {
      setError("Please enter a nickname");
      return;
    }

    if (nickname.length > 20) {
      setError("Nickname must be 20 characters or less");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Step 1: Register player on blockchain
      setRegistrationStep("blockchain");

      await registerPlayer(gameId, nickname.trim());

      // Step 2: Join game via Socket.io
      setRegistrationStep("socket");
      joinGame(gameId, address, nickname.trim());

      // Store player info in sessionStorage for reconnection
      sessionStorage.setItem(`player_nickname_${gameId}`, nickname.trim());
      sessionStorage.setItem(`player_address_${gameId}`, address);

      // Wait a moment for connection
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to player game page
      router.push(`/play/${gameId}`);
    } catch (err: any) {
      console.error("Failed to join game:", err);
      setError(err.message || "Failed to join game");
      setIsJoining(false);
      setRegistrationStep("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Decorative glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-lab-blue/5 rounded-full blur-3xl -z-10"></div>

        <div className="mb-8">
          <Link href="/join">
            <Button variant="ghost" className="mb-4 text-lab-blue hover:bg-lab-blue/20 hover:text-lab-purple hover:scale-105 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3 group">
            <GraduationCap className="w-10 h-10 text-lab-blue drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300" />
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lab-white via-lab-blue to-lab-white bg-clip-text text-transparent">Join Session</h1>
          </div>
          <p className="text-lab-grey pl-13">Session ID: <span className="font-mono text-lab-blue drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">{gameId}</span></p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border-0">
          {/* Game Info */}
          {gameInfo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-lab-blue/15 to-lab-blue/5 rounded-lg shadow-lg shadow-lab-blue/20 border-0">
              <h3 className="font-display font-semibold text-lab-white mb-3">{gameInfo.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-lab-grey">Reward Pool:</span>
                  <span className="ml-2 text-lab-blue font-mono font-semibold drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">
                    {(gameInfo.prizePool / 1000000).toFixed(2)} STX
                  </span>
                </div>
                <div>
                  <span className="text-lab-grey">Learners:</span>
                  <span className="ml-2 text-lab-blue font-mono font-semibold drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">
                    {gameInfo.playerCount || 0}/{gameInfo.settings?.maxPlayers || "∞"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Wallet Connection Warning */}
            {!isConnected && (
              <div className="p-4 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded-lg shadow-lg shadow-lab-blue/20 border-0">
                <p className="text-lab-blue text-sm font-mono mb-3">
                  Connect your wallet to participate and receive Bitcoin rewards
                </p>
                <Button onClick={connect} className="w-full bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-xl hover:shadow-lab-blue/40 hover:scale-105 transition-all duration-300">
                  Connect Wallet
                </Button>
              </div>
            )}

            {/* Nickname Input */}
            {isConnected && (
              <>
                <div>
                  <label className="block text-sm font-medium text-lab-blue mb-2">
                    Choose Your Display Name
                  </label>
                  <Input
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g., BitcoinBuilder, StacksScholar"
                    maxLength={20}
                    className="bg-[#070B1A] border-0 text-lab-white placeholder:text-lab-grey-dark focus:ring-2 focus:ring-lab-blue shadow-inner"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleJoin();
                      }
                    }}
                    autoFocus
                  />
                  <p className="text-sm text-lab-grey-dark mt-2 font-mono">
                    {nickname.length}/20 characters • Displayed on leaderboard
                  </p>
                </div>

                {/* Wallet Address Display */}
                <div className="p-4 bg-gradient-to-br from-[#080D1F] to-[#070B1A] rounded-lg shadow-inner border-0">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-lab-blue drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]" />
                    <span className="text-sm text-lab-grey">Wallet:</span>
                    <span className="text-sm text-lab-blue font-mono drop-shadow-[0_0_5px_rgba(99,102,241,0.3)]">
                      {address?.slice(0, 8)}...{address?.slice(-6)}
                    </span>
                  </div>
                  <p className="text-xs text-lab-grey-dark mt-2">
                    Bitcoin rewards will be sent here if you place in top 3
                  </p>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-gradient-to-r from-error/20 to-error/10 rounded-lg shadow-lg shadow-error/20 border-0">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Join Button */}
            {isConnected && (
              <Button
                onClick={handleJoin}
                className="w-full bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-xl hover:shadow-lab-blue/40 hover:scale-105 transition-all duration-300"
                size="lg"
                disabled={isJoining || !nickname.trim()}
                loading={isJoining}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {registrationStep === "blockchain" ? "Registering on Blockchain..." : "Joining Session..."}
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Join as "{nickname || "..."}"
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="group p-6 mt-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-lg hover:shadow-xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-300 border-0">
          <div className="flex items-center gap-2 mb-4">
            <Blocks className="w-5 h-5 text-lab-blue group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
            <h3 className="font-display font-semibold text-lab-white group-hover:text-lab-blue transition-colors duration-300">What Happens Next?</h3>
          </div>
          <ol className="text-sm text-lab-grey space-y-2 list-decimal list-inside">
            <li>Enter the lobby and see other learners</li>
            <li>Wait for the facilitator to begin the session</li>
            <li>Demonstrate knowledge with accurate, fast answers</li>
            <li>Speed and accuracy determine your score</li>
            <li>Top 3 performers receive Bitcoin rewards automatically via smart contract</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
