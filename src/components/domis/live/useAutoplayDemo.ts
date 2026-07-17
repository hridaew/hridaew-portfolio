"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type AutoplayPhase = {
  id: string;
  durationMs: number;
};

export type UseAutoplayDemoOptions = {
  phases: AutoplayPhase[];
  /** When false, demo stays paused. Default true. */
  enabled?: boolean;
  /** Pause while pointer is over the container. Default true. */
  pauseOnHover?: boolean;
  /**
   * Minimum visible fraction (0–1) required to play.
   * Below this, the ticker pauses. Default 0.2 (~20%).
   */
  visibilityThreshold?: number;
};

export type UseAutoplayDemoResult = {
  phase: string;
  /** 0–1 progress within the current phase. */
  progress: number;
  paused: boolean;
  /** Attach to the demo root for visibility + hover pause. */
  containerRef: RefObject<HTMLElement | null>;
  replay: () => void;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Loops scripted demo phases. Pauses when off-screen (~20% visible),
 * on hover (optional), or when the user prefers reduced motion
 * (jumps to the final phase, no ticker).
 */
export function useAutoplayDemo(
  options: UseAutoplayDemoOptions
): UseAutoplayDemoResult {
  const {
    phases,
    enabled = true,
    pauseOnHover = true,
    visibilityThreshold = 0.2,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);

  const phasesRef = useRef(phases);
  const enabledRef = useRef(enabled);
  const pauseOnHoverRef = useRef(pauseOnHover);
  const thresholdRef = useRef(visibilityThreshold);

  const phaseIndexRef = useRef(0);
  const progressRef = useRef(0);
  const phaseStartedAtRef = useRef(0);
  const inViewRef = useRef(true);
  const hoverPausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  phasesRef.current = phases;
  enabledRef.current = enabled;
  pauseOnHoverRef.current = pauseOnHover;
  thresholdRef.current = visibilityThreshold;

  const computePaused = useCallback(() => {
    return (
      !enabledRef.current ||
      reducedMotionRef.current ||
      !inViewRef.current ||
      (pauseOnHoverRef.current && hoverPausedRef.current)
    );
  }, []);

  const applyPaused = useCallback(() => {
    const next = computePaused();
    if (pausedRef.current === next) return;
    // When resuming, rebase the phase clock so progress continues smoothly.
    if (pausedRef.current && !next) {
      const list = phasesRef.current;
      const current = list[phaseIndexRef.current];
      const duration = current?.durationMs ?? 0;
      phaseStartedAtRef.current =
        performance.now() - progressRef.current * duration;
    }
    pausedRef.current = next;
    setPaused(next);
  }, [computePaused]);

  const jumpToFinalPhase = useCallback(() => {
    const list = phasesRef.current;
    if (!list.length) return;
    const last = list.length - 1;
    phaseIndexRef.current = last;
    progressRef.current = 1;
    setPhaseIndex(last);
    setProgress(1);
  }, []);

  const replay = useCallback(() => {
    phaseIndexRef.current = 0;
    progressRef.current = 0;
    phaseStartedAtRef.current = performance.now();
    setPhaseIndex(0);
    setProgress(0);
    applyPaused();
  }, [applyPaused]);

  // rAF ticker + reduced-motion listener (no ticker while reduced motion is on)
  useEffect(() => {
    const stopTicker = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = (now: number) => {
      // Reduced motion: hard-stop — do not re-schedule.
      if (reducedMotionRef.current) {
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);

      if (pausedRef.current) return;

      const list = phasesRef.current;
      if (!list.length) return;

      const current = list[phaseIndexRef.current];
      if (!current || current.durationMs <= 0) {
        const next = (phaseIndexRef.current + 1) % list.length;
        phaseIndexRef.current = next;
        phaseStartedAtRef.current = now;
        progressRef.current = 0;
        setPhaseIndex(next);
        setProgress(0);
        return;
      }

      const elapsed = now - phaseStartedAtRef.current;
      const nextProgress = Math.min(1, elapsed / current.durationMs);

      // Keep continuous value in a ref; push to state when it moves enough to matter.
      if (
        Math.abs(nextProgress - progressRef.current) >= 0.008 ||
        nextProgress >= 1
      ) {
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      } else {
        progressRef.current = nextProgress;
      }

      if (nextProgress >= 1) {
        const next = (phaseIndexRef.current + 1) % list.length;
        phaseIndexRef.current = next;
        phaseStartedAtRef.current = now;
        progressRef.current = 0;
        setPhaseIndex(next);
        setProgress(0);
      }
    };

    const startTicker = () => {
      if (reducedMotionRef.current || rafRef.current !== null) return;
      phaseStartedAtRef.current =
        performance.now() -
        progressRef.current *
          (phasesRef.current[phaseIndexRef.current]?.durationMs ?? 0);
      rafRef.current = requestAnimationFrame(tick);
    };

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyMotionPreference = (reduce: boolean) => {
      reducedMotionRef.current = reduce;
      if (reduce) {
        jumpToFinalPhase();
        stopTicker();
      } else {
        startTicker();
      }
      applyPaused();
    };

    applyMotionPreference(mq.matches);

    const onMotionChange = () => {
      applyMotionPreference(mq.matches);
    };
    mq.addEventListener("change", onMotionChange);

    return () => {
      mq.removeEventListener("change", onMotionChange);
      stopTicker();
    };
  }, [applyPaused, jumpToFinalPhase]);

  // Visibility pause
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        inViewRef.current =
          entry.isIntersecting &&
          entry.intersectionRatio >= thresholdRef.current;
        applyPaused();
      },
      {
        threshold: [0, visibilityThreshold, 1],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [applyPaused, visibilityThreshold]);

  // Hover pause
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !pauseOnHover) {
      hoverPausedRef.current = false;
      applyPaused();
      return;
    }

    const onEnter = () => {
      hoverPausedRef.current = true;
      applyPaused();
    };
    const onLeave = () => {
      hoverPausedRef.current = false;
      applyPaused();
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [applyPaused, pauseOnHover]);

  // enabled / phases identity updates
  useEffect(() => {
    applyPaused();
  }, [enabled, applyPaused]);

  useEffect(() => {
    // If phases list shrinks past the current index, wrap safely.
    if (!phases.length) {
      phaseIndexRef.current = 0;
      setPhaseIndex(0);
      setProgress(0);
      return;
    }
    if (phaseIndexRef.current >= phases.length) {
      phaseIndexRef.current = 0;
      progressRef.current = 0;
      phaseStartedAtRef.current = performance.now();
      setPhaseIndex(0);
      setProgress(0);
    }
  }, [phases]);

  const phase = phases[phaseIndex]?.id ?? phases[0]?.id ?? "";

  return {
    phase,
    progress,
    paused,
    containerRef,
    replay,
  };
}
