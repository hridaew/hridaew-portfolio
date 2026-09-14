"use client";

import { useEffect, useRef, type RefObject } from "react";
import { DOMIS_PULLBACK } from "@/data/home-painting-sequence";

export type PullbackParams = {
  pull: number;
  startSize: number;
  startX: number;
  startY: number;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function applyCrop(
  img: HTMLImageElement,
  pull: number,
  startSize: number,
  startX: number,
  startY: number,
) {
  const size = startSize + (1 - startSize) * clamp01(pull);
  const x = startX * (1 - clamp01(pull));
  const y = startY * (1 - clamp01(pull));
  const scale = 1 / Math.max(0.2, size);
  img.style.width = `${scale * 100}%`;
  img.style.height = `${scale * 100}%`;
  img.style.left = `${(-x / size) * 100}%`;
  img.style.top = `${(-y / size) * 100}%`;
}

export function PaintingPullback({
  paramsRef,
  reduceMotion,
}: {
  paramsRef: RefObject<PullbackParams>;
  reduceMotion: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const paint = () => {
      const p = paramsRef.current;
      applyCrop(
        img,
        reduceMotion ? 0 : p.pull,
        p.startSize,
        p.startX,
        p.startY,
      );
    };

    paint();
    if (reduceMotion) return;

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      paint();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paramsRef, reduceMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ touchAction: "pan-y" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={DOMIS_PULLBACK.src}
        alt=""
        className="absolute max-w-none select-none"
        draggable={false}
        decoding="async"
      />
    </div>
  );
}
