"use client";

import type { CSSProperties } from "react";

export type DomisLiveIconProps = {
  /** Material Symbols Rounded ligature name. */
  name: string;
  size?: number;
  color?: string;
  className?: string;
};

/**
 * Material Symbols Rounded icon via ligature (self-hosted font).
 */
export function DomisLiveIcon({
  name,
  size = 20,
  color = "currentColor",
  className,
}: DomisLiveIconProps) {
  const style = {
    fontSize: size,
    width: size,
    height: size,
    color,
    lineHeight: 1,
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  } as CSSProperties;

  return (
    <span
      className={["material-symbols-rounded", "domis-live-icon", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden
    >
      {name}
    </span>
  );
}
