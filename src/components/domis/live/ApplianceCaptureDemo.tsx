"use client";

import {
  useMemo,
  type CSSProperties,
  type RefObject,
} from "react";
import { DemoCursor } from "@/components/domis/live/DemoCursor";
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
  { id: "idle", durationMs: 800 },
  { id: "aiming", durationMs: 1100 },
  { id: "capturing", durationMs: 450 },
  { id: "reading", durationMs: 2200 },
  { id: "filled", durationMs: 1200 },
  { id: "hold", durationMs: 2800 },
];

const SCAN_FACTS = [
  "Barcodes were first used in 1974.",
  "A leaky faucet can waste up to 3,000 gallons of water each year.",
  "The average American spends 90% of their time indoors.",
] as const;

/** Cursor waypoints as % of the demo stage (left phone ≈ shutter). */
const CURSOR = {
  rest: { x: 18, y: 72 },
  shutter: { x: 26, y: 86 },
  fields: { x: 72, y: 42 },
} as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

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
  scanFact: string;
  fieldsFilled: boolean;
  fieldsReveal: number;
  arrowActive: boolean;
  cursor: { x: number; y: number; visible: boolean };
};

function deriveView(phase: string, progress: number): DemoView {
  const t = easeOutCubic(progress);
  const factIndex = Math.min(
    SCAN_FACTS.length - 1,
    Math.floor(progress * SCAN_FACTS.length)
  );

  const base: DemoView = {
    mode: "capture",
    flash: false,
    shutterPressed: false,
    scanProgress: 0,
    scanFact: SCAN_FACTS[0],
    fieldsFilled: false,
    fieldsReveal: 0,
    arrowActive: false,
    cursor: { ...CURSOR.rest, visible: true },
  };

  switch (phase) {
    case "idle":
      return {
        ...base,
        cursor: {
          x: lerp(CURSOR.rest.x, CURSOR.rest.x + 2, progress),
          y: lerp(CURSOR.rest.y, CURSOR.rest.y - 2, progress),
          visible: progress > 0.12,
        },
      };

    case "aiming":
      return {
        ...base,
        cursor: {
          x: lerp(CURSOR.rest.x, CURSOR.shutter.x, t),
          y: lerp(CURSOR.rest.y, CURSOR.shutter.y, t),
          visible: true,
        },
      };

    case "capturing":
      return {
        ...base,
        flash: progress > 0.15 && progress < 0.75,
        shutterPressed: progress > 0.1 && progress < 0.85,
        arrowActive: progress > 0.5,
        cursor: {
          x: CURSOR.shutter.x + (progress > 0.15 && progress < 0.7 ? 0.5 : 0),
          y: CURSOR.shutter.y + (progress > 0.15 && progress < 0.7 ? 0.8 : 0),
          visible: true,
        },
      };

    case "reading":
      return {
        ...base,
        mode: "scanning",
        scanProgress: 0.12 + progress * 0.78,
        scanFact: SCAN_FACTS[factIndex] ?? SCAN_FACTS[0],
        arrowActive: true,
        cursor: {
          x: lerp(CURSOR.shutter.x, CURSOR.fields.x, t * 0.55),
          y: lerp(CURSOR.shutter.y, CURSOR.fields.y, t * 0.55),
          visible: progress < 0.95,
        },
      };

    case "filled":
      return {
        ...base,
        fieldsFilled: true,
        fieldsReveal: progress,
        arrowActive: true,
        cursor: {
          x: CURSOR.fields.x,
          y: CURSOR.fields.y + progress * 10,
          visible: true,
        },
      };

    case "hold":
    default:
      return {
        ...base,
        fieldsFilled: true,
        fieldsReveal: 1,
        arrowActive: true,
        cursor: {
          x: lerp(CURSOR.fields.x, CURSOR.rest.x, progress * 0.25),
          y: lerp(CURSOR.fields.y + 10, CURSOR.rest.y, progress * 0.25),
          visible: progress < 0.4,
        },
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
        scanFact: SCAN_FACTS[0],
        fieldsFilled: true,
        fieldsReveal: 1,
        arrowActive: true,
        cursor: { ...CURSOR.fields, visible: false },
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
                scanningMascotSrc={APPLIANCE_ASSETS.scanningMascot}
                flash={view.flash}
                shutterPressed={view.shutterPressed}
                scanProgress={view.scanProgress}
                scanFact={view.scanFact}
              />
            </PhoneFrame>
          </div>
        </div>

        <div
          className="acd-arrow"
          data-active={view.arrowActive ? "true" : "false"}
          aria-hidden="true"
        >
          <div className="acd-arrow-stem" />
          <span className="acd-arrow-step">Read plate</span>
          <div className="acd-arrow-stem" />
          <span className="acd-arrow-tip">→</span>
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

      <DemoCursor
        x={view.cursor.x}
        y={view.cursor.y}
        visible={view.cursor.visible}
        style={{
          transition:
            phase === "idle" ||
            phase === "capturing" ||
            phase === "hold" ||
            !autoplay
              ? "none"
              : undefined,
        }}
      />
    </div>
  );
}
