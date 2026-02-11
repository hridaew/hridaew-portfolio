"use client";

import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  label?: string;
  variant?: "frame" | "viewfinder" | "film";
  aspectRatio?: string;
  className?: string;
}

export function ImagePlaceholder({
  label = "Coming Soon",
  variant = "frame",
  aspectRatio = "16/9",
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950",
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Grain texture */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="h-full w-full">
          <filter id="placeholderGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#placeholderGrain)" />
        </svg>
      </div>

      {/* Variant decorations */}
      {variant === "frame" && (
        <div className="absolute inset-4 border border-neutral-700/40 rounded-lg" />
      )}

      {variant === "viewfinder" && (
        <>
          {/* Viewfinder corners */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-neutral-600/50" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-neutral-600/50" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-neutral-600/50" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-neutral-600/50" />
          {/* Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-600/40" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-600/40" />
          </div>
        </>
      )}

      {variant === "film" && (
        <>
          {/* Film sprocket holes */}
          <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2.5 h-4 rounded-sm bg-neutral-800/60" />
            ))}
          </div>
          <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2.5 h-4 rounded-sm bg-neutral-800/60" />
            ))}
          </div>
        </>
      )}

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-neutral-600 text-sm font-[family-name:var(--font-dm-sans)] tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}
