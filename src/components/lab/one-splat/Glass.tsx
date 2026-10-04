"use client";

import type { ReactNode } from "react";
import styles from "./OneSplat.module.css";

/** A liquid-glass shell around a button: white glass whose edges (and, faintly, body) take the project's colour. */
export function Glass({ children }: { children: ReactNode }) {
  return (
    <span
      className={styles.glass}
      onPointerMove={(e) => {
        // a soft highlight that follows the pointer across the glass
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </span>
  );
}
