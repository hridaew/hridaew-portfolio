"use client";

import { LightboxImage } from "@/components/virdio/Lightbox";

/**
 * Hero product shot — real capture of create-home web + home tab.
 * Source: `public/assets/domis/hero-product.png`
 */
export function HeroProductShot() {
  return (
    <LightboxImage
      className="dcs-hero-product-shot"
      src="/assets/domis/hero-product.png"
      alt="Domis create home profile on web beside the home tab on mobile"
      width={2088}
      height={1176}
      draggable={false}
      hoverScale={1.01}
    />
  );
}
