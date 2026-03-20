"use client";

import { useState } from "react";
import { Wallet, LogOut } from "lucide-react";
import { useStacks } from "@/providers/StacksProvider";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConnectWallet() {
  const { isConnected, address, connect, disconnect } = useStacks();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await connect();
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  if (isConnected && address) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setShowMenu(true)}
          className="gap-2"
        >
          <Wallet className="w-4 h-4" />
          {shortenAddress(address)}
        </Button>

        <Dialog open={showMenu} onOpenChange={setShowMenu}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wallet Connected</DialogTitle>
              <DialogDescription>
                Your wallet is connected to BlockStar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Address</p>
                <p className="font-mono text-white break-all">{address}</p>
              </div>

              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleConnect}
        loading={isLoading}
        disabled={isLoading}
        className="gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>

      {error && (
        <Dialog open={!!error} onOpenChange={() => setError(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connection Error</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setError(null)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
