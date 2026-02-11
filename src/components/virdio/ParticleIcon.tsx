"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface ParticleIconProps {
  shape: "cone" | "magnet" | "speaker";
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  restX: number;
  restY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  phase: number;
  driftAmp: number;
}

/* ─── Constants ─────────────────────────────────────────────────────── */

const CANVAS_SIZE = 160;
const REPULSION_RADIUS = 50;
const REPULSION_FORCE = 0.5;
const SPRING_STRENGTH = 0.065;
const DAMPING = 0.83;

/* ─── Helpers ──────────────────────────────────────────────────────── */

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function pointInTriangle(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

interface RawParticle {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
}

/* ─── Cone: 3D isometric purple cone with white stripes + square base ── */

function generateConeParticles(): RawParticle[] {
  const particles: RawParticle[] = [];

  // Reference: Isometric purple traffic cone with white horizontal bands
  // and a square base plate, viewed at ~30° angle

  // Colors matching the reference image
  const coneDeep = "#7C3AED";    // violet-600
  const coneMid = "#8B5CF6";     // violet-500
  const coneLight = "#A78BFA";   // violet-400
  const coneHighlight = "#C4B5FD"; // violet-300
  const conePink = "#D946EF";    // fuchsia-500 (for the pink-ish highlight)
  const stripeWhite = "#E8E0F0"; // off-white with violet tint
  const stripeLight = "#F3EEFF"; // near white
  const basePurple = "#7C3AED";
  const baseDark = "#6D28D9";
  const baseRim = "#A855F7";     // the bright ring at base
  const openTop = "#581C87";     // dark opening at top

  // ─── Cone body (triangle shape) ───
  const apexX = 0.50, apexY = 0.08;
  const baseLeftX = 0.22, baseLeftY = 0.72;
  const baseRightX = 0.78, baseRightY = 0.72;

  // Dense fill
  for (let i = 0; i < 350; i++) {
    const rx = rand(0.18, 0.82);
    const ry = rand(0.06, 0.74);
    if (pointInTriangle(rx, ry, apexX, apexY, baseLeftX, baseLeftY, baseRightX, baseRightY)) {
      const heightFactor = (ry - apexY) / (baseLeftY - apexY);
      const centerDist = Math.abs(rx - 0.5) / (heightFactor * 0.35 + 0.01);

      // Left side is lighter (highlight), right side is deeper
      let color: string;
      if (rx < 0.45) {
        color = centerDist < 0.5 ? coneHighlight : coneLight;
      } else if (rx < 0.55) {
        color = coneMid;
      } else {
        color = centerDist < 0.5 ? coneMid : coneDeep;
      }

      // Pink highlight on left edge
      if (rx < 0.35 && heightFactor > 0.3 && heightFactor < 0.8) {
        color = Math.random() > 0.5 ? conePink : coneLight;
      }

      particles.push({
        x: rx, y: ry,
        radius: rand(0.6, 1.4) + heightFactor * 0.6,
        color,
        opacity: rand(0.55, 0.95),
      });
    }
  }

  // ─── White stripe bands at ~30% and ~55% height ───
  for (const sy of [0.32, 0.52]) {
    const t = (sy - apexY) / (baseLeftY - apexY);
    const leftX = apexX + (baseLeftX - apexX) * t;
    const rightX = apexX + (baseRightX - apexX) * t;
    const bandH = 0.06;

    for (let i = 0; i < 45; i++) {
      const tx = rand(0.02, 0.98);
      const x = lerp(leftX, rightX, tx);
      const y = sy + rand(-bandH / 2, bandH / 2);
      particles.push({
        x, y,
        radius: rand(0.7, 1.5),
        color: Math.random() > 0.3 ? stripeWhite : stripeLight,
        opacity: rand(0.7, 1.0),
      });
    }
  }

  // ─── Cone edges (crisp outline) ───
  const edge = (ax: number, ay: number, bx: number, by: number, count: number, col: string) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      particles.push({
        x: lerp(ax, bx, t) + rand(-0.006, 0.006),
        y: lerp(ay, by, t) + rand(-0.006, 0.006),
        radius: rand(0.4, 0.8),
        color: col,
        opacity: rand(0.6, 0.9),
      });
    }
  };
  edge(apexX, apexY, baseLeftX, baseLeftY, 18, coneLight);
  edge(apexX, apexY, baseRightX, baseRightY, 18, coneDeep);

  // ─── Dark opening at top ───
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: apexX + rand(-0.025, 0.025),
      y: apexY + rand(-0.015, 0.02),
      radius: rand(0.5, 0.9),
      color: openTop,
      opacity: rand(0.6, 0.9),
    });
  }

  // ─── Bright elliptical rim at cone base ───
  for (let i = 0; i < 30; i++) {
    const angle = rand(0, Math.PI * 2);
    const rx = 0.27;
    const ry = 0.04;
    particles.push({
      x: 0.5 + rx * Math.cos(angle),
      y: 0.73 + ry * Math.sin(angle),
      radius: rand(0.5, 1.0),
      color: baseRim,
      opacity: rand(0.6, 1.0),
    });
  }

  // ─── Square base plate (isometric diamond) ───
  // Corners of the isometric base
  const bTop: [number, number] = [0.5, 0.72];
  const bRight: [number, number] = [0.88, 0.82];
  const bBottom: [number, number] = [0.5, 0.94];
  const bLeft: [number, number] = [0.12, 0.82];

  // Fill the rhombus
  for (let i = 0; i < 120; i++) {
    // Generate point inside rhombus using barycentric coords of two triangles
    const u = rand(0, 1);
    const v = rand(0, 1);
    let px: number, py: number;

    if (u + v <= 1) {
      // Upper triangle: bTop, bRight, bLeft
      px = bTop[0] + u * (bRight[0] - bTop[0]) + v * (bLeft[0] - bTop[0]);
      py = bTop[1] + u * (bRight[1] - bTop[1]) + v * (bLeft[1] - bTop[1]);
    } else {
      // Lower triangle: bBottom, bRight, bLeft
      const u2 = 1 - u;
      const v2 = 1 - v;
      px = bBottom[0] + u2 * (bRight[0] - bBottom[0]) + v2 * (bLeft[0] - bBottom[0]);
      py = bBottom[1] + u2 * (bRight[1] - bBottom[1]) + v2 * (bLeft[1] - bBottom[1]);
    }

    // Left half lighter, right half darker
    const baseColor = px < 0.5 ? coneLight : basePurple;

    particles.push({
      x: px, y: py,
      radius: rand(0.7, 1.5),
      color: baseColor,
      opacity: rand(0.45, 0.8),
    });
  }

  // Base edges
  edge(bTop[0], bTop[1], bRight[0], bRight[1], 12, basePurple);
  edge(bRight[0], bRight[1], bBottom[0], bBottom[1], 12, baseDark);
  edge(bBottom[0], bBottom[1], bLeft[0], bLeft[1], 12, baseDark);
  edge(bLeft[0], bLeft[1], bTop[0], bTop[1], 12, coneLight);

  return particles;
}

