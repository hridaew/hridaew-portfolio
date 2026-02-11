"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ConePlaygroundProps {
  className?: string;
}

/* ─── Types ─────────────────────────────────────────────────────────── */

interface Cone {
  id: number;
  x: number;
  y: number;
  // spring animation
  scale: number;
  targetScale: number;
  velocity: number;
  // visual
  glowOpacity: number;
  settled: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

interface DragState {
  coneId: number | null;
  offsetX: number;
  offsetY: number;
}

/* ─── Constants ─────────────────────────────────────────────────────── */

const MAX_CONES = 2;
const CONE_RADIUS = 18;
const CONE_HIT_RADIUS = 26;
const SPRING_STIFFNESS = 0.15;
const SPRING_DAMPING = 0.7;
const PARTICLE_COUNT = 6;
const GRID_SPACING = 40;
const CALIBRATION_FADE_SPEED = 0.02;

const COLORS = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  primaryGlow: "rgba(124, 58, 237, 0.25)",
  particleColors: ["#7C3AED", "#A78BFA", "#C4B5FD", "#8B5CF6"],
  gridLine: "rgba(0, 0, 0, 0.04)",
  calibrationLine: "#7C3AED",
};

/* ─── Furniture (normalized 0-1 coordinates) ────────────────────────── */

const FURNITURE = [
  { x: 0.03, y: 0.06, w: 0.28, h: 0.13, label: "Couch", r: 8 },
  { x: 0.72, y: 0.68, w: 0.16, h: 0.16, label: "Table", r: 4 },
  { x: 0.78, y: 0.06, w: 0.19, h: 0.09, label: "Shelf", r: 6 },
  { x: 0.02, y: 0.78, w: 0.14, h: 0.18, label: "Plant", r: 10 },
];

/* ─── Component ─────────────────────────────────────────────────────── */

