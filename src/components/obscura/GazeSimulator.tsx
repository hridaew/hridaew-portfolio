"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface GazeRegion {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface DwellData {
  regionId: string;
  label: string;
  time: number;
  color: string;
}

interface GazeSimulatorProps {
  imageSrc: string;
  imageAlt?: string;
  className?: string;
  onDwellUpdate?: (data: DwellData[]) => void;
}

const REGIONS: GazeRegion[] = [
  { id: "environments", label: "Environments", x: 50, y: 5, width: 45, height: 50, color: "#22c55e" },
  { id: "faces", label: "Faces", x: 15, y: 10, width: 25, height: 35, color: "#ef4444" },
  { id: "occupation", label: "Occupation", x: 45, y: 55, width: 50, height: 40, color: "#eab308" },
  { id: "clothing", label: "Clothing", x: 5, y: 45, width: 35, height: 45, color: "#a855f7" },
];

const DWELL_THRESHOLD = 1500; // ms

export function GazeSimulator({
  imageSrc,
  imageAlt = "Wayne Wong's photograph",
  className,
  onDwellUpdate,
}: GazeSimulatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dwellTimersRef = useRef<Record<string, number>>({});
  const dwellDataRef = useRef<DwellData[]>(
    REGIONS.map((r) => ({ regionId: r.id, label: r.label, time: 0, color: r.color }))
  );
  const activeRegionRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(0);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!reticleRef.current) return;
    xTo.current = gsap.quickTo(reticleRef.current, "left", {
      duration: 0.3,
      ease: "power2.out",
    });
    yTo.current = gsap.quickTo(reticleRef.current, "top", {
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  const getActiveRegion = useCallback((pctX: number, pctY: number) => {
    for (const region of REGIONS) {
      if (
        pctX >= region.x &&
        pctX <= region.x + region.width &&
        pctY >= region.y &&
        pctY <= region.y + region.height
      ) {
        return region;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    let raf: number;

    const tick = (time: number) => {
      if (!containerRef.current) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = lastTimeRef.current ? time - lastTimeRef.current : 0;
      lastTimeRef.current = time;

      const rect = containerRef.current.getBoundingClientRect();
      const pctX = ((mouseRef.current.x - rect.left) / rect.width) * 100;
      const pctY = ((mouseRef.current.y - rect.top) / rect.height) * 100;

      const region = getActiveRegion(pctX, pctY);
      const regionId = region?.id || null;

      // Update dwell times
      if (regionId && dt > 0 && dt < 200) {
        const idx = dwellDataRef.current.findIndex((d) => d.regionId === regionId);
        if (idx >= 0) {
          dwellDataRef.current[idx].time += dt;
        }
        dwellTimersRef.current[regionId] =
          (dwellTimersRef.current[regionId] || 0) + dt;
      }

      // Reset timer for regions we're NOT in
      for (const key of Object.keys(dwellTimersRef.current)) {
        if (key !== regionId) {
          dwellTimersRef.current[key] = 0;
        }
      }

      // Show pulse when dwelling
      if (pulseRef.current) {
        const activeTimer = regionId
          ? dwellTimersRef.current[regionId] || 0
          : 0;
        if (activeTimer > DWELL_THRESHOLD) {
          pulseRef.current.style.opacity = "1";
          pulseRef.current.style.transform = "translate(-50%, -50%) scale(1.5)";
        } else {
          pulseRef.current.style.opacity = "0";
          pulseRef.current.style.transform = "translate(-50%, -50%) scale(1)";
        }
      }

      // Update region highlights
      if (regionId !== activeRegionRef.current) {
        activeRegionRef.current = regionId;
        const overlays = containerRef.current.querySelectorAll("[data-region]");
        overlays.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const rid = htmlEl.dataset.region;
          htmlEl.style.opacity = rid === regionId ? "0.2" : "0";
        });
      }

      // Periodic dwell data callback
      if (onDwellUpdate && dt > 0) {
        onDwellUpdate([...dwellDataRef.current]);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [getActiveRegion, onDwellUpdate]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !xTo.current || !yTo.current) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      xTo.current(x);
      yTo.current(y);
    },
    []
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl cursor-none group"
        onMouseMove={handleMouseMove}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-auto block"
          draggable={false}
        />

        {/* Region overlays */}
        {REGIONS.map((region) => (
          <div
            key={region.id}
            data-region={region.id}
            className="absolute transition-opacity duration-300 rounded-lg pointer-events-none"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
              backgroundColor: region.color,
              opacity: 0,
            }}
          />
        ))}

        {/* Gaze reticle */}
        <div
          ref={reticleRef}
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ left: "50%", top: "50%" }}
        >
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-2 border-amber-200/60 -translate-x-1/2 -translate-y-1/2" />
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-amber-300 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          {/* Pulse on dwell */}
          <div
            ref={pulseRef}
            className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full border border-amber-300/40 transition-all duration-500 pointer-events-none"
            style={{ opacity: 0, transform: "translate(-50%, -50%) scale(1)" }}
          />
        </div>

        {/* Instruction overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-neutral-300 text-xs px-4 py-2 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Move your cursor to explore — dwell to discover
        </div>
      </div>
    </div>
  );
}
