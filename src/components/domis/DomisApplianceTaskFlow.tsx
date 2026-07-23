"use client";

import "./domis-ux-diagrams.css";

/**
 * Task flow — one objective: add an appliance so it can be used later.
 * Includes failure / recovery branches (not a manual-vs-product comparison).
 */
export function DomisApplianceTaskFlow() {
  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="Task flow for adding an appliance: open capture, photograph label, branch if unreadable or ambiguous, confirm identity, attach useful links, save to home with recovery paths for retake, manual entry, or partial save"
    >
      <p className="dud-type">Task flow</p>
      <p className="dud-heading">
        Objective: add an appliance so it can be tagged later
      </p>

      <div className="duf duf-appliance">
        <p className="duf-scroll-hint" aria-hidden>
          scroll -&gt;
        </p>

        <div className="duf-scroll">
          <div className="duf-canvas">
            <svg
              className="duf-connectors"
              viewBox="0 0 1640 470"
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

              <path className="duf-line" d="M 145 120 H 170" />
              <path className="duf-line" d="M 278 120 H 315" />
              <path className="duf-line" d="M 433 120 H 460" />
              <path className="duf-line" d="M 374 179 V 321 H 460" />
              <path className="duf-line" d="M 578 120 H 615" />
              <path className="duf-line" d="M 733 120 H 760" />
              <path className="duf-line" d="M 674 179 V 321 H 760" />
              <path className="duf-line" d="M 585 321 H 900 V 120 H 920" />
              <path className="duf-line" d="M 885 321 H 900 V 120 H 920" />
              <path className="duf-line" d="M 885 120 H 920" />
              <path className="duf-line" d="M 1038 120 H 1065" />
              <path className="duf-line" d="M 979 179 V 321 H 1065" />
              <path className="duf-line" d="M 1183 120 H 1215" />
              <path className="duf-line" d="M 1190 321 H 1200 V 120 H 1215" />
              <path className="duf-line" d="M 1333 120 H 1360" />
              <path className="duf-line" d="M 1274 179 V 321 H 1360" />
              <path className="duf-line" d="M 1480 120 H 1505" />
              <path className="duf-line" d="M 1480 321 H 1494 V 120 H 1505" />
            </svg>

            <span
              className="duf-node duf-node-start"
              style={{ left: 20, top: 92, width: 125 }}
            >
              Owner needs appliance on record
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 170, top: 92, width: 108 }}
            >
              Open capture
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 315, top: 61 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">Can access label?</span>
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 438, top: 92 }}
            >
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 460, top: 92, width: 118 }}
            >
              Photograph label
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 384, top: 294 }}
            >
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 460, top: 292, width: 125 }}
            >
              Enter brand / model manually
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 615, top: 61 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">Photo readable?</span>
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 736, top: 92 }}
            >
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 760, top: 92, width: 125 }}
            >
              Extract brand / model candidates
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 684, top: 294 }}
            >
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 760, top: 292, width: 125 }}
            >
              Retake or enter manually
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 920, top: 61 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">Identity confident?</span>
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 1042, top: 92 }}
            >
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 1065, top: 92, width: 118 }}
            >
              Owner confirms fields
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 994, top: 294 }}
            >
              No / unsure
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 1065, top: 292, width: 125 }}
            >
              Correct fields or partial save
            </span>

            <span
              className="duf-node duf-node-decision"
              style={{ left: 1215, top: 61 }}
            >
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">Useful links found?</span>
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 1336, top: 92 }}
            >
              Yes
            </span>
            <span
              className="duf-node duf-node-process"
              style={{ left: 1360, top: 92, width: 120 }}
            >
              Attach manual / warranty / support
            </span>

            <span
              className="duf-branch-label"
              style={{ left: 1300, top: 294 }}
            >
              No
            </span>
            <span
              className="duf-node duf-node-process duf-node-branch"
              style={{ left: 1360, top: 292, width: 120 }}
            >
              Attach links later
            </span>

            <span
              className="duf-node duf-node-end"
              style={{ left: 1505, top: 82, width: 118 }}
            >
              Appliance on home, usable incomplete
            </span>

            <div className="duf-recovery-row" aria-label="Recovery paths">
              <span className="duf-footnote-label">Recovery paths</span>
              <span className="duf-recovery-item">Retake</span>
              <span className="duf-recovery-item">Manual entry</span>
              <span className="duf-recovery-item">Partial save</span>
              <span className="duf-recovery-item">Attach links later</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
