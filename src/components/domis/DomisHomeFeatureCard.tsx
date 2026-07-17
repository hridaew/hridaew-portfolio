"use client";

import { homepageProjects } from "@/data/homepage-projects";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { cn } from "@/lib/utils";

const domis = homepageProjects.find((p) => p.slug === "domis");
const reportCard = domis?.cards[0];

/**
 * Visual twin of the Domis home-gallery first card (red field + tasks composite),
 * sized to its parent instead of the fixed 696×392 home gallery frame.
 */
export function DomisHomeFeatureCard({ className }: { className?: string }) {
  if (!domis || !reportCard) return null;

  return (
    <div
      className={cn(
        "relative w-full min-w-0 aspect-[696/392] overflow-clip rounded-2xl",
        className
      )}
      style={{ backgroundColor: domis.bgColor }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden rounded-2xl"
        aria-hidden
      >
        <div
          className="absolute -left-8 -top-10 size-[180px] rounded-full blur-[42px] opacity-70"
          style={{ backgroundColor: domis.orbColor1 }}
        />
        <div
          className="absolute -bottom-12 -right-6 size-[220px] rounded-full blur-[48px] opacity-80"
          style={{ backgroundColor: domis.orbColor2 }}
        />
        <div
          className="domis-card-dot-mesh pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden
        />
        <div
          className="domis-card-dot-mesh-pop pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 z-10">
        <LightboxImage
          src={reportCard.imageSrc}
          alt={reportCard.imageAlt}
          className={reportCard.imageClassName}
          draggable={false}
          hoverScale={1.02}
        />
      </div>
    </div>
  );
}
