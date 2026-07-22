"use client";

import type { CSSProperties, Ref } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import { APPLIANCE_ASSETS } from "@/components/domis/live/fixtures";
import "./item-scanner-screen.css";

export type ItemScannerScreenProps = {
  /** Camera / plate preview image (static demo fixture). */
  plateSrc?: string;
  /** Brief white flash over the viewfinder after shutter. */
  flash?: boolean;
  /** Shutter pressed visual (scale down). */
  shutterPressed?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Ref target for the shutter hit area (demo cursor). */
  shutterRef?: Ref<HTMLDivElement | null>;
};

/**
 * Domis item scanner — capture chrome only (demo skips the reading overlay).
 */
export function ItemScannerScreen({
  plateSrc = APPLIANCE_ASSETS.platePhoto,
  flash = false,
  shutterPressed = false,
  className,
  style,
  shutterRef,
}: ItemScannerScreenProps) {
  return (
    <div
      className={["domis-live", "iss", className].filter(Boolean).join(" ")}
      style={style}
      data-mode="capture"
      aria-label="Item scanner"
    >
      <div className="iss-capture">
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
    </div>
  );
}
