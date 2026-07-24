"use client";

import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import "./domis-constraint-diagram.css";

const WORKS_BEST_WITH = [
  { icon: "meeting_room", label: "Spaces & layout" },
  { icon: "kitchen", label: "Appliances & systems" },
  { icon: "home_repair_service", label: "Condition & history" },
] as const;

const OWNER_KNOWS = [
  { icon: "location_on", label: "Their address" },
  { icon: "kitchen", label: "A few appliances by sight" },
  { icon: "help", label: "Symptoms, not systems" },
] as const;

/**
 * Key-challenge constraint board — Domis product language.
 * Domis works best with a full home model; owners know far less.
 */
export function DomisConstraintDiagram() {
  return (
    <div
      className="dcd"
      role="img"
      aria-label="Constraint diagram: Domis works best with a full home model, while owners typically know much less"
    >
      <div className="dcd-col">
        <p className="dcd-eyebrow">Domis works best with</p>
        <ul className="dcd-list">
          {WORKS_BEST_WITH.map((item) => (
            <li key={item.label} className="dcd-row">
              <span className="dcd-icon" aria-hidden>
                <DomisLiveIcon name={item.icon} size={17} color="currentColor" />
              </span>
              <span className="dcd-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="dcd-gap" aria-hidden>
        <svg
          className="dcd-gap-mark"
          viewBox="0 0 28 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ≠ not equal */}
          <path
            d="M5 8.5h18M5 15.5h18"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <path
            d="M10.5 19.5l7-15"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="dcd-col">
        <p className="dcd-eyebrow">Owner knows</p>
        <ul className="dcd-list">
          {OWNER_KNOWS.map((item) => (
            <li key={item.label} className="dcd-row">
              <span className="dcd-icon" aria-hidden>
                <DomisLiveIcon name={item.icon} size={17} color="currentColor" />
              </span>
              <span className="dcd-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
