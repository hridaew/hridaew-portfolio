"use client";

import type { CSSProperties } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import { APPLIANCE_CAPTURE } from "@/components/domis/live/fixtures";
import "./appliance-v1-v2-compare.css";

const V1_FIELDS = [
  { key: "brand", label: "Brand", value: APPLIANCE_CAPTURE.brand, icon: "storefront" },
  { key: "model", label: "Model", value: APPLIANCE_CAPTURE.modelShort, icon: "tag" },
  { key: "serial", label: "Serial", value: APPLIANCE_CAPTURE.serial, icon: "qr_code_2" },
  {
    key: "capacity",
    label: "Capacity",
    value: APPLIANCE_CAPTURE.capacityDisplay,
    icon: "water_drop",
  },
] as const;

const V2_LINKS = [
  { key: "manual", label: "Manual, 42 pp", icon: "description" },
  { key: "support", label: "Rheem support", icon: "language" },
  { key: "parts", label: "Replacement parts", icon: "build" },
] as const;

export type ApplianceV1V2CompareProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Editorial v1 vs v2 appliance compare — same story as DomisCaseStudyBody,
 * restyled to Domis item-detail / Additional Details form chrome.
 */
export function ApplianceV1V2Compare({
  className,
  style,
}: ApplianceV1V2CompareProps) {
  return (
    <div
      className={["domis-live", "avc", className].filter(Boolean).join(" ")}
      style={style}
      role="img"
      aria-label="v1 label scanner versus v2 appliance intelligence"
    >
      <div className="avc-twoup">
        {/* v1 — Label scanner: captured fields only */}
        <div className="avc-pane">
          <div className="avc-ph">
            <span className="avc-lbl">v1 — Label scanner</span>
          </div>

          <div className="avc-fields">
            {V1_FIELDS.map((field) => (
              <div key={field.key} className="avc-row">
                <div className="avc-row-inner">
                  <div className="avc-row-icon">
                    <DomisLiveIcon name={field.icon} size={18} />
                  </div>
                  <p className="avc-row-label">{field.label}:</p>
                  <p className="avc-row-value">{field.value}</p>
                  <div className="avc-row-chevron">
                    <DomisLiveIcon name="chevron_right" size={18} />
                  </div>
                </div>
                <hr className="avc-divider" />
              </div>
            ))}
          </div>

          <p className="avc-foot">Accurate. Inert.</p>
        </div>

        {/* v2 — Appliance Intelligence: same capture, actionable outputs */}
        <div className="avc-pane" data-variant="v2">
          <div className="avc-ph">
            <span className="avc-lbl">v2 — Appliance Intelligence</span>
          </div>

          <div className="avc-links">
            {V2_LINKS.map((link) => (
              <div key={link.key} className="avc-link">
                <div className="avc-link-icon">
                  <DomisLiveIcon name={link.icon} size={18} />
                </div>
                <span>{link.label}</span>
                <div className="avc-link-chevron">
                  <DomisLiveIcon name="chevron_right" size={18} />
                </div>
              </div>
            ))}
          </div>

          <div className="avc-warranty">
            <span className="avc-pill">Warranty active · 4 yrs left</span>
          </div>

          <p className="avc-failures">
            Common failures: thermocouple, anode rod, pilot assembly
          </p>

          <p className="avc-foot">Same capture. Now it does something.</p>
        </div>
      </div>
    </div>
  );
}
