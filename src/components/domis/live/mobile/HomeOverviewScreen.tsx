"use client";

import type { CSSProperties } from "react";
import { DomisLiveIcon } from "@/components/domis/live/DomisLiveIcon";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
  ADDRESS_PROFILE,
} from "@/components/domis/live/fixtures";
import "./home-overview-screen.css";

const GALLERY_SRC = [
  ADDRESS_ASSETS.mapThumb,
  "/assets/domis/live/homes/home-pacific.png",
  "/assets/domis/live/homes/home-marina.png",
  "/assets/domis/live/homes/home-hayes.png",
] as const;

export type HomeOverviewScreenProps = {
  className?: string;
  style?: CSSProperties;
  homeName?: string;
  address?: string;
};

/**
 * Domis home profile / overview — avatar, address, stats, gallery.
 * Ported from Flutter `HomeOverviewSection` for tweakable case-study embeds.
 */
export function HomeOverviewScreen({
  className,
  style,
  homeName = "Fillmore Home",
  address = ADDRESS_FULL,
}: HomeOverviewScreenProps) {
  return (
    <div
      className={["domis-live", "hos", className].filter(Boolean).join(" ")}
      style={style}
      aria-label="Domis home profile"
    >
      <div className="hos-card">
        <div className="hos-top">
          <div className="hos-avatar-wrap">
            <img
              className="hos-avatar"
              src={ADDRESS_ASSETS.homeAvatar3d}
              alt=""
              draggable={false}
            />
          </div>
          <p className="hos-name">{homeName}</p>
          <p className="hos-address">{address}</p>

          <div className="hos-stats">
            <div className="hos-stat">
              <DomisLiveIcon
                name="design_services"
                size={22}
                color="#818181"
              />
              <span className="hos-stat-label">
                Built {ADDRESS_PROFILE.yearBuiltDisplay}
              </span>
            </div>
            <div className="hos-stat">
              <DomisLiveIcon name="square_foot" size={22} color="#818181" />
              <span className="hos-stat-label">
                {ADDRESS_PROFILE.squareFootageDisplay} (ft²)
              </span>
            </div>
          </div>
        </div>

        <div className="hos-divider" />

        <div className="hos-gallery">
          <div className="hos-gallery-head">
            <p className="hos-gallery-title">Gallery</p>
            <DomisLiveIcon name="photo_library" size={22} color="#818181" />
          </div>
          <div className="hos-gallery-row">
            {GALLERY_SRC.map((src) => (
              <img
                key={src}
                className="hos-gallery-thumb"
                src={src}
                alt=""
                draggable={false}
              />
            ))}
            <div className="hos-gallery-add" aria-hidden>
              <DomisLiveIcon name="add" size={22} color="#c8c8c8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