export function ConePlayground({ className }: ConePlaygroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const conesRef = useRef<Cone[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const dragRef = useRef<DragState>({ coneId: null, offsetX: 0, offsetY: 0 });
  const nextIdRef = useRef(0);
  const rafRef = useRef<number>(0);
  const calibrationOpacityRef = useRef(0);
  const calibrationPulseRef = useRef(0);
  const labelStateRef = useRef<"placing" | "calibrated">("placing");
  const labelFadeRef = useRef(0);
  const dprRef = useRef(1);
  const lastClickTimeRef = useRef(0);
  const lastClickConeRef = useRef<number | null>(null);

  /* ─── Helpers ───────────────────────────────────────────────────── */

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];
      const rect = canvas.getBoundingClientRect();
      return [clientX - rect.left, clientY - rect.top];
    },
    []
  );

  const findConeAt = useCallback(
    (x: number, y: number): Cone | null => {
      const cones = conesRef.current;
      // Check in reverse so topmost cone is picked first
      for (let i = cones.length - 1; i >= 0; i--) {
        const c = cones[i];
        const dx = c.x - x;
        const dy = c.y - y;
        if (dx * dx + dy * dy <= CONE_HIT_RADIUS * CONE_HIT_RADIUS) {
          return c;
        }
      }
      return null;
    },
    []
  );

  const spawnParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.4,
        radius: 2 + Math.random() * 3,
        color: COLORS.particleColors[Math.floor(Math.random() * COLORS.particleColors.length)],
      });
    }
  }, []);

  const placeCone = useCallback(
    (x: number, y: number) => {
      if (conesRef.current.length >= MAX_CONES) return;
      const cone: Cone = {
        id: nextIdRef.current++,
        x,
        y,
        scale: 0,
        targetScale: 1,
        velocity: 0,
        glowOpacity: 1,
        settled: false,
      };
      conesRef.current.push(cone);
      spawnParticles(x, y);
    },
    [spawnParticles]
  );

  const removeCone = useCallback((id: number) => {
    conesRef.current = conesRef.current.filter((c) => c.id !== id);
  }, []);

  const resetAll = useCallback(() => {
    conesRef.current = [];
    particlesRef.current = [];
    calibrationOpacityRef.current = 0;
    labelStateRef.current = "placing";
    labelFadeRef.current = 0;
  }, []);

  /* ─── Drawing ───────────────────────────────────────────────────── */

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      // Perspective-ish grid: horizontal lines get slightly closer together toward top
      for (let y = 0; y < h; y += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    },
    []
  );

  const drawFurniture = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      for (const f of FURNITURE) {
        const fx = f.x * w;
        const fy = f.y * h;
        const fw = f.w * w;
        const fh = f.h * h;

        // Semi-transparent fill
        ctx.fillStyle = "rgba(0, 0, 0, 0.035)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, f.r);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.font = "10px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(f.label, fx + fw / 2, fy + fh / 2);
      }
    },
    []
  );

  const drawCone = useCallback(
    (ctx: CanvasRenderingContext2D, cone: Cone) => {
      const { x, y, scale, glowOpacity } = cone;
      if (scale <= 0.01) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Glow / shadow
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, CONE_RADIUS * 2.5);
      glowGrad.addColorStop(0, `rgba(124, 58, 237, ${0.18 * glowOpacity})`);
      glowGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, CONE_RADIUS * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring (shadow)
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.arc(1, 2, CONE_RADIUS + 2, 0, Math.PI * 2);
      ctx.fill();

      // Main cone body — gradient circle
      const coneGrad = ctx.createRadialGradient(
        -CONE_RADIUS * 0.3,
        -CONE_RADIUS * 0.3,
        0,
        0,
        0,
        CONE_RADIUS
      );
      coneGrad.addColorStop(0, COLORS.primaryLight);
      coneGrad.addColorStop(1, COLORS.primary);
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.arc(0, 0, CONE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight — cone tip illusion
      const tipGrad = ctx.createRadialGradient(
        -CONE_RADIUS * 0.15,
        -CONE_RADIUS * 0.15,
        0,
        0,
        0,
        CONE_RADIUS * 0.45
      );
      tipGrad.addColorStop(0, "rgba(255,255,255,0.45)");
      tipGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = tipGrad;
      ctx.beginPath();
      ctx.arc(0, 0, CONE_RADIUS * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = "rgba(124, 58, 237, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, CONE_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  const drawCalibrationLines = useCallback(
    (ctx: CanvasRenderingContext2D, cones: Cone[], opacity: number, pulse: number) => {
      if (cones.length < MAX_CONES || opacity <= 0) return;

      const lineOpacity = opacity * (0.5 + 0.3 * Math.sin(pulse));

      // 2 cones define diagonally opposite corners of a rectangle
      const minX = Math.min(cones[0].x, cones[1].x);
      const minY = Math.min(cones[0].y, cones[1].y);
      const maxX = Math.max(cones[0].x, cones[1].x);
      const maxY = Math.max(cones[0].y, cones[1].y);
      const rectW = maxX - minX;
      const rectH = maxY - minY;

      ctx.save();

      // Fill the zone with a subtle tint
      ctx.globalAlpha = opacity * 0.06;
      ctx.fillStyle = COLORS.calibrationLine;
      ctx.fillRect(minX, minY, rectW, rectH);

      // Dashed rectangle border
      ctx.strokeStyle = COLORS.calibrationLine;
      ctx.lineWidth = 2;
      ctx.globalAlpha = lineOpacity;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(minX, minY, rectW, rectH);

      // Draw small dots at all 4 corners of the rectangle
      ctx.setLineDash([]);
      ctx.fillStyle = COLORS.primary;
      const corners = [
        [minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY],
      ];
      for (const [cx, cy] of corners) {
        ctx.globalAlpha = opacity * 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Brighter dots on the actual cone positions
      ctx.globalAlpha = opacity * 0.7;
      for (const c of cones) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
    []
  );

  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    []
  );

  /* ─── Main Loop ─────────────────────────────────────────────────── */

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

    // Clear with floor gradient
    const floorGrad = ctx.createLinearGradient(0, 0, 0, h);
    floorGrad.addColorStop(0, "#f5f5f5"); // neutral-100
    floorGrad.addColorStop(1, "#e5e5e5"); // neutral-200
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid
    drawGrid(ctx, w, h);

    // Furniture obstacles
    drawFurniture(ctx, w, h);

    const cones = conesRef.current;
    const particles = particlesRef.current;

    // Update cone spring physics
    for (const cone of cones) {
      if (!cone.settled) {
        const displacement = cone.targetScale - cone.scale;
        const springForce = displacement * SPRING_STIFFNESS;
        cone.velocity += springForce;
        cone.velocity *= SPRING_DAMPING;
        cone.scale += cone.velocity;

        // Settle detection
        if (
          Math.abs(cone.velocity) < 0.001 &&
          Math.abs(cone.scale - cone.targetScale) < 0.001
        ) {
          cone.scale = cone.targetScale;
          cone.velocity = 0;
          cone.settled = true;
        }

        // Glow fades as it settles
        cone.glowOpacity = Math.max(0.3, 1 - (cone.scale / cone.targetScale) * 0.7);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= 1 / (60 * p.maxLife);
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Calibration state
    const isCalibrated = cones.length === MAX_CONES;
    if (isCalibrated) {
      calibrationOpacityRef.current = Math.min(
        1,
        calibrationOpacityRef.current + CALIBRATION_FADE_SPEED
      );
      calibrationPulseRef.current += 0.03;
    } else {
      calibrationOpacityRef.current = Math.max(
        0,
        calibrationOpacityRef.current - CALIBRATION_FADE_SPEED * 2
      );
    }

    // Update label state for React rendering
    const newState = isCalibrated ? "calibrated" : "placing";
    if (newState !== labelStateRef.current) {
      labelStateRef.current = newState;
      labelFadeRef.current = 0;
    }
    labelFadeRef.current = Math.min(1, labelFadeRef.current + 0.03);

    // Draw calibration lines (behind cones)
    drawCalibrationLines(
      ctx,
      cones,
      calibrationOpacityRef.current,
      calibrationPulseRef.current
    );

    // Draw particles (behind cones)
    drawParticles(ctx, particles);

    // Draw cones
    for (const cone of cones) {
      drawCone(ctx, cone);
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(tick);
  }, [drawGrid, drawFurniture, drawCone, drawCalibrationLines, drawParticles]);

  /* ─── Resize ────────────────────────────────────────────────────── */

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  /* ─── Pointer Events ────────────────────────────────────────────── */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const [x, y] = getCanvasCoords(e.clientX, e.clientY);
      const cone = findConeAt(x, y);

      const now = Date.now();

      // Double-click detection (< 350ms)
      if (
        cone &&
        now - lastClickTimeRef.current < 350 &&
        lastClickConeRef.current === cone.id
      ) {
        removeCone(cone.id);
        lastClickTimeRef.current = 0;
        lastClickConeRef.current = null;
        return;
      }

      lastClickTimeRef.current = now;
      lastClickConeRef.current = cone ? cone.id : null;

      if (cone) {
        // Start drag
        dragRef.current = {
          coneId: cone.id,
          offsetX: cone.x - x,
          offsetY: cone.y - y,
        };
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      } else {
        // Place new cone
        placeCone(x, y);
      }
    },
    [getCanvasCoords, findConeAt, placeCone, removeCone]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (drag.coneId === null) return;

      const [x, y] = getCanvasCoords(e.clientX, e.clientY);
      const cone = conesRef.current.find((c) => c.id === drag.coneId);
      if (cone) {
        cone.x = x + drag.offsetX;
        cone.y = y + drag.offsetY;
      }
    },
    [getCanvasCoords]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = { coneId: null, offsetX: 0, offsetY: 0 };
  }, []);

  /* ─── Lifecycle ─────────────────────────────────────────────────── */

  useEffect(() => {
    resizeCanvas();
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [resizeCanvas, tick]);

  /* ─── Render ────────────────────────────────────────────────────── */

  const coneCount = conesRef.current.length;
  const isCalibrated = coneCount >= MAX_CONES;

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-neutral-50 rounded-2xl border border-neutral-200/60 overflow-hidden">
        {/* Header label */}
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="font-[family-name:var(--font-dm-sans)] text-sm">
            {isCalibrated ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="inline-block"
                >
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M5 8.5L7 10.5L11 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Calibration complete
              </span>
            ) : (
              <span className="text-neutral-500">
                Tap to place cones
                <span className="text-neutral-400 ml-1.5">
                  ({coneCount}/{MAX_CONES})
                </span>
              </span>
            )}
          </div>
          <button
            onClick={resetAll}
            className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400
                       hover:text-neutral-600 transition-colors px-2.5 py-1 rounded-md
                       hover:bg-neutral-100 cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="relative w-full"
          style={{ height: "min(60vw, 500px)" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 font-[family-name:var(--font-dm-sans)]">
          <p className="text-neutral-400 text-xs text-center">
            {isCalibrated
              ? "Double-click a cone to remove it. Drag to reposition."
              : "Place 2 cones at opposite corners to define your workout zone. Drag to move, double-click to remove."}
          </p>
        </div>
      </div>
    </div>
  );
}
