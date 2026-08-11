"use client";

import { cn } from "@/lib/utils";
import { LightboxImage } from "@/components/virdio/Lightbox";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "@/components/home/homeGrid";

const EXHIBITION_IMAGES = [
  "/assets/obscura/exhibition_743gm1tgvfizndo7gwveqtjp584.webp",
  "/assets/obscura/exhibition_adnoitrcdwr5rin7vsl73u4pvo.webp",
  "/assets/obscura/exhibition_fuq7mf78aqfsldtgthmlhbik.webp",
  "/assets/obscura/exhibition_lah07hiyl9glxe2jbec80zastu.webp",
  "/assets/obscura/exhibition_lmwbwqiof2i79hqbywhhidrto1o.webp",
  "/assets/obscura/exhibition_mptzvspexc3aj4b2bxr8hwnjxo.webp",
  "/assets/obscura/exhibition_pieaqe7qfretseuxzmrd9r16opc.webp",
  "/assets/obscura/exhibition_uo819xvsekqwozr2ch9mt0tsci.webp",
  "/assets/obscura/exhibition_xrzfa3phi0b8csowvt4ovbrjbi.webp",
  "/assets/obscura/exhibition_zfpsnuur6vt2yepotybrqfuwcia.webp",
] as const;

/** Match Virdio AR library: Embla row + lightbox slides; Obscura chrome. */
const SLIDE_SHELL =
  "relative aspect-[4/3] w-[min(280px,calc(100vw-2rem))] overflow-hidden border border-ink/[0.1] bg-paper-sunken shadow-e3";

interface ExhibitionMosaicProps {
  className?: string;
}

export function ExhibitionMosaic({ className }: ExhibitionMosaicProps) {
  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      <ProjectCarousel
        className={HOME_WAFFLINGS_EMBLA_VIEWPORT}
        trackEndPadding="inline"
        autoplayDelayMs={4000}
      >
        {EXHIBITION_IMAGES.map((src, i) => (
          <div key={src} className="flex-[0_0_auto]">
            <div className={SLIDE_SHELL}>
              <LightboxImage
                src={src}
                alt={`Exhibition day photograph ${i + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
                loading="lazy"
                hoverScale={1.03}
              />
            </div>
          </div>
        ))}
      </ProjectCarousel>

      <p className="site-gallery-caption mt-3 text-left text-ink-muted">
        Exhibition Day at MOHAI — September 13, 2025
      </p>
    </div>
  );
}
