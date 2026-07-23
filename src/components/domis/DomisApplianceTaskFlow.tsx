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
        Objective: add an appliance so it can be tagged in tasks and pro chats
      </p>

      <div className="duf">
        <div className="duf-row">
          <span className="duf-node duf-node-start">Owner needs appliance on record</span>
          <span className="duf-arrow" aria-hidden>
            →
          </span>
          <span className="duf-node duf-node-process">Open capture</span>
          <span className="duf-arrow" aria-hidden>
            →
          </span>
          <span className="duf-node duf-node-decision">
            <span className="duf-decision-mark" aria-hidden />
            <span className="duf-decision-text">Can access the label?</span>
          </span>
        </div>

        <div className="duf-branch">
          <div className="duf-path">
            <p className="duf-path-label">Yes</p>
            <span className="duf-node duf-node-process">Photograph the label</span>
            <span className="duf-arrow" aria-hidden>
              ↓
            </span>
            <span className="duf-node duf-node-decision">
              <span className="duf-decision-mark" aria-hidden />
              <span className="duf-decision-text">Photo readable?</span>
            </span>
            <div className="duf-branch duf-branch-nested">
              <div className="duf-path">
                <p className="duf-path-label">Yes</p>
                <span className="duf-node duf-node-process">
                  Extract brand / model candidates
                </span>
              </div>
              <div className="duf-path">
                <p className="duf-path-label">No</p>
                <span className="duf-node duf-node-process">Retake photo</span>
                <span className="duf-note-inline">or enter model manually</span>
              </div>
            </div>
          </div>
          <div className="duf-path">
            <p className="duf-path-label">No</p>
            <span className="duf-node duf-node-process">Enter brand / model by hand</span>
            <span className="duf-note-inline">Partial record still allowed</span>
          </div>
        </div>

        <div className="duf-row">
          <span className="duf-node duf-node-decision">
            <span className="duf-decision-mark" aria-hidden />
            <span className="duf-decision-text">Identity confident?</span>
          </span>
        </div>

        <div className="duf-branch">
          <div className="duf-path">
            <p className="duf-path-label">Confident</p>
            <span className="duf-node duf-node-process">Owner confirms fields</span>
          </div>
          <div className="duf-path">
            <p className="duf-path-label">Ambiguous / multi-match</p>
            <span className="duf-node duf-node-process">
              Owner picks candidate or corrects
            </span>
          </div>
        </div>

        <div className="duf-row">
          <span className="duf-node duf-node-decision">
            <span className="duf-decision-mark" aria-hidden />
            <span className="duf-decision-text">Useful links found?</span>
          </span>
        </div>

        <div className="duf-branch">
          <div className="duf-path">
            <p className="duf-path-label">Yes</p>
            <span className="duf-node duf-node-process">
              Attach manual / warranty / support
            </span>
          </div>
          <div className="duf-path">
            <p className="duf-path-label">No</p>
            <span className="duf-node duf-node-process">
              Save identity now — attach links later
            </span>
          </div>
        </div>

        <div className="duf-row">
          <span className="duf-node duf-node-end">
            Appliance on the home — usable even if incomplete
          </span>
        </div>

        <p className="duf-note">Recovery paths: retake · manual entry · partial save · links later</p>
      </div>
    </div>
  );
}
