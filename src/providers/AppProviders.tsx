"use client";

import { ReactNode } from "react";
import { StacksProvider } from "./StacksProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StacksProvider>
      {children}
    </StacksProvider>
  );
}
