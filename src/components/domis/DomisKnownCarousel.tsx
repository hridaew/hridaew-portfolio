"use client";

import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "@/components/home/homeGrid";
import { PhoneFrame } from "@/components/domis/live/PhoneFrame";
import { HomeProfilePreview } from "@/components/domis/live/HeroProductShot";
import { ItemFieldsPanel } from "@/components/domis/live/mobile/ItemFieldsPanel";
import { TaskCard } from "@/components/domis/live/mobile/TaskCard";
import { INSPECTION_TASKS } from "@/components/domis/live/fixtures";
import "./known-carousel-ui.css";

const SLIDES = [
  {
    id: "home-profile",
    title: "Home profile page",
    body: "Filled property — the house is known in software.",
    render: () => (
      <PhoneFrame aria-label="Domis home profile page">
        <HomeProfilePreview />
      </PhoneFrame>
    ),
  },
  {
    id: "appliances",
    title: "Appliances",
    body: "Core systems identified and attached to the property.",
    render: () => (
      <PhoneFrame aria-label="Domis appliance item">
        <ItemFieldsPanel filled fieldsReveal={1} />
      </PhoneFrame>
    ),
  },
  {
    id: "inspection-tasks",
    title: "Inspection report tasks",
    body: "Inspection findings turned into actionable maintenance.",
    render: () => (
      <div className="dcs-known-tasks">
        {INSPECTION_TASKS.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            muted={task.muted}
            thumbSrc={task.thumbSrc}
            chips={[
              ...(task.location
                ? [
                    {
                      id: `${task.id}-loc`,
                      label: task.location,
                      icon: "location_on" as const,
                      variant: "location" as const,
                    },
                  ]
                : []),
              ...(task.completedAtLabel
                ? [
                    {
                      id: `${task.id}-done`,
                      label: task.completedAtLabel,
                      variant: "default" as const,
                    },
                  ]
                : []),
            ]}
          />
        ))}
      </div>
    ),
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
          <div key={slide.id} className="dcs-known-slide flex-[0_0_auto]">
            <div
              className="dcs-media dcs-known-slide-card dcs-known-slide-card-ui"
              aria-label={slide.title}
            >
              <div className="dcs-known-slide-ui">{slide.render()}</div>
              <div className="dcs-known-slide-copy">
                <p className="dcs-known-slide-title">{slide.title}</p>
                <p className="dcs-known-slide-body">{slide.body}</p>
              </div>
            </div>
          </div>
        ))}
      </ProjectCarousel>
    </div>
  );
}
