import { create } from "zustand";
import type {
  Game,
  Player,
  Question,
  GameStatus,
  LeaderboardEntry,
  Winner,
} from "@/types/game";

interface GameState {
  // Current game data
  gameId: string | null;
  game: Partial<Game> | null;
  players: Player[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  questionStartTime: number | null; // Server timestamp when current question started
  isHost: boolean;
  playerAnswer: number | null;
  leaderboard: LeaderboardEntry[];
  gameStatus: GameStatus;
  winners: Winner[] | null;

  // Actions
  setGameId: (gameId: string) => void;
  setGame: (game: Partial<Game>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (address: string) => void;
  updatePlayer: (address: string, updates: Partial<Player>) => void;
  setPlayers: (players: Player[]) => void;
  setCurrentQuestion: (question: Question | null, index: number, startTime?: number) => void;
  setPlayerAnswer: (answerIndex: number | null) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  setGameStatus: (status: GameStatus) => void;
  setWinners: (winners: Winner[] | null) => void;
  setIsHost: (isHost: boolean) => void;
  reset: () => void;
}

const initialState = {
  gameId: null,
  game: null,
  players: [],
  currentQuestion: null,
  currentQuestionIndex: -1,
  questionStartTime: null,
  isHost: false,
  playerAnswer: null,
  leaderboard: [],
  gameStatus: "waiting" as GameStatus,
  winners: null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setGameId: (gameId) => set({ gameId }),

  setGame: (game) => set({ game }),

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
    })),

  removePlayer: (address) =>
    set((state) => ({
      players: state.players.filter((p) => p.address !== address),
    })),

  updatePlayer: (address, updates) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.address === address ? { ...p, ...updates } : p
      ),
    })),

  setPlayers: (players) => set({ players }),

  setCurrentQuestion: (question, index, startTime) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: index,
      questionStartTime: startTime || null,
      playerAnswer: null, // Reset answer when new question starts
    }),

  setPlayerAnswer: (answerIndex) => set({ playerAnswer: answerIndex }),

  updateLeaderboard: (entries) => set({ leaderboard: entries }),

  setGameStatus: (status) => set({ gameStatus: status }),

  setWinners: (winners) => set({ winners }),

  setIsHost: (isHost) => set({ isHost }),

  reset: () => set(initialState),
}));
