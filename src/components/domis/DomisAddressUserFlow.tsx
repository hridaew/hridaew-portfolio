"use client";

import "./domis-ux-diagrams.css";

/**
 * User flow — create a home from an address.
 * Top rail: owner steps. Bottom rail: what the system does while they wait.
 */
export function DomisAddressUserFlow() {
  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="User flow: enter address, choose autofill or type manually, system looks up and researches the property, then owner reviews and edits details or the photo"
    >
      <p className="dud-type">User flow</p>
      <p className="dud-heading">Create a home from an address</p>

      <div className="duf duf-address">
        <p className="duf-scroll-hint" aria-hidden>
          scroll -&gt;
        </p>

        <div className="duf-scroll">
          <div className="duf-canvas duf-canvas-address">
            <svg
              className="duf-connectors"
              viewBox="0 0 1280 340"
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

              {/* Owner rail */}
              <path className="duf-line" d="M 128 72 H 155" />
              <path className="duf-line" d="M 285 72 H 310" />
              <path className="duf-line" d="M 388 52 V 28 H 470" />
              <path className="duf-line" d="M 388 92 V 116 H 470" />
              <path className="duf-line" d="M 590 28 H 620 V 72 H 655" />
              <path className="duf-line" d="M 590 116 H 620 V 72" />
              <path className="duf-line" d="M 785 72 H 820" />
              <path className="duf-line" d="M 950 72 H 985" />
              <path className="duf-line" d="M 1115 72 H 1150" />

              {/* Bridge owner → system */}
              <path className="duf-line duf-line-soft" d="M 720 100 V 188" />

              {/* System rail */}
              <path className="duf-line duf-line-soft" d="M 250 230 H 310" />
              <path className="duf-line duf-line-soft" d="M 430 230 H 490" />
              <path className="duf-line duf-line-soft" d="M 610 230 H 670" />
            </svg>

            <p className="duf-rail-label" style={{ left: 20, top: 18 }}>
              Owner
            </p>

            <span
              className="duf-node duf-node-start"
              style={{ left: 20, top: 48, width: 108 }}
            >
              Enter address
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 155, top: 14 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">
                Autofill match looks right?
              </span>
            </span>

            <span className="duf-branch-label" style={{ left: 400, top: 6 }}>
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 470, top: 2, width: 120 }}
            >
              Choose from autofill
            </span>

            <span className="duf-branch-label" style={{ left: 400, top: 122 }}>
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 470, top: 98, width: 120 }}
            >
              Type address manually
            </span>

            <span
              className="duf-node duf-node-process duf-node-wait"
              style={{ left: 655, top: 48, width: 130 }}
            >
              Wait while Domis loads the home
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 820, top: 48, width: 130 }}
            >
              Review what came back
            </span>

            <span
              className="duf-node duf-node-process"
              style={{ left: 985, top: 48, width: 130 }}
            >
              Edit details or name spaces
            </span>

            <span
              className="duf-node duf-node-end"
              style={{ left: 1150, top: 48, width: 110 }}
            >
              Edit or delete photo
            </span>

            <p className="duf-rail-label duf-rail-label-system" style={{ left: 20, top: 178 }}>
              System
            </p>
            <p className="duf-system-note" style={{ left: 90, top: 176 }}>
              Autosearch is not 100% reliable, so this runs in the background
            </p>

            <span
              className="duf-node duf-node-system"
              style={{ left: 130, top: 208, width: 120 }}
            >
              Address lookup
            </span>
            <span
              className="duf-node duf-node-system"
              style={{ left: 310, top: 208, width: 120 }}
            >
              Review candidates
            </span>
            <span
              className="duf-node duf-node-system"
              style={{ left: 490, top: 208, width: 120 }}
            >
              Gemini search
            </span>
            <span
              className="duf-node duf-node-system"
              style={{ left: 670, top: 208, width: 150 }}
            >
              Prefill agreed fields only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
