/** Xbox 360 unlock chime — trimmed to the sting (see achievements design spec). */

let unlockAudio: HTMLAudioElement | null = null;

function prefersReducedUiMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function preloadAchievementUnlock() {
  if (typeof window === "undefined") return;
  if (unlockAudio) return;
  unlockAudio = new Audio("/assets/achievements/unlock.mp3");
  unlockAudio.volume = 0.55;
  unlockAudio.preload = "auto";
  unlockAudio.load();
}

export function playAchievementUnlock() {
  if (typeof window === "undefined") return;
  if (prefersReducedUiMotion()) return;
  if (!unlockAudio) {
    unlockAudio = new Audio("/assets/achievements/unlock.mp3");
    unlockAudio.volume = 0.55;
  }
  unlockAudio.currentTime = 0;
  void unlockAudio.play().catch(() => {});
}
