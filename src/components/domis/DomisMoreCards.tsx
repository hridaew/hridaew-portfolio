"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type MoreCard = {
  id: string;
  title: string;
  description: string;
  pastel: string;
  ink: string;
  icon: ReactNode;
};

function IconDesignSystem() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="22" height="22" rx="6" fill="currentColor" />
      <rect x="30" y="4" width="22" height="22" rx="6" fill="currentColor" opacity="0.28" />
      <rect x="4" y="30" width="22" height="22" rx="6" fill="currentColor" opacity="0.28" />
      <rect x="30" y="30" width="10" height="10" rx="3" fill="currentColor" opacity="0.75" />
      <rect x="42" y="30" width="10" height="10" rx="3" fill="currentColor" opacity="0.45" />
      <rect x="30" y="42" width="10" height="10" rx="3" fill="currentColor" opacity="0.45" />
      <rect x="42" y="42" width="10" height="10" rx="3" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

function IconMultiProperty() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <path
        d="M8 27.5 L22 15 L36 27.5 V45.5 C36 47.4 34.4 49 32.5 49 H11.5 C9.6 49 8 47.4 8 45.5 V27.5 Z"
        fill="currentColor"
      />
      <path
        d="M26 29.5 L38 19 L50 29.5 V45.5 C50 47.4 48.4 49 46.5 49 H36"
        fill="currentColor"
        opacity="0.32"
      />
      <rect x="20" y="36" width="5" height="13" rx="2" fill="#000" opacity="0.18" />
    </svg>
  );
}

function IconRecommendations() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="3" />
      <path
        d="M28 14 L31.2 23.2 L41 24.1 L33.8 30.4 L36 40 L28 34.8 L20 40 L22.2 30.4 L15 24.1 L24.8 23.2 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMaintenanceGuides() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="40" height="44" rx="8" fill="currentColor" opacity="0.16" />
      <rect x="8" y="6" width="40" height="10" rx="5" fill="currentColor" />
      <rect x="14" y="22" width="28" height="4" rx="2" fill="currentColor" />
      <rect x="14" y="30" width="22" height="4" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="14" y="38" width="16" height="4" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="36" y="6" width="12" height="12" rx="4" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function IconProHandoff() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="4" y="14" width="18" height="28" rx="6" fill="currentColor" />
      <rect x="34" y="14" width="18" height="28" rx="6" fill="currentColor" opacity="0.32" />
      <path d="M24 28 H32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M29 23 L34 28 L29 33"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="13" cy="24" r="3" fill="#000" opacity="0.18" />
      <rect x="9" y="30" width="8" height="3" rx="1.5" fill="#000" opacity="0.18" />
    </svg>
  );
}

function IconTaskModules() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="48" height="12" rx="6" fill="currentColor" />
      <rect x="4" y="22" width="48" height="12" rx="6" fill="currentColor" opacity="0.45" />
      <rect x="4" y="38" width="32" height="12" rx="6" fill="currentColor" opacity="0.22" />
      <path
        d="M10 12 L13.2 15 L20 9"
        stroke="#000"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.22"
      />
      <rect x="10" y="26" width="7" height="4" rx="2" fill="#000" opacity="0.22" />
    </svg>
  );
}

const cards: MoreCard[] = [
  {
    id: "design-system",
    title: "Design system",
    description:
      "Tokens, components, and patterns that keep mobile and web coherent as Domis grows from 0→1 into a shipped product.",
    pastel: "#6bc492",
    ink: "#143528",
    icon: <IconDesignSystem />,
  },
  {
    id: "multi-property",
    title: "Multi-property",
    description:
      "One place for several homes—each with its own profile, tasks, and avatar—so managing more than one property stays clear.",
    pastel: "#c4a882",
    ink: "#3a2a18",
    icon: <IconMultiProperty />,
  },
  {
    id: "recommendations",
    title: "Recommended Tasks",
    description:
      "Location and season aware nudges so the right upkeep surfaces at the right time, without the owner having to remember.",
    pastel: "#6b9ee8",
    ink: "#15233d",
    icon: <IconRecommendations />,
  },
  {
    id: "maintenance-guides",
    title: "Maintenance guides",
    description:
      "Multi-step preventative guides that break complex home care into clear, finishable actions tied to the systems you own.",
    pastel: "#d4bc5c",
    ink: "#352c10",
    icon: <IconMaintenanceGuides />,
  },
  {
    id: "pro-handoff",
    title: "Pro handoff",
    description:
      "Share home context with Pros so they arrive knowing the property—not starting from a blank conversation every time.",
    pastel: "#e07a7a",
    ink: "#3d1818",
    icon: <IconProHandoff />,
  },
  {
    id: "task-modules",
    title: "Task modules",
    description:
      "Reusable task patterns that turn what Domis knows about a home into trackable work homeowners can actually finish.",
    pastel: "#8a9bb0",
    ink: "#1e2834",
    icon: <IconTaskModules />,
  },
];

function FlipCard({
  card,
  flipped,
  onToggle,
}: {
  card: MoreCard;
  flipped: boolean;
  onToggle: () => void;
}) {
  const tiltRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);

  const resetTilt = () => {
    cancelAnimationFrame(rafRef.current);
    const el = tiltRef.current;
    if (!el) return;
    el.classList.remove("is-tilting");
    el.style.setProperty("--dcs-tilt-x", "0deg");
    el.style.setProperty("--dcs-tilt-y", "0deg");
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.classList.add("is-tilting");
      // invert X so the card leans toward the cursor
      el.style.setProperty("--dcs-tilt-x", `${(-py * 12).toFixed(2)}deg`);
      el.style.setProperty("--dcs-tilt-y", `${(px * 14).toFixed(2)}deg`);
    });
  };

  return (
    <button
      type="button"
      className={`dcs-flip${flipped ? " is-flipped" : ""}`}
      aria-pressed={flipped}
      aria-label={`${card.title}. ${flipped ? "Showing description. Click to flip back." : "Click to read more."}`}
      onClick={() => {
        resetTilt();
        onToggle();
      }}
      onPointerMove={flipped ? undefined : onPointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <span className="dcs-flip-tilt" ref={tiltRef}>
        <span className="dcs-flip-inner">
          <span
            className="dcs-flip-face dcs-flip-front"
            style={{ background: card.pastel, color: card.ink } satisfies CSSProperties}
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
      </span>
    </button>
  );
}

export function DomisMoreCards() {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  return (
    <div className="dcs-more">
      <ul className="dcs-sheet">
        {cards.map((card) => (
          <li key={card.id} className="dcs-flip-item">
            <FlipCard
              card={card}
              flipped={flippedId === card.id}
              onToggle={() =>
                setFlippedId((current) => (current === card.id ? null : card.id))
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
