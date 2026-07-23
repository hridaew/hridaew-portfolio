"use client";

import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import "./domis-ux-diagrams.css";

const BEFORE = [
  { icon: "search", label: "Needs help, repair, or warranty" },
  { icon: "edit", label: "Asked to type a tiny model number" },
  { icon: "sentiment_dissatisfied", label: "High friction, often abandoned" },
] as const;

const AFTER = [
  { icon: "photo_camera", label: "Take one photo of the label", key: false },
  {
    icon: "vpn_key",
    label: "Model number becomes the key",
    key: true,
  },
] as const;

const UNLOCKS = [
  "Manual",
  "Support",
  "Warranty",
  "Parts",
  "Common failures",
] as const;

/**
 * JTBD value ladder: the model number is not the destination — it unlocks
 * what the owner actually needs when something breaks.
 */
export function DomisApplianceValueLadder() {
  return (
    <div
      className="dud dav"
      role="img"
      aria-label="Before: typing a tiny model number is high friction. After: one photo turns the model number into a key that unlocks manuals, support, warranty, parts, and common failures."
    >
      <article className="dud-card dav-col">
        <p className="dud-eyebrow">Before</p>
        <p className="dud-title">Model number as homework</p>
        <ul className="dav-steps dav-steps-before">
          {BEFORE.map((step) => (
            <li key={step.label}>
              <span className="dud-icon" aria-hidden>
                <DomisLiveIcon
                  name={step.icon}
                  size={16}
                  color="#6f6f6f"
                />
              </span>
              {step.label}
            </li>
          ))}
        </ul>
        <p className="dav-footnote">The owner has a job. The form is in the way.</p>
      </article>

      <div className="dud-arrow" aria-hidden>
        →
      </div>

      <article className="dud-card dav-col">
        <p className="dud-eyebrow">After</p>
        <p className="dud-title">Model number as a key</p>
        <ul className="dav-steps">
          {AFTER.map((step) => (
            <li key={step.label} className={step.key ? "dav-key" : undefined}>
              <span className="dud-icon" aria-hidden>
                <DomisLiveIcon
                  name={step.icon}
                  size={16}
                  color={step.key ? "#ff5a5b" : "#1a1c1e"}
                />
              </span>
              {step.label}
            </li>
          ))}
        </ul>
        <div className="dav-unlocks" aria-label="What the model unlocks">
          {UNLOCKS.map((item) => (
            <span key={item} className="dud-chip dud-chip-soft">
              {item}
            </span>
          ))}
        </div>
        <p className="dav-footnote">
          Capture identity so the owner can act — not so Domis can store a string.
        </p>
      </article>
    </div>
  );
}
