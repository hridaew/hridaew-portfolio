"use client";

import { useState, type ReactNode } from "react";

type MoreCard = {
  id: string;
  title: string;
  description: string;
  pastel: string;
  ink: string;
  icon: ReactNode;
};

const cards: MoreCard[] = [
  {
    id: "design-system",
    title: "Design system",
    description:
      "Tokens, components, and patterns that keep mobile and web coherent as Domis grows from 0→1 into a shipped product.",
    pastel: "#d9ebe3",
    ink: "#1f3d34",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="12" height="12" rx="3" fill="#1f3d34" opacity="0.9" />
        <rect x="20" y="4" width="12" height="12" rx="3" fill="#3b6cf0" opacity="0.85" />
        <rect x="4" y="20" width="12" height="12" rx="3" fill="#6b7c75" opacity="0.75" />
        <rect x="20" y="20" width="12" height="12" rx="3" fill="#1f3d34" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: "multi-property",
    title: "Multi-property",
    description:
      "One place for several homes—each with its own profile, tasks, and avatar—so managing more than one property stays clear.",
    pastel: "#f3e2d4",
    ink: "#5a3420",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path
          d="M6 16 L14 10 L22 16 V28 H6 V16 Z"
          stroke="#5a3420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M16 18 L24 12 L32 18 V28 H22"
          stroke="#5a3420"
          strokeWidth="1.8"
          strokeLinejoin="round"
          opacity="0.55"
        />
        <rect x="11" y="21" width="4" height="7" fill="#5a3420" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "recommendations",
    title: "Recommendations",
    description:
      "Location and season aware nudges so the right upkeep surfaces at the right time, without the owner having to remember.",
    pastel: "#dce8f7",
    ink: "#243b5a",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="11" stroke="#243b5a" strokeWidth="1.8" />
        <path
          d="M18 10 V18 L24 22"
          stroke="#243b5a"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="18" r="2" fill="#243b5a" />
      </svg>
    ),
  },
  {
    id: "maintenance-guides",
    title: "Maintenance guides",
    description:
      "Multi-step preventative guides that break complex home care into clear, finishable actions tied to the systems you own.",
    pastel: "#efe8c8",
    ink: "#4a3f16",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path
          d="M10 6 H22 L28 12 V30 H10 V6 Z"
          stroke="#4a3f16"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M22 6 V12 H28" stroke="#4a3f16" strokeWidth="1.8" strokeLinejoin="round" />
        <path
          d="M14 18 H24 M14 22 H24 M14 26 H20"
          stroke="#4a3f16"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "pro-handoff",
    title: "Pro handoff",
    description:
      "Share home context with Pros so they arrive knowing the property—not starting from a blank conversation every time.",
    pastel: "#f0ddd8",
    ink: "#5a2e28",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="12" cy="14" r="4" stroke="#5a2e28" strokeWidth="1.8" />
        <path
          d="M6 26 C6 21.5 8.5 19 12 19 C15.5 19 18 21.5 18 26"
          stroke="#5a2e28"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M22 14 H30 M26 10 V18"
          stroke="#5a2e28"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M20 26 H30"
          stroke="#5a2e28"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    id: "task-modules",
    title: "Task modules",
    description:
      "Reusable task patterns that turn what Domis knows about a home into trackable work homeowners can actually finish.",
    pastel: "#dde8f0",
    ink: "#2a3f4d",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="6" y="8" width="24" height="6" rx="2" stroke="#2a3f4d" strokeWidth="1.8" />
        <rect x="6" y="17" width="24" height="6" rx="2" stroke="#2a3f4d" strokeWidth="1.8" />
        <rect x="6" y="26" width="16" height="4" rx="2" fill="#2a3f4d" opacity="0.35" />
        <path
          d="M9 11 L11 13 L15 9"
          stroke="#2a3f4d"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function DomisMoreCards() {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  return (
    <div className="dcs-more">
      <ul className="dcs-sheet">
        {cards.map((card) => {
          const flipped = flippedId === card.id;
          return (
            <li key={card.id} className="dcs-flip-item">
              <button
                type="button"
                className={`dcs-flip${flipped ? " is-flipped" : ""}`}
                aria-pressed={flipped}
                aria-label={`${card.title}. ${flipped ? "Showing description. Click to flip back." : "Click to read more."}`}
                onClick={() =>
                  setFlippedId((current) => (current === card.id ? null : card.id))
                }
              >
                <span className="dcs-flip-inner">
                  <span
                    className="dcs-flip-face dcs-flip-front"
                    style={{ background: card.pastel, color: card.ink }}
                  >
                    <span className="dcs-flip-title">{card.title}</span>
                    <span className="dcs-flip-icon">{card.icon}</span>
                  </span>
                  <span
                    className="dcs-flip-face dcs-flip-back"
                    style={{ background: card.pastel, color: card.ink }}
                  >
                    <span className="dcs-flip-title">{card.title}</span>
                    <span className="dcs-flip-copy">{card.description}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
