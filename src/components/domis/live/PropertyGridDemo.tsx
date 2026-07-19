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
import { PROPERTY_GRID_HOMES } from "@/components/domis/live/fixtures/propertyGrid";
import "./property-grid-demo.css";

const PHASES: AutoplayPhase[] = [
  { id: "solo", durationMs: 800 },
  { id: "shrink", durationMs: 450 },
  { id: "populate", durationMs: 800 },
  { id: "hold", durationMs: 2800 },
];

export type PropertyGridDemoProps = {
  className?: string;
  style?: CSSProperties;
  /** When false, shows end state only (no loop). Default true. */
  autoplay?: boolean;
};

type DemoView = {
  layout: "solo" | "grid";
  satellitesVisible: boolean;
};

function deriveView(phase: string): DemoView {
  if (phase === "solo") {
    return { layout: "solo", satellitesVisible: false };
  }
  if (phase === "shrink") {
    return { layout: "grid", satellitesVisible: false };
  }
  // populate + hold
  return { layout: "grid", satellitesVisible: true };
}

/**
 * Fillmore starts large; shrinks into a 3×3 while eight homes fade in.
 * Captions stay on the case-study figure.
 */
export function PropertyGridDemo({
  className,
  style,
  autoplay = true,
}: PropertyGridDemoProps) {
  const phases = useMemo(() => PHASES, []);
  const { phase, containerRef } = useAutoplayDemo({
    phases,
    enabled: autoplay,
    pauseOnHover: true,
    visibilityThreshold: 0.2,
  });

  const view = autoplay
    ? deriveView(phase)
    : { layout: "grid" as const, satellitesVisible: true };

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "pgd", "pgd-demo", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label="Home icons across nine properties"
    >
      <div
        className="pgd-stage"
        data-layout={view.layout}
        data-satellites={view.satellitesVisible ? "true" : "false"}
      >
        <div className="pgd-grid">
          {PROPERTY_GRID_HOMES.map((home, index) => {
            const isHero = Boolean(home.hero);
            const satelliteIndex = isHero ? -1 : index < 4 ? index : index - 1;
            return (
              <div
                key={home.id}
                className="pgd-card"
                data-hero={isHero ? "true" : "false"}
                data-slot={index}
                style={
                  satelliteIndex >= 0
                    ? ({ "--pgd-i": satelliteIndex } as CSSProperties)
                    : undefined
                }
              >
                <div className="pgd-avatar">
                  <img src={home.src} alt="" draggable={false} />
                </div>
                <p className="pgd-name">{home.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
