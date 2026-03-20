import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats microSTX to STX with 6 decimal precision
 * @param microSTX - Amount in microSTX (1 STX = 1,000,000 microSTX)
 * @returns Formatted STX string
 */
export function formatSTX(microSTX: number): string {
  const stx = microSTX / 1_000_000;
  return stx.toFixed(6).replace(/\.?0+$/, "");
}

/**
 * Generates a random 6-character alphanumeric game code
 * @returns 6-character uppercase game code
 */
export function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding I, O, 0, 1 for clarity
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generates a deterministic avatar URL from a wallet address
 * Uses DiceBear Avataaars style
 * @param address - Wallet address
 * @returns Avatar URL
 */
export function generateAvatar(address: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
}

/**
 * Shortens a Stacks wallet address for display
 * @param address - Full wallet address
 * @param chars - Number of characters to show at start and end (default 4)
 * @returns Shortened address (e.g., "ST1A...BCDE")
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Converts STX to microSTX
 * @param stx - Amount in STX
 * @returns Amount in microSTX
 */
export function stxToMicroSTX(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Validates a game code format
 * @param code - Game code to validate
 * @returns true if valid, false otherwise
 */
export function isValidGameCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Calculates points earned for a correct answer with speed bonus
 * @param timeRemaining - Time remaining in seconds
 * @param totalTime - Total time for question in seconds
 * @returns Points earned (1000 + speed bonus up to 500)
 */
export function calculatePoints(timeRemaining: number, totalTime: number): number {
  const basePoints = 1000;
  const speedBonus = Math.floor(500 * (timeRemaining / totalTime));
  return basePoints + speedBonus;
}
