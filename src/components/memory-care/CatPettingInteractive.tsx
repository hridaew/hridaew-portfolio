"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface CatPettingInteractiveProps {
  className?: string;
}

export function CatPettingInteractive({ className }: CatPettingInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<SVGGElement>(null);
  const speakerRef = useRef<SVGGElement>(null);
  const tvRef = useRef<SVGGElement>(null);
  const hapticLeftRef = useRef<SVGGElement>(null);
  const hapticRightRef = useRef<SVGGElement>(null);
  const signalRefs = useRef<(SVGElement | null)[]>([]);
  const [isPetting, setIsPetting] = useState(false);
  const moveCountRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const animTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const meowAudioRef = useRef<HTMLAudioElement | null>(null);

  const activateSystem = useCallback(() => {
    if (animTimelineRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });
    animTimelineRef.current = tl;

    // Pulse signals from cat to each element
    const signals = signalRefs.current.filter(Boolean) as SVGElement[];

    // Cat purr vibration
    tl.to(catRef.current, {
      x: 1, duration: 0.05, yoyo: true, repeat: 5, ease: "power1.inOut",
    }, 0);
    tl.to(catRef.current, {
      x: -1, duration: 0.05, yoyo: true, repeat: 5, ease: "power1.inOut",
    }, 0.3);
    tl.to(catRef.current, { x: 0, duration: 0.1 }, 0.6);

    // Animate signal paths (stroke-dashoffset for flow effect)
    signals.forEach((signal, i) => {
      tl.fromTo(
        signal,
        { strokeDashoffset: 20, opacity: 0.3 },
        { strokeDashoffset: 0, opacity: 1, duration: 0.6, ease: "power1.out" },
        i * 0.15
      );
    });

    // Speaker pulses
    tl.to(speakerRef.current, {
      scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "center",
    }, 0.3);

    // TV glow
    tl.to(tvRef.current, {
      opacity: 1, duration: 0.4, ease: "power1.out",
    }, 0.2);

    // Haptic emitter pulses
    tl.to(hapticLeftRef.current, {
      scale: 1.1, duration: 0.2, yoyo: true, repeat: 2, ease: "power1.inOut", transformOrigin: "center",
    }, 0.4);
    tl.to(hapticRightRef.current, {
      scale: 1.1, duration: 0.2, yoyo: true, repeat: 2, ease: "power1.inOut", transformOrigin: "center",
    }, 0.5);

    tl.to({}, { duration: 0.4 }); // pause before repeat
  }, []);

  const deactivateSystem = useCallback(() => {
    if (animTimelineRef.current) {
      animTimelineRef.current.kill();
      animTimelineRef.current = null;
    }

    // Reset all elements
    const resetEls = [catRef.current, speakerRef.current, tvRef.current, hapticLeftRef.current, hapticRightRef.current];
    resetEls.forEach((el) => {
      if (el) gsap.to(el, { scale: 1, x: 0, opacity: 0.5, duration: 0.3 });
    });

    signalRefs.current.forEach((signal) => {
      if (signal) gsap.to(signal, { opacity: 0.15, duration: 0.3 });
    });
  }, []);

  const handleMouseMove = useCallback(() => {
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 120) return;
    lastMoveTimeRef.current = now;
    moveCountRef.current += 1;

    if (moveCountRef.current >= 3 && !isPetting) {
      setIsPetting(true);
      activateSystem();
    }
  }, [isPetting, activateSystem]);

  const handleMouseLeave = useCallback(() => {
    moveCountRef.current = 0;
    setIsPetting(false);
    deactivateSystem();
  }, [deactivateSystem]);

  const handleCatClick = useCallback(() => {
    if (!meowAudioRef.current) return;
    meowAudioRef.current.currentTime = 0;
    meowAudioRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    // Preload meow sound
    meowAudioRef.current = new Audio("/assets/memory-care/meow.mp3");
    meowAudioRef.current.load();

    return () => {
      if (animTimelineRef.current) animTimelineRef.current.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("flex flex-col items-center gap-4 py-8", className)}>
      <svg
        viewBox="0 0 460 320"
        className="w-full max-w-[460px] h-auto"
        style={{ overflow: "visible" }}
      >
        {/* Signal paths (animated connections) */}
        {/* Cat → Speaker */}
        <path
          ref={(el) => { signalRefs.current[0] = el; }}
          d="M160 160 Q100 130 70 100"
          fill="none"
          stroke="#a3a3a3"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.15"
        />
        {/* Cat → TV */}
        <path
          ref={(el) => { signalRefs.current[1] = el; }}
          d="M230 120 Q230 70 230 50"
          fill="none"
          stroke="#a3a3a3"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.15"
        />
        {/* Cat → Haptic Left */}
        <path
          ref={(el) => { signalRefs.current[2] = el; }}
          d="M180 200 Q130 250 100 270"
          fill="none"
          stroke="#a3a3a3"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.15"
        />
        {/* Cat → Haptic Right */}
        <path
          ref={(el) => { signalRefs.current[3] = el; }}
          d="M280 200 Q330 250 360 270"
          fill="none"
          stroke="#a3a3a3"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.15"
        />

        {/* TV (top center) */}
        <g ref={tvRef} opacity="0.5">
          <rect x="185" y="10" width="90" height="55" rx="6" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1.5" />
          <polygon points="225,28 225,48 242,38" fill="#a3a3a3" opacity="0.6" />
          <text x="230" y="78" textAnchor="middle" className="text-[10px] fill-neutral-500 font-[family-name:var(--font-dm-sans)]">TV</text>
        </g>

        {/* Speaker (top-left) */}
        <g ref={speakerRef} opacity="0.5">
          <rect x="35" y="70" width="60" height="50" rx="8" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1.5" />
          <circle cx="65" cy="90" r="10" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <circle cx="65" cy="90" r="4" fill="#a3a3a3" />
          <text x="65" y="135" textAnchor="middle" className="text-[10px] fill-neutral-500 font-[family-name:var(--font-dm-sans)]">Speaker</text>
        </g>

        {/* Cat (center) — interactive zone */}
        <g
          ref={catRef}
          opacity="0.5"
          style={{ cursor: "pointer" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
          onClick={handleCatClick}
        >
          {/* Invisible hit area for interactions */}
          <rect x="175" y="105" width="110" height="100" fill="transparent" />
          {/* Cat image */}
          <image
            href="/assets/memory-care/kittycat.png"
            x="175"
            y="105"
            width="110"
            height="100"
            preserveAspectRatio="xMidYMid meet"
          />
          <text x="230" y="218" textAnchor="middle" className="text-[10px] fill-neutral-500 font-[family-name:var(--font-dm-sans)]">Cat (pet me!)</text>
        </g>

        {/* Haptic Emitter Left */}
        <g ref={hapticLeftRef} opacity="0.5">
          <rect x="65" y="250" width="60" height="40" rx="6" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1.5" />
          {/* Vibration waves */}
          <path d="M82 260 Q85 265 82 270" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <path d="M88 258 Q92 265 88 272" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <path d="M94 256 Q99 265 94 274" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <text x="95" y="305" textAnchor="middle" className="text-[10px] fill-neutral-500 font-[family-name:var(--font-dm-sans)]">Haptic L</text>
        </g>

        {/* Haptic Emitter Right */}
        <g ref={hapticRightRef} opacity="0.5">
          <rect x="335" y="250" width="60" height="40" rx="6" fill="#f5f5f5" stroke="#a3a3a3" strokeWidth="1.5" />
          {/* Vibration waves */}
          <path d="M352 260 Q355 265 352 270" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <path d="M358 258 Q362 265 358 272" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <path d="M364 256 Q369 265 364 274" fill="none" stroke="#a3a3a3" strokeWidth="1.5" />
          <text x="365" y="305" textAnchor="middle" className="text-[10px] fill-neutral-500 font-[family-name:var(--font-dm-sans)]">Haptic R</text>
        </g>
      </svg>

      <p className="text-sm text-neutral-500 font-[family-name:var(--font-dm-sans)]">
        {isPetting ? "The system is responding to your touch..." : "Hover over the cat to activate the experience"}
      </p>
    </div>
  );
}
