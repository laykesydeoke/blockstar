"use client";

import { ReactNode } from "react";
import { StacksProvider } from "./StacksProvider";
import { SocketProvider } from "./SocketProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StacksProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </StacksProvider>
  );
}
