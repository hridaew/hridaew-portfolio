"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import {
  APPLIANCE_ASSETS,
  APPLIANCE_CAPTURE,
  APPLIANCE_CAPTURE_FIELDS,
  type ApplianceCaptureField,
} from "@/components/domis/live/fixtures";
import "./item-fields-panel.css";

const FIELD_ICONS: Record<string, string> = {
  appliance: "water_drop",
  brand: "storefront",
  model: "tag",
  serial: "qr_code_2",
  installed: "calendar_today",
};

const CATEGORY_CHIPS = [
  { id: "appliances", label: "Appliances", icon: "kitchen" },
  { id: "utilities", label: "Utilities", icon: "bolt" },
  { id: "hvac", label: "HVAC", icon: "mode_fan" },
] as const;

/** Beats before Additional Details rows: name → photo → category */
export const IFP_HEADER_STEPS = 3;

export function itemFieldsRevealSteps(
  fieldCount = APPLIANCE_CAPTURE_FIELDS.length
) {
  return IFP_HEADER_STEPS + fieldCount;
}

export type ItemFieldsPanelProps = {
  fields?: readonly ApplianceCaptureField[];
  itemName?: string;
  photoSrc?: string | null;
  /**
   * Discrete reveal beat for fades:
   * 0 empty · 1 name · 2 photo · 3 category · 4… detail rows
   */
  revealStep?: number;
  /**
   * 0–1 continuous progress for one linear scroll (no section snaps).
   */
  revealProgress?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Domis create-item form.
 * Fades step top → bottom; scroll is one continuous drift with revealProgress.
 */
export function ItemFieldsPanel({
  fields = APPLIANCE_CAPTURE_FIELDS,
  itemName = APPLIANCE_CAPTURE.appliance,
  photoSrc = APPLIANCE_ASSETS.platePhoto,
  revealStep = itemFieldsRevealSteps(fields.length),
  revealProgress,
  className,
  style,
}: ItemFieldsPanelProps) {
  const totalSteps = itemFieldsRevealSteps(fields.length);
  const step = Math.max(0, Math.floor(revealStep));
  const progress =
    revealProgress !== undefined
      ? Math.max(0, Math.min(1, revealProgress))
      : step / Math.max(1, totalSteps);

  const nameOn = step >= 1;
  const photoOn = step >= 2 && Boolean(photoSrc);
  const categoryOn = step >= 3;
  const fieldsVisible = Math.max(0, step - IFP_HEADER_STEPS);
  const saveEnabled = fieldsVisible >= 2;

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // One linear scroll tied to progress — no per-section tween checkpoints.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    if (progress <= 0) {
      scrollEl.scrollTop = 0;
      return;
    }

    const maxScroll = Math.max(
      0,
      scrollEl.scrollHeight - scrollEl.clientHeight
    );
    if (maxScroll <= 0) return;

    // Hold at top while name / photo / category fill, then drift down with details.
    const headerShare = IFP_HEADER_STEPS / totalSteps;
    const t =
      progress <= headerShare
        ? 0
        : (progress - headerShare) / Math.max(0.0001, 1 - headerShare);

    scrollEl.scrollTop = maxScroll * t;
  }, [progress, totalSteps]);

  return (
    <div
      className={["domis-live", "ifp", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Item fields after scan"
      data-step={step}
    >
      <div className="ifp-scroll" ref={scrollRef}>
        {/* 1 — Name */}
        <div
          className="ifp-name ifp-reveal"
          data-on={nameOn ? "true" : "false"}
          data-empty={nameOn ? "false" : "true"}
        >
          {nameOn ? itemName : "What's the Item?"}
        </div>

        {/* 2 — Photo */}
        <div className="ifp-photo-row">
          <div className="ifp-photo-slot">
            <div
              className="ifp-photo ifp-photo-add"
              data-active={photoOn ? "false" : "true"}
              aria-hidden={photoOn}
            >
              <DomisLiveIcon name="add_photo_alternate" size={30} />
            </div>
            {photoSrc ? (
              <div
                className="ifp-photo ifp-photo-scanned ifp-reveal"
                data-on={photoOn ? "true" : "false"}
              >
                <img src={photoSrc} alt="" draggable={false} />
                <span className="ifp-photo-ai" aria-hidden>
                  <DomisLiveIcon name="document_scanner" size={17} />
                </span>
              </div>
            ) : null}
          </div>
          <p
            className="ifp-photo-hint"
            data-hidden={photoOn ? "true" : "false"}
          >
            Add a photo and we’ll fill the details for you!
          </p>
        </div>

        {/* 3 — Category */}
        <div>
          <p className="ifp-section-label">Category</p>
          <div className="ifp-chip-row ifp-chip-row-pad">
            {CATEGORY_CHIPS.map((chip) => {
              const selected = categoryOn && chip.id === "appliances";
              return (
                <div
                  key={chip.id}
                  className="ifp-chip ifp-reveal"
                  data-on="true"
                  data-selected={selected ? "true" : "false"}
                >
                  <DomisLiveIcon name={chip.icon} size={18} />
                  <span>{chip.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ifp-notes">
          <p className="ifp-notes-title">Notes</p>
          <p className="ifp-notes-placeholder">
            Add a note to help you remember the little and not so little things
            along the way.
          </p>
        </div>

        <p className="ifp-section-label">Space</p>
        <div className="ifp-chip-row">
          <div className="ifp-add-circle" aria-hidden>
            <DomisLiveIcon name="add" size={24} />
          </div>
        </div>

        <p className="ifp-section-label">Associated Item</p>
        <div className="ifp-chip-row">
          <div className="ifp-add-circle" aria-hidden>
            <DomisLiveIcon name="add" size={24} />
          </div>
        </div>

        {/* 4… — Each Additional Details row */}
        <p className="ifp-section-label">Additional Details</p>
        <div className="ifp-fields">
          {fields.map((field, index) => {
            const visible = index < fieldsVisible;
            const empty = Boolean(field.empty);
            const label = empty ? field.label : `${field.label}:`;
            const icon = FIELD_ICONS[field.key] ?? "notes";

            return (
              <div
                key={field.key}
                className="ifp-row ifp-reveal"
                data-on={visible ? "true" : "false"}
                data-empty={empty ? "true" : "false"}
              >
                <div className="ifp-row-inner">
                  <div className="ifp-row-icon">
                    <DomisLiveIcon name={icon} />
                  </div>
                  <p className="ifp-row-label">{label}</p>
                  <p
                    className="ifp-row-value"
                    data-empty={empty ? "true" : "false"}
                  >
                    {field.display}
                  </p>
                  {!empty ? (
                    <div className="ifp-row-chevron">
                      <DomisLiveIcon name="chevron_right" />
                    </div>
                  ) : null}
                </div>
                <hr className="ifp-divider" />
              </div>
            );
          })}
        </div>

        <div className="ifp-scroll-pad" aria-hidden />
      </div>

      <div className="ifp-footer">
        <div className="ifp-scan-wrap">
          <div className="ifp-scan-btn" aria-hidden>
            <DomisLiveIcon name="document_scanner" size={18} />
            <span>Scan It!</span>
          </div>
        </div>
        <div className="ifp-footer-row">
          <div className="ifp-close-btn" aria-hidden>
            <DomisLiveIcon name="close" size={24} />
          </div>
          <div
            className="ifp-save-btn"
            data-enabled={saveEnabled ? "true" : "false"}
            aria-hidden
          >
            Add Item
          </div>
        </div>
      </div>
    </div>
  );
}
