"use client";

import { useDialKit } from "dialkit";
import { PAINTING_SEQUENCE } from "@/data/home-painting-sequence";

export function usePaintingSequenceDials() {
  return useDialKit(
    "Domis → Obscura",
    {
      canvas: {
        maxHeightVh: [88, 48, 100, 1],
        radius: [4, 0, 28, 1],
      },
      scroll: {
        trackVh: [260, 120, 480, 10],
        holdDomis: [0.36, 0.08, 0.62, 0.01],
        holdObscura: [0.2, 0.05, 0.5, 0.01],
        dissolve: [0.16, 0.04, 0.4, 0.01],
        scrub: [0.16, 0, 0.5, 0.01],
      },
    },
    {
      id: "home-painting-domis-obscura",
      persist: true,
    },
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Map track progress 0..1 onto a playhead 0..n-1.
 * Each frame holds for `holds[i]`, then remaining progress is split evenly
 * across the n-1 dissolves.
 */
export function progressToPlayhead(
  progress: number,
  holds: readonly number[],
): number {
  const n = holds.length;
  const p = clamp01(progress);
  if (n <= 1) return 0;

  const holdSum = holds.reduce((a, b) => a + b, 0);
  const transCount = n - 1;
  const minTransTotal = 0.05 * transCount;
  let scaled = Array.from(holds);
  let transBudget = 1 - holdSum;
  if (transBudget < minTransTotal) {
    const s = (1 - minTransTotal) / Math.max(holdSum, 1e-6);
    scaled = holds.map((h) => h * s);
    transBudget = minTransTotal;
  }
  const transEach = transBudget / transCount;

  let cursor = 0;
  for (let i = 0; i < n; i++) {
    const holdEnd = cursor + scaled[i];
    if (i === n - 1) return n - 1;
    if (p < holdEnd) return i;
    cursor = holdEnd;
    const transEnd = cursor + transEach;
    if (p < transEnd) return i + (p - cursor) / transEach;
    cursor = transEnd;
  }
  return n - 1;
}

export function playheadToPair(playhead: number, frameCount: number) {
  if (frameCount < 2) return { fromIndex: 0, mix: 0 };
  const maxFrom = frameCount - 2;
  const clamped = Math.min(Math.max(playhead, 0), frameCount - 1);
  const fromIndex = Math.min(maxFrom, Math.floor(clamped));
  const mix = clamped >= frameCount - 1 ? 1 : clamped - fromIndex;
  return { fromIndex, mix: clamp01(mix) };
}

export function playheadToFrameIndex(playhead: number, frameCount: number) {
  return Math.min(frameCount - 1, Math.max(0, Math.round(playhead)));
}

export function holdsForSequence(scroll: {
  holdDomis: number;
  holdObscura: number;
}) {
  if (PAINTING_SEQUENCE.length === 2) {
    return [scroll.holdDomis, scroll.holdObscura];
  }
  return PAINTING_SEQUENCE.map((_, i) => {
    if (i === 0) return scroll.holdDomis;
    if (i === PAINTING_SEQUENCE.length - 1) return scroll.holdObscura;
    return 0.2;
  });
}
