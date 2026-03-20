import { NextRequest, NextResponse } from "next/server";
import { gameStorage } from "@/lib/gameStorage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { gameId, hostAddress, title, prizePool, questions, settings } = body;

    // Validate required fields
    if (!gameId || !hostAddress || !title || !questions || !settings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Store game data
    const gameData = {
      gameId,
      hostAddress,
      title,
      prizePool,
      questions,
      settings,
      status: "waiting",
      players: [],
      createdAt: Date.now(),
    };

    gameStorage.set(gameId, gameData);

    console.log("✅ Game created:", gameId);

    return NextResponse.json(
      { success: true, gameId },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
