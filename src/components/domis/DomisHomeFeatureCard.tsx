"use client";

import { homepageProjects } from "@/data/homepage-projects";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { cn } from "@/lib/utils";

const reportCard = homepageProjects.find((p) => p.slug === "domis")?.cards[0];

/**
 * Domis home-gallery first card treatment: plain Domis red + tasks composite,
 * sized to its parent instead of the fixed 696×392 home gallery frame.
 */
export function DomisHomeFeatureCard({ className }: { className?: string }) {
  if (!reportCard) return null;

  return (
    <div
      className={cn(
        "dcs-home-feature-card relative w-full min-w-0 aspect-[696/392] overflow-clip rounded-2xl",
        className
      )}
      style={{ backgroundColor: "var(--dcs-media-bg, #ff5a5b)" }}
    >
      <div className="absolute inset-0">
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
