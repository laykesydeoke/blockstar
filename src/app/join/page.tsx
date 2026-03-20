"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStacks } from "@/providers/StacksProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Loader2, GraduationCap, Blocks, Trophy } from "lucide-react";
import Link from "next/link";

export default function JoinGamePage() {
  const router = useRouter();
  const { isConnected, connect } = useStacks();
  const [gameId, setGameId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!gameId.trim()) {
      setError("Please enter a game ID");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Verify game exists
      const response = await fetch(`/api/game/${gameId}`);

      if (!response.ok) {
        throw new Error("Game not found");
      }

      // Redirect to join page with nickname prompt
      router.push(`/join/${gameId}`);
    } catch (err: any) {
      setError(err.message || "Failed to find game");
      setIsJoining(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setGameId(text.trim());
      setError(null);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Decorative glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-lab-blue/5 rounded-full blur-3xl -z-10"></div>

        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-lab-blue hover:bg-lab-blue/20 hover:text-lab-purple hover:scale-105 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3 group">
            <GraduationCap className="w-10 h-10 text-lab-blue drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300" />
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lab-white via-lab-blue to-lab-white bg-clip-text text-transparent">Join Learning Session</h1>
          </div>
          <p className="text-lab-grey pl-13">Enter the Session ID to participate</p>
        </div>

        <Card className="p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border-0">
          <div className="space-y-6">
            {/* Wallet Connection Warning */}
            {!isConnected && (
              <div className="p-4 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded-lg shadow-lg shadow-lab-blue/20 border-0">
                <p className="text-lab-blue text-sm font-mono">
                  Connect your wallet to join and receive Bitcoin rewards
                </p>
              </div>
            )}

            {/* Game ID Input */}
            <div>
              <label className="block text-sm font-medium text-lab-blue mb-2">
                Session ID
              </label>
              <div className="flex gap-2">
                <Input
                  value={gameId}
                  onChange={(e) => {
                    setGameId(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g., abc123xyz"
                  className="bg-[#070B1A] border-0 text-lab-white placeholder:text-lab-grey-dark focus:ring-2 focus:ring-lab-blue shadow-inner flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJoin();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handlePaste}
                  className="bg-lab-blue/20 text-lab-blue hover:bg-lab-blue hover:text-lab-black border-0 shadow-lg shadow-lab-blue/20 hover:shadow-xl hover:shadow-lab-blue/30 hover:scale-105 transition-all duration-300"
                >
                  Paste
                </Button>
              </div>
              <p className="text-sm text-lab-grey-dark mt-2">
                Get this ID from the facilitator or QR code
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-gradient-to-r from-error/20 to-error/10 rounded-lg shadow-lg shadow-error/20 border-0">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Join Button */}
            <Button
              onClick={handleJoin}
              className="w-full bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-xl hover:shadow-lab-blue/40 hover:scale-105 transition-all duration-300"
              size="lg"
              disabled={isJoining || !gameId.trim()}
              loading={isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding Session...
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Join Session
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lab-blue/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-lab-black text-lab-grey-dark">OR</span>
              </div>
            </div>

            {/* Scan QR Code */}
            <div className="text-center space-y-4">
              <p className="text-sm text-lab-grey">
                Scan the QR code displayed on the facilitator's screen
              </p>
              <div className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-lab-blue/20 rounded-lg hover:border-lab-blue/40 hover:bg-lab-blue/5 transition-all duration-300">
                <svg
                  className="w-12 h-12 text-lab-blue drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <div>
                  <p className="text-lab-grey text-sm">Point your camera at the QR code</p>
                  <p className="text-lab-grey-dark text-xs mt-1">
                    The Session ID will be automatically filled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="group p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-lg hover:shadow-xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-300 border-0">
            <div className="flex items-center gap-2 mb-3">
              <Blocks className="w-5 h-5 text-lab-blue group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              <h3 className="font-display font-semibold text-lab-white group-hover:text-lab-blue transition-colors duration-300">How to Join</h3>
            </div>
            <ol className="text-sm text-lab-grey space-y-2 list-decimal list-inside">
              <li>Get the Session ID from the facilitator</li>
              <li>Enter the ID above or scan QR code</li>
              <li>Choose your nickname</li>
              <li>Wait for the session to begin</li>
            </ol>
          </Card>

          <Card className="group p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-lg hover:shadow-xl hover:shadow-lab-blue/10 hover:-translate-y-1 transition-all duration-300 border-0">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-lab-blue group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              <h3 className="font-display font-semibold text-lab-white group-hover:text-lab-blue transition-colors duration-300">Reward Distribution</h3>
            </div>
            <div className="text-sm text-lab-grey space-y-2">
              <div className="flex justify-between p-2 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded shadow-sm hover:shadow-md hover:shadow-lab-blue/20 transition-all duration-300 border-0">
                <span>1st Place:</span>
                <span className="text-lab-blue font-mono font-semibold">50%</span>
              </div>
              <div className="flex justify-between p-2 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded shadow-sm hover:shadow-md hover:shadow-lab-blue/20 transition-all duration-300 border-0">
                <span>2nd Place:</span>
                <span className="text-lab-blue font-mono font-semibold">30%</span>
              </div>
              <div className="flex justify-between p-2 bg-gradient-to-r from-lab-blue/10 to-lab-blue/5 rounded shadow-sm hover:shadow-md hover:shadow-lab-blue/20 transition-all duration-300 border-0">
                <span>3rd Place:</span>
                <span className="text-lab-blue font-mono font-semibold">20%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
