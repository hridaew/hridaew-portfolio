"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  OBSCURA_LIQUID_GLASS_FILTER_ID,
  OBSCURA_LIQUID_GLASS_LENS_PX,
  ObscuraLiquidGlassFilterSvg,
} from "@/components/home/ObscuraLiquidGlassFilterSvg";
import {
  detectSvgBackdropFilterUrl,
} from "@/lib/obscuraLiquidGlass";

import { useBrowserEngine } from "@/lib/useBrowserEngine";
import { ThreeGlassLensFallback } from "./ThreeGlassLensFallback";

/**
 * Home Obscura gallery card uses this liquid-glass puck + cursor-none on hover.
 * On the case study page we mirror that as the default cursor for the whole route.
 */
export function ObscuraPageLiquidCursor() {
  const reduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);
  const engine = useBrowserEngine();
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const [lens, setLens] = useState({ x: 0, y: 0 });
  // Same capability check the home card uses — avoids applying a broken filter on Chrome
  const [svgBackdropSupported, setSvgBackdropSupported] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion || isTouch) return;
    setLens({
      x: Math.round(window.innerWidth / 2),
      y: Math.round(window.innerHeight / 2),
    });
  }, [reduceMotion, isTouch]);

  // Detect whether backdropFilter: url(#…) actually composites on this browser/GPU
  useEffect(() => {
    setSvgBackdropSupported(detectSvgBackdropFilterUrl());
  }, []);

  const flush = useCallback(() => {
    rafRef.current = 0;
    const p = posRef.current;
    setLens({ x: p.x, y: p.y });
  }, []);

  useEffect(() => {
    if (reduceMotion || isTouch) return;

    const onPointerMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        flush();
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [flush, reduceMotion, isTouch]);

  if (reduceMotion || isTouch) return null;

  return (
    <>
      <ObscuraLiquidGlassFilterSvg />
      {engine === "chromium" ? (
        <div
          className="pointer-events-none fixed left-0 top-0 z-[25] h-0 w-0"
          style={{ left: lens.x, top: lens.y }}
          aria-hidden
        >
          <div
            className="rounded-full border border-white/12 shadow-[0_16px_52px_rgba(0,0,0,0.55)] ring-1 ring-white/5 will-change-transform"
            style={{
              width: OBSCURA_LIQUID_GLASS_LENS_PX,
              height: OBSCURA_LIQUID_GLASS_LENS_PX,
              transform: "translate(-50%, -50%) scale(1.14)",
              ...(svgBackdropSupported
                ? {
                    backdropFilter: `url(#${OBSCURA_LIQUID_GLASS_FILTER_ID})`,
                    WebkitBackdropFilter: `url(#${OBSCURA_LIQUID_GLASS_FILTER_ID})`,
                  }
                : {}),
            }}
          />
        </div>
      ) : (
        <div className="pointer-events-none fixed left-0 top-0 z-[25] h-0 w-0">
          <ThreeGlassLensFallback
            x={lens.x}
            y={lens.y}
            imageSrc="/assets/obscura/wayne_1946.avif"
            isFixed
            diameter={OBSCURA_LIQUID_GLASS_LENS_PX / 2}
          />
        </div>
      )}
    </>
  );
}
