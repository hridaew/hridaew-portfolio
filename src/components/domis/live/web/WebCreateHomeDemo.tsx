"use client";

import {
  useMemo,
  useRef,
  type CSSProperties,
  type RefObject,
} from "react";
import { BrowserFrame } from "@/components/domis/live/BrowserFrame";
import {
  useAutoplayDemo,
  type AutoplayPhase,
} from "@/components/domis/live/useAutoplayDemo";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  ADDRESS_TYPED,
} from "@/components/domis/live/fixtures";
import {
  CreateHomePanel,
  type CreateHomeManual,
} from "./CreateHomePanel";
import "./create-home-panel.css";

/** ~16s loop — tweak durations freely; panel stays prop-driven. */
const PHASES: AutoplayPhase[] = [
  { id: "idle", durationMs: 700 },
  { id: "moveToField", durationMs: 900 },
  { id: "typing", durationMs: 2600 },
  { id: "addressReady", durationMs: 450 },
  { id: "moveToConfirm", durationMs: 850 },
  { id: "clickConfirm", durationMs: 320 },
  { id: "enriching", durationMs: 1800 },
  { id: "fieldsFilled", durationMs: 900 },
  { id: "hold", durationMs: 2800 },
];

/** Onboarding canvas — wide enough for Lab two-panel create-home card. */
const DEMO_DESIGN_WIDTH = 860;
const DEMO_DESIGN_HEIGHT = 580;

/** Cursor waypoints as % of the demo stage (BrowserFrame shell). */
const CURSOR = {
  rest: { x: 72, y: 78 },
  field: { x: 28, y: 34 },
  confirm: { x: 28, y: 68 },
} as const;

const SELECTED_MANUAL: CreateHomeManual = {
  street: "2140 Fillmore St",
  apt: "",
  city: "San Francisco",
  state: "CA",
  zip: "94115",
};

const EMPTY_MANUAL: CreateHomeManual = {
  street: "",
  apt: "",
  city: "",
  state: "",
  zip: "",
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export type WebCreateHomeDemoProps = {
  className?: string;
  style?: CSSProperties;
  /** Override BrowserFrame design width (px). */
  designWidth?: number;
  /** Override BrowserFrame design height (px). */
  designHeight?: number;
};

/**
 * Autoplaying web create-home demo: type address → confirm → mock enrich →
 * fields fill → hold → loop. Panel markup stays in CreateHomePanel.
 */
export function WebCreateHomeDemo({
  className,
  style,
  designWidth = DEMO_DESIGN_WIDTH,
  designHeight = DEMO_DESIGN_HEIGHT,
}: WebCreateHomeDemoProps) {
  const addressFieldRef = useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const phases = useMemo(() => PHASES, []);
  const { phase, progress, containerRef } = useAutoplayDemo({
    phases,
    pauseOnHover: true,
    visibilityThreshold: 0.2,
  });

  const demo = deriveDemoState(phase, progress);

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "chp-demo", className].filter(Boolean).join(" ")}
      style={style}
    >
      <BrowserFrame
        showChrome={false}
        aria-label="Create home profile demo"
        designWidth={designWidth}
        designHeight={designHeight}
      >
        <CreateHomePanel
          addressText={demo.addressText}
          addressSelected={demo.addressSelected}
          typing={demo.typing}
          fieldFocused={demo.fieldFocused}
          enriching={demo.enriching}
          enrichProgress={demo.enrichProgress}
          enrichDone={demo.enrichDone}
          confirmPressed={demo.confirmPressed}
          fieldsReveal={demo.fieldsReveal}
          manual={demo.manual}
          homeName="Fillmore Home"
          homePhoto={demo.homePhoto}
          displayAddress={ADDRESS_FULL}
          addressFieldRef={addressFieldRef}
          confirmButtonRef={confirmButtonRef}
        />
      </BrowserFrame>
    </div>
  );
}

type DemoDerived = {
  addressText: string;
  addressSelected: boolean;
  typing: boolean;
  fieldFocused: boolean;
  enriching: boolean;
  enrichProgress: number;
  enrichDone: boolean;
  confirmPressed: boolean;
  fieldsReveal: number;
  manual: CreateHomeManual;
  homePhoto: string | null;
  cursor: { x: number; y: number };
  cursorVisible: boolean;
};

