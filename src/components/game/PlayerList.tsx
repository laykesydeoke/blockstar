"use client";

import { Users } from "lucide-react";
import { generateAvatar } from "@/lib/utils";

interface Player {
  address: string;
  nickname: string;
  connected: boolean;
}

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 text-white">
        <Users className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Players ({players.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {players.map((player) => (
          <div
            key={player.address}
            className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-slate-700"
          >
            {/* Avatar with connection indicator */}
            <div className="relative">
              <img
                src={generateAvatar(player.address)}
                alt={player.nickname}
                className="w-10 h-10 rounded-full"
              />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${
                  player.connected ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>

            {/* Nickname */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {player.nickname}
              </p>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No players yet</p>
          <p className="text-sm">Waiting for players to join...</p>
        </div>
      )}
    </div>
  );
}
