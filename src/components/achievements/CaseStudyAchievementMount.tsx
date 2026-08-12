"use client";

import { useCaseStudyAchievement } from "@/hooks/useCaseStudyAchievement";
import type { AchievementId } from "@/data/achievements";

/** Mount on dedicated case-study pages (stack / hard nav). Sheets use SheetNav. */
export function CaseStudyAchievementMount({ id }: { id: AchievementId }) {
  useCaseStudyAchievement(id);
  return null;
}
