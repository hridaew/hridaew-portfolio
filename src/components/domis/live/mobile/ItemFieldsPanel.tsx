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

/** Static category chips — matches FormCategorySection empty create flow. */
const CATEGORY_CHIPS = [
  { id: "appliances", label: "Appliances", icon: "kitchen" },
  { id: "utilities", label: "Utilities", icon: "bolt" },
  { id: "hvac", label: "HVAC", icon: "mode_fan" },
] as const;

/** Space chips — TaskLocationSection / LocationChip look. */
const SPACE_CHIPS = [
  { id: "basement", label: "Basement", icon: "location_on" },
  { id: "garage", label: "Garage", icon: "location_on" },
] as const;

/** Associated item chips — TaskItemSection look (unselected placeholders). */
const ITEM_CHIPS = [
  { id: "furnace", label: "Furnace" },
  { id: "panel", label: "Electrical panel" },
] as const;

export type ItemFieldsPanelProps = {
  fields?: readonly ApplianceCaptureField[];
  /** Item title shown in SharedSuggestionInput-style name field. */
  itemName?: string;
  /** Thumbnail from scan (plate photo). Null = empty photo slot + hint. */
  photoSrc?: string | null;
  /**
   * 0–1 stagger for Additional Details rows.
   * 0 = none, 1 = all fields visible.
   */
  fieldsReveal?: number;
  /** When true, name + photo + details show filled scan results. */
  filled?: boolean;
  header?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Presentational Domis create-item form — FormHeader, SharedSuggestionInput,
 * FormImageSection, Notes, Category / Space / Associated Item, Additional
 * Details, and bottom Scan It! / close / Add Item chrome.
 */
export function ItemFieldsPanel({
  fields = APPLIANCE_CAPTURE_FIELDS,
  itemName = APPLIANCE_CAPTURE.appliance,
  photoSrc = APPLIANCE_ASSETS.platePhoto,
  fieldsReveal = 1,
  filled = true,
  header = "New Item",
  className,
  style,
}: ItemFieldsPanelProps) {
  const showPhoto = filled && Boolean(photoSrc);
  const nameText = filled ? itemName : "What's the Item?";
  const count = fields.length;
  const saveEnabled = filled && fieldsReveal >= 0.4;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLParagraphElement | null>(null);

  // Keep Additional Details in view while fields stagger in; reset on loop.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    if (!filled) {
      scrollEl.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    if (fieldsReveal <= 0) return;
    const detailsEl = detailsRef.current;
    if (!detailsEl) return;
    const top = Math.max(0, detailsEl.offsetTop - 12);
    scrollEl.scrollTo({
      top,
      behavior: fieldsReveal < 0.15 ? "smooth" : "auto",
    });
  }, [filled, fieldsReveal]);

  return (
    <div
      className={["domis-live", "ifp", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Item fields after scan"
      data-filled={filled ? "true" : "false"}
    >
      <div className="ifp-scroll" ref={scrollRef}>
        <p className="ifp-header">{header}</p>

        <div className="ifp-name" data-empty={filled ? "false" : "true"}>
          {nameText}
        </div>

        <div className="ifp-photo-row">
          {showPhoto ? (
            <div className="ifp-photo ifp-photo-scanned">
              <img src={photoSrc!} alt="" draggable={false} />
              <span className="ifp-photo-ai" aria-hidden>
                <DomisLiveIcon name="document_scanner" size={17} />
              </span>
            </div>
          ) : (
            <div className="ifp-photo ifp-photo-add" aria-hidden>
              <DomisLiveIcon name="add_photo_alternate" size={30} />
            </div>
          )}
          <p
            className="ifp-photo-hint"
            data-hidden={showPhoto ? "true" : "false"}
          >
            Add a photo and we’ll fill the details for you!
          </p>
        </div>

        {/* Notes — TaskFormNoteSection */}
        <div className="ifp-notes">
          <p className="ifp-notes-title">Notes</p>
          <p className="ifp-notes-placeholder">
            Add a note to help you remember the little and not so little things
            along the way.
          </p>
        </div>

        {/* Category — FormCategorySection */}
        <p className="ifp-section-label">Category</p>
        <div className="ifp-chip-row ifp-chip-row-pad">
          {CATEGORY_CHIPS.map((chip) => {
            const selected = filled && chip.id === "appliances";
            return (
              <div
                key={chip.id}
                className="ifp-chip"
                data-selected={selected ? "true" : "false"}
              >
                <DomisLiveIcon name={chip.icon} size={18} />
                <span>{chip.label}</span>
              </div>
            );
          })}
        </div>

        {/* Space — TaskLocationSection + add affordance */}
        <p className="ifp-section-label">Space</p>
        <div className="ifp-chip-row">
          <div className="ifp-add-circle" aria-hidden>
            <DomisLiveIcon name="add" size={24} />
          </div>
          <div className="ifp-chip-scroll">
            {SPACE_CHIPS.map((chip) => (
              <div
                key={chip.id}
                className="ifp-chip ifp-chip-space"
                data-selected="false"
              >
                <DomisLiveIcon name={chip.icon} size={20} />
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Associated Item — TaskItemSection */}
        <p className="ifp-section-label">Associated Item</p>
        <div className="ifp-chip-row">
          <div className="ifp-add-circle" aria-hidden>
            <DomisLiveIcon name="add" size={24} />
          </div>
          <div className="ifp-chip-scroll">
            {ITEM_CHIPS.map((chip) => (
              <div
                key={chip.id}
                className="ifp-chip ifp-chip-space"
                data-selected="false"
              >
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Details — AdditionalDetailsItem rows */}
        <p className="ifp-section-label" ref={detailsRef}>
          Additional Details
        </p>
        <div className="ifp-fields">
          {fields.map((field, index) => {
            const threshold = (index + 1) / count;
            const visible = filled && fieldsReveal >= threshold - 0.001;
            const empty = Boolean(field.empty);
            const label = empty ? field.label : `${field.label}:`;
            const icon = FIELD_ICONS[field.key] ?? "notes";

            return (
              <div
                key={field.key}
                className="ifp-row"
                data-visible={visible ? "true" : "false"}
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

      {/* Bottom chrome — Scan It! + BrandBackButton + Add Item */}
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
