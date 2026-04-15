"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  OBSCURA_LIQUID_GLASS_FILTER_ID,
  OBSCURA_LIQUID_GLASS_LENS_PX,
  ObscuraLiquidGlassFilterSvg,
} from "@/components/home/ObscuraLiquidGlassFilterSvg";
import { detectSvgBackdropFilterUrl } from "@/lib/obscuraLiquidGlass";

/**
 * Home Obscura gallery card uses this liquid-glass puck + cursor-none on hover.
 * On the case study page we mirror that as the default cursor for the whole route.
 */
export function ObscuraPageLiquidCursor() {
  const reduceMotion = useReducedMotion();
  const [isTouch, setIsTouch] = useState(false);
  const [svgBackdrop, setSvgBackdrop] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const [lens, setLens] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion || isTouch) return;
    setLens({
      x: Math.round(window.innerWidth / 2),
      y: Math.round(window.innerHeight / 2),
    });
    setSvgBackdrop(detectSvgBackdropFilterUrl());
  }, [reduceMotion, isTouch]);

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
      <div
        className="pointer-events-none fixed left-0 top-0 z-[25] h-0 w-0"
        style={{ left: lens.x, top: lens.y }}
        aria-hidden
      >
        <div
          className={`rounded-full border border-white/12 shadow-[0_16px_52px_rgba(0,0,0,0.55)] ring-1 ring-white/5 will-change-transform ${
            svgBackdrop ? "" : "obscura-liquid-lens-fallback"
          }`}
          style={{
            width: OBSCURA_LIQUID_GLASS_LENS_PX,
            height: OBSCURA_LIQUID_GLASS_LENS_PX,
            transform: "translate(-50%, -50%) scale(1.14)",
            ...(svgBackdrop
              ? {
                  backdropFilter: `url(#${OBSCURA_LIQUID_GLASS_FILTER_ID})`,
                  WebkitBackdropFilter: `url(#${OBSCURA_LIQUID_GLASS_FILTER_ID})`,
                }
              : {}),
          }}
        />
      </div>
    </>
  );
}
