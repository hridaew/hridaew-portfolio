"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CheatThemeClass } from "@/lib/homeCheats";
import { playChoomLoadingStart } from "@/lib/choomUiAudio";

const QUICKHACK_DURATION_MS = 2800;

/** Above recipe modal (z~200), sticky notes, lightboxes — intros must paint on top. */
const PORTAL_Z = "z-[99999]";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

type IntroBaseProps = {
  onComplete: (theme: CheatThemeClass) => void;
  onSkip: (theme: CheatThemeClass) => void;
  theme: CheatThemeClass;
};

function SkipButton({ onClick, variant = "light" }: { onClick: () => void; variant?: "light" | "cyberRed" }) {
  if (variant === "cyberRed") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="border border-[#ff0030] bg-black/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-[#ff6b7a] transition-colors hover:bg-[#ff0030]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0030]/70"
      >
        Skip
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-ink/[0.24] bg-black/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink backdrop-blur-sm transition-colors hover:bg-ink/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.4]"
    >
      Skip
    </button>
  );
}

const LINES_2004 = [
  "Internet Explorer 6 compatibility shim… OK",
  "Loading stylesheet pack: invincibles_season_03–04.css",
  "Verifying record: W38 · D0 · L0 · GF73 · GA26",
  "Cross-check: last league defeat 2003-05-07 (away, 3-2, extra time)",
  "Installing table-layout renderer · disabling border-radius polyfill",
  "Marquee entropy buffer… 48 bytes · warmed",
  "Theme pack signed · checksum 0x4F494C45",
  "Applying Win32 chrome · Done.",
] as const;

