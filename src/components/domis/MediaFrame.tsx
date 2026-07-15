"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 16:9 glass frame for portrait phone media.
 * Phone(s) sit centered in an ambient gradient field.
 */
export function MediaFrame({
  children,
  className,
  caption,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  caption?: string;
  /** Slight vertical offsets for multi-phone layouts */
  stagger?: boolean;
}) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <div
        className={cn(
          "glass-panel relative aspect-video w-full overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-white/[0.04] via-transparent to-amber-900/10"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-3 p-4 md:gap-5 md:p-8",
            stagger && "items-end pb-6 md:pb-10"
          )}
        >
          {children}
        </div>
      </div>
      {caption ? (
        <p className="site-gallery-caption case-study-media-caption-mt text-left text-white/45">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

/** Portrait phone slot inside MediaFrame */
export function PhoneSlot({
  children,
  className,
  offset = "none",
}: {
  children: ReactNode;
  className?: string;
  offset?: "up" | "down" | "none";
}) {
  return (
    <div
      className={cn(
        "h-full max-h-full w-auto shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]",
        offset === "up" && "-translate-y-3 md:-translate-y-5",
        offset === "down" && "translate-y-2 md:translate-y-4",
        className
      )}
    >
      <div className="flex h-full items-stretch justify-center [&_img]:h-full [&_img]:w-auto [&_img]:max-w-none [&_img]:object-contain">
        {children}
      </div>
    </div>
  );
}
