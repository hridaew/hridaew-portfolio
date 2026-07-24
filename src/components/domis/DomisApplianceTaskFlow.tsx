"use client";

import "./domis-ux-diagrams.css";

/**
 * Task flow — photograph a label, confirm identity, attach useful links.
 */
export function DomisApplianceTaskFlow() {
  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="Task flow: open capture, photograph label, extract identity, confirm, attach useful links, appliance on home"
    >
      <p className="dud-type">Task flow</p>
      <p className="dud-heading">
        Add an appliance so it can be tagged later
      </p>

      <div className="duf duf-appliance">
        <p className="duf-scroll-hint" aria-hidden>
          scroll -&gt;
        </p>

        <div className="duf-scroll">
          <div className="duf-canvas duf-canvas-appliance">
            <svg
              className="duf-connectors"
              viewBox="0 0 980 140"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="duf-arrow-appliance"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              <path className="duf-line" d="M 130 70 H 155" />
              <path className="duf-line" d="M 285 70 H 310" />
              <path className="duf-line" d="M 440 70 H 465" />
              <path className="duf-line" d="M 595 70 H 620" />
              <path className="duf-line" d="M 750 70 H 775" />
            </svg>

            <span
              className="duf-node duf-node-start"
              style={{ left: 20, top: 44, width: 110 }}
            >
              Open capture
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 155, top: 44, width: 130 }}
            >
              Photograph the label
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 310, top: 44, width: 130 }}
            >
              Extract brand / model
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 465, top: 44, width: 130 }}
            >
              Owner confirms
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 620, top: 44, width: 130 }}
            >
              Attach useful links
            </span>
            <span
              className="duf-node duf-node-end"
              style={{ left: 775, top: 44, width: 170 }}
            >
              Appliance on the home
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
