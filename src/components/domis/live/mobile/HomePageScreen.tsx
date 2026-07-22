"use client";

import type { CSSProperties } from "react";
import "./home-page-screen.css";

/**
 * Domis Home / Tasks tab — real product capture only.
 * Source: `public/assets/home/domis-home-screen.png`
 *
 * Do not recreate Flutter chrome (FAB, nav, cards) in React unless the user
 * explicitly asks after confirming a port is acceptable. Prefer real captures
 * or exact source — never a crude stand-in.
 */
export type HomePageScreenProps = {
  className?: string;
  style?: CSSProperties;
};

export function HomePageScreen({ className, style }: HomePageScreenProps) {
  return (
    <div
      className={["domis-live", "hps", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Domis home tab"
    >
      <img
        className="hps-shot"
        src="/assets/home/domis-home-screen.png"
        alt="Domis home tab — upcoming tasks and Domis Recommends"
        width={1170}
        height={2532}
        draggable={false}
      />
    </div>
  );
}
