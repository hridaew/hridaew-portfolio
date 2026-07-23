"use client";

import "./domis-ux-diagrams.css";

const MANUAL = [
  "Find the label",
  "Read tiny model text",
  "Type it in",
  "Search the web",
  "Compare results",
  "Save a useful link",
] as const;

const DOMIS = [
  "Photograph the label",
  "Confirm brand / model",
  "Manual, warranty, support, parts attached",
] as const;

/**
 * Task flow — one objective: identify an appliance and make it useful.
 * Compact linear comparison; does not duplicate the live capture demo.
 */
export function DomisApplianceTaskFlow() {
  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="Task flow comparing manual appliance lookup with Domis photo capture: fewer steps from noticing a need to having useful identity and links"
    >
      <p className="dud-type">Task flow</p>
      <p className="dud-heading">
        Objective: identify an appliance and get something useful from it
      </p>

      <div className="dtf" aria-hidden>
        <span className="duf-node duf-node-start">Need help / repair</span>
        <span className="duf-arrow">→</span>
        <span className="duf-node duf-node-process">Capture identity</span>
        <span className="duf-arrow">→</span>
        <span className="duf-node duf-node-process">Confirm</span>
        <span className="duf-arrow">→</span>
        <span className="duf-node duf-node-end">Useful links + home record</span>
      </div>

      <div className="dtf-compare">
        <div className="dtf-lane">
          <p className="dtf-lane-label">Manual path</p>
          <ol>
            {MANUAL.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="dtf-lane dtf-lane-domis">
          <p className="dtf-lane-label">Domis path</p>
          <ol>
            {DOMIS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
