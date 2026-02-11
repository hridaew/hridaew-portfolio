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
    <div className={cn("relative", className)}>
      {/* Film strip container */}
      <div className="relative bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800">
        {/* Sprocket holes top */}
        <div className="flex justify-between px-4 py-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="w-3 h-2 rounded-sm bg-neutral-800"
            />
          ))}
        </div>

        {/* Main content area */}
        <div className="px-6 py-4">
          <p className="text-neutral-500 text-xs uppercase tracking-[0.15em] mb-4">
            Your Gaze Profile
          </p>

          {/* Bars */}
          <div className="space-y-3">
            {sorted.map((item) => {
              const pct = Math.min(100, (item.time / totalTime) * 100);
              return (
                <div key={item.regionId} className="flex items-center gap-3">
                  <span className="text-neutral-400 text-xs w-20 text-right shrink-0">
                    {item.label}
                  </span>
                  <div className="flex-1 h-4 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-neutral-500 text-xs w-10 shrink-0">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dominant path */}
          {sorted[0] && sorted[0].time > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-800/50">
              <p className="text-neutral-500 text-xs">
                Your path:{" "}
                <span
                  className="font-medium"
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
              className="w-3 h-2 rounded-sm bg-neutral-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
