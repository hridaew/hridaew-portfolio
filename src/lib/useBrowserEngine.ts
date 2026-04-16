"use client";

import { useEffect, useState } from "react";

export type BrowserEngine = "chromium" | "other" | "unknown";

export function getBrowserEngine(): BrowserEngine {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "unknown";
  }

  // Detect Chromium (Chrome, Edge, Opera, Brave, etc.)
  // @ts-ignore
  if (window.chrome && typeof window.chrome !== "undefined") {
    return "chromium";
  }

  // Check user-agent for chromium-based identifiers
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("chrome/") || ua.includes("chromium/") || ua.includes("edg/")) {
    return "chromium";
  }

  return "other";
}

export function useBrowserEngine(): BrowserEngine {
  const [engine, setEngine] = useState<BrowserEngine>("unknown");

  useEffect(() => {
    setEngine(getBrowserEngine());
  }, []);

  return engine;
}
