"use client";

import { cn } from "@/lib/utils";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "@/components/home/homeGrid";

const STORYBOARD_DIR = "/assets/obscura/storyboard%20individual%20images";

const STORYBOARD_FRAMES = [
  `${STORYBOARD_DIR}/20240708204649225_0001.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0002.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0003.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0004.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0005.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0006.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0007.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0008.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0009.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0010.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0013.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0011.jpg`,
  `${STORYBOARD_DIR}/20240708204649225_0012.jpg`,
] as const;

/** Full editorial column width; image keeps natural aspect ratio (no crop). */
const SLIDE_SHELL =
  "relative w-full min-w-0 overflow-hidden border border-neutral-800 bg-neutral-950 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.35)]";

interface StoryboardCarouselProps {
  className?: string;
}

export function StoryboardCarousel({ className }: StoryboardCarouselProps) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <ProjectCarousel
        className={HOME_WAFFLINGS_EMBLA_VIEWPORT}
        trackEndPadding="inline"
        autoplayDelayMs={4200}
      >
        {STORYBOARD_FRAMES.map((src, i) => (
          <div key={src} className="min-w-0 shrink-0 grow-0 basis-full">
            <div className={SLIDE_SHELL}>
              <LightboxImage
                src={src}
                alt={`Obscura storyboard panel ${i + 1} of ${STORYBOARD_FRAMES.length}`}
                className="h-auto w-full max-w-full object-contain object-top"
                draggable={false}
                loading="lazy"
                hoverScale={1.02}
              />
            </div>
          </div>
        ))}
      </ProjectCarousel>
    </div>
  );
}
