"use client";

import { useEffect } from "react";
import {
  isCaseStudyAchievementId,
  type AchievementId,
} from "@/data/achievements";
import { useAchievements } from "@/components/achievements/AchievementProvider";

const OPEN_DELAY_MS = 1000;

/** Fire a case-study unlock ~1s after open; clears timer on unmount / key change. */
export function useCaseStudyAchievement(key: string | null) {
  const { unlock } = useAchievements();

  useEffect(() => {
    if (!isCaseStudyAchievementId(key)) return;
    const id = key as AchievementId;
    const t = window.setTimeout(() => unlock(id), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [key, unlock]);
}
