"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { generateAvatar, formatSTX } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Winner {
  address: string;
  nickname: string;
  score: number;
  prize: number; // in microSTX
}

interface WinnerRevealProps {
  winners: [Winner, Winner, Winner]; // Exactly 3 winners
  onComplete: () => void;
}

export function WinnerReveal({ winners, onComplete }: WinnerRevealProps) {
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  useEffect(() => {
    // Reveal 3rd place after 1s
    const timer1 = setTimeout(() => {
      setRevealedIndices([2]);
    }, 1000);

    // Reveal 2nd place after 3s
    const timer2 = setTimeout(() => {
      setRevealedIndices([2, 1]);
    }, 3000);

    // Reveal 1st place after 5s
    const timer3 = setTimeout(() => {
      setRevealedIndices([2, 1, 0]);
    }, 5000);

    // Call onComplete after 8s
    const timer4 = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const getRankData = (index: number) => {
    switch (index) {
      case 0:
        return {
          rank: "1st Place",
          icon: Trophy,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-500/20",
          borderColor: "border-yellow-500",
        };
      case 1:
        return {
          rank: "2nd Place",
          icon: Medal,
          iconColor: "text-gray-400",
          bgColor: "bg-gray-400/20",
          borderColor: "border-gray-400",
        };
      case 2:
        return {
          rank: "3rd Place",
          icon: Award,
          iconColor: "text-violet-500",
          bgColor: "bg-violet-500/20",
          borderColor: "border-violet-500",
        };
      default:
        return {
          rank: "",
          icon: Trophy,
          iconColor: "",
          bgColor: "",
          borderColor: "",
        };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 space-y-8">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
        Winners!
      </h1>

      {/* Display order: 2nd, 1st, 3rd for podium effect */}
      <div className="flex items-end justify-center gap-6 w-full max-w-5xl">
        {/* 2nd Place */}
        <div className="flex-1 max-w-xs">
          {revealedIndices.includes(1) && (
            <WinnerCard winner={winners[1]} rank={1} />
          )}
        </div>

        {/* 1st Place - Larger */}
        <div className="flex-1 max-w-sm">
          {revealedIndices.includes(0) && (
            <WinnerCard winner={winners[0]} rank={0} isFirst />
          )}
        </div>

        {/* 3rd Place */}
        <div className="flex-1 max-w-xs">
          {revealedIndices.includes(2) && (
            <WinnerCard winner={winners[2]} rank={2} />
          )}
        </div>
      </div>
    </div>
  );
}

function WinnerCard({
  winner,
  rank,
  isFirst = false,
}: {
  winner: Winner;
  rank: number;
  isFirst?: boolean;
}) {
  const rankData = getRankData(rank);
  const Icon = rankData.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center p-6 rounded-lg border-4 transition-all animate-reveal",
        rankData.bgColor,
        rankData.borderColor,
        isFirst && "scale-110 animate-celebrate"
      )}
    >
      {/* Icon */}
      <Icon className={cn("w-16 h-16 mb-4", rankData.iconColor)} />

      {/* Rank */}
      <p className={cn("text-2xl font-bold mb-2", rankData.iconColor)}>
        {rankData.rank}
      </p>

      {/* Avatar */}
      <img
        src={generateAvatar(winner.address)}
        alt={winner.nickname}
        className="w-20 h-20 rounded-full mb-3"
      />

      {/* Nickname */}
      <p className="text-xl font-bold text-white mb-1">{winner.nickname}</p>

      {/* Score */}
      <p className="text-lg text-slate-300 mb-3">{winner.score} points</p>

      {/* Prize */}
      <div className="bg-primary/20 border-2 border-primary rounded-lg px-4 py-2">
        <p className="text-2xl font-bold text-primary">
          {formatSTX(winner.prize)} STX
        </p>
      </div>
    </div>
  );
}

function getRankData(index: number) {
  switch (index) {
    case 0:
      return {
        rank: "1st Place",
        icon: Trophy,
        iconColor: "text-yellow-500",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500",
      };
    case 1:
      return {
        rank: "2nd Place",
        icon: Medal,
        iconColor: "text-gray-400",
        bgColor: "bg-gray-400/20",
        borderColor: "border-gray-400",
      };
    case 2:
      return {
        rank: "3rd Place",
        icon: Award,
        iconColor: "text-violet-500",
        bgColor: "bg-violet-500/20",
        borderColor: "border-violet-500",
      };
    default:
      return {
        rank: "",
        icon: Trophy,
        iconColor: "",
        bgColor: "",
        borderColor: "",
      };
  }
}
