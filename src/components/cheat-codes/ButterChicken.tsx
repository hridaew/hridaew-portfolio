"use client";

import { useRef, useEffect, useCallback } from "react";

type ButterChickenProps = {
  onDismiss?: () => void;
};

/** Fullscreen cheat reward: tilt plate + vignette + grain; Esc calls `onDismiss` when provided. */
export function ButterChicken({ onDismiss }: ButterChickenProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lx = useRef(0);
  const ly = useRef(0);
  const tx = useRef(0);
  const ty = useRef(0);
  const raf = useRef<number>(0);

  const dismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (!onDismiss) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss, onDismiss]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const tick = () => {
      raf.current = 0;
      const k = 0.14;
      lx.current += (tx.current - lx.current) * k;
      ly.current += (ty.current - ly.current) * k;
      img.style.transform = `perspective(1100px) rotateX(${lx.current}deg) rotateY(${ly.current}deg) scale(1.04)`;
      if (Math.abs(tx.current - lx.current) > 0.02 || Math.abs(ty.current - ly.current) > 0.02) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    const queue = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      tx.current = -ny * 11;
      ty.current = nx * 13;
      queue();
    };

    const onLeave = () => {
      tx.current = 0;
      ty.current = 0;
      queue();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointercancel", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[200] cursor-grab touch-none"
      style={{ touchAction: "none" }}
    >
      <img
        ref={imgRef}
        src="/assets/cheat-codes/butterchicken.png"
        alt=""
        className="h-full w-full object-cover will-change-transform"
        style={{ transformOrigin: "50% 42%", transform: "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1.04)" }}
        draggable={false}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />
    </div>
  );
}
