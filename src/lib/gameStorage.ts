// Shared in-memory game storage
// In production, replace with a database (Redis, PostgreSQL, etc.)

const games = new Map<string, any>();

export const gameStorage = {
  set: (gameId: string, data: any) => {
    games.set(gameId, data);
  },

  get: (gameId: string) => {
    return games.get(gameId);
  },

  delete: (gameId: string) => {
    games.delete(gameId);
  },

  has: (gameId: string) => {
    return games.has(gameId);
  },
};
