export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  timeLimit: number; // seconds
}

export interface PlayerAnswer {
  questionId: string;
  selectedIndex: number | null;
  answeredAt: number; // timestamp
  correct: boolean;
  pointsEarned: number;
}

export interface Player {
  address: string;
  nickname: string;
  score: number;
  answers: PlayerAnswer[];
  connected: boolean;
  socketId: string;
}

export interface GameSettings {
  questionCount: number;
  timePerQuestion: number;
  minPlayers: number;
}

export type GameStatus = "waiting" | "active" | "question" | "results" | "finished";

export interface Game {
  id: string;
  hostAddress: string;
  hostSocketId: string;
  title: string;
  status: GameStatus;
  currentQuestionIndex: number;
  questions: Question[];
  players: Map<string, Player>;
  prizePool: number; // in microSTX
  settings: GameSettings;
  createdAt: number;
  questionStartTime: number;
}

export interface LeaderboardEntry {
  address: string;
  nickname: string;
  score: number;
  rank: number;
}

export interface Winner {
  address: string;
  nickname: string;
  score: number;
  prize: number; // in microSTX
}

// Socket.io event payloads
export interface JoinGamePayload {
  gameId: string;
  address: string;
  nickname: string;
}

export interface SubmitAnswerPayload {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}

export interface StartGamePayload {
  gameId: string;
}

export interface FinalizeGamePayload {
  gameId: string;
  winners: [string, string, string];
}

export interface PlayerJoinedPayload {
  address: string;
  nickname: string;
  avatar: string;
}

export interface QuestionStartPayload {
  question: Omit<Question, "correctIndex">;
  questionIndex: number;
  timeLimit: number;
}

export interface QuestionEndPayload {
  correctIndex: number;
  stats: {
    [key: number]: number; // answer index -> count
  };
}

export interface LeaderboardUpdatePayload {
  rankings: LeaderboardEntry[];
}

export interface GameFinishedPayload {
  winners: Winner[];
  prizeDistribution: {
    first: number;
    second: number;
    third: number;
  };
  finalRankings: LeaderboardEntry[];
}
