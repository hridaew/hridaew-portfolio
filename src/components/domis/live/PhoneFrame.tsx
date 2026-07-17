"use client";

import type { CSSProperties, ReactNode } from "react";
import "./domis-live.css";
import { useDesignScale } from "./useDesignScale";

/** Flutter ScreenUtil base — keep screen ports at this size, then scale. */
export const PHONE_DESIGN_WIDTH = 390;
export const PHONE_DESIGN_HEIGHT = 844;

export type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  /** Override design canvas width (px). Default 390. */
  designWidth?: number;
  /** Override design canvas height (px). Default 844. */
  designHeight?: number;
};

export function PhoneFrame({
  children,
  className,
  "aria-label": ariaLabel = "Phone demo",
  designWidth = PHONE_DESIGN_WIDTH,
  designHeight = PHONE_DESIGN_HEIGHT,
}: PhoneFrameProps) {
  const { shellRef, scale } = useDesignScale(designWidth);

  return (
    <div
      ref={shellRef}
      className={["domis-live", "domis-live-phone-shell", className]
        .filter(Boolean)
        .join(" ")}
      style={{ height: designHeight * scale }}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="domis-live-phone-canvas"
        style={
          {
            "--domis-design-w": `${designWidth}px`,
            "--domis-design-h": `${designHeight}px`,
            width: designWidth,
            height: designHeight,
            transform: `scale(${scale})`,
          } as CSSProperties
        }
      >
        <div className="domis-live-phone-screen">{children}</div>
      </div>
    </div>
  );
}
