"use client";

import { useEffect, useRef } from "react";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { useReducedMotion } from "framer-motion";
import { LivingPaintingCanvas, type LivingPaintingParams } from "./LivingPaintingCanvas";
import { useLivingPaintingDials } from "./useLivingPaintingDials";
import { MIGHTY_HAND_ALT } from "@/data/home-painting-storyboard";

export function HomePaintingStudio() {
  const p = useLivingPaintingDials();
  const reduceMotion = useReducedMotion() === true;
  const paramsRef = useRef<LivingPaintingParams>({
    displace: p.paint.displace,
    zoom: p.paint.zoom,
    vignette: p.paint.vignette,
    light: p.paint.light,
    tilt: p.motion.tilt,
    follow: p.motion.follow,
    idle: p.motion.idle,
    idleAmount: p.motion.idleAmount,
    idleSpeed: p.motion.idleSpeed,
  });

  useEffect(() => {
    paramsRef.current = {
      displace: p.paint.displace,
      zoom: p.paint.zoom,
      vignette: p.paint.vignette,
      light: p.paint.light,
      tilt: p.motion.tilt,
      follow: p.motion.follow,
      idle: p.motion.idle && !reduceMotion,
      idleAmount: p.motion.idleAmount,
      idleSpeed: p.motion.idleSpeed,
    };
  }, [p, reduceMotion]);

  return (
    <>
      <figure className="flex w-full flex-col gap-3">
        <div
          className="relative mx-auto overflow-hidden bg-[#120a1c]"
          style={{
            width: `min(100%, calc(${p.canvas.maxHeightVh}vh * 3 / 4))`,
            aspectRatio: "3 / 4",
            borderRadius: p.canvas.radius,
            boxShadow: `0 ${24 + p.canvas.lift * 80}px ${48 + p.canvas.lift * 120}px rgba(18, 10, 28, ${0.18 + p.canvas.lift})`,
          }}
        >
          <LivingPaintingCanvas
            paramsRef={paramsRef}
            reduceMotion={reduceMotion}
          />
        </div>
        <figcaption className="type-caption-medium font-mono uppercase text-ink-muted">
          Mighty Hand · acrylic
        </figcaption>
        <span className="sr-only">{MIGHTY_HAND_ALT}</span>
      </figure>
      <DialRoot productionEnabled position="bottom-left" theme="dark" />
    </>
  );
}
