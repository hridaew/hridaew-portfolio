"use client";

import "./domis-ux-diagrams.css";

type Note = { text: string; source?: string; fact?: boolean };

/** Distinct sticky colors per participant (P1–P9). */
const PARTICIPANT_STYLE: Record<string, { bg: string; ink: string; tag: string }> =
  {
    P1: { bg: "#f6cfc9", ink: "#3a1f1c", tag: "#7a3b34" },
    P2: { bg: "#fde2b8", ink: "#3d2a12", tag: "#8a5a18" },
    P3: { bg: "#e8f0c8", ink: "#2a3314", tag: "#5a6b28" },
    P4: { bg: "#cfeee3", ink: "#16352c", tag: "#2f6b57" },
    P5: { bg: "#cfe0f7", ink: "#1a2a42", tag: "#355987" },
    P6: { bg: "#ddd4f5", ink: "#2a2142", tag: "#5a488a" },
    P7: { bg: "#f5d0e6", ink: "#3a1f30", tag: "#7a3b5f" },
    P8: { bg: "#d7ebe7", ink: "#1d3330", tag: "#3a6660" },
    P9: { bg: "#f3e0c8", ink: "#3a2a16", tag: "#7a5a2e" },
  };

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
 * Affinity diagram with per-participant sticky colors.
 */
export function DomisReportAffinity() {
  return (
    <div
      className="dud dud-board"
      role="region"
      aria-label="Affinity diagram from homeowner interviews about inspection reports"
    >
      <p className="dud-type">Affinity diagram</p>
      <p className="dud-heading">Why owners ignore the inspection report</p>

      <div className="dad">
        {CLUSTERS.map((cluster) => (
          <section key={cluster.theme} className="dad-cluster">
            <h3 className="dad-theme">{cluster.theme}</h3>
            <ul className="dad-notes">
              {cluster.notes.map((note) => {
                const style =
                  note.source && !note.fact
                    ? PARTICIPANT_STYLE[note.source]
                    : undefined;
                return (
                  <li
                    key={note.text}
                    className={
                      note.fact ? "dad-note dad-note-fact" : "dad-note"
                    }
                    style={
                      style
                        ? {
                            background: style.bg,
                            color: style.ink,
                            ["--dad-tag" as string]: style.tag,
                          }
                        : undefined
                    }
                  >
                    <span>{note.text}</span>
                    {note.source ? (
                      <span className="dad-source">{note.source}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
