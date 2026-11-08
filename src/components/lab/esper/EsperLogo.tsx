"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The HW mark (the favicon, redrawn as vectors): six bars, 3 wide with 1 between, on a 23 x 16 grid. The second and
 * fifth have their tops cut at 45 degrees; the second also stops short of the baseline.
 */
const BARS = [
  "M0 0H3V16H0Z",
  "M4 4.6L7 1.6V14.6H4Z",
  "M8 0H11V16H8Z",
  "M12 0H15V16H12Z",
  "M16 4.6L19 1.6V16H16Z",
  "M20 0H23V16H20Z",
];

/**
 * The loading mark. The bars rise in one after another, the mark fills left to right as the room loads (it is the
 * progress bar), and when the room is ready the bars drop away in turn as the house fades in behind.
 */
export function EsperLogo({ progress, done, className }: { progress: number; done: boolean; className?: string }) {
  const clip = useId().replace(/:/g, "");
  const fill = Math.max(0, Math.min(1, progress)) * 23;
  return (
    <svg
      viewBox="-0.5 -0.5 24 17"
      aria-hidden
      className={cn("esper-logo overflow-visible", done && "esper-logo-out", className)}
    >
      <defs>
        <clipPath id={clip}>
          <rect x="-0.5" y="-0.5" height="17" className="esper-logo-fill" style={{ width: fill + 0.5 }} />
        </clipPath>
      </defs>
      {BARS.map((d, i) => (
        <g key={i} className="esper-logo-bar" style={{ "--i": i } as React.CSSProperties}>
          {/* The bar as it waits, faint, and the same bar lit as far as loading has reached. */}
          <path d={d} fill="currentColor" opacity={0.16} />
          <path d={d} fill="currentColor" clipPath={`url(#${clip})`} />
        </g>
      ))}
    </svg>
  );
}
