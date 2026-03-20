"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { generateAvatar } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Player {
  address: string;
  nickname: string;
  score: number;
  rank?: number;
  lastQuestionPoints?: number; // Points earned on last question
  lastQuestionBase?: number; // Base points (1000)
  lastQuestionBonus?: number; // Speed bonus (0-500)
}

interface LeaderboardProps {
  players?: Player[];
  rankings?: Player[];
  limit?: number;
  showAnimation?: boolean;
}

export function Leaderboard({
  players,
  rankings,
  limit = 5,
  showAnimation = false,
}: LeaderboardProps) {
  // Use rankings if provided, otherwise use players
  const playerList = rankings || players || [];

  // Sort players by score descending (if not already ranked)
  const sortedPlayers = [...playerList].sort((a, b) => b.score - a.score);
  const topPlayers = sortedPlayers.slice(0, limit);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-violet-500" />;
      default:
        return null;
    }
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500/20 border-yellow-500";
      case 1:
        return "bg-gray-400/20 border-gray-400";
      case 2:
        return "bg-violet-500/20 border-violet-500";
      default:
        return "bg-surface border-slate-700";
    }
  };

  return (
    <div className="w-full space-y-2">
      {topPlayers.map((player, index) => (
        <div
          key={player.address}
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
            getRankStyle(index),
            showAnimation && "animate-reveal"
          )}
          style={{
            animationDelay: showAnimation ? `${index * 100}ms` : "0ms",
          }}
        >
          {/* Rank */}
          <div className="flex items-center justify-center w-8 h-8">
            {getRankIcon(index) || (
              <span className="text-lg font-bold text-slate-400">
                {index + 1}
              </span>
            )}
          </div>

          {/* Avatar */}
          <img
            src={generateAvatar(player.address)}
            alt={player.nickname}
            className="w-10 h-10 rounded-full"
          />

          {/* Nickname */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">
              {player.nickname}
            </p>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-xl font-bold text-white">{player.score}</p>
            <p className="text-xs text-slate-400">total points</p>
            {/* Show last question breakdown if available */}
            {player.lastQuestionPoints !== undefined && player.lastQuestionPoints > 0 && (
              <div className="mt-1 text-xs text-green-400">
                +{player.lastQuestionPoints} ({player.lastQuestionBase} + {player.lastQuestionBonus} speed)
              </div>
            )}
            {player.lastQuestionPoints === 0 && (
              <div className="mt-1 text-xs text-red-400">
                +0 (incorrect)
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
