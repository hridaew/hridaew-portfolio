"use client";

import type { ComponentType } from "react";

type SheetBody = ComponentType;

const cache = new Map<string, SheetBody>();
const inflight = new Map<string, Promise<SheetBody | null>>();

/**
 * Client-side loaders for sheet content. Opening the sheet does not wait on the
 * intercepting-route RSC — we kick these off on hover / click and paint as soon
 * as the module resolves (usually already warm from prefetch).
 */
const LOADERS: Record<string, () => Promise<SheetBody>> = {
  domis: async () => {
    const { DomisCaseStudyContent } = await import(
      "@/components/domis/DomisCaseStudyContent"
    );
    return function DomisSheetBody() {
      return (
        <div className="site-editorial relative w-full overflow-x-clip bg-paper font-sans text-ink antialiased selection:bg-ink/[0.05] selection:text-ink">
          <DomisCaseStudyContent />
        </div>
      );
    };
  },
  virdio: async () => {
    const { VirdioCaseStudyBody } = await import(
      "@/components/virdio/VirdioCaseStudyBody"
    );
    return function VirdioSheetBody() {
      // overflow-x-clip (not hidden): hidden creates a scrollport and breaks sticky/pin in the sheet
      return (
        <div className="site-editorial isolate relative w-full overflow-x-clip bg-paper font-sans text-ink antialiased selection:bg-ink/[0.05] selection:text-ink [--csp-dot-x:50%] [--csp-dot-y:50%] [--csp-dot-heat:0]">
          <div
            className="pointer-events-none absolute inset-0 -z-10 min-h-full"
            aria-hidden
          >
            <div className="case-study-page-dot-mesh absolute inset-0 min-h-full" />
          </div>
          <div className="relative z-[1]">
            <VirdioCaseStudyBody />
          </div>
        </div>
      );
    };
  },
  obscura: async () => {
    const [
      { GrainOverlay },
      { ObscuraCaseStudyBody },
      { ObscuraPageLiquidCursor },
    ] = await Promise.all([
      import("@/components/virdio/GrainOverlay"),
      import("@/components/obscura/ObscuraCaseStudyBody"),
      import("@/components/obscura/ObscuraPageLiquidCursor"),
    ]);
    return function ObscuraSheetBody() {
      return (
        <div className="site-editorial relative w-full cursor-none overflow-x-clip bg-paper font-sans antialiased selection:bg-amber-900/15 selection:text-amber-950 [&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_select]:cursor-pointer [&_textarea]:cursor-text">
          <GrainOverlay />
          <ObscuraCaseStudyBody />
          <ObscuraPageLiquidCursor elevated />
        </div>
      );
    };
  },
  "memory-care": async () => {
    const { MemoryCareCaseStudyBody } = await import(
      "@/components/memory-care/MemoryCareCaseStudyBody"
    );
    return function MemoryCareSheetBody() {
      return (
        <div className="site-editorial relative w-full overflow-x-clip bg-background font-sans text-foreground antialiased selection:bg-ink/[0.05] selection:text-ink">
          <MemoryCareCaseStudyBody />
        </div>
      );
    };
  },
  "waffling/savor": async () => {
    const { SavorWafflingBody } = await import(
      "@/components/savor/SavorWafflingBody"
    );
    return function SavorSheetBody() {
      return (
        <div className="relative w-full overflow-x-clip bg-paper text-ink">
          <SavorWafflingBody />
        </div>
      );
    };
  },
  "waffling/orca": async () => {
    const { OrcaWafflingBody } = await import(
      "@/components/orca/OrcaWafflingBody"
    );
    return function OrcaSheetBody() {
      return (
        <div className="relative w-full overflow-x-clip bg-paper text-ink">
          <OrcaWafflingBody />
        </div>
      );
    };
  },
  "waffling/recorder": async () => {
    const { VoiceRecorder } = await import(
      "@/components/recorder/VoiceRecorder"
    );
    return function RecorderSheetBody() {
      return (
        <div className="relative w-full bg-paper-sunken">
          <VoiceRecorder embed />
        </div>
      );
    };
  },
  "butter-chicken": async () => {
    const { ButterChickenRecipeBody } = await import(
      "@/components/butter-chicken/ButterChickenRecipeBody"
    );
    return function ButterChickenSheetBody() {
      return (
        <div className="relative w-full overflow-x-clip bg-paper text-ink">
          <ButterChickenRecipeBody />
        </div>
      );
    };
  },
};

export function prefetchSheetBody(key: string): void {
  void loadSheetBody(key);
}

export function loadSheetBody(key: string): Promise<SheetBody | null> {
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);

  const existing = inflight.get(key);
  if (existing) return existing;

  const loader = LOADERS[key];
  if (!loader) return Promise.resolve(null);

  const promise = loader()
    .then((body) => {
      cache.set(key, body);
      inflight.delete(key);
      return body;
    })
    .catch((err) => {
      inflight.delete(key);
      console.error(`[sheet] failed to load body for ${key}`, err);
      return null;
    });

  inflight.set(key, promise);
  return promise;
}

export function getCachedSheetBody(key: string): SheetBody | null {
  return cache.get(key) ?? null;
}
