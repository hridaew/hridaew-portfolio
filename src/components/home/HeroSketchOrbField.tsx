"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { animate } from "framer-motion";
import {
  burstBezierPoint,
  createBurstParticleSpecs,
  HERO_BURST_DURATION_S,
  HERO_BURST_EASE,
} from "@/lib/burstBezier";

const G = 2380;
const MAX_ORBS = 7;
const ORB_PX = 100;
/** Half of orb diameter — physics uses center coordinates. */
const RAD = ORB_PX / 2;
const MAX_DT = 1 / 45;
/** Hard cap before an orb is removed (ms). */
const ORB_MAX_LIFETIME_MS = 120_000;
/**
 * If the orb has barely moved for this long, treat it as settled and remove
 * (avoids infinite idle orbs).
 */
const ORB_SETTLE_MIN_AGE_MS = 90_000;
const ORB_SETTLE_VX = 12;
const ORB_SETTLE_VY = 12;
/** How far past the viewport (px) the orb may go before a side bounce — same both sides. */
const ORB_SIDE_OUTSIDE = 60;
/** After bounce, keep orb center at least this far inside the viewport (CSS px). */
const ORB_SIDE_CLAMP = 4;
/** Movement past this (px) from pointerdown starts a drag (tap pop uses smaller slop on release). */
const ORB_DRAG_START_PX = 10;
/** Max pointer travel from down for a gesture to still count as a tap-to-pop (px). */
const ORB_TAP_SLOP = 14;
/** Scales pointer velocity (px/s) into throw speed. */
const ORB_THROW_STRENGTH = 0.48;
const ORB_THROW_VX_CAP = 920;
const ORB_THROW_VY_CAP = 1280;

let orbIdSeq = 0;

type OrbParticle = {
  id: number;
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  born: number;
  /** When true, rAF physics skips integration; position is driven by pointer handlers. */
  dragging: boolean;
};

export type HeroSketchOrbFieldHandle = {
  spawnFromCard: (
    cardEl: HTMLElement,
    imageSrc: string,
    opts: { cardTopBounce: boolean },
  ) => void;
};

function applyTransform(p: OrbParticle) {
  p.el.style.transform = `translate3d(${p.x - RAD}px, ${p.y - RAD}px, 0) rotate(${p.rot}deg)`;
}

function spawnOrbBurst(
  root: HTMLDivElement,
  cx: number,
  cy: number,
  reduceMotion: boolean,
) {
  if (reduceMotion) return;
  const specs = createBurstParticleSpecs();
  for (const p of specs) {
    const el = document.createElement("span");
    const s = p.size;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = [
      "position:absolute",
      "left:0",
      "top:0",
      `width:${s}px`,
      `height:${s}px`,
      "border-radius:999px",
      "pointer-events:none",
      `background-color:${p.color}`,
      "box-shadow:0 0 6px rgba(255,255,255,0.28)",
      "will-change:transform,opacity",
    ].join(";");
    root.appendChild(el);

    animate(0, 1, {
      duration: HERO_BURST_DURATION_S,
      ease: HERO_BURST_EASE,
      onUpdate: (t) => {
        const pt = burstBezierPoint(
          p.angle,
          p.dist,
          p.arch,
          p.archSign,
          t,
        );
        let opacity = 1;
        if (t >= 0.74) {
          const k = (t - 0.74) / 0.26;
          opacity = Math.max(0, 1 - k);
        }
        let sc = 1;
        if (t >= 0.74) {
          const k = (t - 0.74) / 0.26;
          sc = Math.max(0.04, 1 - 0.94 * k);
        }
        el.style.opacity = String(opacity);
        el.style.transform = `translate3d(${cx + pt.x - s / 2}px,${cy + pt.y - s / 2}px,0) scale(${sc})`;
      },
      onComplete: () => {
        el.remove();
      },
    });
  }
}

