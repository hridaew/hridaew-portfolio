"use client";

import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { playAlarm, playDestroyBoom, playExplosionBoom } from "@/lib/audio";

const COUNTDOWN_SEC = 3;
const DEBRIS_COUNT = 42;

/** Above `HeroCard` portal (`PORTAL_Z` 90) and page shell (`z-[1]`); cheats sit outside that portal. */
const DESTROY_PORTAL_Z = "z-[10000]";

const PRELUDE_LINES = [
  "MCC-LINK :: primary range safety handshake… ACK",
  "VERIFY_RANGE_SAFETY checksum 0x9E2F441B … PASS",
  "Telemetry: shell_attitude=stable · thermal= nominal · comms=GREEN",
  "Operator note: “We are go for demonstration burst — stand clear of viewport.”",
  "Arm sequence: SAFE → TEST → LIVE (simulated)",
  "Final poll: flight_director=GO · range_safety=GO · intern=… hesitant GO",
  "WARNING: This is a portfolio gag. Real ordnance would use more paperwork.",
] as const;

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

function initialPhase(): "prelude" | "shake" {
  if (typeof window === "undefined") return "prelude";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "shake" : "prelude";
}

export function DestroySequence() {
  const [portalReady, setPortalReady] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [phase, setPhase] = useState<"prelude" | "shake" | "burst" | "flash" | "done">(initialPhase);
  const [preludeIndex, setPreludeIndex] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const shakeTargetRef = useRef<HTMLElement | null>(null);
  const debrisRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boomRef = useRef<HTMLAudioElement | null>(null);
  const preludeDoneRef = useRef(false);

  const debrisKeys = useMemo(() => Array.from({ length: DEBRIS_COUNT }, (_, i) => i), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const skipPrelude = useCallback(() => {
    if (phase !== "prelude") return;
    preludeDoneRef.current = true;
    setPhase("shake");
  }, [phase]);

  useEffect(() => {
    if (phase !== "prelude") return;
    preludeDoneRef.current = false;
    setPreludeIndex(0);
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("shake");
      return;
    }
    const step = 520;
    const id = window.setInterval(() => {
      setPreludeIndex((i) => {
        const next = i + 1;
        if (next >= PRELUDE_LINES.length) {
          window.clearInterval(id);
          window.setTimeout(() => {
            if (!preludeDoneRef.current) setPhase("shake");
          }, 420);
          return i;
        }
        return next;
      });
    }, step);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "shake") return;

    shakeTargetRef.current =
      document.querySelector<HTMLElement>("[data-cheat-theme-scope]") ?? document.body;

    const boom = new Audio("/assets/cheat-codes/boom.wav");
    boom.preload = "auto";
    boom.load();
    boomRef.current = boom;

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const alarmTimer = window.setTimeout(() => {
      playAlarm();
    }, 1000);

    const target = shakeTargetRef.current;
    if (target && !reduceMotion) {
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
  }, [phase]);

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

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => setPhase("flash"),
    });

    if (target) {
      gsap.set(target, { transformOrigin: "50% 50%" });
      if (reduceMotion) {
        tl.to(target, {
          scale: 1.08,
          opacity: 0.85,
          filter: "blur(4px) contrast(1.2)",
          duration: 0.35,
        }).to(target, {
          scale: 1.35,
          opacity: 0.4,
          filter: "blur(10px) contrast(1.6)",
          duration: 0.45,
          ease: "expo.in",
        });
      } else {
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
      }
    } else {
      tl.to({}, { duration: reduceMotion ? 0.55 : 0.85 });
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
          duration: (reduceMotion ? 0.45 : 0.75) + Math.random() * 0.2,
          ease: "power4.out",
          delay: reduceMotion ? i * 0.006 : i * 0.012,
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

  useEffect(() => {
    if (phase !== "prelude") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        skipPrelude();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, skipPrelude]);

  if (!portalReady || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 min-h-dvh w-full ${DESTROY_PORTAL_Z}`}>
      {phase === "prelude" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="destroy-prelude-title"
          className="pointer-events-auto absolute inset-0 z-[10001] flex items-center justify-center bg-[#0a0c10] p-4"
        >
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={skipPrelude}
              className="rounded border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/90 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Skip
            </button>
          </div>
          <div className="w-full max-w-2xl border border-emerald-500/40 bg-black/85 p-5 font-mono text-[12px] leading-relaxed text-emerald-100/95 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
            <h2 id="destroy-prelude-title" className="mb-3 border-b border-emerald-500/30 pb-2 text-[11px] uppercase tracking-[0.25em] text-emerald-300/90">
              Mission control · range demo (simulated)
            </h2>
            <div className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto text-[11px] text-emerald-100/85">
              {PRELUDE_LINES.slice(0, preludeIndex + 1).map((line, i) => (
                <p key={i}>
                  <span className="select-none text-emerald-500/80">[{String(i + 1).padStart(2, "0")}]</span> {line}
                </p>
              ))}
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-emerald-500/60">Enter — continue to countdown</p>
          </div>
        </div>
      )}

      {phase === "done" ? (
        <DestroyDoneScreen />
      ) : (
        <div
          ref={overlayRef}
          className={`absolute inset-0 min-h-dvh w-full ${phase === "prelude" ? "pointer-events-none" : "pointer-events-none"}`}
        >
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
  const incidentId = useMemo(() => {
    const hex = () => Math.floor(Math.random() * 16).toString(16);
    return `INC-2077-${Array.from({ length: 8 }, hex).join("").toUpperCase()}`;
  }, []);

  const stamp = useMemo(() => new Date().toISOString(), []);

  return (
    <div className="pointer-events-auto fixed inset-0 flex min-h-dvh flex-col items-center justify-center gap-5 bg-white px-4">
      <div className="max-w-md text-center font-mono text-[10px] uppercase leading-relaxed text-neutral-500">
        <p className="tracking-[0.2em]">Post-incident summary (internal)</p>
        <p className="mt-1 text-neutral-400">
          <span className="text-neutral-600">Case</span> {incidentId}
        </p>
        <p className="mt-0.5">
          <span className="text-neutral-600">Timestamp</span> {stamp}
        </p>
        <p className="mt-2 text-[9px] normal-case leading-snug text-neutral-400">
          Outcome: operator invoked “destroy” on a personal site. No databases were harmed.
        </p>
      </div>
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
