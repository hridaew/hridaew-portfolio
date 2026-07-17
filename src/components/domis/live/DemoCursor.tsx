"use client";

import { forwardRef, type CSSProperties } from "react";
import "./domis-live.css";

/** Large demo pointer path (scaled via CSS on `.domis-live-cursor`). */
export const DEMO_CURSOR_PATH =
  "M1.5 1.2 L1.5 15.4 L5.2 11.9 L7.6 17.4 L10 16.4 L7.6 11 L12 11 Z";

export type DemoCursorProps = {
  /** Left position: number = %, string = raw CSS (e.g. "120px"). */
  x?: number | string;
  /** Top position: number = %, string = raw CSS (e.g. "80px"). */
  y?: number | string;
  visible?: boolean;
  className?: string;
  style?: CSSProperties;
};

function toCssLength(value: number | string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === "number" ? `${value}%` : value;
}

export const DemoCursor = forwardRef<HTMLDivElement, DemoCursorProps>(
  function DemoCursor(
    { x = 50, y = 50, visible = true, className, style },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={["domis-live-cursor", className].filter(Boolean).join(" ")}
        data-visible={visible ? "true" : "false"}
        aria-hidden="true"
        style={{
          left: toCssLength(x, "50%"),
          top: toCssLength(y, "50%"),
          ...style,
        }}
      >
        <svg viewBox="0 0 13 19" fill="none">
          <path
            d={DEMO_CURSOR_PATH}
            fill="#fff"
            stroke="#16181c"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
);
