"use client";

import type { CSSProperties, ReactNode } from "react";
import "./domis-live.css";
import { useDesignScale } from "./useDesignScale";

/** Default create-home panel canvas — tweak via props or CSS vars. */
export const BROWSER_DESIGN_WIDTH = 720;
export const BROWSER_DESIGN_HEIGHT = 640;

export type BrowserFrameProps = {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  /** Chrome bar label (optional). */
  title?: string;
  /** When false, omits the traffic-light / title bar. Default true. */
  showChrome?: boolean;
  /** Override design canvas width (px). Default 720. */
  designWidth?: number;
  /** Override design canvas height (px). Default 640. */
  designHeight?: number;
};

export function BrowserFrame({
  children,
  className,
  "aria-label": ariaLabel = "Browser demo",
  title = "domis.app",
  showChrome = true,
  designWidth = BROWSER_DESIGN_WIDTH,
  designHeight = BROWSER_DESIGN_HEIGHT,
}: BrowserFrameProps) {
  const { shellRef, scale } = useDesignScale(designWidth);

  return (
    <div
      ref={shellRef}
      className={["domis-live", "domis-live-browser-shell", className]
        .filter(Boolean)
        .join(" ")}
      style={{ height: designHeight * scale }}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="domis-live-browser-stage"
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
        {showChrome ? (
          <div className="domis-live-browser-chrome" aria-hidden="true">
            <div className="domis-live-browser-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="domis-live-browser-title">{title}</div>
          </div>
        ) : null}
        <div className="domis-live-browser-content">{children}</div>
      </div>
    </div>
  );
}
