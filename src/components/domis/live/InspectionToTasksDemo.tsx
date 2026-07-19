"use client";

import {
  useMemo,
  type CSSProperties,
  type RefObject,
} from "react";
import {
  useAutoplayDemo,
  type AutoplayPhase,
} from "@/components/domis/live/useAutoplayDemo";
import {
  INSPECTION_DEMO,
  INSPECTION_TASKS,
  type InspectionTask,
} from "@/components/domis/live/fixtures";
import {
  TaskCard,
  type TaskCardChip,
} from "@/components/domis/live/mobile/TaskCard";
import "./inspection-to-tasks-demo.css";

/**
 * One beat = one element. Phase changes drive the choreography
 * (not progress within a long phase), so each step is evenly timed.
 *
 * enter: PDF → Read → Group → Translate → → → label → cards → hint → settle
 * hold → exit (all at once) → loop
 */
const FADE_MS = 400;
const BEAT_MS = 450;

const PROCESS_STEPS = ["Read", "Group", "Translate"] as const;

const PHASES: AutoplayPhase[] = [
  { id: "pdf", durationMs: BEAT_MS },
  { id: "step-1", durationMs: BEAT_MS },
  { id: "step-2", durationMs: BEAT_MS },
  { id: "step-3", durationMs: BEAT_MS },
  { id: "tip", durationMs: BEAT_MS },
  { id: "out-label", durationMs: BEAT_MS },
  { id: "card-0", durationMs: BEAT_MS },
  { id: "card-1", durationMs: BEAT_MS },
  { id: "card-2", durationMs: BEAT_MS },
  { id: "hint", durationMs: BEAT_MS },
  { id: "settle", durationMs: BEAT_MS },
  { id: "hold", durationMs: 2600 },
  // Exit — everything fades out together
  { id: "exit", durationMs: FADE_MS + 80 },
];

function chipsForTask(task: InspectionTask): TaskCardChip[] {
  const chips: TaskCardChip[] = [];

  if (task.location) {
    chips.push({
      id: `${task.id}-loc`,
      label: task.location,
      icon: "location_on",
      variant: "location",
    });
  }

  if (task.completedAtLabel) {
    chips.push({
      id: `${task.id}-done`,
      label: task.completedAtLabel,
      variant: "default",
    });
  }

  return chips;
}

export type InspectionToTasksDemoProps = {
  className?: string;
  style?: CSSProperties;
  /** When false, shows end state only (no loop). Default true. */
  autoplay?: boolean;
};

type DemoView = {
  showIn: boolean;
  pdfEngaged: boolean;
  processLit: number;
  showOutLabel: boolean;
  cardsVisible: number;
  showHint: boolean;
  highlightIndex: number;
};

const END_VIEW: DemoView = {
  showIn: true,
  pdfEngaged: true,
  processLit: 4,
  showOutLabel: true,
  cardsVisible: INSPECTION_TASKS.length,
  showHint: true,
  highlightIndex: 0,
};

const EMPTY_VIEW: DemoView = {
  showIn: false,
  pdfEngaged: false,
  processLit: 0,
  showOutLabel: false,
  cardsVisible: 0,
  showHint: false,
  highlightIndex: -1,
};

function deriveView(phase: string): DemoView {
  switch (phase) {
    case "pdf":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
      };
    case "step-1":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 1,
      };
    case "step-2":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 2,
      };
    case "step-3":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 3,
      };
    case "tip":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 4,
      };
    case "out-label":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 4,
        showOutLabel: true,
      };
    case "card-0":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 4,
        showOutLabel: true,
        cardsVisible: 1,
      };
    case "card-1":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 4,
        showOutLabel: true,
        cardsVisible: 2,
      };
    case "card-2":
      return {
        ...EMPTY_VIEW,
        showIn: true,
        pdfEngaged: true,
        processLit: 4,
        showOutLabel: true,
        cardsVisible: 3,
      };
    case "hint":
      return {
        ...END_VIEW,
        highlightIndex: -1,
      };
    case "settle":
    case "hold":
      return END_VIEW;

    case "exit":
      return EMPTY_VIEW;

    default:
      return EMPTY_VIEW;
  }
}

/**
 * inspection.pdf left → Domis TaskCard list on the right.
 * Beat-sequenced choreography; CSS fades between discrete states.
 */
export function InspectionToTasksDemo({
  className,
  style,
  autoplay = true,
}: InspectionToTasksDemoProps) {
  const phases = useMemo(() => PHASES, []);
  const { phase, containerRef } = useAutoplayDemo({
    phases,
    enabled: autoplay,
    pauseOnHover: true,
    visibilityThreshold: 0.2,
  });

  const view = autoplay ? deriveView(phase) : END_VIEW;
  const { source, tasks, footerHint } = INSPECTION_DEMO;

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "itt", "itt-demo", className]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          ...style,
          "--itt-fade": `${FADE_MS}ms`,
        } as CSSProperties
      }
      aria-label="Inspection report converted into Domis task cards"
    >
      <div className="itt-stage">
        <div
          className="itt-in"
          data-visible={view.showIn ? "true" : "false"}
        >
          <p className="itt-lbl">The user gives</p>
          <div
            className="itt-dropzone"
            data-engaged={view.pdfEngaged ? "true" : "false"}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 2.5 H13.5 L18.5 7.5 V21.5 H6 Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 2.5 V7.5 H18.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 12.5 H16 M8.5 15.5 H16 M8.5 18.5 H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="itt-file">{source.fileName}</p>
            <p className="itt-pages">{source.pageCountDisplay}</p>
          </div>
        </div>

        <div
          className="itt-arrow"
          data-lit={view.processLit}
          aria-hidden="true"
        >
          <div className="itt-stem" data-part="1" />
          <span className="itt-mstep" data-part="1">
            {PROCESS_STEPS[0]}
          </span>
          <div className="itt-stem" data-part="2" />
          <span className="itt-mstep" data-part="2">
            {PROCESS_STEPS[1]}
          </span>
          <div className="itt-stem" data-part="3" />
          <span className="itt-mstep" data-part="3">
            {PROCESS_STEPS[2]}
          </span>
          <div className="itt-stem" data-part="4" />
          <span className="itt-tip" data-part="4">
            →
          </span>
        </div>

        <div className="itt-out">
          <p
            className="itt-lbl itt-out-lbl"
            data-visible={view.showOutLabel ? "true" : "false"}
          >
            Domis returns
          </p>
          <div className="itt-cards">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="itt-card-slot"
                data-visible={index < view.cardsVisible ? "true" : "false"}
              >
                <TaskCard
                  title={task.title}
                  chips={chipsForTask(task)}
                  thumbSrc={task.thumbSrc}
                  thumbAlt=""
                  muted={task.muted}
                  highlighted={view.highlightIndex === index}
                />
              </div>
            ))}
            <p
              className="itt-hint"
              data-visible={view.showHint ? "true" : "false"}
            >
              {footerHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
