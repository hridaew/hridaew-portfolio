"use client";

import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "@/components/home/homeGrid";

const SLIDES = [
  {
    title: "Filled property",
    body: "Home profile complete — the house is known in software.",
  },
  {
    title: "Appliances tagged",
    body: "Core systems identified and attached to the property.",
  },
  {
    title: "Tasks from the report",
    body: "Inspection findings turned into actionable maintenance.",
  },
] as const;

export function DomisKnownCarousel() {
  return (
    <div className="dcs-known-carousel">
      <ProjectCarousel
        className={HOME_WAFFLINGS_EMBLA_VIEWPORT}
        trackEndPadding="inline"
        autoplayDelayMs={4200}
      >
        {SLIDES.map((slide) => (
          <div key={slide.title} className="dcs-known-slide flex-[0_0_auto]">
            <div
              className="dcs-media dcs-media-placeholder dcs-known-slide-card"
              aria-label={slide.title}
            >
              <div className="dcs-known-slide-copy">
                <p className="dcs-known-slide-title">{slide.title}</p>
                <p className="dcs-placeholder-label">{slide.body}</p>
              </div>
            </div>
          </div>
        ))}
      </ProjectCarousel>
    </div>
  );
}
