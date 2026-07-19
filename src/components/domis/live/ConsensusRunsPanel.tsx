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
  CONSENSUS_RUNS,
  CONSENSUS_SHOWN,
} from "@/components/domis/live/fixtures/consensusRuns";
import "./consensus-runs-panel.css";

const PHASES: AutoplayPhase[] = [
  { id: "idle", durationMs: 500 },
  { id: "run1", durationMs: 700 },
  { id: "run2", durationMs: 700 },
  { id: "run3", durationMs: 800 },
  { id: "highlight", durationMs: 900 },
  { id: "shown", durationMs: 700 },
  { id: "point", durationMs: 600 },
  { id: "hold", durationMs: 2600 },
];

export type ConsensusRunsPanelProps = {
  className?: string;
  style?: CSSProperties;
  /** When false, shows end state only (no loop). Default true. */
  autoplay?: boolean;
};

type DemoView = {
  runsVisible: number;
  highlightAgree: boolean;
  showShown: boolean;
  cursor: { x: number; y: number; visible: boolean };
};

function deriveView(phase: string, progress: number): DemoView {
  const runsVisible =
    phase === "idle"
      ? 0
      : phase === "run1"
        ? 1
        : phase === "run2"
          ? 2
          : 3;

  const highlightAgree =
    phase === "highlight" ||
    phase === "shown" ||
    phase === "point" ||
    phase === "hold";

  const showShown =
    phase === "shown" || phase === "point" || phase === "hold";

  let cursor = { x: 78, y: 22, visible: false };
  if (phase === "run1") {
    cursor = { x: 28, y: 18, visible: true };
  } else if (phase === "run2") {
    cursor = { x: 28, y: 32, visible: true };
  } else if (phase === "run3") {
    cursor = { x: 28, y: 46, visible: true };
  } else if (phase === "highlight") {
    cursor = {
      x: 55,
      y: 28 + progress * 8,
      visible: true,
    };
  } else if (phase === "shown" || phase === "point") {
    cursor = { x: 72, y: 62, visible: true };
  } else if (phase === "hold") {
    cursor = { x: 72, y: 62, visible: progress < 0.35 };
  }

  return { runsVisible, highlightAgree, showShown, cursor };
}

/**
 * Gemini ×3 consensus board restyled to web Domis chips/cards.
 * Keeps Run 1/2/3 → Shown story (caption lives on the figure in the case study).
 */
export function ConsensusRunsPanel({
  className,
  style,
  autoplay = true,
}: ConsensusRunsPanelProps) {
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
        runsVisible: 3,
        highlightAgree: true,
        showShown: true,
        cursor: { x: 72, y: 62, visible: false },
      };

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "crp", "crp-demo", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label="Consensus across three research runs"
    >
      <div className="crp-card">
        <div className="crp-runs">
          {CONSENSUS_RUNS.map((run, index) => {
            const visible = index < view.runsVisible;
            return (
              <div
                key={run.id}
                className="crp-row"
                data-visible={visible ? "true" : "false"}
              >
                <span className="crp-who">{run.who}</span>
                <div className="crp-chips">
                  {run.chips.map((chip) => {
                    const agree =
                      view.highlightAgree &&
                      !chip.dropped &&
                      (chip.label === "1974" || chip.label === "2 bath");
                    return (
                      <div
                        key={`${run.id}-${chip.label}`}
                        className="crp-chip"
                        data-dropped={chip.dropped ? "true" : "false"}
                        data-hl={agree ? "agree" : undefined}
                      >
                        {chip.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="crp-shown"
          data-visible={view.showShown ? "true" : "false"}
        >
          <div className="crp-row" data-visible="true">
            <span className="crp-who">{CONSENSUS_SHOWN.who}</span>
            <div className="crp-chips">
              {CONSENSUS_SHOWN.chips.map((chip) => (
                <div
                  key={chip.label}
                  className="crp-landed"
                  data-ask={chip.ask ? "true" : "false"}
                >
                  {chip.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
