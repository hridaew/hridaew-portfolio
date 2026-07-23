"use client";

import "./domis-ux-diagrams.css";

const STAGES = [
  "Closing / inspection",
  "Move-in month",
  "First breakdown",
  "Trying to look it up",
  "Talking to a pro",
  "Weeks later",
] as const;

const ROWS = [
  {
    label: "Actions",
    cells: [
      "Receives 60+ page inspection PDF + appliance docs",
      "Drops files into email / Drive / a drawer",
      "Furnace fault or leak — needs model / age / history",
      "Hunts PDF, camera roll, Google for the plate text",
      "Dictates house details from memory on the phone",
      "Learned facts stay in texts — not in a home record",
    ],
  },
  {
    label: "Thoughts",
    cells: [
      "\u201cI\u2019ll read the report after we move in.\u201d",
      "\u201cI should organize this someday.\u201d",
      "\u201cWhat brand is this, and is it under warranty?\u201d",
      "\u201cWhere did that inspection PDF go?\u201d",
      "\u201cI sound like I don\u2019t know my own house.\u201d",
      "\u201cI should save what the tech told me.\u201d",
    ],
  },
  {
    label: "Emotions",
    cells: [
      "Overloaded",
      "Optimistic, busy",
      "Stressed",
      "Frustrated",
      "Embarrassed / dependent",
      "Relief, then drift",
    ],
    emotion: true as const,
  },
  {
    label: "Touchpoints",
    cells: [
      "Inspection PDF, disclosures, manuals",
      "Inbox, cloud folders, photos",
      "Appliance label, breaker panel",
      "Search, email, camera roll",
      "Contractor call / text thread",
      "Notes app, memory, receipts",
    ],
  },
  {
    label: "Pain / breakdown",
    cells: [
      "Report is dense; unread after closing",
      "Knowledge scatters across tools",
      "Identity of systems unknown under stress",
      "Retrieval fails when time-sensitive",
      "Context expensive to reconstruct for pros",
      "Learning is not retained as home knowledge",
    ],
    pain: true as const,
  },
] as const;

const OPPORTUNITY = [
  "Turn dense closing docs into understanding",
  "Capture while energy is high",
  "Make identity 1 small action",
  "Shorten lookup to confirm, not hunt",
  "Hand pros a shared home context",
  "Keep what was learned on the property",
] as const;

/**
 * Customer journey map — Domis-specific homeowner knowledge breakdown over time.
 */
export function DomisHomeKnowledgeJourney() {
  return (
    <div
      className="dud dud-board"
      role="region"
      aria-label="Customer journey map: how homeowners gain, lose, and struggle to retrieve home knowledge from closing through a repair call"
    >
      <p className="dud-type">Customer journey map</p>
      <p className="dud-meta">
        Inputs: homeowner interviews · inspection reports · onboarding tests
      </p>
      <p className="dud-heading">
        Home knowledge arrives at closing, scatters after move-in, and fails
        under the stress of a repair
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
                      "emotion" in row && row.emotion
                        ? "djm-emo"
                        : "pain" in row && row.pain
                          ? "djm-pain"
                          : undefined
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
