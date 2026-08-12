"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ACHIEVEMENTS,
  type AchievementDef,
  type AchievementId,
} from "@/data/achievements";
import { preloadAchievementUnlock } from "@/lib/achievementAudio";
import { AchievementToast } from "./AchievementToast";
import { ACH_QUEUE_GAP_MS } from "./achievementTokens";

const STORAGE_KEY = "hw-achievements-session";

type AchievementContextValue = {
  unlock: (id: AchievementId) => void;
};

const AchievementContext = createContext<AchievementContextValue>({
  unlock: () => {},
});

export function useAchievements() {
  return useContext(AchievementContext);
}

function readUnlocked(): Set<AchievementId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed.filter((id): id is AchievementId => id in ACHIEVEMENTS));
  } catch {
    return new Set();
  }
}

function writeUnlocked(set: Set<AchievementId>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* private mode / quota — ignore */
  }
}

export function AchievementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const unlockedRef = useRef<Set<AchievementId>>(new Set());
  const queueRef = useRef<AchievementId[]>([]);
  const [current, setCurrent] = useState<AchievementDef | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    unlockedRef.current = readUnlocked();
    preloadAchievementUnlock();
  }, []);

  const pump = useCallback(() => {
    if (busyRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;
    const def = ACHIEVEMENTS[next];
    if (!def) {
      pump();
      return;
    }
    busyRef.current = true;
    setCurrent(def);
  }, []);

  const unlock = useCallback(
    (id: AchievementId) => {
      if (!(id in ACHIEVEMENTS)) return;
      if (unlockedRef.current.has(id)) return;
      unlockedRef.current.add(id);
      writeUnlocked(unlockedRef.current);
      queueRef.current.push(id);
      pump();
    },
    [pump],
  );

  const onComplete = useCallback(() => {
    setCurrent(null);
    window.setTimeout(() => {
      busyRef.current = false;
      pump();
    }, ACH_QUEUE_GAP_MS);
  }, [pump]);

  const value = useMemo(() => ({ unlock }), [unlock]);

  return (
    <AchievementContext.Provider value={value}>
      {children}
      {current ? (
        <AchievementToast
          key={current.id}
          achievement={current}
          onComplete={onComplete}
        />
      ) : null}
    </AchievementContext.Provider>
  );
}