function clampOrbPosition(
  x: number,
  y: number,
  viewportW: number,
  floorY: number,
): { x: number; y: number } {
  const minX = RAD + ORB_SIDE_CLAMP;
  const maxX = viewportW - RAD - ORB_SIDE_CLAMP;
  const minY = RAD + ORB_SIDE_CLAMP;
  const maxY = floorY - RAD - ORB_SIDE_CLAMP;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

function mountOrb(
  root: HTMLDivElement,
  imageSrc: string,
  opts: {
    getParticle: () => OrbParticle | undefined;
    onTapPop: () => void;
  },
): HTMLDivElement {
  const { getParticle, onTapPop } = opts;
  const noSelect =
    "user-select:none;-webkit-user-select:none;-moz-user-select:none";
  const wrap = document.createElement("div");
  wrap.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    `width:${ORB_PX}px`,
    `height:${ORB_PX}px`,
    "cursor:grab",
    "touch-action:manipulation",
    "z-index:2",
    "pointer-events:auto",
    noSelect,
  ].join(";");

  const glass = document.createElement("div");
  glass.style.cssText = [
    "position:absolute",
    "inset:0",
    "border-radius:50%",
    "overflow:hidden",
    "box-shadow:0 14px 32px rgba(0,0,0,0.48),inset 0 1px 0 rgba(255,255,255,0.5),inset 0 -14px 28px rgba(0,0,0,0.3)",
    "border:1px solid rgba(255,255,255,0.2)",
    noSelect,
  ].join(";");

  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = "";
  img.draggable = false;
  img.style.cssText = [
    "width:100%",
    "height:100%",
    "object-fit:cover",
    "display:block",
    "pointer-events:none",
    noSelect,
    "-webkit-user-drag:none",
  ].join(";");

  const shade = document.createElement("div");
  shade.style.cssText = [
    "pointer-events:none",
    "position:absolute",
    "inset:0",
    "border-radius:50%",
    "background:linear-gradient(148deg,rgba(255,255,255,0.42) 0%,transparent 40%,rgba(0,0,0,0.26) 100%)",
    noSelect,
  ].join(";");

  const spec = document.createElement("div");
  spec.style.cssText = [
    "pointer-events:none",
    "position:absolute",
    "top:-20%",
    "left:16%",
    "width:58%",
    "height:44%",
    "border-radius:999px",
    "background:rgba(255,255,255,0.24)",
    "filter:blur(14px)",
    "opacity:0.9",
    noSelect,
  ].join(";");

  glass.appendChild(img);
  glass.appendChild(shade);
  glass.appendChild(spec);
  wrap.appendChild(glass);

  let gesturePointerId: number | null = null;

  wrap.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (gesturePointerId !== null) return;
    e.preventDefault();
    e.stopPropagation();

    const pointerId = e.pointerId;
    gesturePointerId = pointerId;
    const prevDocUserSelect = document.documentElement.style.userSelect;
    const prevBodyUserSelect = document.body.style.userSelect;
    document.documentElement.style.userSelect = "none";
    document.body.style.userSelect = "none";
    const onSelectStart = (ev: Event) => {
      ev.preventDefault();
    };
    document.addEventListener("selectstart", onSelectStart);
    const downX = e.clientX;
    const downY = e.clientY;
    let grabDx = 0;
    let grabDy = 0;
    let dragging = false;
    let lastX = e.clientX;
    let lastY = e.clientY;
    let lastT = e.timeStamp;
    let velX = 0;
    let velY = 0;

    const endGesture = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("selectstart", onSelectStart);
      document.documentElement.style.userSelect = prevDocUserSelect;
      document.body.style.userSelect = prevBodyUserSelect;
      gesturePointerId = null;
      wrap.style.cursor = "grab";
      wrap.style.touchAction = "manipulation";
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const p = getParticle();
      if (!p) {
        endGesture();
        return;
      }

      const travel = Math.hypot(ev.clientX - downX, ev.clientY - downY);
      if (!dragging && travel > ORB_DRAG_START_PX) {
        dragging = true;
        p.dragging = true;
        grabDx = p.x - ev.clientX;
        grabDy = p.y - ev.clientY;
        wrap.style.cursor = "grabbing";
        wrap.style.touchAction = "none";
        if (typeof window.getSelection === "function") {
          window.getSelection()?.removeAllRanges();
        }
        lastX = ev.clientX;
        lastY = ev.clientY;
        lastT = ev.timeStamp;
        velX = 0;
        velY = 0;
      }

      if (dragging) {
        ev.preventDefault();
        const viewportW = Math.min(
          window.innerWidth,
          document.documentElement?.clientWidth ?? window.innerWidth,
        );
        const floorY = window.innerHeight - 26;
        const next = clampOrbPosition(
          ev.clientX + grabDx,
          ev.clientY + grabDy,
          viewportW,
          floorY,
        );
        p.x = next.x;
        p.y = next.y;

        const dtm = ev.timeStamp - lastT;
        if (dtm > 0 && dtm < 120) {
          const ix = ((ev.clientX - lastX) / dtm) * 1000;
          const iy = ((ev.clientY - lastY) / dtm) * 1000;
          velX = velX * 0.62 + ix * 0.38;
          velY = velY * 0.62 + iy * 0.38;
        }
        lastX = ev.clientX;
        lastY = ev.clientY;
        lastT = ev.timeStamp;
        applyTransform(p);
      }
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      endGesture();
      const p = getParticle();
      if (!p) return;

      if (dragging) {
        p.dragging = false;
        p.vx = Math.max(
          -ORB_THROW_VX_CAP,
          Math.min(ORB_THROW_VX_CAP, velX * ORB_THROW_STRENGTH),
        );
        p.vy = Math.max(
          -ORB_THROW_VY_CAP,
          Math.min(ORB_THROW_VY_CAP, velY * ORB_THROW_STRENGTH),
        );
        p.vr += (ev.clientX - downX) * -0.012;
        applyTransform(p);
        return;
      }

      if (
        (ev.button === 0 || ev.pointerType !== "mouse") &&
        Math.hypot(ev.clientX - downX, ev.clientY - downY) <= ORB_TAP_SLOP
      ) {
        ev.stopPropagation();
        onTapPop();
      }
    };

    document.addEventListener("pointermove", onMove, { passive: false });
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  });

  root.appendChild(wrap);
  return wrap;
}

