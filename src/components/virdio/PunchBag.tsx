"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface PunchBagProps {
  className?: string;
}

const celebrations = [
  "Nice!",
  "Great!",
  "Amazing!",
  "Keep going!",
  "Wow!",
  "Power!",
  "Beast mode!",
  "Unstoppable!",
];

export function PunchBag({ className }: PunchBagProps) {
  const [count, setCount] = useState(0);
  const [ppm, setPpm] = useState(0);
  const [celebration, setCelebration] = useState<string | null>(null);
  const bagRef = useRef<SVGSVGElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const ppmBarRef = useRef<HTMLDivElement>(null);
  const countRef = useRef(0);
  const punchTimestampsRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // PPM sliding window calculation
  const updatePPM = useCallback(() => {
    const now = Date.now();
    const windowMs = 5000;
    // Remove old timestamps
    punchTimestampsRef.current = punchTimestampsRef.current.filter(
      (t) => now - t < windowMs
    );
    const punchesInWindow = punchTimestampsRef.current.length;
    const currentPPM = Math.round((punchesInWindow / 5) * 60);
    setPpm(currentPPM);

    // Animate bar
    if (ppmBarRef.current) {
      const barHeight = Math.min(currentPPM / 300, 1) * 100; // 300 PPM = full bar
      gsap.to(ppmBarRef.current, {
        height: `${barHeight}%`,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, []);

  // Play thud sound via Web Audio API
  const playThud = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(90 + Math.random() * 30, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }, []);

  const punch = useCallback(() => {
    const newCount = countRef.current + 1;
    countRef.current = newCount;
    setCount(newCount);

    // Record timestamp for PPM
    punchTimestampsRef.current.push(Date.now());
    updatePPM();

    // Play thud
    playThud();

    // Swing the bag
    if (bagRef.current) {
      gsap.killTweensOf(bagRef.current);
      gsap.fromTo(
        bagRef.current,
        { rotation: 0, transformOrigin: "50% 0%" },
        {
          rotation: 15 + Math.random() * 10,
          duration: 0.12,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(bagRef.current, {
              rotation: 0,
              duration: 0.8,
              ease: "elastic.out(1, 0.3)",
            });
          },
        }
      );
    }

    // Celebration every 10 punches
    if (newCount % 10 === 0) {
      const text = celebrations[Math.floor(Math.random() * celebrations.length)];
      setCelebration(text);

      if (celebrationRef.current) {
        gsap.killTweensOf(celebrationRef.current);
        gsap.fromTo(
          celebrationRef.current,
          { opacity: 0, y: 10, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "back.out(2)",
            onComplete: () => {
              gsap.to(celebrationRef.current, {
                opacity: 0,
                y: -10,
                duration: 0.4,
                delay: 0.8,
                ease: "power2.in",
                onComplete: () => setCelebration(null),
              });
            },
          }
        );
      }
    }
  }, [updatePPM, playThud]);

  // Decay PPM when not punching
  useEffect(() => {
    const interval = setInterval(updatePPM, 1000);
    return () => {
      clearInterval(interval);
      if (bagRef.current) gsap.killTweensOf(bagRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [updatePPM]);

  return (
    <div className={cn("flex flex-col items-center gap-6 py-10", className)}>

      <div className="relative select-none flex items-end gap-6">
        {/* Celebration text */}
        <div
          ref={celebrationRef}
          className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 pointer-events-none z-10"
        >
          {celebration && (
            <span className="font-[family-name:var(--font-dm-sans)] text-lg font-bold text-violet-500 whitespace-nowrap">
              {celebration}
            </span>
          )}
        </div>

        {/* Punching Bag SVG — Purple Cylindrical */}
        <svg
          ref={bagRef}
          width="120"
          height="220"
          viewBox="0 0 120 220"
          className="cursor-pointer active:scale-95 transition-transform"
          onClick={punch}
          style={{ transformOrigin: "50% 0%" }}
        >
          {/* Chain/rope */}
          <line
            x1="60" y1="0" x2="60" y2="50"
            stroke="#a3a3a3" strokeWidth="3" strokeDasharray="4 4"
          />
          {/* Mount bracket */}
          <rect x="45" y="0" width="30" height="8" rx="3" fill="#737373" />
          {/* Swivel */}
          <circle cx="60" cy="50" r="6" fill="#525252" />
          {/* Connection straps */}
          <line x1="45" y1="80" x2="60" y2="55" stroke="#404040" strokeWidth="2" />
          <line x1="75" y1="80" x2="60" y2="55" stroke="#404040" strokeWidth="2" />
          {/* Bag top strap */}
          <path d="M40 75 Q60 65 80 75 L75 85 Q60 78 45 85 Z" fill="#525252" />

          {/* Bag body — single rounded rect */}
          <rect x="28" y="80" width="64" height="110" rx="24" ry="24" fill="#7C3AED" />
        </svg>

        {/* PPM Meter */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-wide">
            PPM
          </span>
          <div className="relative w-5 h-[140px] rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden">
            <div
              ref={ppmBarRef}
              className="absolute bottom-0 left-0 w-full rounded-full"
              style={{
                height: "0%",
                background: "linear-gradient(to top, #A78BFA, #7C3AED, #5B21B6)",
              }}
            />
          </div>
          <span className="font-[family-name:var(--font-dm-sans)] text-sm font-semibold text-neutral-700 tabular-nums">
            {ppm}
          </span>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-3">
        <span className="font-[family-name:var(--font-instrument-serif)] text-4xl text-neutral-900">
          {count}
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500">
          {count === 1 ? "punch" : "punches"}
        </span>
      </div>
    </div>
  );
}
