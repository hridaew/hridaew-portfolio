"use client";

import { useRef, useEffect } from "react";

/** Light “liquid” tilt: perspective + smoothed pointer → rotate (no WebGL). */
export function ButterChicken() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lx = useRef(0);
  const ly = useRef(0);
  const tx = useRef(0);
  const ty = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const tick = () => {
      raf.current = 0;
      const k = 0.14;
      lx.current += (tx.current - lx.current) * k;
      ly.current += (ty.current - ly.current) * k;
      img.style.transform = `perspective(1100px) rotateX(${lx.current}deg) rotateY(${ly.current}deg) scale(1.02)`;
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
        style={{ transformOrigin: "50% 45%", transform: "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1.02)" }}
        draggable={false}
      />
    </div>
  );
}
