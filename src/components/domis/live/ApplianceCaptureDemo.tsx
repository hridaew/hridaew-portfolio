"use client";

import {
  useMemo,
  type CSSProperties,
  type RefObject,
} from "react";
import { PhoneFrame } from "@/components/domis/live/PhoneFrame";
import {
  useAutoplayDemo,
  type AutoplayPhase,
} from "@/components/domis/live/useAutoplayDemo";
import {
  APPLIANCE_ASSETS,
  APPLIANCE_CAPTURE,
} from "@/components/domis/live/fixtures";
import { ItemScannerScreen } from "@/components/domis/live/mobile/ItemScannerScreen";
import { ItemFieldsPanel } from "@/components/domis/live/mobile/ItemFieldsPanel";
import "./appliance-capture-demo.css";

/** ~14s loop — cursor → shutter → scan → fields fill → hold → reset. */
const PHASES: AutoplayPhase[] = [
  { id: "idle", durationMs: 700 },
  { id: "aiming", durationMs: 900 },
  { id: "capturing", durationMs: 400 },
  { id: "reading", durationMs: 2400 },
  { id: "filled", durationMs: 1100 },
  { id: "hold", durationMs: 2600 },
];

export type ApplianceCaptureDemoProps = {
  className?: string;
  style?: CSSProperties;
  /** When false, shows end state only (no loop). Default true. */
  autoplay?: boolean;
};

type DemoView = {
  mode: "capture" | "scanning";
  flash: boolean;
  shutterPressed: boolean;
  scanProgress: number;
  fieldsFilled: boolean;
  fieldsReveal: number;
};

function deriveView(phase: string, progress: number): DemoView {
  const base: DemoView = {
    mode: "capture",
    flash: false,
    shutterPressed: false,
    scanProgress: 0,
    fieldsFilled: false,
    fieldsReveal: 0,
  };

  switch (phase) {
    case "idle":
    case "aiming":
      return base;

    case "capturing":
      return {
        ...base,
        flash: progress > 0.15 && progress < 0.75,
        shutterPressed: progress > 0.1 && progress < 0.85,
      };

    case "reading":
      return {
        ...base,
        mode: "scanning",
        scanProgress: 0.12 + progress * 0.78,
      };

    case "filled":
      return {
        ...base,
        fieldsFilled: true,
        fieldsReveal: progress,
      };

    case "hold":
    default:
      return {
        ...base,
        fieldsFilled: true,
        fieldsReveal: 1,
      };
  }
}

/**
 * Autoplaying appliance capture demo: shutter → scan → Rheem fields fill.
 * ItemScannerScreen + ItemFieldsPanel stay presentational; choreography here.
 */
export function ApplianceCaptureDemo({
  className,
  style,
  autoplay = true,
}: ApplianceCaptureDemoProps) {
  const phases = useMemo(() => PHASES, []);
  const { phase, progress, containerRef } = useAutoplayDemo({
    phases,
    enabled: autoplay,
    pauseOnHover: true,
    visibilityThreshold: 0.2,
  });

  const view = autoplay
    ? deriveView(phase, progress)
    : {
        mode: "capture" as const,
        flash: false,
        shutterPressed: false,
        scanProgress: 0,
        fieldsFilled: true,
        fieldsReveal: 1,
      };

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "acd", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Appliance label capture filling item fields"
    >
      <div className="acd-stage">
        <div className="acd-col">
          <p className="acd-lbl">The user gives</p>
          <div className="acd-phone">
            <PhoneFrame aria-label="Domis item scanner">
              <ItemScannerScreen
                mode={view.mode}
                plateSrc={APPLIANCE_ASSETS.platePhoto}
                flash={view.flash}
                shutterPressed={view.shutterPressed}
                scanProgress={view.scanProgress}
              />
            </PhoneFrame>
          </div>
        </div>

        <div className="acd-col acd-col-fields">
          <p className="acd-lbl">Domis returns</p>
          <div className="acd-phone">
            <PhoneFrame aria-label="Domis item fields">
              <ItemFieldsPanel
                itemName={APPLIANCE_CAPTURE.appliance}
                photoSrc={APPLIANCE_ASSETS.platePhoto}
                filled={view.fieldsFilled}
                fieldsReveal={view.fieldsReveal}
              />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
