"use client";

import {
  useMemo,
  type CSSProperties,
  type RefObject,
} from "react";
import { DemoCursor } from "@/components/domis/live/DemoCursor";
import {
  useAutoplayDemo,
  type AutoplayPhase,
} from "@/components/domis/live/useAutoplayDemo";
import {
  ADDRESS_ASSETS,
  ADDRESS_FULL,
} from "@/components/domis/live/fixtures";
import "./home-avatar-conversion.css";

const PHASES: AutoplayPhase[] = [
  { id: "map", durationMs: 1400 },
  { id: "bridge", durationMs: 700 },
  { id: "reveal", durationMs: 900 },
  { id: "hold", durationMs: 2800 },
];

const HOME_NAME = "Fillmore Home";

export type HomeAvatarConversionProps = {
  className?: string;
  style?: CSSProperties;
  mapSrc?: string;
  avatarSrc?: string;
  homeName?: string;
  address?: string;
  /** When false, shows end state only (no loop). Default true. */
  autoplay?: boolean;
};

type DemoView = {
  dimMap: boolean;
  arrowActive: boolean;
  profileVisible: boolean;
  cursor: { x: number; y: number; visible: boolean };
};

function deriveView(phase: string, progress: number): DemoView {
  if (phase === "map") {
    return {
      dimMap: false,
      arrowActive: false,
      profileVisible: false,
      cursor: { x: 22, y: 42, visible: true },
    };
  }
  if (phase === "bridge") {
    return {
      dimMap: true,
      arrowActive: true,
      profileVisible: false,
      cursor: {
        x: 22 + progress * 40,
        y: 42,
        visible: true,
      },
    };
  }
  if (phase === "reveal") {
    return {
      dimMap: true,
      arrowActive: true,
      profileVisible: true,
      cursor: { x: 72, y: 40, visible: true },
    };
  }
  // hold
  return {
    dimMap: true,
    arrowActive: true,
    profileVisible: true,
    cursor: { x: 72, y: 40, visible: progress < 0.25 },
  };
}

/**
 * Map thumb → real Lab Homes profile card (avatar + name + address).
 * Light loop for the conversion; captions stay in the case study figure.
 */
export function HomeAvatarConversion({
  className,
  style,
  mapSrc = ADDRESS_ASSETS.mapThumb,
  avatarSrc = ADDRESS_ASSETS.homeAvatar,
  homeName = HOME_NAME,
  address = ADDRESS_FULL,
  autoplay = true,
}: HomeAvatarConversionProps) {
  const phases = useMemo(() => PHASES, []);
  const { phase, progress, containerRef } = useAutoplayDemo({
    phases,
    enabled: autoplay,
    pauseOnHover: true,
    visibilityThreshold: 0.2,
  });

  const view = autoplay
    ? deriveView(phase, progress)
    : {
        dimMap: true,
        arrowActive: true,
        profileVisible: true,
        cursor: { x: 72, y: 40, visible: false },
      };

  return (
    <div
      ref={containerRef as RefObject<HTMLDivElement>}
      className={["domis-live", "hac", "hac-demo", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label="Home profile conversion from map photo to Domis avatar"
    >
      <div className="hac-stage">
        <div className="hac-col">
          <div
            className="hac-map"
            data-dim={view.dimMap ? "true" : "false"}
          >
            <img
              src={mapSrc}
              alt="Street-level map view of the property"
              draggable={false}
            />
          </div>
          <p className="hac-lbl">What the map gives you</p>
        </div>

        <div
          className="hac-arrow"
          data-active={view.arrowActive ? "true" : "false"}
          aria-hidden="true"
        >
          →
        </div>

        <div className="hac-col">
          <div
            className="hac-profile"
            data-visible={view.profileVisible ? "true" : "false"}
          >
            <div className="hac-profile-head">
              <div className="hac-avatar">
                <img src={avatarSrc} alt="" draggable={false} />
              </div>
              <p className="hac-name">{homeName}</p>
              <p className="hac-address">{address}</p>
            </div>
          </div>
          <p className="hac-lbl">What Domis makes of it</p>
        </div>
      </div>

      <DemoCursor
        x={view.cursor.x}
        y={view.cursor.y}
        visible={view.cursor.visible}
      />
    </div>
  );
}
