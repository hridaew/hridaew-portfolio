"use client";

import { cn } from "@/lib/utils";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import {
  HOME_PROJECT_EMBLA_VIEWPORT,
  SITE_COLUMN,
} from "@/components/home/homeGrid";

function basenameFromSrc(src: string): string {
  const seg = src.split("/").pop();
  return seg ?? src;
}

const GALLERY_IMAGES_UNSORTED = [
  { src: "/assets/virdio/are_bss1.png", alt: "Bulgarian split squat, AR tracking frame 1" },
  { src: "/assets/virdio/are_bss2.png", alt: "Bulgarian split squat, AR tracking frame 2" },
  { src: "/assets/virdio/are_bpu1.png", alt: "Barbell push-up, AR tracking frame 1" },
  { src: "/assets/virdio/are_bpu2.png", alt: "Barbell push-up, AR tracking frame 2" },
  { src: "/assets/virdio/are_bpu3.png", alt: "Barbell push-up, AR tracking frame 3" },
  { src: "/assets/virdio/are_hurdles1.png", alt: "Virtual hurdles, AR tracking frame 1" },
  { src: "/assets/virdio/are_hurdles2.png", alt: "Virtual hurdles, AR tracking frame 2" },
] as const;

const GALLERY_IMAGES = [...GALLERY_IMAGES_UNSORTED].sort((a, b) =>
  basenameFromSrc(a.src).localeCompare(basenameFromSrc(b.src), undefined, {
    numeric: true,
    sensitivity: "base",
  })
);

/** Same horizontal gallery as home project cards: Embla + wheel/trackpad, drag-free inertia. */
const SLIDE_SHELL =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.45)] aspect-[696/392] w-[min(696px,calc(100vw-2rem))]";

interface ARMosaicProps {
  className?: string;
}

export function ARMosaic({ className }: ARMosaicProps) {
  return (
    <section
      className={cn("w-full min-w-0", className)}
      aria-label="AR exercise library: drag or scroll horizontally to browse frames; select a frame to view larger."
    >
      <div className={SITE_COLUMN}>
        <div className="mb-6 w-full min-w-0 text-left md:mb-8">
          <p className="site-label text-left text-white/40">The AR Exercise Library</p>
        </div>

        <ProjectCarousel className={HOME_PROJECT_EMBLA_VIEWPORT}>
          {GALLERY_IMAGES.map((item) => (
            <div key={item.src} className="flex-[0_0_auto]">
              <div className={SLIDE_SHELL}>
                <LightboxImage
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                  draggable={false}
                  loading="lazy"
                  hoverScale={1.03}
                />
              </div>
            </div>
          ))}
        </ProjectCarousel>
      </div>
    </section>
  );
}
