"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { LightboxImage } from "@/components/virdio/Lightbox";

interface PersonalizationShowcaseProps {
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
}

/**
 * Signature interaction for AI home identity.
 * Ships as static showcase fallback; input→avatar animation can replace later.
 */
export function PersonalizationShowcase({
  className,
  imageSrc = "/assets/domis/personalization.png",
  imageAlt = "Domis personalization: AI-generated home identity and tailored tasks",
  caption,
}: PersonalizationShowcaseProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden border border-neutral-800 bg-neutral-950">
        {failed ? (
          <ImagePlaceholder
            label="Personalization — assets coming"
            aspectRatio="9/16"
          />
        ) : (
          <LightboxImage
            src={imageSrc}
            alt={imageAlt}
            className="block h-auto w-full object-contain"
            draggable={false}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {caption ? (
        <p className="site-gallery-caption case-study-media-caption-mt text-left text-neutral-500">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
