"use client";

import type { CSSProperties } from "react";
import "./task-card.css";

export type TaskCardChipVariant =
  | "default"
  | "location"
  | "recommends"
  | "priority-high"
  | "priority-monitor"
  | "priority-dismissed"
  | "category"
  | "pin";

export type TaskCardChip = {
  id: string;
  label?: string;
  /** Material Symbols Rounded ligature name */
  icon?: string;
  variant?: TaskCardChipVariant;
  backgroundColor?: string;
  color?: string;
};

export type TaskCardProps = {
  title: string;
  chips?: readonly TaskCardChip[];
  thumbSrc?: string;
  thumbAlt?: string;
  pinned?: boolean;
  /** Dismissed / muted card treatment */
  muted?: boolean;
  /** Demo highlight ring (choreography owns timing) */
  highlighted?: boolean;
  className?: string;
  style?: CSSProperties;
};

function MaterialIcon({
  name,
  size = 15,
}: {
  name: string;
  size?: number;
}) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden="true"
      style={{ fontSize: size, width: size, height: size }}
    >
      {name}
    </span>
  );
}

/**
 * Presentational Domis task card — Flutter TaskCard / CustomCard / AppShadows.
 * Demo modules own reveal / highlight choreography.
 */
export function TaskCard({
  title,
  chips = [],
  thumbSrc,
  thumbAlt = "",
  pinned = false,
  muted = false,
  highlighted = false,
  className,
  style,
}: TaskCardProps) {
  return (
    <article
      className={["domis-live", "dtc", className].filter(Boolean).join(" ")}
      style={style}
      data-muted={muted ? "true" : "false"}
      data-highlighted={highlighted ? "true" : "false"}
    >
      <div className="dtc-body">
        <p className="dtc-title">{title}</p>
        {(pinned || chips.length > 0) && (
          <div className="dtc-chips">
            {pinned && (
              <span
                className="dtc-chip-circle"
                data-variant="pin"
                aria-label="Pinned"
              >
                <MaterialIcon name="star" size={16} />
              </span>
            )}
            {chips.map((chip) => {
              const variant = chip.variant ?? "default";
              const iconOnly =
                Boolean(chip.icon) && !chip.label && variant === "category";

              if (iconOnly) {
                return (
                  <span
                    key={chip.id}
                    className="dtc-chip-circle"
                    data-variant="category"
                    style={{
                      backgroundColor: chip.backgroundColor,
                      color: chip.color,
                    }}
                    aria-hidden="true"
                  >
                    <MaterialIcon name={chip.icon!} size={15} />
                  </span>
                );
              }

              return (
                <span
                  key={chip.id}
                  className="dtc-chip"
                  data-variant={variant}
                  data-has-icon={chip.icon ? "true" : "false"}
                  style={{
                    backgroundColor: chip.backgroundColor,
                    color: chip.color,
                  }}
                >
                  {chip.icon ? <MaterialIcon name={chip.icon} /> : null}
                  {chip.label ? (
                    <span className="dtc-chip-label">{chip.label}</span>
                  ) : null}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {thumbSrc ? (
        <div className="dtc-thumb">
          <img src={thumbSrc} alt={thumbAlt} draggable={false} />
        </div>
      ) : null}
    </article>
  );
}
