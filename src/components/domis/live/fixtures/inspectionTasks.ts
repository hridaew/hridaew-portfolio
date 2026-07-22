/**
 * Inspection → tasks demo fixture.
 * Three cards match DomisCaseStudyBody inspection section — edit here, not in UI.
 */

export type InspectionTaskPriority = "high" | "monitor" | "dismissed";

export type InspectionTask = {
  id: string;
  /** Pill label as shown on the page */
  priorityLabel: string;
  priority: InspectionTaskPriority;
  title: string;
  description: string;
  /** Location chip (TagBadge + location_on), mirrors Flutter locations */
  location?: string;
  /** Local thumb for TaskCard (56px) — zero network */
  thumbSrc?: string;
  /** Completed-date chip when dismissed (MM/dd/yyyy, Flutter format) */
  completedAtLabel?: string;
  /** Dismissed / muted styling on the page */
  muted?: boolean;
};

export const INSPECTION_ASSETS = {
  /** Doc-processing illustration for the PDF → tasks media */
  docProcessing: "/assets/domis/live/docproc.png",
  /** Inspection mascot / blippy */
  inspectionBlippy: "/assets/domis/live/inspection-blippy.png",
  /** Shared task thumb fallback */
  taskThumb: "/assets/domis/live/item-placeholder.png",
  roofFlashing: "/assets/domis/live/task-roof-flashing.png",
  waterHeater: "/assets/domis/live/scan-item-demo.png",
  kitchenGfci: "/assets/domis/live/task-kitchen-gfci.png",
} as const;

/** Source doc shown on the input side of the demo */
export const INSPECTION_SOURCE = {
  fileName: "inspection.pdf",
  pageCount: 64,
  pageCountDisplay: "64 pages",
} as const;

/**
 * Three result cards for the inspection → tasks demo.
 * Priority labels are unused in the live media; kept for Known carousel.
 */
export const INSPECTION_TASKS: readonly InspectionTask[] = [
  {
    id: "roof-flashing-north",
    priorityLabel: "High priority",
    priority: "high",
    title: "Roof flashing, north side",
    description: "Water can get in where the roof meets the chimney.",
    location: "Roof",
    thumbSrc: INSPECTION_ASSETS.roofFlashing,
  },
  {
    id: "water-heater-age",
    priorityLabel: "Monitor",
    priority: "monitor",
    title: "Water heater, age",
    description: "Near the end of a typical lifespan. Not urgent.",
    location: "Utility",
    thumbSrc: INSPECTION_ASSETS.waterHeater,
  },
  {
    id: "kitchen-gfci",
    priorityLabel: "Dismissed",
    priority: "dismissed",
    title: "Kitchen GFCI outlets",
    description: "Already fixed. Removed by you, Mar 2025.",
    location: "Kitchen",
    completedAtLabel: "03/01/2025",
    thumbSrc: INSPECTION_ASSETS.kitchenGfci,
    muted: true,
  },
] as const;

export const INSPECTION_DEMO = {
  source: INSPECTION_SOURCE,
  tasks: INSPECTION_TASKS,
  assets: INSPECTION_ASSETS,
  /** Caption footnote under the cards on the page */
  footerHint: "Pull any of these into tasks. Or don't.",
} as const;
