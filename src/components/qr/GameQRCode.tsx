"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

interface GameQRCodeProps {
  gameId: string;
  size?: number;
}

export function GameQRCode({ gameId, size = 256 }: GameQRCodeProps) {
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join/${gameId}`;

  return (
    <Card className="inline-block">
      <CardContent className="p-6">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={joinUrl} size={size} level="H" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">Scan to join</p>
          <p className="text-2xl font-bold text-white mt-2">{gameId}</p>
        </div>
      </CardContent>
    </Card>
  );
}
