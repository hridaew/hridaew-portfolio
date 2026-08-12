import type { LucideIcon } from "lucide-react";
import {
  Bomb,
  Cat,
  Cigarette,
  Construction,
  CookingPot,
  Cpu,
  Disc3,
  Dumbbell,
  Eye,
  Focus,
  Hand,
  House,
  Mail,
  PawPrint,
  ScanLine,
  Smile,
  StickyNote,
  Sword,
  Trash2,
  Wind,
  Zap,
} from "lucide-react";

export type AchievementId =
  | "domis"
  | "virdio"
  | "obscura"
  | "memory-care"
  | "about"
  | "hero-face"
  | "painting-orb"
  | "copy-email"
  | "album"
  | "game-cyberpunk"
  | "game-halflife2"
  | "game-dishonored"
  | "virdio-space"
  | "punch-bag"
  | "pet-cat"
  | "sticky-note"
  | "gaze"
  | "cheat-2004"
  | "cheat-choom"
  | "cheat-destroy"
  | "cheat-butter-chicken";

export type AchievementDef = {
  id: AchievementId;
  title: string;
  icon: LucideIcon;
};

export const ACHIEVEMENTS: Record<AchievementId, AchievementDef> = {
  domis: { id: "domis", title: "Hello homeowner", icon: House },
  virdio: { id: "virdio", title: "Get moving!", icon: Dumbbell },
  obscura: { id: "obscura", title: "Witness the Obscura", icon: Eye },
  "memory-care": { id: "memory-care", title: "Meow", icon: Cat },
  about: { id: "about", title: "Hello there", icon: Hand },
  "hero-face": { id: "hero-face", title: "I'm touched", icon: Smile },
  "painting-orb": {
    id: "painting-orb",
    title: "Must've been the wind",
    icon: Wind,
  },
  "copy-email": { id: "copy-email", title: "Hit me up", icon: Mail },
  album: { id: "album", title: "Is this taste?", icon: Disc3 },
  "game-cyberpunk": {
    id: "game-cyberpunk",
    title: "No gonks allowed",
    icon: Cpu,
  },
  "game-halflife2": {
    id: "game-halflife2",
    title: "Pick up that can",
    icon: Trash2,
  },
  "game-dishonored": {
    id: "game-dishonored",
    title: "Whiskey and cigars?",
    icon: Cigarette,
  },
  "virdio-space": {
    id: "virdio-space",
    title: "Setup done!",
    icon: ScanLine,
  },
  "punch-bag": { id: "punch-bag", title: "Good work!", icon: Zap },
  "pet-cat": { id: "pet-cat", title: "MRRROWWW", icon: PawPrint },
  "sticky-note": { id: "sticky-note", title: "Noted.", icon: StickyNote },
  gaze: { id: "gaze", title: "I see what you see", icon: Focus },
  "cheat-2004": {
    id: "cheat-2004",
    title: "Under construction",
    icon: Construction,
  },
  "cheat-choom": { id: "cheat-choom", title: "Wake up, samurai", icon: Sword },
  "cheat-destroy": { id: "cheat-destroy", title: "Oops.", icon: Bomb },
  "cheat-butter-chicken": {
    id: "cheat-butter-chicken",
    title: "Extra butter",
    icon: CookingPot,
  },
};

/** Case-study sheet/page keys that unlock after ~1s open. */
export const CASE_STUDY_ACHIEVEMENT_IDS = [
  "domis",
  "virdio",
  "obscura",
  "memory-care",
] as const satisfies readonly AchievementId[];

export function isCaseStudyAchievementId(
  key: string | null,
): key is (typeof CASE_STUDY_ACHIEVEMENT_IDS)[number] {
  return (
    key === "domis" ||
    key === "virdio" ||
    key === "obscura" ||
    key === "memory-care"
  );
}
