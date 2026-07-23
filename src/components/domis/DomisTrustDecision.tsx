"use client";

import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import "./domis-ux-diagrams.css";

const BRANCHES = [
  {
    title: "Agreement",
    example: (
      <>
        <strong>Year built 1974</strong> shows up in 2+ runs
      </>
    ),
    result: "Prefill the field",
    resultClass: "dud-chip-ok",
    icon: "check_circle",
  },
  {
    title: "Disagreement",
    example: (
      <>
        One run says <strong>2 bath</strong>, another says <strong>3</strong>
      </>
    ),
    result: "Leave blank for review",
    resultClass: "dud-chip-warn",
    icon: "help",
  },
  {
    title: "Missing",
    example: (
      <>
        Nothing reliable for <strong>lot size</strong>
      </>
    ),
    result: "Show Add — owner fills in",
    resultClass: "dud-chip-soft",
    icon: "add",
  },
] as const;

/**
 * Address Intelligence trust model — what the UI does when AI agrees,
 * disagrees, or finds nothing. Not an architecture diagram.
 */
export function DomisTrustDecision() {
  return (
    <div
      className="dud dtd"
      role="img"
      aria-label="Trust decision: when search runs agree, Domis prefills; when they disagree, fields stay blank for review; when data is missing, the owner adds it. Every field stays editable."
    >
      <div className="dtd-start">
        <span className="dud-chip dud-chip-accent">
          <span className="dud-icon" aria-hidden>
            <DomisLiveIcon name="location_on" size={16} color="#fff" />
          </span>
          Owner types an address
        </span>
        <span className="dud-arrow" aria-hidden>
          →
        </span>
        <span className="dud-chip">Domis researches the house</span>
        <span className="dud-arrow" aria-hidden>
          →
        </span>
        <span className="dud-chip">For each field…</span>
      </div>

      <div className="dtd-branches">
        {BRANCHES.map((branch) => (
          <article key={branch.title} className="dud-card dtd-branch">
            <p className="dud-eyebrow">{branch.title}</p>
            <p className="dtd-example">{branch.example}</p>
            <div className="dtd-result">
              <span className={`dud-chip ${branch.resultClass}`}>
                <span className="dud-icon" aria-hidden>
                  <DomisLiveIcon
                    name={branch.icon}
                    size={16}
                    color="currentColor"
                  />
                </span>
                {branch.result}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="dtd-rule">
        <span className="dtd-rule-label">Trust rule</span>
        <p className="dtd-rule-text">
          When Domis is unsure, the UI gets quieter. Every field stays editable.
        </p>
      </div>
    </div>
  );
}
