import { useStacks } from "@/providers/StacksProvider";
import {
  AnchorMode,
  PostConditionMode,
  stringAsciiCV,
  uintCV,
  principalCV,
  fetchCallReadOnlyFunction,
  cvToJSON,
} from "@stacks/transactions";
import { openContractCall } from "@stacks/connect";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import { stxToMicroSTX } from "@/lib/utils";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || "sabix-game";

export function useContract() {
  const { network: providerNetwork, address } = useStacks();

  // Ensure we have a valid network object
  const isTestnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet";
  const network = isTestnet ? STACKS_TESTNET : STACKS_MAINNET;

  console.log("🔧 useContract network:", {
    usingTestnet: isTestnet,
    networkUrl: network.client.baseUrl
  });

  /**
   * Create a new game with prize pool
   */
  const createGame = async (gameId: string, prizeAmount: number): Promise<string> => {
    console.log("🎮 createGame called with:", { gameId, prizeAmount, address });

    if (!address) throw new Error("Wallet not connected");

    const prizeInMicroSTX = stxToMicroSTX(prizeAmount);
    console.log("💰 Prize in microSTX:", prizeInMicroSTX);

    return new Promise((resolve, reject) => {
      try {
        console.log("📞 Calling openContractCall with:", {
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          networkUrl: network.client.baseUrl
        });

        openContractCall({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "create-game",
          functionArgs: [stringAsciiCV(gameId), uintCV(prizeInMicroSTX)],
          network,
          anchorMode: AnchorMode.Any,
          postConditionMode: PostConditionMode.Allow,
          onFinish: (data) => {
            console.log("✅ Transaction successful:", data.txId);
            resolve(data.txId);
          },
          onCancel: () => {
            console.log("❌ Transaction cancelled by user");
            reject(new Error("Transaction cancelled by user"));
          },
        });
      } catch (error) {
        console.error("❌ openContractCall threw error:", error);
        reject(error);
      }
    });
  };

  /**
   * Register a player for a game
   */
  const registerPlayer = async (gameId: string, nickname: string): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "register-player",
        functionArgs: [stringAsciiCV(gameId), stringAsciiCV(nickname)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error("Transaction cancelled by user"));
        },
      });
    });
  };

  /**
   * Finalize game and distribute prizes
   */
  const finalizeGame = async (
    gameId: string,
    first: string,
    second: string,
    third: string,
    firstPrize: number,
    secondPrize: number,
    thirdPrize: number
  ): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "finalize-game",
        functionArgs: [
          stringAsciiCV(gameId),
          principalCV(first),
          principalCV(second),
          principalCV(third),
        ],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error("Transaction cancelled by user"));
        },
      });
    });
  };

  /**
   * Cancel game and refund host (only works for games in "waiting" status)
   */
  const cancelGame = async (gameId: string): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "cancel-game",
        functionArgs: [stringAsciiCV(gameId)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error("Transaction cancelled by user"));
        },
      });
    });
  };

  /**
   * Emergency refund - works for any non-finalized game
   * Use this if game gets stuck and needs funds recovered
   */
  const emergencyRefund = async (gameId: string): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "emergency-refund",
        functionArgs: [stringAsciiCV(gameId)],
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          resolve(data.txId);
        },
        onCancel: () => {
          reject(new Error("Transaction cancelled by user"));
        },
      });
    });
  };

  /**
   * Get game details (read-only)
   */
  const getGame = async (gameId: string) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-game",
        functionArgs: [stringAsciiCV(gameId)],
        network,
        senderAddress: address || CONTRACT_ADDRESS,
      });

      return cvToJSON(result);
    } catch (error) {
      console.error("Failed to get game:", error);
      return null;
    }
  };

  /**
   * Get player registration (read-only)
   */
  const getPlayer = async (gameId: string, playerAddress: string) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-player",
        functionArgs: [stringAsciiCV(gameId), principalCV(playerAddress)],
        network,
        senderAddress: address || CONTRACT_ADDRESS,
      });

      return cvToJSON(result);
    } catch (error) {
      console.error("Failed to get player:", error);
      return null;
    }
  };

  /**
   * Check if game is active (read-only)
   */
  const isGameActive = async (gameId: string) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "is-game-active",
        functionArgs: [stringAsciiCV(gameId)],
        network,
        senderAddress: address || CONTRACT_ADDRESS,
      });

      const jsonResult = cvToJSON(result);
      return jsonResult.value === true;
    } catch (error) {
      console.error("Failed to check game status:", error);
      return false;
    }
  };

  /**
   * Get prize distribution (read-only)
   */
  const getPrizeDistribution = async (gameId: string) => {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-prize-distribution",
        functionArgs: [stringAsciiCV(gameId)],
        network,
        senderAddress: address || CONTRACT_ADDRESS,
      });

      return cvToJSON(result);
    } catch (error) {
      console.error("Failed to get prize distribution:", error);
      return null;
    }
  };

  return {
    createGame,
    registerPlayer,
    finalizeGame,
    cancelGame,
    emergencyRefund,
    getGame,
    getPlayer,
    isGameActive,
    getPrizeDistribution,
  };
}
