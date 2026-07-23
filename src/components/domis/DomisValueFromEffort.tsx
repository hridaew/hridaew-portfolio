"use client";

import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import "./domis-ux-diagrams.css";

const LANES = [
  {
    title: "Address",
    icon: "location_on",
    gives: "Type an address",
    returns: ["Property basics", "Home systems", "Avatar icon"],
    control: "Edit any field. Fill blanks yourself.",
  },
  {
    title: "Appliance",
    icon: "kitchen",
    gives: "Photo of a label",
    returns: ["Brand & model", "Support links", "Warranty pages"],
    control: "Confirm or correct before it sticks.",
  },
  {
    title: "Report",
    icon: "description",
    gives: "Upload a PDF",
    returns: ["Plain-language findings", "Grouped issues", "Optional tasks"],
    control: "Pull, monitor, or dismiss — you decide.",
  },
] as const;

/**
 * Cross-feature interaction model: smallest user action → multiplied value,
 * with owner control as the constant.
 */
export function DomisValueFromEffort() {
  return (
    <div
      className="dud dve"
      role="img"
      aria-label="Across Address, Appliance, and Report: the user gives a small action, Domis returns useful home understanding, and the owner stays in control"
    >
      {LANES.map((lane) => (
        <article key={lane.title} className="dud-card dve-lane">
          <p className="dud-eyebrow">{lane.title}</p>

          <div className="dve-action">
            <p className="dud-title">User gives</p>
            <span className="dud-chip dud-chip-accent">
              <span className="dud-icon" aria-hidden>
                <DomisLiveIcon name={lane.icon} size={16} color="#fff" />
              </span>
              {lane.gives}
            </span>
          </div>

          <div className="dve-returns">
            <p className="dud-title">Domis returns</p>
            {lane.returns.map((item) => (
              <span key={item} className="dud-chip dud-chip-soft">
                {item}
              </span>
            ))}
          </div>

          <div className="dve-control">
            <p>
              <strong>Owner decides.</strong> {lane.control}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