function deriveDemoState(phase: string, progress: number): DemoDerived {
  const t = easeOutCubic(progress);
  const typedLen = Math.floor(progress * ADDRESS_TYPED.length);
  const typedText = ADDRESS_TYPED.slice(0, typedLen);

  const base: DemoDerived = {
    addressText: "",
    addressSelected: false,
    typing: false,
    fieldFocused: false,
    enriching: false,
    enrichProgress: 0,
    enrichDone: false,
    confirmPressed: false,
    fieldsReveal: 0,
    manual: EMPTY_MANUAL,
    homePhoto: null,
    cursor: { ...CURSOR.rest },
    cursorVisible: true,
  };

  switch (phase) {
    case "idle":
      return {
        ...base,
        cursorVisible: progress > 0.15,
        cursor: {
          x: lerp(CURSOR.rest.x, CURSOR.rest.x - 4, progress),
          y: lerp(CURSOR.rest.y, CURSOR.rest.y - 2, progress),
        },
      };

    case "moveToField":
      return {
        ...base,
        fieldFocused: progress > 0.85,
        cursor: {
          x: lerp(CURSOR.rest.x, CURSOR.field.x, t),
          y: lerp(CURSOR.rest.y, CURSOR.field.y, t),
        },
      };

    case "typing":
      return {
        ...base,
        addressText: typedText,
        typing: true,
        fieldFocused: true,
        cursor: { ...CURSOR.field },
      };

    case "addressReady":
      return {
        ...base,
        addressText: ADDRESS_TYPED,
        addressSelected: true,
        fieldFocused: false,
        manual: SELECTED_MANUAL,
        cursor: { ...CURSOR.field },
      };

    case "moveToConfirm":
      return {
        ...base,
        addressText: ADDRESS_TYPED,
        addressSelected: true,
        manual: SELECTED_MANUAL,
        cursor: {
          x: lerp(CURSOR.field.x, CURSOR.confirm.x, t),
          y: lerp(CURSOR.field.y, CURSOR.confirm.y, t),
        },
      };

    case "clickConfirm":
      return {
        ...base,
        addressText: ADDRESS_TYPED,
        addressSelected: true,
        manual: SELECTED_MANUAL,
        confirmPressed: progress > 0.25 && progress < 0.85,
        cursor: {
          x: CURSOR.confirm.x + (progress > 0.25 && progress < 0.7 ? 0.4 : 0),
          y: CURSOR.confirm.y + (progress > 0.25 && progress < 0.7 ? 0.6 : 0),
        },
      };

    case "enriching": {
      // Reach 100% before the phase ends, then hold full so the profile
      // never cuts the fill short.
      const fillT = Math.min(1, progress / 0.72);
      return {
        ...base,
        addressText: ADDRESS_TYPED,
        addressSelected: true,
        manual: SELECTED_MANUAL,
        enriching: true,
        enrichProgress: easeOutCubic(fillT) * 100,
        cursor: {
          x: lerp(CURSOR.confirm.x, 72, t * 0.6),
          y: lerp(CURSOR.confirm.y, 48, t * 0.6),
        },
      };
    }

    case "fieldsFilled":
      return {
        ...base,
        addressText: ADDRESS_TYPED,
        addressSelected: true,
        manual: SELECTED_MANUAL,
        enrichDone: true,
        fieldsReveal: progress,
        homePhoto: ADDRESS_ASSETS.homeAvatar,
        cursor: { x: 72, y: 48 },
        cursorVisible: progress < 0.9,
      };

    case "hold":
    default:
      return {
        ...base,
        addressText: ADDRESS_TYPED,
        addressSelected: true,
        manual: SELECTED_MANUAL,
        enrichDone: true,
        fieldsReveal: 1,
        homePhoto: ADDRESS_ASSETS.homeAvatar,
        cursor: {
          x: lerp(72, CURSOR.rest.x, progress * 0.3),
          y: lerp(48, CURSOR.rest.y, progress * 0.3),
        },
        cursorVisible: true,
      };
  }
}
