"use client";

import type { CSSProperties } from "react";
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
  /** When true, name + photo show filled scan results. */
  filled?: boolean;
  header?: string;
  className?: string;
  style?: CSSProperties;
};

function MaterialIcon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden
      style={{ fontSize: size, width: size, height: size }}
    >
      {name}
    </span>
  );
}

/**
 * Presentational Domis item form fields panel — FormHeader + name input +
 * AdditionalDetailsItem rows. Driven by fixtures / parent choreography.
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

  return (
    <div
      className={["domis-live", "ifp", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Item fields after scan"
    >
      <div className="ifp-scroll">
        <p className="ifp-header">{header}</p>

        <div className="ifp-name" data-empty={filled ? "false" : "true"}>
          {nameText}
        </div>

        <div className="ifp-photo-row">
          <div className="ifp-photo">
            {showPhoto ? (
              <img src={photoSrc!} alt="" draggable={false} />
            ) : null}
          </div>
          <p
            className="ifp-photo-hint"
            data-hidden={showPhoto ? "true" : "false"}
          >
            Add a photo and we’ll fill the details for you!
          </p>
        </div>

        <p className="ifp-section-label">Additional Details</p>

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
                    <MaterialIcon name={icon} />
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
                      <MaterialIcon name="chevron_right" />
                    </div>
                  ) : null}
                </div>
                <hr className="ifp-divider" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
