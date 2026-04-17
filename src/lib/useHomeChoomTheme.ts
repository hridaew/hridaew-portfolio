"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  HOME_CHEAT_THEME_CHANGE_EVENT,
  type CheatThemeClass,
} from "@/lib/homeCheats";

function readCyberpunkActive(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("theme-cyberpunk");
}

function subscribe(onChange: () => void): () => void {
  const root = document.documentElement;
  const obs = new MutationObserver(onChange);
  obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  const onEvt = () => onChange();
  window.addEventListener(HOME_CHEAT_THEME_CHANGE_EVENT, onEvt);
  return () => {
    obs.disconnect();
    window.removeEventListener(HOME_CHEAT_THEME_CHANGE_EVENT, onEvt);
  };
}

/** True while `html.theme-cyberpunk` (choom cheat) is active on the home route. */
export function useHomeChoomTheme(): boolean {
  return useSyncExternalStore(subscribe, readCyberpunkActive, () => false);
}

/** Stable choom pick helper for inline copy. */
export function choomPick<T>(isChoom: boolean, plain: T, netrunner: T): T {
  return isChoom ? netrunner : plain;
}

export function useChoomPick(): <T>(plain: T, netrunner: T) => T {
  const isChoom = useHomeChoomTheme();
  return useCallback(
    <T,>(plain: T, netrunner: T) => (isChoom ? netrunner : plain),
    [isChoom],
  );
}
