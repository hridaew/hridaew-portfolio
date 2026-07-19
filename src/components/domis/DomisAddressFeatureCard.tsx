"use client";

import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  ADDRESS_PROFILE,
} from "@/components/domis/live/fixtures";
import { cn } from "@/lib/utils";
import "./domis-address-feature-card.css";

const META = [
  { icon: "calendar_month", label: "Built", value: ADDRESS_PROFILE.yearBuiltDisplay },
  { icon: "bed", label: "Beds", value: "3" },
  { icon: "shower", label: "Baths", value: "2" },
  {
    icon: "square_foot",
    label: "Sq ft",
    value: ADDRESS_PROFILE.squareFootageDisplay,
  },
] as const;

const DETAILS = [
  { icon: "home", label: "Property", value: ADDRESS_PROFILE.property },
  { icon: "roofing", label: "Roof", value: ADDRESS_PROFILE.roof },
  { icon: "mode_fan", label: "Heating", value: ADDRESS_PROFILE.heating },
  { icon: "map", label: "Zoning", value: "RH-2" },
  { icon: "handyman", label: "Nearby Pros", value: "12 within 2 mi" },
  { icon: "water_drop", label: "Water heater", value: "Rheem 50 gal" },
] as const;

/**
 * Address → compact Domis home-profile composite on the coral feature card.
 */
export function DomisAddressFeatureCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "dcs-home-feature-card daf relative w-full min-w-0 aspect-[696/392] overflow-clip rounded-2xl",
        className
      )}
      style={{ backgroundColor: "var(--dcs-media-bg, #ff5a5b)" }}
      aria-label="Address resolving into a Domis home profile"
    >
      <div className="daf-stage">
        <div className="daf-input">
          <div className="daf-search">
            <span className="daf-search-pin" aria-hidden>
              <DomisLiveIcon name="location_on" size={18} color="#005750" />
            </span>
            <p className="daf-search-text">{ADDRESS_FULL}</p>
          </div>
        </div>

        <svg
          className="daf-arrow"
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

        <div className="daf-panel">
          <div className="daf-head">
            <div className="daf-avatar">
              <img
                src={ADDRESS_ASSETS.homeAvatar}
                alt=""
                draggable={false}
              />
            </div>
            <div className="daf-titles">
              <p className="daf-name">Fillmore Home</p>
              <p className="daf-addr">{ADDRESS_FULL}</p>
            </div>
          </div>

          <div className="daf-meta">
            {META.map((item) => (
              <div key={item.label} className="daf-meta-item">
                <DomisLiveIcon name={item.icon} size={15} color="#818181" />
                <span className="daf-meta-label">{item.label}</span>
                <span className="daf-meta-value">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="daf-details">
            {DETAILS.map((item) => (
              <div key={item.label} className="daf-detail">
                <span className="daf-detail-icon" aria-hidden>
                  <DomisLiveIcon name={item.icon} size={15} color="#005750" />
                </span>
                <div className="daf-detail-copy">
                  <span className="daf-detail-label">{item.label}</span>
                  <span className="daf-detail-value">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
