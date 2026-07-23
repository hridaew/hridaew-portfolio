"use client";

import "./domis-ux-diagrams.css";

const WRONG_PATH = ["Inspection PDF", "Extract defects", "Auto task list"] as const;

const RISKS = ["Stale", "Already fixed", "False urgency", "Trust breaks"] as const;

const DECISIONS = [
  { q: "Still true?", a: "Pull into a task" },
  { q: "Already fixed?", a: "Dismiss" },
  { q: "Not urgent?", a: "Monitor" },
  { q: "Useful context only?", a: "Keep as reference" },
] as const;

/**
 * Research-driven product pivot: understanding the house vs. auto-generating
 * chores from a stale inspection report.
 */
export function DomisReportMentalModel() {
  return (
    <div
      className="dud drm"
      role="img"
      aria-label="Wrong model: inspection PDF becomes an automatic task list, which is stale and erodes trust. Domis model: PDF becomes translated findings the owner reviews — pull into a task, dismiss, monitor, or keep as reference."
    >
      <article className="dud-card drm-col drm-wrong">
        <p className="dud-eyebrow">Wrong model</p>
        <p className="dud-title">Automatic chores</p>
        <div className="drm-path" aria-hidden>
          {WRONG_PATH.flatMap((step, i) =>
            i === 0
              ? [
                  <span key={step} className="dud-chip dud-chip-soft">
                    {step}
                  </span>,
                ]
              : [
                  <span key={`${step}-arrow`} className="dud-arrow dud-arrow-ink">
                    →
                  </span>,
                  <span key={step} className="dud-chip dud-chip-soft">
                    {step}
                  </span>,
                ]
          )}
        </div>
        <p className="dud-sub">
          The report may no longer describe the house they live in. Auto tasks
          risk arriving stale.
        </p>
        <div className="drm-risks">
          {RISKS.map((risk) => (
            <span key={risk} className="dud-chip dud-chip-warn">
              {risk}
            </span>
          ))}
        </div>
      </article>

      <article className="dud-card drm-col">
        <p className="dud-eyebrow">Domis model</p>
        <p className="dud-title">Translate first. Let the owner judge.</p>
        <div className="drm-path" aria-hidden>
          <span className="dud-chip dud-chip-accent">Inspection PDF</span>
          <span className="dud-arrow dud-arrow-ink">→</span>
          <span className="dud-chip">Translated findings</span>
          <span className="dud-arrow dud-arrow-ink">→</span>
          <span className="dud-chip">Owner reviews</span>
        </div>
        <ul className="drm-decisions">
          {DECISIONS.map((row) => (
            <li key={row.q}>
              <span className="drm-q">{row.q}</span>
              <span className="drm-a">{row.a}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
