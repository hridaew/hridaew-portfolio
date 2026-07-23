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
 * Flowchart language, not product UI cards.
 */
export function DomisAddressUserFlow() {
  return (
    <div
      className="dud dud-board"
      role="img"
      aria-label="User flow for creating a home from an address: type address, resolve property, branch on match confidence, then prefill only what sources agree on, always leaving fields editable"
    >
      <p className="dud-type">User flow</p>
      <p className="dud-heading">
        Create a home from an address — including when the data is unsure
      </p>

      <div className="duf">
        <div className="duf-row">
          <span className="duf-node duf-node-start">Owner types address</span>
          <span className="duf-arrow" aria-hidden>
            →
          </span>
          <span className="duf-node duf-node-process">Resolve property candidates</span>
          <span className="duf-arrow" aria-hidden>
            →
          </span>
          <span className="duf-node duf-node-decision">Single confident match?</span>
        </div>

        <div className="duf-branch">
          <div className="duf-path">
            <p className="duf-path-label">Yes</p>
            <span className="duf-node duf-node-process">
              Prefill agreed home facts
            </span>
            <span className="duf-arrow" aria-hidden>
              ↓
            </span>
            <span className="duf-node duf-node-process">
              Owner reviews / edits any field
            </span>
          </div>
          <div className="duf-path">
            <p className="duf-path-label">No / ambiguous</p>
            <span className="duf-node duf-node-process">
              Show 2–3 candidates with differentiating facts
            </span>
            <span className="duf-arrow" aria-hidden>
              ↓
            </span>
            <span className="duf-node duf-node-process">
              Owner picks or corrects the address
            </span>
          </div>
        </div>

        <div className="duf-row">
          <span className="duf-node duf-node-decision">
            Field-level source agreement?
          </span>
        </div>

        <div className="duf-branch">
          <div className="duf-path">
            <p className="duf-path-label">Agree</p>
            <span className="duf-node duf-node-process">Show the value</span>
          </div>
          <div className="duf-path">
            <p className="duf-path-label">Disagree or missing</p>
            <span className="duf-node duf-node-process">
              Leave blank — owner fills later
            </span>
          </div>
        </div>

        <div className="duf-row">
          <span className="duf-node duf-node-end">
            Home profile exists — editable, incomplete is OK
          </span>
        </div>

        <p className="duf-note">Edge cases designed for</p>
        <div className="duf-edges">
          {EDGES.map((edge) => (
            <span key={edge} className="duf-edge">
              {edge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
