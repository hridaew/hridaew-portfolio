/**
 * Choom (theme-cyberpunk) UI sounds — assets in `/public/assets/choom-ui/`
 * (user-supplied Cyberpunk 2077-style SFX). Pastiche only.
 */

const ASSETS = {
  clickOpen: "/assets/choom-ui/opening-phone-contacts.mp3",
  clickClose: "/assets/choom-ui/closing-phone-contacts.mp3",
  loading: "/assets/choom-ui/biochip-malfunctioning.mp3",
  ambient: "/assets/choom-ui/breaching.mp3",
  heroExpand: "/assets/choom-ui/skill-advancing.mp3",
} as const;

let ambientEl: HTMLAudioElement | null = null;

/** After `playChoomClick()`, the next `playChoomClick()` uses the other clip. */
let clickAlternateUseOpenNext = true;

function prefersReducedUiMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playOneShot(src: string, volume: number): void {
  try {
    const a = new Audio(src);
    a.volume = volume;
    void a.play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/** Opening vs closing phone contact, alternating per call. */
export function playChoomClick(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(
    clickAlternateUseOpenNext ? ASSETS.clickOpen : ASSETS.clickClose,
    0.52,
  );
  clickAlternateUseOpenNext = !clickAlternateUseOpenNext;
}

/** Dedicated “close” UI (e.g. hero card collapse); next `playChoomClick()` is opening. */
export function playChoomClickClosing(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(ASSETS.clickClose, 0.5);
  clickAlternateUseOpenNext = true;
}

let lastLoadingStartMs = 0;

/** Quickhack / loader bed (Biochip); deduped for React Strict Mode double-mount in dev. */
export function playChoomLoadingStart(): void {
  if (prefersReducedUiMotion()) return;
  const now = Date.now();
  if (now - lastLoadingStartMs < 500) return;
  lastLoadingStartMs = now;
  playOneShot(ASSETS.loading, 0.36);
}

/** Expanded hero “Games” row — first cover (Cyberpunk 2077). Any theme; not deduped. */
export function playBiochipMalfunctionHeroGame(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(ASSETS.loading, 0.4);
}

const HL2_GAME_COVER_PICKUP = "/assets/hero-expanded-games/hl2-pick-up-that-can-1.mp3";

/** Expanded hero “Games” row — second cover (Half-Life 2). Any theme; not deduped. */
export function playHalfLife2HeroGameCover(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(HL2_GAME_COVER_PICKUP, 0.48);
}

const GAME3_HEART_WHISPER = "/assets/hero-expanded-games/heart-whisper-6-klickaud.mp3";

/** Expanded hero “Games” row — third cover. Any theme; not deduped. */
export function playGame3HeroCover(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(GAME3_HEART_WHISPER, 0.48);
}

export function playChoomHeroExpand(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(ASSETS.heroExpand, 0.44);
}

/** Theme intro finished / choom HUD live — same asset as ambient bed, one-shot stinger. */
export function playChoomThemeReady(): void {
  if (prefersReducedUiMotion()) return;
  playOneShot(ASSETS.ambient, 0.38);
}

export function startChoomAmbient(): void {
  if (prefersReducedUiMotion()) return;
  stopChoomAmbient();
  try {
    const a = new Audio(ASSETS.ambient);
    a.loop = true;
    a.volume = 0.09;
    a.setAttribute("playsinline", "");
    ambientEl = a;
    void a.play().catch(() => {});
  } catch {
    ambientEl = null;
  }
}

export function stopChoomAmbient(): void {
  const a = ambientEl;
  ambientEl = null;
  if (!a) return;
  try {
    a.pause();
    a.currentTime = 0;
    a.removeAttribute("src");
    a.load();
  } catch {
    /* ignore */
  }
}

/** True when choom cheat theme is active on `<html>`. */
export function isChoomThemeDocument(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("theme-cyberpunk");
}
