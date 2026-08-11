/**
 * Home layout mode: twin-pane split (≥1024) vs single-column stack (<1024).
 * Sheets soft-nav only in split; stack uses full-page transitions.
 */

export type HomeLayoutMode = "split" | "stack";

/** Enter split at this width (and above). */
export const HOME_SPLIT_MIN_WIDTH = 1024;

/** Hysteresis band so dragging the window across 1024 doesn't thrash. */
export const HOME_SPLIT_HYSTERESIS_PX = 8;

/** Left pane never grows past this; right takes remaining space. */
export const HOME_SPLIT_LEFT_MAX_PX = 720;

const MQ_SPLIT = `(min-width: ${HOME_SPLIT_MIN_WIDTH}px)`;

let currentMode: HomeLayoutMode | null = null;
const listeners = new Set<(mode: HomeLayoutMode) => void>();

function readModeFromWidth(width: number, prev: HomeLayoutMode): HomeLayoutMode {
  if (prev === "split") {
    return width < HOME_SPLIT_MIN_WIDTH - HOME_SPLIT_HYSTERESIS_PX
      ? "stack"
      : "split";
  }
  return width >= HOME_SPLIT_MIN_WIDTH ? "split" : "stack";
}

function ensureMode(): HomeLayoutMode {
  if (typeof window === "undefined") return "stack";
  if (currentMode == null) {
    currentMode = window.matchMedia(MQ_SPLIT).matches ? "split" : "stack";
  }
  return currentMode;
}

function stampAttr(mode: HomeLayoutMode) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-home-layout", mode);
  }
}

function setMode(next: HomeLayoutMode) {
  const changed = currentMode !== next;
  currentMode = next;
  stampAttr(next);
  if (changed) {
    listeners.forEach((fn) => fn(next));
  }
}

function syncFromViewport() {
  if (typeof window === "undefined") return;
  const prev = ensureMode();
  setMode(readModeFromWidth(window.innerWidth, prev));
}

let subscribed = false;

function ensureViewportSubscription() {
  if (typeof window === "undefined" || subscribed) return;
  subscribed = true;
  syncFromViewport();
  const mq = window.matchMedia(MQ_SPLIT);
  mq.addEventListener("change", syncFromViewport);
  window.addEventListener("resize", syncFromViewport);
}

export function getHomeLayoutMode(): HomeLayoutMode {
  ensureViewportSubscription();
  return ensureMode();
}

export function isHomeSplitLayout(): boolean {
  return getHomeLayoutMode() === "split";
}

export function applyHomeLayoutDataAttr(mode: HomeLayoutMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-home-layout", mode);
}

export function subscribeHomeLayoutMode(
  onChange: (mode: HomeLayoutMode) => void,
): () => void {
  ensureViewportSubscription();
  listeners.add(onChange);
  onChange(ensureMode());
  return () => {
    listeners.delete(onChange);
  };
}
