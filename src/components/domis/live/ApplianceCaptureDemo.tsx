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
  APPLIANCE_CAPTURE_FIELDS,
} from "@/components/domis/live/fixtures";
import { ItemScannerScreen } from "@/components/domis/live/mobile/ItemScannerScreen";
import {
  ItemFieldsPanel,
  itemFieldsRevealSteps,
} from "@/components/domis/live/mobile/ItemFieldsPanel";
import "./appliance-capture-demo.css";

const REVEAL_STEPS = itemFieldsRevealSteps(APPLIANCE_CAPTURE_FIELDS.length);
/** ~620ms per beat — gradual name → photo → category → each detail. */
const REVEAL_MS = REVEAL_STEPS * 620;

const PHASES: AutoplayPhase[] = [
  { id: "idle", durationMs: 700 },
  { id: "aiming", durationMs: 800 },
  { id: "capturing", durationMs: 400 },
  { id: "reveal", durationMs: REVEAL_MS },
  { id: "hold", durationMs: 2800 },
];

export type ApplianceCaptureDemoProps = {
  className?: string;
  style?: CSSProperties;
  /** When false, shows end state only (no loop). Default true. */
  autoplay?: boolean;
};

type DemoView = {
  flash: boolean;
  shutterPressed: boolean;
  revealStep: number;
  revealProgress: number;
};

function deriveView(phase: string, progress: number): DemoView {
  const base: DemoView = {
    flash: false,
    shutterPressed: false,
    revealStep: 0,
    revealProgress: 0,
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

    case "reveal": {
      const step = Math.min(
        REVEAL_STEPS,
        1 + Math.floor(progress * REVEAL_STEPS * 0.999)
      );
      return {
        ...base,
        revealStep: step,
        revealProgress: progress,
      };
    }

    case "hold":
    default:
      return {
        ...base,
        revealStep: REVEAL_STEPS,
        revealProgress: 1,
      };
  }
}

/**
 * Autoplaying appliance capture demo: shutter → sequential form fill.
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
        flash: false,
        shutterPressed: false,
        revealStep: REVEAL_STEPS,
        revealProgress: 1,
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
                plateSrc={APPLIANCE_ASSETS.platePhoto}
                flash={view.flash}
                shutterPressed={view.shutterPressed}
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
                revealStep={view.revealStep}
                revealProgress={view.revealProgress}
              />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