/* ─── Magnet: horseshoe/U-shape with N/S pole colors ─────────────── */

function generateMagnetParticles(): RawParticle[] {
  const particles: RawParticle[] = [];

  const barW = 0.13;
  const lc = 0.28, rc = 0.72;
  const topY = 0.06, bendY = 0.58;

  const bodyDark = "#6D28D9";
  const bodyMid = "#7C3AED";
  const bodyLight = "#A78BFA";
  const poleRed = "#EF4444";
  const poleRedLight = "#FCA5A5";
  const poleBlue = "#3B82F6";
  const poleBlueLight = "#93C5FD";
  const fieldLine = "#C4B5FD";

  // Left bar fill
  for (let i = 0; i < 100; i++) {
    const x = lc + rand(-barW / 2, barW / 2);
    const y = rand(topY, bendY);
    const edge = 1 - Math.abs(x - lc) / (barW / 2);
    particles.push({ x, y, radius: rand(0.5, 1.3) * edge + 0.5, color: edge > 0.6 ? bodyLight : bodyMid, opacity: rand(0.5, 0.9) });
  }

  // Right bar fill
  for (let i = 0; i < 100; i++) {
    const x = rc + rand(-barW / 2, barW / 2);
    const y = rand(topY, bendY);
    const edge = 1 - Math.abs(x - rc) / (barW / 2);
    particles.push({ x, y, radius: rand(0.5, 1.3) * edge + 0.5, color: edge > 0.6 ? bodyLight : bodyMid, opacity: rand(0.5, 0.9) });
  }

  // Semicircle connecting bottom
  const cx = 0.5;
  const rOuter = (rc - lc) / 2 + barW / 2;
  const rInner = (rc - lc) / 2 - barW / 2;

  for (let i = 0; i < 120; i++) {
    const angle = rand(0, Math.PI);
    const r = rand(rInner, rOuter);
    const x = cx + r * Math.cos(angle);
    const y = bendY + r * Math.sin(angle) * 0.55;
    if (y >= bendY - 0.01 && y < bendY + rOuter * 0.58) {
      particles.push({ x, y, radius: rand(0.5, 1.2), color: bodyMid, opacity: rand(0.5, 0.9) });
    }
  }

  // Bar edges
  for (const c of [lc, rc]) {
    for (const dx of [-barW / 2, barW / 2]) {
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        particles.push({ x: c + dx + rand(-0.004, 0.004), y: lerp(topY, bendY, t), radius: rand(0.4, 0.7), color: bodyDark, opacity: rand(0.7, 1.0) });
      }
    }
  }

  // Red pole (left top) with "N"
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: lc + rand(-barW / 2, barW / 2), y: topY + rand(-0.01, 0.08),
      radius: rand(0.6, 1.3), color: Math.random() > 0.3 ? poleRed : poleRedLight, opacity: rand(0.7, 1.0),
    });
  }

  // Blue pole (right top) with "S"
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: rc + rand(-barW / 2, barW / 2), y: topY + rand(-0.01, 0.08),
      radius: rand(0.6, 1.3), color: Math.random() > 0.3 ? poleBlue : poleBlueLight, opacity: rand(0.7, 1.0),
    });
  }

  // Field lines arching between poles
  for (let arc = 0; arc < 3; arc++) {
    const arcR = 0.12 + arc * 0.07;
    const numDots = 12 + arc * 4;
    for (let i = 0; i <= numDots; i++) {
      const angle = Math.PI + Math.PI * (i / numDots);
      particles.push({
        x: cx + arcR * Math.cos(angle) * 2.1,
        y: topY - 0.02 + arcR * Math.sin(angle) * 0.65,
        radius: rand(0.25, 0.5),
        color: fieldLine,
        opacity: rand(0.15, 0.4) - arc * 0.06,
      });
    }
  }

  return particles;
}

