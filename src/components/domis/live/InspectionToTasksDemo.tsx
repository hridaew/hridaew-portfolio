"use client";

import {
  useMemo,
  type CSSProperties,
  type RefObject,
} from "react";
import { DemoCursor } from "@/components/domis/live/DemoCursor";
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

/** Cursor → PDF → process → cards appear / highlight → hold → loop */
const PHASES: AutoplayPhase[] = [
  { id: "idle", durationMs: 700 },
  { id: "engage", durationMs: 1100 },
  { id: "process", durationMs: 900 },
  { id: "reveal", durationMs: 1400 },
  { id: "highlight", durationMs: 1200 },
  { id: "hold", durationMs: 2800 },
];

const CURSOR = {
  rest: { x: 14, y: 58 },
  pdf: { x: 18, y: 48 },
  cards: { x: 72, y: 42 },
} as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function chipsForTask(task: InspectionTask): TaskCardChip[] {
  const chips: TaskCardChip[] = [];

  if (task.recommends) {
    chips.push({
      id: `${task.id}-rec`,
      label: "Domis Recommends",
      icon: "recommend",
      variant: "recommends",
    });
  }

  chips.push({
    id: `${task.id}-priority`,
    label: task.priorityLabel,
    variant:
      task.priority === "high"
        ? "priority-high"
        : task.priority === "monitor"
          ? "priority-monitor"
          : "priority-dismissed",
  });

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
  pdfEngaged: boolean;
  arrowActive: boolean;
  cardsVisible: number;
  highlightIndex: number;
  cursor: { x: number; y: number; visible: boolean };
};

function deriveView(phase: string, progress: number): DemoView {
  const t = easeOutCubic(progress);

  if (phase === "idle") {
    return {
      pdfEngaged: false,
      arrowActive: false,
      cardsVisible: 0,
      highlightIndex: -1,
      cursor: {
        x: lerp(CURSOR.rest.x, CURSOR.rest.x + 2, progress),
        y: lerp(CURSOR.rest.y, CURSOR.rest.y - 2, progress),
        visible: progress > 0.15,
      },
    };
  }

  if (phase === "engage") {
    return {
      pdfEngaged: progress > 0.35,
      arrowActive: false,
      cardsVisible: 0,
      highlightIndex: -1,
      cursor: {
        x: lerp(CURSOR.rest.x, CURSOR.pdf.x, t),
        y: lerp(CURSOR.rest.y, CURSOR.pdf.y, t),
        visible: true,
      },
    };
  }

  if (phase === "process") {
    return {
      pdfEngaged: true,
      arrowActive: true,
      cardsVisible: 0,
      highlightIndex: -1,
      cursor: {
        x: lerp(CURSOR.pdf.x, 42, t),
        y: lerp(CURSOR.pdf.y, 44, t),
        visible: true,
      },
    };
  }

  if (phase === "reveal") {
    const cardsVisible = Math.min(
      INSPECTION_TASKS.length,
      1 + Math.floor(progress * INSPECTION_TASKS.length)
    );
    return {
      pdfEngaged: true,
      arrowActive: true,
      cardsVisible,
      highlightIndex: -1,
      cursor: {
        x: lerp(42, CURSOR.cards.x, t),
        y: lerp(44, CURSOR.cards.y, t),
        visible: true,
      },
    };
  }

  if (phase === "highlight") {
    const highlightIndex = Math.min(
      INSPECTION_TASKS.length - 1,
      Math.floor(progress * INSPECTION_TASKS.length)
    );
    return {
      pdfEngaged: true,
      arrowActive: true,
      cardsVisible: INSPECTION_TASKS.length,
      highlightIndex,
      cursor: {
        x: CURSOR.cards.x,
        y: lerp(36, 62, progress),
        visible: true,
      },
    };
  }

  // hold
  return {
    pdfEngaged: true,
    arrowActive: true,
    cardsVisible: INSPECTION_TASKS.length,
    highlightIndex: 0,
    cursor: {
      x: CURSOR.cards.x,
      y: 42,
      visible: progress < 0.3,
    },
  };
}

const END_VIEW: DemoView = {
  pdfEngaged: true,
  arrowActive: true,
  cardsVisible: INSPECTION_TASKS.length,
  highlightIndex: 0,
  cursor: { x: CURSOR.cards.x, y: 42, visible: false },
};

/**
 * inspection.pdf left → real Domis TaskCard recreations on the right.
 * Presentational TaskCard; this module owns the autoplay loop.
 */
export function InspectionToTasksDemo({
  className,
  style,
  autoplay = true,
}: InspectionToTasksDemoProps) {
  const phases = useMemo(() => PHASES, []);
  const { phase, progress, containerRef } = useAutoplayDemo({
    phases,
    enabled: autoplay,
    pauseOnHover: true,
    visibilityThreshold: 0.2,
  });

  const view = autoplay ? deriveView(phase, progress) : END_VIEW;
  const { source, tasks, footerHint } = INSPECTION_DEMO;

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "itt", "itt-demo", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label="Inspection report converted into Domis task cards"
    >
      <div className="itt-stage">
        <div className="itt-in">
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
          data-active={view.arrowActive ? "true" : "false"}
          aria-hidden="true"
        >
          <div className="itt-stem" />
          <span className="itt-mstep">Read</span>
          <div className="itt-stem" />
          <span className="itt-mstep">Group</span>
          <div className="itt-stem" />
          <span className="itt-mstep">Translate</span>
          <div className="itt-stem" />
          <span className="itt-tip">→</span>
        </div>

        <div className="itt-out">
          <p className="itt-lbl">Domis returns</p>
          <div className="itt-cards">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="itt-card-slot"
                data-visible={index < view.cardsVisible ? "true" : "false"}
                style={{
                  transitionDelay:
                    index < view.cardsVisible ? `${index * 60}ms` : "0ms",
                }}
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
            <p className="itt-hint">{footerHint}</p>
          </div>
        </div>
      </div>

      <DemoCursor
        x={view.cursor.x}
        y={view.cursor.y}
        visible={view.cursor.visible}
      />
    </div>
  );
}
