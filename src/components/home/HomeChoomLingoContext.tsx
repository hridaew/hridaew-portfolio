"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  preloadChoomUiAudio,
  startChoomAmbient,
  stopChoomAmbient,
} from "@/lib/choomUiAudio";
import { useHomeChoomTheme } from "@/lib/useHomeChoomTheme";

const ChoomLingoContext = createContext(false);

export function HomeChoomLingoProvider({ children }: { children: ReactNode }) {
  const isChoom = useHomeChoomTheme();

  useEffect(() => {
    if (isChoom) {
      preloadChoomUiAudio();
      startChoomAmbient();
      return () => stopChoomAmbient();
    }
    stopChoomAmbient();
  }, [isChoom]);

  const value = useMemo(() => isChoom, [isChoom]);
  return (
    <ChoomLingoContext.Provider value={value}>{children}</ChoomLingoContext.Provider>
  );
}

export function useChoomLingo(): boolean {
  return useContext(ChoomLingoContext);
}
