"use client";

import "./domis-ux-diagrams.css";

type Note = { text: string; source?: string; fact?: boolean };

const CLUSTERS: { theme: string; notes: Note[] }[] = [
  {
    theme: "Treated as a one-time transaction",
    notes: [
      {
        text: "\u201cI read it when buying, then never opened it again.\u201d",
        source: "P2",
      },
      {
        text: "\u201cIt felt like closing paperwork, not a maintenance guide.\u201d",
        source: "P5",
      },
      {
        text: "\u201cI only cared whether the house was a bad purchase.\u201d",
        source: "P8",
      },
      { text: "0 of 9 had opened it in the past year", fact: true },
    ],
  },
  {
    theme: "Dense, but not actionable",
    notes: [
      {
        text: "\u201cI don\u2019t know what\u2019s urgent vs just inspector language.\u201d",
        source: "P1",
      },
      {
        text: "\u201cEverything sounds serious.\u201d",
        source: "P4",
      },
      {
        text: "\u201cPhotos show issues, but I don\u2019t know what to do next.\u201d",
        source: "P6",
      },
      {
        text: "\u201cHalf of it is about problems we already fixed.\u201d",
        source: "P3",
      },
    ],
  },
  {
    theme: "Loses context over time",
    notes: [
      {
        text: "\u201cI don\u2019t remember which things were fixed.\u201d",
        source: "P7",
      },
      {
        text: "\u201cThe seller said they handled some of it.\u201d",
        source: "P2",
      },
      {
        text: "\u201cI think it\u2019s in a drawer. Maybe the garage.\u201d",
        source: "P9",
      },
      { text: "Report age at interview: 4\u201311 yrs", fact: true },
    ],
  },
  {
    theme: "Doesn\u2019t know the current home",
    notes: [
      {
        text: "\u201cThat was six years ago. We redid the whole kitchen since.\u201d",
        source: "P3",
      },
      {
        text: "\u201cIt was true on inspection day.\u201d",
        source: "P5",
      },
      {
        text: "\u201cI couldn\u2019t tell you what brand the furnace is.\u201d",
        source: "P1",
      },
      {
        text: "\u201cWhen was the roof done? No idea. Before us.\u201d",
        source: "P8",
      },
    ],
  },
];

/**
 * Affinity diagram — interview synthesis that drove the Report Processor pivot.
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
        Why owners ignore the inspection report
      </p>

      <div className="dad">
        {CLUSTERS.map((cluster) => (
          <section key={cluster.theme} className="dad-cluster">
            <h3 className="dad-theme">{cluster.theme}</h3>
            <ul className="dad-notes">
              {cluster.notes.map((note) => (
                <li
                  key={note.text}
                  className={
                    note.fact ? "dad-note dad-note-fact" : "dad-note"
                  }
                >
                  <span>{note.text}</span>
                  {note.source ? (
                    <span className="dad-source">{note.source}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
