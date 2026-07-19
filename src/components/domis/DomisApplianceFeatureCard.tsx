"use client";

import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import {
  APPLIANCE_ASSETS,
  APPLIANCE_CAPTURE,
} from "@/components/domis/live/fixtures";
import { cn } from "@/lib/utils";
import "./domis-appliance-feature-card.css";

const FIELDS = [
  { icon: "water_drop", label: "Appliance", value: APPLIANCE_CAPTURE.appliance },
  { icon: "storefront", label: "Brand", value: APPLIANCE_CAPTURE.brand },
  { icon: "tag", label: "Model", value: APPLIANCE_CAPTURE.modelShort },
  { icon: "qr_code_2", label: "Serial", value: APPLIANCE_CAPTURE.serial },
] as const;

/**
 * Nameplate photo → compact Domis appliance record on the coral feature card.
 */
export function DomisApplianceFeatureCard({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dcs-home-feature-card dap relative w-full min-w-0 aspect-[696/392] overflow-clip rounded-2xl",
        className
      )}
      style={{ backgroundColor: "var(--dcs-media-bg, #ff5a5b)" }}
      aria-label="Appliance nameplate resolving into a Domis item record"
    >
      <div className="dap-stage">
        <div className="dap-input">
          <div className="dap-plate">
            <div className="dap-plate-frame">
              <img
                src={APPLIANCE_ASSETS.platePhoto}
                alt=""
                draggable={false}
              />
            </div>
            <p className="dap-plate-title">Appliance label</p>
          </div>
        </div>

        <svg
          className="dap-arrow"
          viewBox="0 0 48 40"
          fill="none"
          aria-hidden
        >
          <path
            d="M24 2v28M16 22l8 12 8-12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="dap-panel">
          <div className="dap-head">
            <div className="dap-thumb">
              <img
                src={APPLIANCE_ASSETS.platePhoto}
                alt=""
                draggable={false}
              />
            </div>
            <div className="dap-titles">
              <p className="dap-name">
                {APPLIANCE_CAPTURE.brand} {APPLIANCE_CAPTURE.appliance}
              </p>
              <p className="dap-model">{APPLIANCE_CAPTURE.model}</p>
            </div>
          </div>

          <div className="dap-fields">
            {FIELDS.map((item) => (
              <div key={item.label} className="dap-field">
                <span className="dap-field-icon" aria-hidden>
                  <DomisLiveIcon name={item.icon} size={15} color="#005750" />
                </span>
                <div className="dap-field-copy">
                  <span className="dap-field-label">{item.label}</span>
                  <span className="dap-field-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
