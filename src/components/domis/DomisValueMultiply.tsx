"use client";

import { useEffect, useRef } from "react";
import "./domis-value-multiply.css";

const OUTPUT_COUNT = 4;

/**
 * One input pill → gate → many output pills.
 * Abstract principle visual; CSS loop, starts when in view.
 */
export function DomisValueMultiply() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        root.classList.add("dvm-playing");
        io.disconnect();
      },
      { threshold: 0.35 }
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="dvm"
      role="img"
      aria-label="One small input becomes many outputs"
    >
      <div className="dvm-stage">
        <div className="dvm-gate" aria-hidden />

        <div className="dvm-in-track">
          <div className="dvm-pill dvm-pill-in" />
        </div>

        <div className="dvm-outs">
          {Array.from({ length: OUTPUT_COUNT }, (_, i) => (
            <div
              key={i}
              className="dvm-pill dvm-pill-out"
              style={{ ["--i" as string]: i }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
