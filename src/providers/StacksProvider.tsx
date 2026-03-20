"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { STACKS_TESTNET, STACKS_MAINNET } from "@stacks/network";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

type StacksNetworks = typeof STACKS_TESTNET | typeof STACKS_MAINNET;

interface StacksContextType {
  network: StacksNetworks;
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  userSession: UserSession;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

interface StacksProviderProps {
  children: ReactNode;
}

export function StacksProvider({ children }: StacksProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Determine network based on environment
  const isTestnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet";
  const network = isTestnet ? STACKS_TESTNET : STACKS_MAINNET;

  // Debug: Log network configuration
  useEffect(() => {
    console.log("🌐 Network config:", {
      isTestnet,
      networkUrl: network.client.baseUrl,
      expectedAddressPrefix: isTestnet ? "ST..." : "SP..."
    });
  }, [isTestnet, network]);

  // Check for existing session on mount
  useEffect(() => {
    try {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        const userAddress = userData.profile.stxAddress[isTestnet ? "testnet" : "mainnet"];
        console.log("👛 Loading address:", {
          testnetAddress: userData.profile.stxAddress.testnet,
          mainnetAddress: userData.profile.stxAddress.mainnet,
          selectedAddress: userAddress,
          usingTestnet: isTestnet
        });
        setAddress(userAddress);
        setIsConnected(true);
      }
    } catch (error) {
      // Clear incompatible session data (v8 -> v7 migration)
      console.warn("Clearing incompatible session data:", error);
      userSession.signUserOut();
      setAddress(null);
      setIsConnected(false);
    }
  }, [isTestnet]);

  const connect = async () => {
    try {
      // Use showConnect from @stacks/connect v7
      // Note: v7 doesn't support network parameter in showConnect
      // The wallet shows both networks - we select correct address on reload
      showConnect({
        appDetails: {
          name: "BlockStar",
          icon: typeof window !== "undefined" ? window.location.origin + "/logo.svg" : "/logo.svg",
        },
        redirectTo: '/',
        onFinish: () => {
          console.log("Wallet connected successfully, reloading to apply network:", isTestnet ? "testnet" : "mainnet");
          window.location.reload();
        },
        onCancel: () => {
          console.log("User cancelled wallet connection");
        },
      });
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      alert(`Failed to connect wallet: ${error.message || "Unknown error"}`);
    }
  };

  const disconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <StacksContext.Provider
      value={{
        network,
        isConnected,
        address,
        connect,
        disconnect,
        userSession,
      }}
    >
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error("useStacks must be used within a StacksProvider");
  }
  return context;
}
