"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./domis-ux-diagrams.css";

type PersonaId = "mid" | "first";

type JourneyPersona = {
  id: PersonaId;
  label: string;
  blurb: string;
  stages: string[];
  /** Emotion valence 0–100 (higher = better) for the wave above the map */
  emotionWave: number[];
  rows: {
    label: string;
    cells: string[];
    tone?: "emotion" | "pain";
  }[];
  opportunity: string[];
};

const PERSONAS: JourneyPersona[] = [
  {
    id: "mid",
    label: "Mid-journey homeowner",
    blurb:
      "Most Domis users. Years in, still reconstructing the house under stress.",
    stages: [
      "Quiet period",
      "Something breaks",
      "Digging for records",
      "Talking to a pro",
      "Temporary fix",
      "Back to baseline",
    ],
    emotionWave: [58, 26, 14, 18, 42, 52],
    rows: [
      {
        label: "Actions",
        cells: [
          "Ignores systems until a symptom",
          "Needs age, model, prior work",
          "Searches old PDFs, photos, texts",
          "Rebuilds the story from scraps",
          "Pays for a patch / replacement",
          "New facts live in the invoice thread",
        ],
      },
      {
        label: "Thoughts",
        cells: [
          "\u201cIt\u2019s been fine for years.\u201d",
          "\u201cDid we already fix this once?\u201d",
          "\u201cIs the warranty still good?\u201d",
          "\u201cI know I have this somewhere.\u201d",
          "\u201cJust get it working.\u201d",
          "\u201cI\u2019ll track this better next time.\u201d",
        ],
      },
      {
        label: "Emotions",
        cells: [
          "Complacent",
          "Anxious",
          "Frustrated",
          "Frustrated. Info is everywhere",
          "Relieved, spent",
          "Resigned drift",
        ],
        tone: "emotion",
      },
      {
        label: "Touchpoints",
        cells: [
          "None / vague memory",
          "Appliance, prior invoices",
          "Email, Drive, camera roll",
          "Pro call / group texts",
          "Receipt, warranty email",
          "Same scattered tools",
        ],
      },
      {
        label: "Pain",
        cells: [
          "No living home record",
          "History is incomplete",
          "Files are stale or missing",
          "Can\u2019t brief a pro cleanly",
          "Learning stays with the vendor",
          "Cycle repeats next season",
        ],
        tone: "pain",
      },
    ],
    opportunity: [
      "Surface what\u2019s already known",
      "Capture identity under urgency",
      "One place for home facts",
      "Hand pros a coherent brief",
      "Log the outcome on the home",
      "Break the forget-repeat loop",
    ],
  },
  {
    id: "first",
    label: "First-time homeowner",
    blurb: "Knowledge arrives all at once at closing, then scatters.",
    stages: [
      "Closing",
      "Move-in",
      "First breakdown",
      "Looking it up",
      "Talking to a pro",
      "Weeks later",
    ],
    emotionWave: [32, 74, 28, 16, 20, 48],
    rows: [
      {
        label: "Actions",
        cells: [
          "Gets inspection PDF + manuals",
          "Files land in email / a drawer",
          "Something fails. Needs model and history",
          "Hunts PDF, camera roll, Google",
          "Piecing details together on the phone",
          "Facts stay in texts, not on the home",
        ],
      },
      {
        label: "Thoughts",
        cells: [
          "\u201cI\u2019ll read this later.\u201d",
          "\u201cI should organize this.\u201d",
          "\u201cWhat brand is this?\u201d",
          "\u201cWhere did that report go?\u201d",
          "\u201cI have this somewhere\u2026\u201d",
          "\u201cI should save what they said.\u201d",
        ],
      },
      {
        label: "Emotions",
        cells: [
          "Overloaded",
          "Optimistic, busy",
          "Stressed",
          "Frustrated",
          "Frustrated. Info is everywhere",
          "Relief, then drift",
        ],
        tone: "emotion",
      },
      {
        label: "Touchpoints",
        cells: [
          "Inspection PDF, disclosures",
          "Inbox, Drive, photos",
          "Label, panel, memory",
          "Search, email, camera",
          "Pro call / text thread",
          "Notes, receipts, memory",
        ],
      },
      {
        label: "Pain",
        cells: [
          "Dense, unread after closing",
          "Knowledge scatters",
          "Systems unknown under stress",
          "Retrieval fails when urgent",
          "Context hard to assemble for pros",
          "Learning isn\u2019t retained",
        ],
        tone: "pain",
      },
    ],
    opportunity: [
      "Make closing docs understandable",
      "Capture while energy is high",
      "Identity in one small action",
      "Confirm, don\u2019t hunt",
      "Shared home context for pros",
      "Keep learning on the property",
    ],
  },
];

function EmotionWave({
  values,
  gradientId,
}: {
  values: number[];
  gradientId: string;
}) {
  const width = 600;
  const height = 88;
  const padX = 10;
  const padY = 10;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * innerW;
    const y = padY + (1 - v / 100) * innerH;
    return { x, y };
  });

  const lineD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1]!;
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaD = `${lineD} L ${points[points.length - 1]!.x} ${height - 2} L ${points[0]!.x} ${height - 2} Z`;

  return (
    <div className="djm-wave" aria-hidden>
      <svg
        className="djm-wave-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 90, 91, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 90, 91, 0)" />
          </linearGradient>
        </defs>
        <path className="djm-wave-area" d={areaD} fill={`url(#${gradientId})`} />
        <path className="djm-wave-line" d={lineD} />
        {points.map((p, i) => (
          <circle key={i} className="djm-wave-dot" cx={p.x} cy={p.y} r="2.6" />
        ))}
      </svg>
    </div>
  );
}

/**
 * Customer journey map — mid-journey first, animated persona switch, red emotion wave.
 */
export function DomisHomeKnowledgeJourney() {
  const [personaId, setPersonaId] = useState<PersonaId>("mid");
  const gradientId = useId().replace(/:/g, "");
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0]!;

  return (
    <div
      className="dud dud-board djm"
      role="region"
      aria-label={`Customer journey map for ${persona.label}: emotional highs and lows and home-knowledge breakdown across stages`}
    >
      <div className="djm-header">
        <div>
          <p className="dud-type">Customer journey map</p>
          <p className="dud-heading djm-heading">{persona.blurb}</p>
        </div>

        <div
          className="djm-switch"
          role="tablist"
          aria-label="Journey persona"
        >
          {PERSONAS.map((p) => {
            const selected = p.id === personaId;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={
                  selected
                    ? "djm-switch-btn djm-switch-btn-active"
                    : "djm-switch-btn"
                }
                onClick={() => setPersonaId(p.id)}
              >
                {selected ? (
                  <motion.span
                    layoutId="djm-switch-pill"
                    className="djm-switch-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="djm-switch-label">{p.label}</span>
                {p.id === "mid" ? (
                  <span className="djm-switch-tag">Most users</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="djm-scroll">
        <div className="djm-wave-rail" aria-hidden>
          <div className="djm-wave-gutter" />
          <AnimatePresence mode="wait">
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <EmotionWave
                values={persona.emotionWave}
                gradientId={`djm-grad-${gradientId}-${persona.id}`}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <table className="djm-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Dimension</span>
                  </th>
                  {persona.stages.map((stage) => (
                    <th key={stage} scope="col">
                      {stage}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {persona.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.cells.map((cell) => (
                      <td
                        key={`${row.label}-${cell}`}
                        className={
                          row.tone === "emotion"
                            ? "djm-emo"
                            : row.tone === "pain"
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
                  {persona.opportunity.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
