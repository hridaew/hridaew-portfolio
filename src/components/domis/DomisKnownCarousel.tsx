"use client";

import { PhoneFrame } from "@/components/domis/live/PhoneFrame";
import "./known-carousel-ui.css";

const SCREENS = [
  {
    id: "home-tab",
    label: "Domis home tab",
    src: "/assets/domis/home-tab-screen.png",
  },
  {
    id: "home-profile",
    label: "Domis home profile",
    src: "/assets/domis/home-profile-screen.png",
  },
  {
    id: "tasks-found",
    label: "Domis tasks found from inspection report",
    src: "/assets/domis/tasks-found-screen.png",
  },
] as const;

export function DomisKnownCarousel() {
  return (
    <div
      className="dcs-media dcs-known-trio"
      aria-label="Domis home tab, home profile, and tasks found"
    >
      {SCREENS.map((screen) => (
        <div key={screen.id} className="dcs-known-trio-phone">
          <PhoneFrame aria-label={screen.label}>
            <img
              className="dcs-known-slide-shot"
              src={screen.src}
              alt=""
              width={473}
              height={1024}
              draggable={false}
            />
          </PhoneFrame>
        </div>
      ))}
    </div>
  );
}