export const HeroSketchOrbField = forwardRef<
  HeroSketchOrbFieldHandle,
  { reduceMotion: boolean }
>(function HeroSketchOrbField({ reduceMotion }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<OrbParticle[]>([]);
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const runningRef = useRef(false);
  const cardTopBounceRef = useRef(false);
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    runningRef.current = false;
    lastTRef.current = 0;
  }, []);

  const removeOrbById = useCallback(
    (id: number) => {
      const root = rootRef.current;
      if (!root) return;
      const parts = particlesRef.current;
      const i = parts.findIndex((p) => p.id === id);
      if (i < 0) return;
      const p = parts[i]!;
      const cx = p.x;
      const cy = p.y;
      spawnOrbBurst(root, cx, cy, reduceMotionRef.current);
      if (p.el.parentNode === root) root.removeChild(p.el);
      parts.splice(i, 1);
      if (parts.length === 0) stopLoop();
    },
    [stopLoop],
  );

  const step = useCallback(
    (now: number) => {
      const root = rootRef.current;
      if (!root) {
        stopLoop();
        return;
      }

      const last = lastTRef.current || now;
      let dt = (now - last) / 1000;
      lastTRef.current = now;
      if (dt <= 0) dt = MAX_DT;
      else if (dt > MAX_DT) dt = MAX_DT;

      const floorY = window.innerHeight - 26;
      /** Match visible width (excludes vertical scrollbar) so L/R walls align with what you see. */
      const viewportW = Math.min(
        window.innerWidth,
        document.documentElement?.clientWidth ?? window.innerWidth,
      );
      const workEl = document.querySelector("[data-home-work-section]");
      const wr = workEl?.getBoundingClientRect();

      const shell = document.querySelector("[data-testid='hero-card-shell']");
      const glassEl =
        shell?.firstElementChild instanceof HTMLElement
          ? shell.firstElementChild
          : null;
      const cr = glassEl?.getBoundingClientRect();
      const cardBounce = cardTopBounceRef.current && cr && cr.height > 0;

      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!;
        if (!p.dragging) {
          p.vy += G * dt;
          p.vx *= 0.999 ** (dt * 60);
          p.vy *= 0.9995 ** (dt * 60);
          p.rot += p.vr * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (cardBounce && cr) {
            const lidTop = cr.top;
            const lidBottom = cr.top + 26;
            const pad = 14;
            if (
              p.vy > 0 &&
              p.y + RAD > lidTop &&
              p.y - RAD < lidBottom &&
              p.x > cr.left - pad &&
              p.x < cr.right + pad
            ) {
              p.y = lidTop - RAD;
              p.vy = -Math.abs(p.vy) * 0.44;
              p.vx *= 0.86;
              p.vr *= 0.82;
            }
          }

          if (wr && p.vy > 40) {
            const padX = 20;
            if (
              p.x + RAD > wr.left - padX &&
              p.x - RAD < wr.right + padX &&
              p.y + RAD > wr.top &&
              p.y - RAD < wr.top + 36
            ) {
              p.y = wr.top - RAD;
              p.vy = -Math.abs(p.vy) * 0.38;
              p.vx *= 0.84;
              p.vr *= 0.78;
            }
          }

          if (p.y + RAD > floorY) {
            p.y = floorY - RAD;
            p.vy = -Math.abs(p.vy) * 0.46;
            p.vx *= 0.88;
            p.vr *= 0.85;
            if (Math.abs(p.vy) < 95) p.vy = 0;
          }

          if (
            p.x - RAD < -ORB_SIDE_OUTSIDE ||
            p.x + RAD > viewportW + ORB_SIDE_OUTSIDE
          ) {
            p.vx *= -0.35;
            p.x = Math.max(
              RAD + ORB_SIDE_CLAMP,
              Math.min(viewportW - RAD - ORB_SIDE_CLAMP, p.x),
            );
          }
        }

        applyTransform(p);

        const age = now - p.born;
        if (
          age > ORB_MAX_LIFETIME_MS ||
          (age > ORB_SETTLE_MIN_AGE_MS &&
            Math.abs(p.vx) < ORB_SETTLE_VX &&
            Math.abs(p.vy) < ORB_SETTLE_VY)
        ) {
          if (p.el.parentNode === root) root.removeChild(p.el);
          parts.splice(i, 1);
        }
      }

      if (parts.length === 0) {
        stopLoop();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [stopLoop],
  );

  const ensureLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTRef.current = 0;
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const spawnFromCard = useCallback(
    (cardEl: HTMLElement, imageSrc: string, opts: { cardTopBounce: boolean }) => {
      if (reduceMotion) return;
      const root = rootRef.current;
      if (!root) return;

      cardTopBounceRef.current = opts.cardTopBounce;

      const parts = particlesRef.current;
      while (parts.length >= MAX_ORBS) {
        const old = parts.shift();
        if (old?.el.parentNode === root) root.removeChild(old.el);
      }

      const id = ++orbIdSeq;
      const cr = cardEl.getBoundingClientRect();

      const el = mountOrb(root, imageSrc, {
        getParticle: () => particlesRef.current.find((q) => q.id === id),
        onTapPop: () => {
          removeOrbById(id);
        },
      });

      const p: OrbParticle = {
        id,
        el,
        x: cr.right - 10 + Math.random() * 6,
        y: cr.top + cr.height * (0.26 + Math.random() * 0.42),
        vx: 380 + Math.random() * 260,
        vy: -(300 + Math.random() * 260),
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        born: performance.now(),
        dragging: false,
      };
      applyTransform(p);
      parts.push(p);
      ensureLoop();
    },
    [ensureLoop, reduceMotion, removeOrbById],
  );

  useImperativeHandle(ref, () => ({ spawnFromCard }), [spawnFromCard]);

  useEffect(
    () => () => {
      stopLoop();
      const root = rootRef.current;
      if (!root) return;
      for (const p of particlesRef.current) {
        if (p.el.parentNode === root) root.removeChild(p.el);
      }
      particlesRef.current = [];
    },
    [stopLoop],
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[86] overflow-hidden select-none"
      aria-hidden
    />
  );
});
