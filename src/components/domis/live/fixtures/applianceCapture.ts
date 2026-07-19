/**
 * Appliance capture demo fixture.
 * Copy matches DomisCaseStudyBody appliance section — edit here, not in UI.
 */

export type ApplianceCaptureFieldKey =
  | "appliance"
  | "brand"
  | "model"
  | "serial"
  | "installed";

export type ApplianceCaptureField = {
  key: ApplianceCaptureFieldKey;
  label: string;
  display: string;
  /** True when the page shows a muted "Add" placeholder */
  empty?: boolean;
};

/** Demo phases for shutter → scan → filled form loops */
export type ApplianceCapturePhase =
  | "idle"
  | "aiming"
  | "capturing"
  | "reading"
  | "filled";

export const APPLIANCE_CAPTURE_PHASES: readonly ApplianceCapturePhase[] = [
  "idle",
  "aiming",
  "capturing",
  "reading",
  "filled",
] as const;

/**
 * Local plate / scan assets (zero network).
 * `platePhoto` is a Rheem water-heater nameplate that matches the filled fields.
 */
export const APPLIANCE_ASSETS = {
  /** Nameplate / rating-plate demo photo for the camera viewfinder */
  platePhoto: "/assets/domis/live/scan-item-demo.png",
  /** Case study scanner composition (phone UI reference) */
  scannerComposition: "/assets/domis/live/scanner.png",
  /** Generic item placeholder if plate photo is unavailable */
  itemPlaceholder: "/assets/domis/live/item-placeholder.png",
  /** Gemini label-research proof-of-concept screenshot */
  geminiLabelTest: "/assets/domis/live/gemini-appliance-label.jpg",
} as const;

/** Fields Domis returns after reading the plate — page order */
export const APPLIANCE_CAPTURE_FIELDS: readonly ApplianceCaptureField[] = [
  {
    key: "appliance",
    label: "Appliance",
    display: "Water heater",
  },
  {
    key: "brand",
    label: "Brand",
    display: "Rheem",
  },
  {
    key: "model",
    label: "Model",
    display: "XE50M06ST45U1",
  },
  {
    key: "serial",
    label: "Serial",
    display: "Q451812345",
  },
  {
    key: "installed",
    label: "Installed",
    display: "Add",
    empty: true,
  },
] as const;

/** Flat lookup for capture / form-fill demos */
export const APPLIANCE_CAPTURE = {
  appliance: "Water heater",
  brand: "Rheem",
  model: "XE50M06ST45U1",
  /** Shorter model string shown in the v1 compare pane on the page */
  modelShort: "XE50M06ST",
  serial: "Q451812345",
  installedDisplay: "Add",
  installedEmpty: true,
  /** Extra v1 pane detail from the case study compare */
  capacityDisplay: "50 gal",
  assets: APPLIANCE_ASSETS,
  fields: APPLIANCE_CAPTURE_FIELDS,
  phases: APPLIANCE_CAPTURE_PHASES,
} as const;
