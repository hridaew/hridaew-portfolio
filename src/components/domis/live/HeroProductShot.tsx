"use client";

import { BrowserFrame } from "@/components/domis/live/BrowserFrame";
import { PhoneFrame } from "@/components/domis/live/PhoneFrame";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  ADDRESS_PROFILE,
  ADDRESS_TYPED,
} from "@/components/domis/live/fixtures";
import { CreateHomePanel } from "@/components/domis/live/web/CreateHomePanel";
import { HomeTasksScreen } from "@/components/domis/live/mobile/HomeTasksScreen";
import "./hero-product-shot.css";

/**
 * Hero composition: web create-home + home profile + home tasks,
 * floating in the media field under “What is Domis”.
 */
export function HeroProductShot() {
  return (
    <div
      className="domis-live dcs-hero-shot"
      aria-label="Domis web and mobile product UI"
    >
      <div className="dcs-hero-shot-stage">
        <div className="dcs-hero-shot-web">
          <BrowserFrame
            title="domis.app"
            aria-label="Domis web create home"
            designWidth={720}
            designHeight={480}
          >
            <CreateHomePanel
              addressText={ADDRESS_TYPED}
              addressSelected
              enrichDone
              fieldsReveal={1}
              homeName="Fillmore Home"
              homePhoto={ADDRESS_ASSETS.homeAvatar}
              displayAddress={ADDRESS_FULL}
              manual={{
                street: "2140 Fillmore St",
                apt: "",
                city: "San Francisco",
                state: "CA",
                zip: "94115",
              }}
            />
          </BrowserFrame>
        </div>

        <div className="dcs-hero-shot-phone dcs-hero-shot-phone-profile">
          <PhoneFrame aria-label="Domis home profile">
            <HomeProfilePreview />
          </PhoneFrame>
        </div>

        <div className="dcs-hero-shot-phone dcs-hero-shot-phone-tasks">
          <PhoneFrame aria-label="Domis home tasks">
            <HomeTasksScreen />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}

const PROFILE_ROWS = [
  { label: "Type", value: ADDRESS_PROFILE.property },
  { label: "Year built", value: ADDRESS_PROFILE.yearBuiltDisplay },
  { label: "Square footage", value: ADDRESS_PROFILE.squareFootageDisplay },
  { label: "Bedrooms", value: ADDRESS_PROFILE.bedroomsDisplay },
  { label: "Bathrooms", value: ADDRESS_PROFILE.bathroomsDisplay },
  { label: "Roof", value: ADDRESS_PROFILE.roof },
  { label: "Heating", value: ADDRESS_PROFILE.heating },
] as const;

const SYSTEMS = [
  { icon: "water_drop", label: "Water heater" },
  { icon: "mode_fan", label: "HVAC" },
  { icon: "bolt", label: "Electrical" },
  { icon: "roofing", label: "Roof" },
] as const;

/** Populated home-profile preview for hero / carousel. */
export function HomeProfilePreview() {
  return (
    <div className="dcs-home-preview">
      <div className="dcs-home-preview-hero">
        <img
          src={ADDRESS_ASSETS.homeAvatar}
          alt=""
          className="dcs-home-preview-avatar"
          draggable={false}
        />
        <div className="dcs-home-preview-meta">
          <p className="dcs-home-preview-name">Fillmore Home</p>
          <p className="dcs-home-preview-addr">{ADDRESS_FULL}</p>
        </div>
      </div>

      <div className="dcs-home-preview-card">
        <p className="dcs-home-preview-section">Property</p>
        {PROFILE_ROWS.map((row) => (
          <div key={row.label} className="dcs-home-preview-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>

      <div className="dcs-home-preview-card">
        <p className="dcs-home-preview-section">Core systems</p>
        <div className="dcs-home-preview-chips">
          {SYSTEMS.map((item) => (
            <span key={item.label} className="dcs-home-preview-chip">
              <DomisLiveIcon name={item.icon} size={14} color="#005750" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
