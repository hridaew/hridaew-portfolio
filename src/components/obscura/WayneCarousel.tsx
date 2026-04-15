"use client";

import { cn } from "@/lib/utils";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "@/components/home/homeGrid";

const WAYNE_IMAGES = [
  "/assets/obscura/wayne_archive_0dsc06003awaynemarketplace.jpg",
  "/assets/obscura/wayne_archive_dsc05112awaynewong.jpg",
  "/assets/obscura/wayne_archive_dsc05127asoldierportrait.jpg",
  "/assets/obscura/wayne_archive_dsc05130a.jpg",
  "/assets/obscura/wayne_archive_dsc05132a.jpg",
  "/assets/obscura/wayne_archive_dsc05135a.jpg",
  "/assets/obscura/wayne_archive_dsc05138a.jpg",
  "/assets/obscura/wayne_archive_dsc05155a.jpg",
  "/assets/obscura/wayne_archive_dsc05166awaynebayonete.jpg",
  "/assets/obscura/wayne_archive_dsc05218ac_waynewong.jpg",
  "/assets/obscura/wayne_archive_dsc05232awayne2soldiers.jpg",
  "/assets/obscura/wayne_archive_dsc05265acjapanesefamily.jpg",
  "/assets/obscura/wayne_archive_dsc05267awaynejapanesemotherdaughter.jpg",
  "/assets/obscura/wayne_1946.avif",
  "/assets/obscura/wayne_2019.avif",
] as const;

/** Same interaction model as Virdio `ARMosaic`: Embla drag-free + wheel/trackpad. */
const SLIDE_SHELL =
  "relative aspect-[4/3] w-[min(280px,calc(100vw-2rem))] overflow-hidden border border-neutral-800 bg-neutral-950 shadow-[0px_4px_24px_0px_rgba(0,0,0,0.35)]";

interface WayneCarouselProps {
  className?: string;
}

export function WayneCarousel({ className }: WayneCarouselProps) {
  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      <ProjectCarousel
        className={HOME_WAFFLINGS_EMBLA_VIEWPORT}
        trackEndPadding="inline"
        autoplayDelayMs={3400}
      >
        {WAYNE_IMAGES.map((src, i) => (
          <div key={src} className="flex-[0_0_auto]">
            <div className={SLIDE_SHELL}>
              <LightboxImage
                src={src}
                alt={`Wayne Wong archive photograph ${i + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
                loading="lazy"
                hoverScale={1.03}
              />
            </div>
          </div>
        ))}
      </ProjectCarousel>
      <p className="site-gallery-caption mt-3 text-left text-neutral-500">
        Wayne Wong&apos;s hidden archive — hundreds of unexposed 35mm photographs from post-war
        Japan, 1946
      </p>
    </div>
  );
}
