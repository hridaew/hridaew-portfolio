"use client";

import "./domis-ux-diagrams.css";

const ROWS = [
  {
    feature: "Address",
    action: "Type address",
    ai: "Prefill home facts",
    trust: "Only show agreement",
    control: "Edit / fill blanks",
    payoff: "Home exists in software",
  },
  {
    feature: "Appliance",
    action: "Photo of label",
    ai: "Identity + useful links",
    trust: "Facts first, then sources",
    control: "Confirm / edit",
    payoff: "Appliance becomes actionable",
  },
  {
    feature: "Report",
    action: "Upload PDF",
    ai: "Translate findings",
    trust: "No auto chore list",
    control: "Pull / monitor / dismiss",
    payoff: "Owner understands the house",
  },
] as const;

const COLS = [
  "Feature",
  "Smallest action",
  "AI contribution",
  "Trust rule",
  "Owner control",
  "Payoff",
] as const;

/**
 * Scannable operating model for Insights — systems, trust, and control
 * across the three ingestion surfaces.
 */
export function DomisInsightsMatrix() {
  return (
    <div
      className="dud dim"
      role="region"
      aria-label="Insights matrix across Address, Appliance, and Report"
    >
      <table className="dim-table">
        <caption className="dud-caption-hidden">
          For each feature: smallest user action, AI contribution, trust rule,
          owner control, and payoff
        </caption>
        <thead>
          <tr>
            {COLS.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.feature}>
              <th scope="row">{row.feature}</th>
              <td>{row.action}</td>
              <td className="dim-muted">{row.ai}</td>
              <td>{row.trust}</td>
              <td className="dim-muted">{row.control}</td>
              <td>{row.payoff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
