"use client";

import type { CSSProperties, Ref } from "react";
import { APPLIANCE_ASSETS } from "@/components/domis/live/fixtures";
import "./item-scanner-screen.css";

export type ItemScannerMode = "capture" | "scanning";

export type ItemScannerScreenProps = {
  mode?: ItemScannerMode;
  /** Camera / plate preview image (static demo fixture). */
  plateSrc?: string;
  scanningMascotSrc?: string;
  /** Brief white flash over the viewfinder after shutter. */
  flash?: boolean;
  /** Shutter pressed visual (scale down). */
  shutterPressed?: boolean;
  /** 0–1 scan progress bar (ItemScanningScreen). */
  scanProgress?: number;
  /** Fun fact under “Scanning…” — fixture-driven. */
  scanFact?: string;
  className?: string;
  style?: CSSProperties;
  /** Ref target for the shutter hit area (demo cursor). */
  shutterRef?: Ref<HTMLDivElement | null>;
};

const DEFAULT_FACT =
  "Barcodes were first used in 1974.";

function MaterialIcon({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden
      style={{ fontSize: size, width: size, height: size }}
    >
      {name}
    </span>
  );
}

/**
 * Presentational Domis item scanner — InAppItemScanner chrome +
 * ItemScanningScreen overlay. No camera / Riverpod; fixtures only.
 */
export function ItemScannerScreen({
  mode = "capture",
  plateSrc = APPLIANCE_ASSETS.platePhoto,
  scanningMascotSrc = APPLIANCE_ASSETS.scanningMascot,
  flash = false,
  shutterPressed = false,
  scanProgress = 0,
  scanFact = DEFAULT_FACT,
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
      aria-label={scanning ? "Scanning appliance label" : "Item scanner"}
    >
      <div className="iss-capture" aria-hidden={scanning}>
        <div className="iss-frame" data-flash={flash ? "true" : "false"}>
          <img
            className="iss-frame-media"
            src={plateSrc}
            alt=""
            draggable={false}
          />
          <div className="iss-flash-btn">
            <MaterialIcon name="flash_off" />
          </div>
        </div>

        <p className="iss-instruction">
          Scanning works best when capturing an item’s label or box – basically
          anywhere there’s a lot of readable information!
        </p>

        <div className="iss-spacer" />

        <div className="iss-controls">
          <div className="iss-icon-btn" aria-hidden>
            <MaterialIcon name="close" />
          </div>
          <div
            ref={shutterRef}
            className="iss-shutter"
            data-pressed={shutterPressed ? "true" : "false"}
            aria-label="Shutter"
          />
          <div className="iss-icon-btn" aria-hidden>
            <MaterialIcon name="help" />
          </div>
        </div>
      </div>

      <div
        className="iss-scanning"
        data-active={scanning ? "true" : "false"}
        aria-hidden={!scanning}
      >
        <div className="iss-scanning-body">
          <img
            className="iss-scanning-mascot"
            src={scanningMascotSrc}
            alt=""
            draggable={false}
          />
          <p className="iss-scanning-title">Scanning...</p>
          <p className="iss-scanning-fact">{scanFact}</p>
        </div>
        <div className="iss-progress-track" aria-hidden>
          <div
            className="iss-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="iss-scan-close" aria-hidden>
          <MaterialIcon name="close" />
        </div>
      </div>
    </div>
  );
}
