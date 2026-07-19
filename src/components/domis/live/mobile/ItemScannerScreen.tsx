"use client";

import type { CSSProperties, Ref } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import { APPLIANCE_ASSETS } from "@/components/domis/live/fixtures";
import "./item-scanner-screen.css";

export type ItemScannerMode = "capture" | "scanning";

export type ItemScannerScreenProps = {
  mode?: ItemScannerMode;
  /** Camera / plate preview image (static demo fixture). */
  plateSrc?: string;
  /** Brief white flash over the viewfinder after shutter. */
  flash?: boolean;
  /** Shutter pressed visual (scale down). */
  shutterPressed?: boolean;
  /** 0–1 scan progress for the reading indicator. */
  scanProgress?: number;
  className?: string;
  style?: CSSProperties;
  /** Ref target for the shutter hit area (demo cursor). */
  shutterRef?: Ref<HTMLDivElement | null>;
};

/**
 * Domis item scanner — capture chrome + glassy “reading label” overlay.
 * Capture stays mounted under the overlay so blur has real content to sample.
 */
export function ItemScannerScreen({
  mode = "capture",
  plateSrc = APPLIANCE_ASSETS.platePhoto,
  flash = false,
  shutterPressed = false,
  scanProgress = 0,
  className,
  style,
  shutterRef,
}: ItemScannerScreenProps) {
  const scanning = mode === "scanning";
  const progressPct = Math.max(0, Math.min(100, scanProgress * 100));

  return (
    <div
      className={["domis-live", "iss", className].filter(Boolean).join(" ")}
      style={style}
      data-mode={mode}
      aria-label={scanning ? "Reading appliance label" : "Item scanner"}
    >
      <div
        className="iss-capture"
        data-dimmed={scanning ? "true" : "false"}
        aria-hidden={scanning}
      >
        <div className="iss-frame" data-flash={flash ? "true" : "false"}>
          <img
            className="iss-frame-media"
            src={plateSrc}
            alt=""
            draggable={false}
          />
          <div className="iss-flash-btn" aria-hidden>
            <DomisLiveIcon name="flash_off" size={22} />
          </div>
        </div>

        <div className="iss-controls">
          <div className="iss-icon-btn" aria-hidden>
            <DomisLiveIcon name="close" size={22} />
          </div>
          <div
            ref={shutterRef}
            className="iss-shutter"
            data-pressed={shutterPressed ? "true" : "false"}
            aria-label="Shutter"
          />
          <div className="iss-icon-btn" aria-hidden>
            <DomisLiveIcon name="help" size={22} />
          </div>
        </div>
      </div>

      <div
        className="iss-scanning"
        data-active={scanning ? "true" : "false"}
        aria-hidden={!scanning}
      >
        <div className="iss-scan-dim" aria-hidden />

        <div className="iss-skel" aria-hidden>
          <div className="iss-skel-thumb" />
          <div className="iss-skel-line iss-skel-w-lg" />
          <div className="iss-skel-line iss-skel-w-md" />
          <div className="iss-skel-line iss-skel-w-sm" />
          <div className="iss-skel-stack">
            <div className="iss-skel-row" />
            <div className="iss-skel-row" />
            <div className="iss-skel-row" />
          </div>
        </div>

        <div className="iss-glass">
          <div className="iss-ai" aria-hidden>
            <span className="iss-ai-ring" />
            <span className="iss-ai-ring iss-ai-ring-delay" />
            <span className="iss-ai-core" />
          </div>
          <p className="iss-glass-title">Reading label</p>
          <p className="iss-glass-sub">Brand, model, and serial</p>
          <div className="iss-progress" aria-hidden>
            <div
              className="iss-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
