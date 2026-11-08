"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BOARD, STATIONS } from "./stations";

/**
 * The name of the room under the pointer, riding just below and right of the cursor. Position is written
 * straight to the element (no re-render per move); the name cross-fades in 150ms.
 */
export function HoverTag({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // The last name stays on the tag while it fades out.
  const [shown, setShown] = useState(id);
  if (id && id !== shown) setShown(id);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX + 14}px, ${e.clientY + 18}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  const title = [...STATIONS, BOARD].find((s) => s.id === shown)?.title ?? "";
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform">
      <span
        className={cn(
          "esper-pill type-body-medium block rounded-full bg-[rgba(255,255,255,0.72)] px-3 py-1.5 text-[#1d1d1f]",
          "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_8px_24px_-10px_rgba(40,36,30,0.35)] backdrop-blur-xl",
          "origin-top-left transition-[opacity,transform] duration-150 ease-out",
          id ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
      >
        {title}
      </span>
    </div>
  );
}
