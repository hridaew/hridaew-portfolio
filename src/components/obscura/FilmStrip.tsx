"use client";

import { cn } from "@/lib/utils";

interface DwellData {
  regionId: string;
  label: string;
  time: number;
  color: string;
}

interface FilmStripProps {
  dwellData: DwellData[];
  className?: string;
}

export function FilmStrip({ dwellData, className }: FilmStripProps) {
  const totalTime = dwellData.reduce((sum, d) => sum + d.time, 0) || 1;
  const sorted = [...dwellData].sort((a, b) => b.time - a.time);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      {/* Film strip — dark emulsion stock, not page paper */}
      <div className="relative w-full overflow-hidden border border-white/10 bg-neutral-950">
        {/* Sprocket holes top */}
        <div className="flex justify-between px-4 py-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="h-2 w-3 rounded-[1px] bg-white/15"
            />
          ))}
        </div>

        {/* Main content area */}
        <div className="px-8 py-6 md:px-10 md:py-8">
          <p className="type-caption-medium mb-6 text-left uppercase text-white/65">
            Your Gaze Profile
          </p>

          {/* Bars */}
          <div className="space-y-4">
            {sorted.map((item) => {
              const pct = Math.min(100, (item.time / totalTime) * 100);
              return (
                <div key={item.regionId} className="flex items-center gap-4">
                  <span className="type-caption w-24 shrink-0 text-right text-white/70">
                    {item.label}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden bg-white/10">
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        opacity: 0.92,
                      }}
                    />
                  </div>
                  <span className="type-caption w-10 shrink-0 text-white/70">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dominant path */}
          {sorted[0] && sorted[0].time > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="type-caption text-left text-white/65">
                Your path:{" "}
                <span
                  className="type-caption-medium"
                  style={{ color: sorted[0].color }}
                >
                  {sorted[0].label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Sprocket holes bottom */}
        <div className="flex justify-between px-4 py-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`bot-${i}`}
              className="h-2 w-3 rounded-[1px] bg-white/15"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
