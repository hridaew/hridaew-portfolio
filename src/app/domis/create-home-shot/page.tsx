"use client";

import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  ADDRESS_TYPED,
} from "@/components/domis/live/fixtures";
import { DomisLiveFonts } from "@/components/domis/live";
import { CreateHomePanel } from "@/components/domis/live/web/CreateHomePanel";
import "./create-home-shot.css";

/**
 * Full-viewport Create Home panel for clean screenshots.
 * Open /domis/create-home-shot — not linked from the site.
 */
export default function CreateHomeShotPage() {
  return (
    <DomisLiveFonts className="chs-page">
      <CreateHomePanel
        className="chs-panel"
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
    </DomisLiveFonts>
  );
}