/* ─── Speaker: megaphone/speaker with sound waves ─────────────────── */

function generateSpeakerParticles(): RawParticle[] {
  const particles: RawParticle[] = [];

  // Speaker body — wider trapezoid
  const backX = 0.06;
  const mouthX = 0.36;
  const topNarrow = 0.34;
  const bottomNarrow = 0.66;
  const topWide = 0.14;
  const bottomWide = 0.86;

  const bodyDark = "#6D28D9";
  const bodyMid = "#7C3AED";
  const bodyLight = "#A78BFA";
  const highlight = "#C4B5FD";
  const wavePrimary = "#8B5CF6";
  const waveFaint = "#C4B5FD";
  const waveGhost = "#DDD6FE";

  // Dense body fill
  for (let i = 0; i < 200; i++) {
    const tx = rand(0, 1);
    const x = lerp(backX, mouthX, tx);
    const topAtX = lerp(topNarrow, topWide, tx);
    const botAtX = lerp(bottomNarrow, bottomWide, tx);
    const y = rand(topAtX, botAtX);
    const edge = Math.min((y - topAtX) / (botAtX - topAtX), 1 - (y - topAtX) / (botAtX - topAtX));

    // Gradient: lighter top-left, darker bottom-right
    let color: string;
    if (tx < 0.3 && y < 0.5) color = highlight;
    else if (edge > 0.3) color = bodyLight;
    else color = bodyMid;

    particles.push({ x, y, radius: rand(0.6, 1.5) + edge * 0.4, color, opacity: rand(0.5, 0.9) });
  }

  // Edges
  const bodyEdge = (ax: number, ay: number, bx: number, by: number, count: number) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      particles.push({
        x: lerp(ax, bx, t) + rand(-0.005, 0.005),
        y: lerp(ay, by, t) + rand(-0.005, 0.005),
        radius: rand(0.4, 0.7), color: bodyDark, opacity: rand(0.7, 1.0),
      });
    }
  };
  bodyEdge(backX, topNarrow, backX, bottomNarrow, 10);
  bodyEdge(mouthX, topWide, mouthX, bottomWide, 16);
  bodyEdge(backX, topNarrow, mouthX, topWide, 10);
  bodyEdge(backX, bottomNarrow, mouthX, bottomWide, 10);

  // Speaker cone (circular detail at mouth)
  for (let ring = 0; ring < 3; ring++) {
    const r = 0.03 + ring * 0.03;
    const n = 10 + ring * 6;
    for (let i = 0; i < n; i++) {
      const angle = rand(0, Math.PI * 2);
      particles.push({
        x: mouthX + r * Math.cos(angle) * 0.5,
        y: 0.5 + r * Math.sin(angle),
        radius: rand(0.3, 0.6),
        color: ring === 0 ? bodyDark : highlight,
        opacity: rand(0.4, 0.8),
      });
    }
  }

  // Sound waves — 4 arcs
  const wcx = mouthX + 0.08;
  const wcy = 0.5;

  for (let wave = 0; wave < 4; wave++) {
    const radius = 0.1 + wave * 0.1;
    const arcSpan = 0.55 + wave * 0.05;
    const numDots = 16 + wave * 5;
    const fadeOut = 1 - wave * 0.2;

    for (let i = 0; i <= numDots; i++) {
      const t = i / numDots;
      const angle = -arcSpan + t * (arcSpan * 2);
      particles.push({
        x: wcx + radius * Math.cos(angle),
        y: wcy + radius * Math.sin(angle),
        radius: rand(0.3, 0.8) * fadeOut,
        color: wave < 2 ? wavePrimary : wave < 3 ? waveFaint : waveGhost,
        opacity: rand(0.2, 0.55) * fadeOut,
      });
    }
  }

  return particles;
}

