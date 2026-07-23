"use client";

import "./domis-ux-diagrams.css";

const STAGES = [
  "Buying the home",
  "Moving in",
  "First repair",
  "Looking things up",
  "Calling a pro",
  "Afterward",
] as const;

const ROWS = [
  {
    label: "Actions",
    cells: [
      "Gets inspection report, disclosures, manuals",
      "Files PDFs and emails somewhere",
      "Something breaks",
      "Searches model numbers, old PDFs, camera roll",
      "Describes the house from memory",
      "Learned info disappears again",
    ],
  },
  {
    label: "Thoughts",
    cells: [
      "\u201cI\u2019ll read this later.\u201d",
      "\u201cI should organize this.\u201d",
      "\u201cWhat even is this appliance?\u201d",
      "\u201cWhere did I put that report?\u201d",
      "\u201cHope this is enough context.\u201d",
      "\u201cI should save what I learned.\u201d",
    ],
  },
  {
    label: "Emotions",
    cells: [
      "Overwhelmed",
      "Optimistic",
      "Anxious",
      "Frustrated",
      "Dependent",
      "Relief, then forgetting",
    ],
    emotion: true as const,
  },
  {
    label: "Touchpoints",
    cells: [
      "Inspection PDF, listing",
      "Email, files, photos",
      "Label, panel, memory",
      "Search, inbox, camera",
      "Contractor call / text",
      "Notes app, memory",
    ],
  },
] as const;

const OPPORTUNITY = [
  "Knowledge exists, but dense",
  "Knowledge scatters",
  "Need turns urgent",
  "Retrieval fails",
  "Context is expensive",
  "Learning isn’t retained",
] as const;

/**
 * Customer journey map — homeowner relationship with home knowledge over time.
 * Observational / research-led, not a Domis product pitch.
 */
export function DomisHomeKnowledgeJourney() {
  return (
    <div
      className="dud dud-board"
      role="region"
      aria-label="Customer journey map: how homeowners gain, lose, and struggle to retrieve home knowledge over time"
    >
      <p className="dud-type">Customer journey map</p>
      <p className="dud-heading">
        Home knowledge appears at transitions, disappears in daily life, and
        becomes urgent when something breaks
      </p>

      <div className="djm-scroll">
        <table className="djm-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Dimension</span>
              </th>
              {STAGES.map((stage) => (
                <th key={stage} scope="col">
                  {stage}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell) => (
                  <td
                    key={`${row.label}-${cell}`}
                    className={
                      "emotion" in row && row.emotion ? "djm-emo" : undefined
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="djm-opp">
              <th scope="row">Opportunity</th>
              {OPPORTUNITY.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
