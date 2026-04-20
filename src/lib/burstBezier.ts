/**
 * Shared quadratic burst used by hero avatar and sketch-glass orb pop.
 */

export const DEFAULT_BURST_COLORS = [
  "#ffffff",
  "#FF5A5B",
  "#EB8314",
  "#CCBAFF",
] as const;

export const HERO_BURST_DURATION_S = 1.22;

export const HERO_BURST_EASE: [number, number, number, number] = [
  0.2, 0.95, 0.24, 1,
];

export type BurstParticleSpec = {
  id: number;
  angle: number;
  dist: number;
  arch: number;
  archSign: number;
  size: number;
  color: string;
};

/** Quadratic bezier from origin to (ex,ey) with control point biased perpendicular for an arc. */
export function burstBezierPoint(
  angle: number,
  dist: number,
  arch: number,
  archSign: number,
  u: number,
): { x: number; y: number } {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const ex = cosA * dist;
  const ey = sinA * dist;
  const perpX = -sinA * archSign;
  const perpY = cosA * archSign;
  const cx = ex * 0.5 + perpX * arch;
  const cy = ey * 0.5 + perpY * arch;
  const t = u;
  const o = 1 - t;
  return {
    x: 2 * o * t * cx + t * t * ex,
    y: 2 * o * t * cy + t * t * ey,
  };
}

/** Radial burst specs (same distribution as original avatar burst). */
export function createBurstParticleSpecs(
  colors: readonly string[] = DEFAULT_BURST_COLORS,
): BurstParticleSpec[] {
  const n = 18;
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.35,
    dist: 56 + Math.random() * 44,
    arch: 16 + Math.random() * 18,
    archSign: i % 2 === 0 ? 1 : -1,
    size: 1.15 + Math.random() * 1.15,
    color: colors[i % colors.length] ?? "#ffffff",
  }));
}
