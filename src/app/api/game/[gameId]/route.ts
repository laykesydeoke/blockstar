import { NextRequest, NextResponse } from "next/server";
import { gameStorage } from "@/lib/gameStorage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;

  // Fetch from shared game storage
  const gameData = gameStorage.get(gameId);

  if (gameData) {
    return NextResponse.json({
      success: true,
      ...gameData,
    });
  }

  // If not found, return error
  return NextResponse.json(
    { error: "Game not found" },
    { status: 404 }
  );
}
