"use client";

import { useEffect } from "react";

const RED_SURFACE =
  ".dcs-media:not(.dcs-media-hero-shot), .dcs-domis-red, .dcs-home-feature-card";

type DomisRedMeshPointerProps = {
  /** Root to listen on. Defaults to `.domis-cs`. */
  rootSelector?: string;
};

/**
 * Pointer heat for Domis coral surfaces — same --domis-dot-* contract as
 * homepage work cards. Mesh layers are CSS ::before/::after on those surfaces.
 */
export function DomisRedMeshPointer({
  rootSelector = ".domis-cs",
}: DomisRedMeshPointerProps) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const clear = (el: HTMLElement) => {
      el.style.setProperty("--domis-dot-x", "50%");
      el.style.setProperty("--domis-dot-y", "50%");
      el.style.setProperty("--domis-dot-heat", "0");
    };

    const onMove = (event: Event) => {
      const e = event as PointerEvent;
      const target = (e.target as Element | null)?.closest?.(RED_SURFACE);
      if (!(target instanceof HTMLElement) || !root.contains(target)) return;

      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--domis-dot-x", `${x}%`);
      target.style.setProperty("--domis-dot-y", `${y}%`);
      target.style.setProperty("--domis-dot-heat", "1");
    };

    const onLeave = (event: Event) => {
      const e = event as PointerEvent;
      const target = (e.target as Element | null)?.closest?.(RED_SURFACE);
      if (!(target instanceof HTMLElement) || !root.contains(target)) return;

      const related = e.relatedTarget as Element | null;
      if (related && target.contains(related)) return;
      clear(target);
    };

    root.querySelectorAll(RED_SURFACE).forEach((node) => {
      if (node instanceof HTMLElement) clear(node);
    });

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave, true);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave, true);
    };
  }, [rootSelector]);

  return null;
}
