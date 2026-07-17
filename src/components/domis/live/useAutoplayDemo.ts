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
  const wasPausedRef = useRef(false);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [inView, setInView] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const paused =
    !enabled ||
    reducedMotion ||
    !inView ||
    (pauseOnHover && hoverPaused);

  // Keep latest option values available to the rAF ticker / observers.
  useEffect(() => {
    phasesRef.current = phases;
    enabledRef.current = enabled;
    pauseOnHoverRef.current = pauseOnHover;
    thresholdRef.current = visibilityThreshold;
  }, [phases, enabled, pauseOnHover, visibilityThreshold]);

  // Mirror derived pause into refs and rebase the phase clock on resume.
  useEffect(() => {
    if (wasPausedRef.current && !paused) {
      const list = phasesRef.current;
      const current = list[phaseIndexRef.current];
      const duration = current?.durationMs ?? 0;
      phaseStartedAtRef.current =
        performance.now() - progressRef.current * duration;
    }
    wasPausedRef.current = paused;
    pausedRef.current = paused;
  }, [paused]);

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
    // Reduced motion: stay on the final static frame; never restart the loop.
    if (reducedMotionRef.current) {
      jumpToFinalPhase();
      return;
    }
    phaseIndexRef.current = 0;
    progressRef.current = 0;
    phaseStartedAtRef.current = performance.now();
    setPhaseIndex(0);
    setProgress(0);
  }, [jumpToFinalPhase]);

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

      if (phaseIndexRef.current >= list.length) {
        phaseIndexRef.current = 0;
        progressRef.current = 0;
        phaseStartedAtRef.current = now;
        setPhaseIndex(0);
        setProgress(0);
        return;
      }

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
      setReducedMotion(reduce);
      if (reduce) {
        jumpToFinalPhase();
        stopTicker();
      } else {
        startTicker();
      }
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
  }, [jumpToFinalPhase]);

  // Visibility pause
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const nextInView =
          entry.isIntersecting &&
          entry.intersectionRatio >= thresholdRef.current;
        inViewRef.current = nextInView;
        setInView(nextInView);
      },
      {
        threshold: [0, visibilityThreshold, 1],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibilityThreshold]);

  // Hover pause (when pauseOnHover is false, hoverPaused is ignored in `paused`)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !pauseOnHover) return;

    const onEnter = () => {
      hoverPausedRef.current = true;
      setHoverPaused(true);
    };
    const onLeave = () => {
      hoverPausedRef.current = false;
      setHoverPaused(false);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [pauseOnHover]);

  // Clamp display index if the phases list shrinks (ticker also guards refs).
  const safePhaseIndex =
    phases.length === 0 ? 0 : Math.min(phaseIndex, phases.length - 1);
  const phase = phases[safePhaseIndex]?.id ?? phases[0]?.id ?? "";

  return {
    phase,
    progress,
    paused,
    containerRef,
    replay,
  };
}
