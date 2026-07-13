"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { LightboxImage } from "@/components/virdio/Lightbox";

interface ApplianceScannerDemoProps {
  className?: string;
  /** Annotated / product screenshot fallback */
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
}

/**
 * Signature interaction for Appliance Scanner.
 * Ships as annotated screenshot fallback; interactive camera flow can replace later.
 */
export function ApplianceScannerDemo({
  className,
  imageSrc = "/assets/domis/scanner.png",
  imageAlt = "Domis appliance scanner: camera capture and auto-researched appliance guide",
  caption,
}: ApplianceScannerDemoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden border border-neutral-800 bg-neutral-950">
        {failed ? (
          <ImagePlaceholder
            label="Appliance scanner — screenshot coming"
            aspectRatio="9/16"
            variant="viewfinder"
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