/* ─── Component ─────────────────────────────────────────────────────── */

export function ParticleIcon({ shape, className }: ParticleIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -999, y: -999, active: false });
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);
  const timeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initParticles = useCallback(() => {
    let raw: RawParticle[];
    switch (shape) {
      case "cone": raw = generateConeParticles(); break;
      case "magnet": raw = generateMagnetParticles(); break;
      case "speaker": raw = generateSpeakerParticles(); break;
      default: raw = generateConeParticles();
    }

    const pad = 14;
    const usable = CANVAS_SIZE - pad * 2;

    particlesRef.current = raw.map((rp) => {
      const x = pad + rp.x * usable;
      const y = pad + rp.y * usable;
      return {
        x, y, restX: x, restY: y, vx: 0, vy: 0,
        radius: rp.radius, color: rp.color, opacity: rp.opacity,
        phase: Math.random() * Math.PI * 2,
        driftAmp: rand(0.3, 0.8),
      };
    });
  }, [shape]);

  const playDing = useCallback(() => {
    if (shape !== "speaker") return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, [shape]);

  const getCanvasCoords = useCallback((clientX: number, clientY: number): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    return [clientX - rect.left, clientY - rect.top];
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = dprRef.current;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const time = timeRef.current;
    timeRef.current += 1;

    for (const p of particles) {
      // Idle drift: subtle sinusoidal movement when mouse is not active
      const driftX = !mouse.active ? Math.sin(time * 0.02 + p.phase) * p.driftAmp : 0;
      const driftY = !mouse.active ? Math.cos(time * 0.015 + p.phase * 1.3) * p.driftAmp : 0;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPULSION_RADIUS && dist > 0.1) {
          const force = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
      p.vx += ((p.restX + driftX) - p.x) * SPRING_STRENGTH;
      p.vy += ((p.restY + driftY) - p.y) * SPRING_STRENGTH;
      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx;
      p.y += p.vy;
    }

    for (const p of particles) {
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const [x, y] = getCanvasCoords(e.clientX, e.clientY);
    mouseRef.current = { x, y, active: true };
  }, [getCanvasCoords]);

  const handlePointerLeave = useCallback(() => { mouseRef.current.active = false; }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    initParticles();
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [initParticles, tick]);

  useEffect(() => {
    return () => { if (audioCtxRef.current) audioCtxRef.current.close(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("touch-none", shape === "speaker" && "cursor-pointer", className)}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={playDing}
    />
  );
}