export function Theme2004Intro({ onComplete, onSkip, theme }: IntroBaseProps) {
  const reduced = usePrefersReducedMotion();
  const [lineIndex, setLineIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete(theme);
  }, [onComplete, theme]);

  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onSkip(theme);
  }, [onSkip, theme]);

  useEffect(() => {
    if (reduced) {
      setLineIndex(LINES_2004.length - 1);
      const t = window.setTimeout(finish, 1500);
      return () => clearTimeout(t);
    }
    const stepMs = 720;
    timerRef.current = setInterval(() => {
      setLineIndex((i) => {
        const next = i + 1;
        if (next >= LINES_2004.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          window.setTimeout(finish, 380);
          return i;
        }
        return next;
      });
    }, stepMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reduced, finish]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheat-2004-title"
      className={`pointer-events-auto fixed inset-0 flex min-h-dvh items-center justify-center bg-[#245edc] p-4 font-mono text-sm text-ink ${PORTAL_Z}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0_2px,rgba(0,0,0,0.04)_2px_4px)]" />
      <div className="absolute right-4 top-4 z-[2]">
        <SkipButton onClick={skip} />
      </div>
      <div
        className="relative z-[1] w-full max-w-lg border border-[#0a246a] bg-[#ece9d8] text-black shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899,2px_2px_8px_rgba(0,0,0,0.35)]"
        style={{ borderRadius: 0 }}
      >
        <div className="flex items-center justify-between border-b border-[#0a246a] bg-gradient-to-b from-[#245edc] to-[#1941a5] px-2 py-1 text-xs font-bold text-ink">
          <span id="cheat-2004-title" className="select-none">
            Theme Pack Setup
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="hidden opacity-80 sm:inline">— Web 1.0</span>
            <span
              className="flex select-none items-center gap-0.5 font-['Tahoma','Segoe_UI',sans-serif] text-[10px] font-normal leading-none tracking-tight"
              aria-hidden
            >
              <span className="flex h-[14px] w-[15px] items-center justify-center border border-[#0a246a] bg-[#2b6bd6] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                _
              </span>
              <span className="flex h-[14px] w-[15px] items-center justify-center border border-[#0a246a] bg-[#2b6bd6] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                □
              </span>
              <span className="flex h-[14px] w-[15px] items-center justify-center border border-[#0a246a] bg-[#c75050] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                ×
              </span>
            </span>
          </span>
        </div>
        <div className="space-y-2 p-4 font-['Tahoma','Segoe_UI',sans-serif] text-[13px] leading-snug text-[#000080]">
          <div className="max-h-[220px] space-y-1 overflow-y-auto border border-[#808080] bg-black p-2 font-mono text-[11px] text-[#cfcfc2]">
            {LINES_2004.slice(0, reduced ? LINES_2004.length : lineIndex + 1).map((line, i) => (
              <p key={i} className="border-b border-[#333] py-0.5 last:border-0">
                <span className="text-[#6bcc6b]">{">"}</span> {line}
              </p>
            ))}
          </div>
          <div className="h-2 w-full border border-[#808080] bg-[#c0c0c0]">
            <div
              className="h-full bg-[#000080]"
              style={{
                width: reduced ? "100%" : `${Math.min(100, ((lineIndex + 1) / LINES_2004.length) * 100)}%`,
                transition: "none",
              }}
            />
          </div>
          <p className="text-[10px] text-[#404040]">Press Enter to skip — same as Skip button.</p>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Full-screen “quickhack” loader for choom — original fiction / UI pastiche only. */
export function ChoomNetrunIntro({ onComplete, onSkip, theme }: IntroBaseProps) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const fillRef = useRef<HTMLDivElement>(null);
  const lastShownPct = useRef(-1);

  useEffect(() => {
    playChoomLoadingStart();
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete(theme);
  }, [onComplete, theme]);

  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onSkip(theme);
  }, [onSkip, theme]);

  useEffect(() => {
    if (reduced) {
      setProgress(100);
      if (fillRef.current) fillRef.current.style.width = "100%";
      const t = window.setTimeout(finish, 1500);
      return () => clearTimeout(t);
    }
    lastShownPct.current = -1;
    const start = performance.now();
    let raf = 0;
    let completeTimer: number | undefined;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / QUICKHACK_DURATION_MS) * 100);
      if (fillRef.current) fillRef.current.style.width = `${p}%`;
      const rounded = Math.round(p);
      if (rounded !== lastShownPct.current) {
        lastShownPct.current = rounded;
        setProgress(rounded);
      }
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else if (completeTimer === undefined) {
        completeTimer = window.setTimeout(finish, 280);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (completeTimer !== undefined) window.clearTimeout(completeTimer);
    };
  }, [reduced, finish]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheat-choom-title"
      className={`pointer-events-auto fixed inset-0 min-h-dvh overflow-hidden font-mono text-[#ff1e3c] ${PORTAL_Z}`}
    >
      <style>{`
        @keyframes choomQuickhackScan {
          0% { transform: translateY(0); }
          100% { transform: translateY(6px); }
        }
        @keyframes choomQuickhackTitle {
          0%, 100% { text-shadow: 0 0 18px rgba(255, 0, 48, 0.55), 0 0 42px rgba(255, 0, 48, 0.2); }
          50% { text-shadow: 0 0 26px rgba(255, 0, 48, 0.75), 2px 0 0 rgba(0, 0, 0, 0.4), -2px 0 0 rgba(255, 80, 120, 0.25); }
        }
        @keyframes choomHudGlitch {
          0%, 86%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          87% { clip-path: inset(8% 0 22% 0); transform: translate(-3px, 1px); }
          88% { clip-path: inset(28% 0 10% 0); transform: translate(2px, -1px); }
          89% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }
        @keyframes choomFrameGlitch {
          0%, 94%, 100% { transform: translate(0); filter: none; }
          94.6% { transform: translate(-2px, 1px); filter: hue-rotate(70deg) saturate(1.4); }
          95.2% { transform: translate(2px, -1px); filter: hue-rotate(-40deg); }
        }
        @keyframes choomRgbFlicker {
          0%, 100% { text-shadow: 0 0 8px rgba(255, 0, 48, 0.35); }
          33% { text-shadow: -1px 0 0 rgba(0, 240, 255, 0.4), 1px 0 0 rgba(255, 0, 80, 0.35); }
          66% { text-shadow: 1px 0 0 rgba(0, 255, 200, 0.3), -1px 0 0 rgba(255, 0, 48, 0.4); }
        }
      `}</style>
      {/* Base + horizontal “clinical” band */}
      <div className="pointer-events-none absolute inset-0 bg-[#0a0204]" />
      <div className="pointer-events-none absolute inset-x-0 top-[38%] h-[32%] -translate-y-1/2 bg-gradient-to-b from-transparent via-[#1a0408] to-transparent opacity-90" />
      {/* Faint data columns */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 56px, rgba(255,0,48,0.04) 56px 57px)",
        }}
      />

      <div className="absolute right-4 top-4 z-[6]">
        <SkipButton variant="cyberRed" onClick={skip} />
      </div>

      <div className="relative z-[2] flex min-h-dvh flex-col items-center justify-center px-5 pb-16 pt-20">
        <div
          className="relative w-full max-w-[min(540px,94vw)] border border-[#ff0030] bg-black/55 shadow-[0_0_0_1px_rgba(255,0,48,0.25),0_0_48px_rgba(255,0,48,0.12)]"
          style={{
            animation: reduced ? "none" : "choomFrameGlitch 3.2s steps(1, end) infinite",
          }}
        >
          <p className="absolute -top-5 right-0 text-[8px] uppercase tracking-[0.28em] text-[#ff6b7a]/60">
            NIGHT CITY // NETRUN OVERLAY
          </p>

          <div className="bg-[#ff0030] px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-black">
            クイックハック · アイスブレイク（雰囲気再現 · 非公式）
          </div>

          <div className="px-5 py-8 md:px-10 md:py-10">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="shrink-0 text-[#ff0030]" aria-hidden>
                <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="opacity-95 drop-shadow-[0_0_12px_rgba(255,0,48,0.5)]">
                  <path
                    fill="currentColor"
                    d="M24 4L8 14v18c0 10 6 18 16 22 10-4 16-12 16-22V14L24 4z"
                    opacity="0.35"
                  />
                  <path
                    stroke="currentColor"
                    strokeWidth="1.5"
                    d="M24 8L12 15.5V30c0 7 4 13 12 16 8-3 12-9 12-16V15.5L24 8z"
                  />
                  <circle cx="18" cy="24" r="2.5" fill="currentColor" />
                  <circle cx="30" cy="24" r="2.5" fill="currentColor" />
                  <path stroke="currentColor" strokeWidth="1.2" d="M17 34c2 3 5 5 7 5s5-2 7-5" />
                </svg>
                <p className="mt-1 text-[8px] tracking-widest text-[#ff6b7a]/80">コーデック</p>
                <p className="font-mono text-[9px] tabular-nums text-[#ff0030]/90">
                  {(0.00052 + progress * 0.000091).toFixed(5)}
                </p>
              </div>

              <div className="min-w-0 flex-1 text-center">
                <h1
                  id="cheat-choom-title"
                  className="break-words text-[clamp(1.35rem,5vw,2.75rem)] font-black uppercase leading-none tracking-[0.06em] text-[#ff0a2e] will-change-transform"
                  style={{
                    animation: reduced
                      ? "none"
                      : "choomQuickhackTitle 2.2s ease-in-out infinite, choomHudGlitch 2.8s steps(1, end) infinite",
                  }}
                >
                  Quickhack installing
                </h1>
                <p
                  className="mt-4 text-[11px] font-semibold leading-snug tracking-wide text-[#ff6b7a] will-change-transform"
                  style={{
                    animation: reduced ? "none" : "choomRgbFlicker 0.45s steps(2, end) infinite, choomHudGlitch 3.1s steps(1, end) infinite",
                  }}
                >
                  Warning: Rogue Netrunner is breaking your ice
                </p>
              </div>
            </div>

            <div
              className="relative mt-2 border border-[#ff0030]/60 bg-[#140205] p-1 shadow-[inset_0_0_20px_rgba(0,0,0,0.65)]"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Install progress"
            >
              <div
                ref={fillRef}
                className="h-3 max-w-full bg-[#ff0030] shadow-[0_0_18px_rgba(255,0,48,0.45)]"
                style={{ width: "0%", transition: "none" }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[9px] uppercase tracking-widest text-[#ff0030]/55">
              <span>buffer</span>
              <span>{Math.round(progress)}%</span>
              <span>commit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strong CRT scanlines — above UI, below Skip (z-6) */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          mixBlendMode: "soft-light",
          opacity: reduced ? 0.38 : 0.58,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(255,40,72,0.35) 1px, rgba(255,40,72,0.35) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 3px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          mixBlendMode: "multiply",
          opacity: reduced ? 0.22 : 0.48,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.62) 3px, rgba(0,0,0,0.62) 4px)",
          animation: reduced ? "none" : "choomQuickhackScan 3.2s linear infinite",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          mixBlendMode: "overlay",
          opacity: reduced ? 0.18 : 0.36,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,0,48,0.12) 0px, rgba(255,0,48,0.12) 1px, transparent 1px, transparent 4px)",
        }}
      />
    </div>,
    document.body
  );
}

/**
 * Enter = skip / apply theme. Listener is deferred so the same Enter key that
 * submitted the cheat code cannot immediately dismiss the intro before paint.
 */
export function useThemeIntroEnterSkip(enabled: boolean, onSkip: () => void) {
  useEffect(() => {
    if (!enabled) return;
    let attached = false;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSkip();
      }
    };
    const attachId = window.setTimeout(() => {
      window.addEventListener("keydown", onKey);
      attached = true;
    }, 500);
    return () => {
      window.clearTimeout(attachId);
      if (attached) window.removeEventListener("keydown", onKey);
    };
  }, [enabled, onSkip]);
}
