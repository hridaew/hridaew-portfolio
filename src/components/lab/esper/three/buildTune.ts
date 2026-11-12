/**
 * The opening's numbers: the loading mark, the plan, the walls, the furnishing, the camera and the interface. These
 * defaults are what ships. In development the DialKit panel (BuildDials) writes overrides to window.__esperBuild;
 * the room reads them each time the build starts, so "replay" shows a change at once.
 */
export type Transition =
  | { type: "spring"; stiffness?: number; damping?: number; mass?: number; visualDuration?: number; bounce?: number }
  | { type: "easing"; duration: number; ease: [number, number, number, number] };

export const BUILD_TUNE = {
  /** The loading mark (ms; CSS). Seen on a full reload. */
  loader: { barRise: 580, barStagger: 60, fillGlide: 900, exitDelay: 260, exitDuration: 300, exitStagger: 45, roomFadeIn: 900 },
  /** The plan sketch on the floor (s, m). `delay` is the wait after the room is ready, before the first line. */
  plan: { delay: 0.11, outlineAt: 0, outlineDuration: 0.25, innerAt: 0.1, innerGap: 0.016, innerDuration: 0.13, width: 0.034, opacity: 2, tipLength: 0.48, tipGlow: 2.7, fadeOut: 0.05 },
  /** The walls' two beats, and the spring they rise on. */
  walls: { outlineAt: 0.25, innerAt: 0.37, rise: { type: "spring", visualDuration: 0.4, bounce: 0.3 } as Transition },
  /** The faint projection each wall rises into (off: the walls rise straight out of their lines). */
  hologram: { show: true, lead: 0.17, fadeIn: 0.34, fadeOut: 0.43, opacity: 0.2, rim: 0.24, scanlines: 0, edgeGlow: 1 },
  /** The rooms filling in (s, m). Squash: how much things flatten on landing; bounce/settle: its wobble and decay. */
  furnish: { at: 0.43, roomGap: 0.17, itemGap: 0.045, dropHeight: 0.42, fallTime: 0.3, squash: 0.13, bounce: 31, settle: 20 },
  /** The camera's small settle (degrees of turn at the start, seconds). */
  camera: { settleX: -3.5, settleY: 1.2, duration: 3.4 },
  /** When the name and the bar come in (s). */
  ui: { interfaceAt: 0.75 },
};
export type BuildTune = typeof BUILD_TUNE;

/** The defaults with any development overrides on top, folder by folder. */
export function buildTune(): BuildTune {
  const o = typeof window !== "undefined" ? (window as unknown as { __esperBuild?: Partial<BuildTune> }).__esperBuild : undefined;
  if (!o) return BUILD_TUNE;
  const out = { ...BUILD_TUNE } as Record<string, unknown>;
  for (const k of Object.keys(BUILD_TUNE) as (keyof BuildTune)[]) out[k] = { ...BUILD_TUNE[k], ...(o[k] ?? {}) };
  return out as BuildTune;
}

/** A spring's natural frequency and damping ratio, from either physics or Motion's visualDuration/bounce. */
function springOf(tr: Extract<Transition, { type: "spring" }>) {
  if (tr.stiffness !== undefined) {
    const k = tr.stiffness, m = tr.mass ?? 1, c = tr.damping ?? 10;
    return { w: Math.sqrt(k / m), z: c / (2 * Math.sqrt(k * m)) };
  }
  // As Motion converts them.
  const w = (2 * Math.PI) / ((tr.visualDuration ?? 0.3) * 1.2);
  return { w, z: Math.min(1, Math.max(0.05, 1 - (tr.bounce ?? 0.25))) };
}

/** A cubic-bezier easing's value at progress x (0..1). */
function bezier([x1, y1, x2, y2]: [number, number, number, number], x: number) {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  let lo = 0, hi = 1, s = x;
  for (let i = 0; i < 24; i++) {
    const v = at(x1, x2, s);
    if (Math.abs(v - x) < 1e-5) break;
    if (v < x) lo = s;
    else hi = s;
    s = (lo + hi) / 2;
  }
  return at(y1, y2, s);
}

/** How far 0 -> 1 has got, `t` seconds in. */
export function progress(tr: Transition, t: number) {
  if (t <= 0) return 0;
  if (tr.type === "easing") return t >= tr.duration ? 1 : bezier(tr.ease, t / Math.max(1e-4, tr.duration));
  const { w, z } = springOf(tr);
  if (z < 0.999) {
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  if (z <= 1.001) return 1 - Math.exp(-w * t) * (1 + w * t);
  const r = Math.sqrt(z * z - 1), r1 = -w * (z - r), r2 = -w * (z + r);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

/** About when it's done (within 1%). */
export function settleTime(tr: Transition) {
  if (tr.type === "easing") return tr.duration;
  const { w, z } = springOf(tr);
  return Math.min(4, 4.6 / (Math.min(1, z) * w));
}
