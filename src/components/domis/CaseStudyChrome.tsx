"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Soft media slot matching Figma empty cards (#1a1a1a, 16px radius). */
export function MediaPlaceholder({
  label = "Media coming soon",
  className,
  aspectClass = "aspect-[16/10]",
}: {
  label?: string;
  className?: string;
  aspectClass?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-[0_2px_6px_rgba(0,0,0,0.78)]",
        aspectClass,
        className
      )}
      role="img"
      aria-label={label}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(77,77,77,0.61)]" />
      <span className="df-placeholder relative z-[1]">{label}</span>
    </div>
  );
}

export function SimonyTag({
  children,
  tone = "coral",
}: {
  children: ReactNode;
  tone?: "coral" | "violet" | "mint" | "green";
}) {
  const styles =
    tone === "violet"
      ? "border-[#635974] bg-[rgba(212,188,255,0.1)] text-[#d4bcff]"
      : tone === "mint"
        ? "border-[#3d6b66] bg-[rgba(94,196,184,0.12)] text-[#9ee5dc]"
        : tone === "green"
          ? "border-[#50715a] bg-[rgba(162,246,192,0.1)] text-[#a2f6c0]"
          : "border-[#744d40] bg-[rgba(253,158,123,0.1)] text-[#fd9e7b]";

  return (
    <span
      className={cn(
        "df-tag inline-flex items-center rounded-lg border px-1.5 py-[3px]",
        styles
      )}
    >
      {children}
    </span>
  );
}

/** Soft gradient shell for product media (Figma showcase frames). */
export function GradientShell({
  children,
  from = "#ffa1a8",
  to = "#faf7f2",
  className,
  caption,
  prototypeLabel = "Open prototype",
  showPrototype = true,
  framed = true,
}: {
  children: ReactNode;
  from?: string;
  to?: string;
  className?: string;
  caption?: string;
  prototypeLabel?: string;
  showPrototype?: boolean;
  /** When false, children sit directly on the gradient (for interactive demos). */
  framed?: boolean;
}) {
  return (
    <div className={cn("relative w-full max-w-[1200px]", className)}>
      <div
        className="relative overflow-hidden rounded-[30px] border border-black/[0.08] p-4 md:p-8 lg:p-10"
        style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }}
      >
        {framed ? (
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/50 p-1.5 shadow-[0_10px_10px_-3.75px_rgba(0,0,0,0.06)]">
            <div className="overflow-hidden rounded-xl bg-white">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
      {showPrototype ? (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1] -translate-x-1/2 md:bottom-4">
          <span className="df-proto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#1a1a1a] to-black px-3.5 py-2 shadow-[0_0.6px_0.3px_rgba(0,0,0,0.18),0_2.3px_1.1px_rgba(0,0,0,0.16),0_10px_5px_rgba(0,0,0,0.06)]">
            {prototypeLabel}
            <span aria-hidden className="leading-none">
              ↗
            </span>
          </span>
        </div>
      ) : null}
      {caption ? <p className="df-caption mt-3 text-center">{caption}</p> : null}
    </div>
  );
}
