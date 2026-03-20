import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

const contractName = "stackquiz-game";

describe("StackQuiz Game Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("create-game", () => {
    it("should create a new game successfully", () => {
      const gameId = "test-game-1";
      const totalPrize = 10000000; // 10 STX

      const { result } = simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      expect(result).toBeOk(Cl.stringAscii(gameId));
    });

    it("should calculate prize distribution correctly (50/30/20)", () => {
      const gameId = "prize-test";
      const totalPrize = 10000000; // 10 STX

      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-prize-distribution",
        [Cl.stringAscii(gameId)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          first: Cl.uint(5000000), // 50%
          second: Cl.uint(3000000), // 30%
          third: Cl.uint(2000000), // 20%
        })
      );
    });

    it("should fail if game already exists", () => {
      const gameId = "duplicate-game";
      const totalPrize = 10000000;

      // Create first game
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      // Try to create duplicate
      const { result } = simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // err-game-exists
    });

    it("should fail if prize is less than 1 STX", () => {
      const gameId = "low-prize";
      const totalPrize = 500000; // 0.5 STX (below minimum)

      const { result } = simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(105)); // err-insufficient-funds
    });

    it("should transfer STX from host to contract", () => {
      const gameId = "transfer-test";
      const totalPrize = 10000000;

      const initialBalance = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0;

      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      const finalBalance = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0;

      expect(finalBalance).toBeLessThan(initialBalance);
    });

    it("should set game status to active", () => {
      const gameId = "status-test";
      const totalPrize = 10000000;

      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(gameId), Cl.uint(totalPrize)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-game-active",
        [Cl.stringAscii(gameId)],
        wallet1
      );

      expect(result).toBeBool(true);
    });
  });

  describe("register-player", () => {
    beforeEach(() => {
      // Create a game before each test
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("test-game"), Cl.uint(10000000)],
        wallet1
      );
    });

    it("should register a player successfully", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii("Player1")],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should increment player count", () => {
      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii("Player1")],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-game",
        [Cl.stringAscii("test-game")],
        wallet1
      );

      // Verify result is Some and contains player-count
      expect(result).toBeSome(
        Cl.tuple({
          host: Cl.principal(wallet1),
          "total-prize": Cl.uint(10000000),
          "first-prize": Cl.uint(5000000),
          "second-prize": Cl.uint(3000000),
          "third-prize": Cl.uint(2000000),
          status: Cl.stringAscii("active"),
          "player-count": Cl.uint(1),
          "created-at": Cl.uint(simnet.blockHeight - 1),
        })
      );
    });

    it("should fail if game does not exist", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("nonexistent"), Cl.stringAscii("Player1")],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(102)); // err-game-not-found
    });

    it("should fail if player already registered", () => {
      // Register once
      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii("Player1")],
        wallet2
      );

      // Try to register again
      const { result } = simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii("Player1-Again")],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(104)); // err-already-registered
    });

    it("should store player nickname", () => {
      const nickname = "CoolPlayer";

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii(nickname)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-player",
        [Cl.stringAscii("test-game"), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          nickname: Cl.stringAscii(nickname),
          "registered-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("should allow multiple players to register", () => {
      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii("Player1")],
        wallet2
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("test-game"), Cl.stringAscii("Player2")],
        wallet3
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-game",
        [Cl.stringAscii("test-game")],
        wallet1
      );

      // Verify result is Some and contains player-count of 2
      expect(result).toBeSome(
        Cl.tuple({
          host: Cl.principal(wallet1),
          "total-prize": Cl.uint(10000000),
          "first-prize": Cl.uint(5000000),
          "second-prize": Cl.uint(3000000),
          "third-prize": Cl.uint(2000000),
          status: Cl.stringAscii("active"),
          "player-count": Cl.uint(2),
          "created-at": Cl.uint(simnet.blockHeight - 2),
        })
      );
    });
  });

  describe("finalize-game", () => {
    beforeEach(() => {
      // Create game and register three players
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("final-game"), Cl.uint(10000000)],
        wallet1
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("final-game"), Cl.stringAscii("First")],
        wallet2
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("final-game"), Cl.stringAscii("Second")],
        wallet3
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("final-game"), Cl.stringAscii("Third")],
        wallet4
      );
    });

    it("should finalize game and distribute prizes", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update game status to finalized", () => {
      simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-game-active",
        [Cl.stringAscii("final-game")],
        wallet1
      );

      expect(result).toBeBool(false);
    });

    it("should record winners", () => {
      simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-winners",
        [Cl.stringAscii("final-game")],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          first: Cl.principal(wallet2),
          second: Cl.principal(wallet3),
          third: Cl.principal(wallet4),
          distributed: Cl.bool(true),
        })
      );
    });

    it("should fail if not called by host", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet2 // Not the host
      );

      expect(result).toBeErr(Cl.uint(100)); // err-not-host
    });

    it("should fail if winner is not registered", () => {
      const unregisteredPlayer = accounts.get("wallet_5")!;

      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(unregisteredPlayer), // Not registered
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(107)); // err-invalid-winner
    });

    it("should fail if game is not active", () => {
      // Finalize once
      simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      // Try to finalize again
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // err-game-not-active
    });

    it("should transfer correct prize amounts to winners", () => {
      const balance2Before = simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;
      const balance3Before = simnet.getAssetsMap().get("STX")?.get(wallet3) ?? 0n;
      const balance4Before = simnet.getAssetsMap().get("STX")?.get(wallet4) ?? 0n;

      simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("final-game"),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
          Cl.principal(wallet4),
        ],
        wallet1
      );

      const balance2After = simnet.getAssetsMap().get("STX")?.get(wallet2) ?? 0n;
      const balance3After = simnet.getAssetsMap().get("STX")?.get(wallet3) ?? 0n;
      const balance4After = simnet.getAssetsMap().get("STX")?.get(wallet4) ?? 0n;

      // First place should receive 50%
      expect(balance2After - balance2Before).toBe(5000000n);
      // Second place should receive 30%
      expect(balance3After - balance3Before).toBe(3000000n);
      // Third place should receive 20%
      expect(balance4After - balance4Before).toBe(2000000n);
    });
  });

  describe("cancel-game", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("cancel-test"), Cl.uint(10000000)],
        wallet1
      );
    });

    it("should cancel game successfully", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "cancel-game",
        [Cl.stringAscii("cancel-test")],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update game status to cancelled", () => {
      simnet.callPublicFn(
        contractName,
        "cancel-game",
        [Cl.stringAscii("cancel-test")],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-game-active",
        [Cl.stringAscii("cancel-test")],
        wallet1
      );

      expect(result).toBeBool(false);
    });

    it("should refund STX to host", () => {
      const balanceBefore = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0;

      simnet.callPublicFn(
        contractName,
        "cancel-game",
        [Cl.stringAscii("cancel-test")],
        wallet1
      );

      const balanceAfter = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0;

      // Balance should increase by the prize amount
      expect(balanceAfter).toBeGreaterThan(balanceBefore);
    });

    it("should fail if not called by host", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "cancel-game",
        [Cl.stringAscii("cancel-test")],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(100)); // err-not-host
    });

    it("should fail if game is not active", () => {
      // Cancel once
      simnet.callPublicFn(
        contractName,
        "cancel-game",
        [Cl.stringAscii("cancel-test")],
        wallet1
      );

      // Try to cancel again
      const { result } = simnet.callPublicFn(
        contractName,
        "cancel-game",
        [Cl.stringAscii("cancel-test")],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // err-game-not-active
    });
  });

  describe("read-only functions", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("readonly-test"), Cl.uint(10000000)],
        wallet1
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("readonly-test"), Cl.stringAscii("TestPlayer")],
        wallet2
      );
    });

    it("get-game should return game details", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-game",
        [Cl.stringAscii("readonly-test")],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          host: Cl.principal(wallet1),
          "total-prize": Cl.uint(10000000),
          "first-prize": Cl.uint(5000000),
          "second-prize": Cl.uint(3000000),
          "third-prize": Cl.uint(2000000),
          status: Cl.stringAscii("active"),
          "player-count": Cl.uint(1),
          "created-at": Cl.uint(simnet.blockHeight - 1),
        })
      );
    });

    it("get-player should return player details", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-player",
        [Cl.stringAscii("readonly-test"), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          nickname: Cl.stringAscii("TestPlayer"),
          "registered-at": Cl.uint(simnet.blockHeight),
        })
      );
    });

    it("get-player should return none for unregistered player", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-player",
        [Cl.stringAscii("readonly-test"), Cl.principal(wallet3)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("is-game-active should return true for active game", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-game-active",
        [Cl.stringAscii("readonly-test")],
        wallet1
      );

      expect(result).toBeBool(true);
    });

    it("is-game-active should return false for nonexistent game", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-game-active",
        [Cl.stringAscii("nonexistent")],
        wallet1
      );

      expect(result).toBeBool(false);
    });

    it("get-winners should return none before finalization", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-winners",
        [Cl.stringAscii("readonly-test")],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("get-prize-distribution should return correct distribution", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-prize-distribution",
        [Cl.stringAscii("readonly-test")],
        wallet1
      );

      expect(result).toBeSome(
        Cl.tuple({
          first: Cl.uint(5000000),
          second: Cl.uint(3000000),
          third: Cl.uint(2000000),
        })
      );
    });

    it("get-prize-distribution should return none for nonexistent game", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-prize-distribution",
        [Cl.stringAscii("nonexistent")],
        wallet1
      );

      expect(result).toBeNone();
    });
  });

  describe("edge cases and security", () => {
    it("should handle maximum string length for game-id", () => {
      const maxGameId = "a".repeat(32);

      const { result } = simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii(maxGameId), Cl.uint(10000000)],
        wallet1
      );

      expect(result).toBeOk(Cl.stringAscii(maxGameId));
    });

    it("should handle maximum string length for nickname", () => {
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("nickname-test"), Cl.uint(10000000)],
        wallet1
      );

      const maxNickname = "b".repeat(20);

      const { result } = simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("nickname-test"), Cl.stringAscii(maxNickname)],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should handle large prize amounts", () => {
      const largePrize = 1000000000000; // 1,000,000 STX

      const { result } = simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("large-prize"), Cl.uint(largePrize)],
        wallet1
      );

      expect(result).toBeOk(Cl.stringAscii("large-prize"));
    });

    it("should prevent host from finalizing with themselves as winner", () => {
      simnet.callPublicFn(
        contractName,
        "create-game",
        [Cl.stringAscii("self-win"), Cl.uint(10000000)],
        wallet1
      );

      // Host tries to register as player (this should work)
      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("self-win"), Cl.stringAscii("Host")],
        wallet1
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("self-win"), Cl.stringAscii("Player2")],
        wallet2
      );

      simnet.callPublicFn(
        contractName,
        "register-player",
        [Cl.stringAscii("self-win"), Cl.stringAscii("Player3")],
        wallet3
      );

      // Host can finalize with themselves as winner (allowed by contract)
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-game",
        [
          Cl.stringAscii("self-win"),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.principal(wallet3),
        ],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
