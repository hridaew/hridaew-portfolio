"use client";

import "./domis-ux-diagrams.css";

const EDGES = [
  "New build / thin records",
  "Unit ambiguity",
  "Spelling variants",
  "Conflicting public data",
  "User skips confirm",
] as const;

/**
 * User flow — Address Intelligence with branching confidence / trust paths.
 */
export function DomisAddressUserFlow() {
  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="User flow for creating a home from an address with branching match confidence and field-level agreement"
    >
      <p className="dud-type">User flow</p>
      <p className="dud-heading">
        Create a home from an address — including when the data is unsure
      </p>

      <div className="duf duf-address">
        <p className="duf-scroll-hint" aria-hidden>
          scroll -&gt;
        </p>

        <div className="duf-scroll">
          <div className="duf-canvas">
            <svg
              className="duf-connectors"
              viewBox="0 0 1360 390"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="duf-arrow-address"
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

              <path className="duf-line" d="M 136 105 H 160" />
              <path className="duf-line" d="M 290 105 H 330" />
              <path className="duf-line" d="M 448 105 H 485" />
              <path className="duf-line" d="M 389 164 V 259 H 485" />
              <path className="duf-line" d="M 611 105 H 805" />
              <path className="duf-line" d="M 619 259 H 642" />
              <path className="duf-line" d="M 766 259 H 790 V 105 H 805" />
              <path className="duf-line" d="M 923 105 H 960" />
              <path className="duf-line" d="M 864 164 V 259 H 960" />
              <path className="duf-line" d="M 1085 105 H 1100 V 163 H 1115" />
              <path className="duf-line" d="M 1085 259 H 1100 V 163 H 1115" />
              <path className="duf-line" d="M 1225 163 H 1238" />
            </svg>

            <span
              className="duf-node duf-node-start"
              style={{ left: 20, top: 78, width: 116 }}
            >
              Owner types address
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 160, top: 78, width: 130 }}
            >
              Resolve property candidates
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 330, top: 46 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">Single confident match?</span>
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 454, top: 78 }}
            >
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 485, top: 78, width: 126 }}
            >
              Use single match as draft
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 400, top: 218 }}
            >
              Ambiguous
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 485, top: 230, width: 134 }}
            >
              Show 2-3 candidates
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 642, top: 230, width: 124 }}
            >
              Owner picks or corrects
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 805, top: 46 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Field-level source agreement?
              </span>
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 926, top: 78 }}
            >
              Agree
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 960, top: 78, width: 125 }}
            >
              Show trusted value
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 874, top: 218 }}
            >
              Disagree / missing
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 960, top: 230, width: 125 }}
            >
              Leave field blank
            </span>

            <span
              className="duf-node duf-node-process duf-node-merge"
              style={{ left: 1115, top: 132, width: 110 }}
            >
              Owner reviews / edits
            </span>
            <span
              className="duf-node duf-node-end"
              style={{ left: 1238, top: 129, width: 105 }}
            >
              Home profile exists, incomplete OK
            </span>

            <div className="duf-footnote" aria-label="Edge cases">
              <span className="duf-footnote-label">Edge cases</span>
              <div className="duf-edge-row">
                {EDGES.map((edge) => (
                  <span key={edge} className="duf-edge">
                    {edge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
