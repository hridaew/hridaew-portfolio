"use client";

import { cn } from "@/lib/utils";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "@/components/home/homeGrid";

const CAT_PROTOTYPE_IMAGES = [
  { src: "/assets/memory-care/catpettingresult.avif", alt: "Cat hero — plush cat prototype" },
  { src: "/assets/memory-care/cat_plush_complete.jpg", alt: "Plush cat with embedded sensors" },
  { src: "/assets/memory-care/cat_arduino_wiring.jpg", alt: "Arduino wiring for haptic cat prototype" },
  { src: "/assets/memory-care/cat_sensors.jpg", alt: "Pressure sensors inside plush cat" },
  {
    src: "/assets/memory-care/haptic_proto_home_unboxing.png",
    alt: "Home workspace with stereo receiver boxes and haptic prototype parts during assembly",
  },
] as const;

/** Dark editorial chrome — matches MCES case study + home tokens. */
const SLIDE_SHELL =
  "relative aspect-[4/3] w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink/[0.08] bg-card shadow-e3";

interface CatPrototypeCarouselProps {
  className?: string;
}

export function CatPrototypeCarousel({ className }: CatPrototypeCarouselProps) {
  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      <ProjectCarousel
        className={HOME_WAFFLINGS_EMBLA_VIEWPORT}
        trackEndPadding="inline"
        autoplayDelayMs={3600}
      >
        {CAT_PROTOTYPE_IMAGES.map(({ src, alt }, i) => (
          <div key={src} className="flex-[0_0_auto]">
            <div className={SLIDE_SHELL}>
              <LightboxImage
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
                draggable={false}
                loading="lazy"
                hoverScale={1.03}
              />
            </div>
          </div>
        ))}
      </ProjectCarousel>
      <p className="site-gallery-caption case-study-caption-tight-mt text-left text-ink-subtle">
        Prototype build — plush toy, Arduino wiring, internal sensors, and stereo hardware staged at home
      </p>
    </div>
  );
}
