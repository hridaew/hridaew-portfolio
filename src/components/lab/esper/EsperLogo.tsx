"use client";

import { cn } from "@/lib/utils";

/**
 * The HW mark (the favicon): six bars, 3 wide with 1 between, on a 23 x 16 grid. The second and fifth have their tops
 * cut at 45 degrees; the second also stops short of the baseline. Laid out here as plain boxes in a 24 x 17 frame
 * (half a unit of air all round), so every moving part is a transform the compositor can run on its own.
 */
const BARS: { x: number; y: number; h: number; cut?: number }[] = [
  { x: 0, y: 0, h: 16 },
  { x: 4, y: 1.6, h: 13, cut: 3 },
  { x: 8, y: 0, h: 16 },
  { x: 12, y: 0, h: 16 },
  { x: 16, y: 1.6, h: 14.4, cut: 3 },
  { x: 20, y: 0, h: 16 },
];
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function Bars() {
  return BARS.map((b, i) => (
    <span
      key={i}
      className="esper-logo-bar absolute bg-current"
      style={{
        left: pct(b.x + 0.5, 24),
        top: pct(b.y + 0.5, 17),
        width: pct(3, 24),
        height: pct(b.h, 17),
        clipPath: b.cut ? `polygon(0 ${pct(b.cut, b.h)}, 100% 0, 100% 100%, 0 100%)` : undefined,
        ["--i" as string]: i,
      }}
    />
  ));
}

/**
 * The loading mark. The bars rise in one after another, the mark fills left to right as the room loads (it is the
 * progress bar), and when the room is ready the bars sink into the ground in turn, where the house starts to draw.
 *
 * Everything that moves is a transform or an opacity, so it keeps running while the page is busy building the room
 * (parsing three.js, decoding models, compiling shaders) instead of freezing with it. The fill is a reveal: a window
 * slides right while the lit copy inside it slides left by the same amount, so its edge moves and nothing resizes.
 */
export function EsperLogo({ progress, done, className }: { progress: number; done: boolean; className?: string }) {
  const fill = done ? 1 : Math.max(0, Math.min(1, progress));
  return (
    <div aria-hidden className={cn("esper-logo relative aspect-[24/17]", done && "esper-logo-out", className)}>
      <div className="absolute inset-0 opacity-[0.16]">
        <Bars />
      </div>
      <div className="esper-logo-fill absolute inset-0 overflow-hidden" style={{ transform: `translateX(${(fill - 1) * 100}%)` }}>
        <div className="esper-logo-fill absolute inset-0" style={{ transform: `translateX(${(1 - fill) * 100}%)` }}>
          <Bars />
        </div>
      </div>
    </div>
  );
}
