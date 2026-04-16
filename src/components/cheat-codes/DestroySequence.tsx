"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { playAlarm, playDestroyBoom, playExplosionBoom } from "@/lib/audio";

const COUNTDOWN_SEC = 3;
const DEBRIS_COUNT = 42;

/** Above `HeroCard` portal (`PORTAL_Z` 90) and page shell (`z-[1]`); cheats sit outside that portal. */
const DESTROY_PORTAL_Z = "z-[10000]";

function randomDebrisStyle(seed: number): CSSProperties {
  const left = ((seed * 47) % 100) - 8;
  const top = ((seed * 31) % 100) - 8;
  const w = 10 + (seed % 36);
  const h = 8 + (seed % 40);
  const hue = (seed * 53) % 360;
  return {
    position: "absolute",
    left: `${left}%`,
    top: `${top}%`,
    width: w,
    height: h,
    backgroundColor: `hsl(${hue} 90% 58%)`,
    borderRadius: 0,
    pointerEvents: "none",
    zIndex: 1,
    boxShadow: "0 0 12px rgba(255,200,80,0.35)",
  };
}

export function DestroySequence() {
  const [portalReady, setPortalReady] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [phase, setPhase] = useState<"shake" | "burst" | "flash" | "done">("shake");
  const overlayRef = useRef<HTMLDivElement>(null);
  const shakeTargetRef = useRef<HTMLElement | null>(null);
  const debrisRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boomRef = useRef<HTMLAudioElement | null>(null);

  const debrisKeys = useMemo(() => Array.from({ length: DEBRIS_COUNT }, (_, i) => i), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    shakeTargetRef.current =
      document.querySelector<HTMLElement>("[data-cheat-theme-scope]") ?? document.body;

    const boom = new Audio("/assets/cheat-codes/boom.wav");
    boom.preload = "auto";
    boom.load();
    boomRef.current = boom;

    const alarmTimer = window.setTimeout(() => {
      playAlarm();
    }, 1000);

    const target = shakeTargetRef.current;
    if (target) {
      gsap.to(target, {
        x: () => (Math.random() - 0.5) * 28,
        y: () => (Math.random() - 0.5) * 16,
        rotation: () => (Math.random() - 0.5) * 4,
        duration: 0.04,
        repeat: -1,
        yoyo: true,
      });
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("burst");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(alarmTimer);
      clearInterval(interval);
      const el = shakeTargetRef.current;
      if (el) {
        gsap.killTweensOf(el);
        gsap.set(el, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          clearProps: "filter",
        });
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (phase !== "burst") return;

    const target = shakeTargetRef.current;
    if (target) {
      gsap.killTweensOf(target);
    }

    const boom = boomRef.current;
    if (boom) {
      playDestroyBoom(boom);
    } else {
      playExplosionBoom();
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setPhase("flash"),
    });

    if (target) {
      gsap.set(target, { transformOrigin: "50% 50%" });
      tl.to(target, {
        scale: 1.12,
        rotation: (Math.random() - 0.5) * 10,
        filter: "blur(0px)",
        duration: 0.12,
      })
        .to(target, {
          scale: 1.55,
          rotation: (Math.random() - 0.5) * 22,
          filter: "blur(2px) contrast(1.35)",
          duration: 0.28,
        })
        .to(target, {
          scale: 2.35,
          rotation: (Math.random() - 0.5) * 38,
          opacity: 0.35,
          filter: "blur(14px) contrast(2)",
          duration: 0.55,
          ease: "expo.in",
        });
    } else {
      tl.to({}, { duration: 0.85 });
    }

    debrisRefs.current.forEach((el, i) => {
      if (!el) return;
      const dx = (Math.random() - 0.5) * 720;
      const dy = (Math.random() - 0.5) * 720;
      const rot = (Math.random() - 0.5) * 980;
      gsap.fromTo(
        el,
        { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 },
        {
          opacity: 0,
          x: dx,
          y: dy,
          rotation: rot,
          scale: 0.2 + Math.random() * 1.4,
          duration: 0.75 + Math.random() * 0.2,
          ease: "power4.out",
          delay: i * 0.012,
        }
      );
    });

    return () => {
      tl.kill();
      debrisRefs.current.forEach((el) => {
        if (el) gsap.killTweensOf(el);
      });
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "flash") return;

    const target = shakeTargetRef.current;
    if (target) {
      gsap.killTweensOf(target);
      gsap.set(target, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 0,
        clearProps: "filter",
      });
    }

    debrisRefs.current.forEach((el) => {
      if (el) {
        gsap.killTweensOf(el);
        gsap.set(el, { opacity: 0 });
      }
    });

    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { backgroundColor: "rgba(255,255,255,0)" },
        {
          backgroundColor: "rgba(255,255,255,1)",
          duration: 0.28,
          ease: "power2.in",
          onComplete: () => setPhase("done"),
        }
      );
    } else {
      setPhase("done");
    }
  }, [phase]);

  if (!portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={`pointer-events-none fixed inset-0 min-h-dvh w-full ${DESTROY_PORTAL_Z}`}>
      {phase === "done" ? (
        <DestroyDoneScreen />
      ) : (
        <div ref={overlayRef} className="pointer-events-none absolute inset-0 min-h-dvh w-full">
          {(phase === "burst" || phase === "flash") && (
            <>
              {debrisKeys.map((i) => (
                <div
                  key={i}
                  ref={(node) => {
                    debrisRefs.current[i] = node;
                  }}
                  style={randomDebrisStyle(i)}
                />
              ))}
            </>
          )}
          {phase === "shake" && (
            <div className="pointer-events-none fixed left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-xl bg-red-600/90 px-8 py-4 text-center text-white shadow-lg">
                <p className="type-h1 tabular-nums font-mono leading-none">{countdown}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
}

function DestroyDoneScreen() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="pointer-events-auto fixed inset-0 flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-4">
      {!imageFailed ? (
        <img
          src="/assets/cheat-codes/sad-hamster.png"
          alt=""
          width={192}
          height={192}
          className="h-40 w-40 object-contain md:h-48 md:w-48"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="select-none text-7xl leading-none" aria-hidden>
          🐹
        </span>
      )}
      <p className="max-w-sm text-center text-lg text-neutral-600">why would you do that</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-500 opacity-0 transition-colors hover:bg-neutral-100 animate-[destroyReloadFade_0.3s_ease_2.5s_forwards]"
      >
        reload
      </button>
      <style>{`
        @keyframes destroyReloadFade {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
