"use client";

import "./domis-ux-diagrams.css";

const CLUSTERS = [
  {
    theme: "Treated as a one-time transaction",
    notes: [
      "\u201cI read it when buying, then never opened it again.\u201d",
      "\u201cIt felt like closing paperwork, not a maintenance guide.\u201d",
      { text: "0 of 9 had opened it in the past year", fact: true },
    ],
  },
  {
    theme: "Dense, but not actionable",
    notes: [
      "\u201cI don\u2019t know what\u2019s urgent vs just inspector language.\u201d",
      "\u201cEverything sounds serious.\u201d",
      "\u201cPhotos show issues, but I don\u2019t know what to do next.\u201d",
    ],
  },
  {
    theme: "Loses context over time",
    notes: [
      "\u201cI don\u2019t remember which things were fixed.\u201d",
      "\u201cThe seller said they handled some of it.\u201d",
      { text: "Report age at interview: 4\u201311 yrs", fact: true },
    ],
  },
  {
    theme: "Doesn\u2019t know the current home",
    notes: [
      "\u201cThat was six years ago. We redid the whole kitchen since.\u201d",
      "\u201cIt was true on inspection day.\u201d",
      "\u201cIt can\u2019t tell what changed after move-in.\u201d",
    ],
  },
] as const;

/**
 * Affinity diagram — interview synthesis that drove the Report Processor pivot:
 * understanding over auto-generated chores.
 */
export function DomisReportAffinity() {
  return (
    <div
      className="dud dud-board"
      role="region"
      aria-label="Affinity diagram from homeowner interviews about inspection reports"
    >
      <p className="dud-type">Affinity diagram</p>
      <p className="dud-heading">
        Why owners ignore the inspection report — and why auto-chores would
        arrive wrong
      </p>

      <div className="dad">
        {CLUSTERS.map((cluster) => (
          <section key={cluster.theme} className="dad-cluster">
            <h3 className="dad-theme">{cluster.theme}</h3>
            <ul className="dad-notes">
              {cluster.notes.map((note) => {
                const text = typeof note === "string" ? note : note.text;
                const fact = typeof note !== "string" && note.fact;
                return (
                  <li
                    key={text}
                    className={fact ? "dad-note dad-note-fact" : "dad-note"}
                  >
                    {text}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div className="dad-implication">
          <h3 className="dad-theme">Design implication</h3>
          <p>
            Help owners understand findings. Preserve context. Separate
            “possible issue” from “confirmed chore.” Do not pretend a stale PDF
            is a current to-do list.
          </p>
        </div>
      </div>
    </div>
  );
}
