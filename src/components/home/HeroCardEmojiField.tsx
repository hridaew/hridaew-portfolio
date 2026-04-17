"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const G = 2380;
const MAX_PARTICLES = 7;
/** Half of the 40px emoji box — physics uses center coordinates. */
const RAD = 20;
const MAX_DT = 1 / 45;

type Particle = {
  el: HTMLSpanElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  born: number;
};

export type HeroEmojiFieldHandle = {
  spawnFromCard: (
    cardEl: HTMLElement,
    emoji: string,
    opts: { cardTopBounce: boolean },
  ) => void;
};

function mountParticle(root: HTMLDivElement, emoji: string): Particle {
  const el = document.createElement("span");
  el.textContent = emoji;
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    "width:40px",
    "height:40px",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "font-size:28px",
    "line-height:1",
    "will-change:transform",
    "user-select:none",
    "pointer-events:none",
    "filter:drop-shadow(0 2px 7px rgba(0,0,0,0.38))",
  ].join(";");
  root.appendChild(el);
  return {
    el,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: 0,
    vr: 0,
    born: performance.now(),
  };
}

function applyTransform(p: Particle) {
  p.el.style.transform = `translate3d(${p.x - RAD}px, ${p.y - RAD}px, 0) rotate(${p.rot}deg)`;
}

export const HeroEmojiField = forwardRef<
  HeroEmojiFieldHandle,
  { reduceMotion: boolean }
>(function HeroEmojiField({ reduceMotion }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const lastTRef = useRef(0);
  const runningRef = useRef(false);
  const cardTopBounceRef = useRef(false);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    runningRef.current = false;
    lastTRef.current = 0;
  }, []);

  const step = useCallback((now: number) => {
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

      if (p.x - RAD < -60 || p.x - RAD > window.innerWidth + 80) {
        p.vx *= -0.35;
        p.x = Math.max(RAD + 4, Math.min(window.innerWidth - RAD - 4, p.x));
      }

      applyTransform(p);

      const age = now - p.born;
      if (age > 9800 || (age > 4200 && Math.abs(p.vx) < 8 && Math.abs(p.vy) < 8)) {
        root.removeChild(p.el);
        parts.splice(i, 1);
      }
    }

    if (parts.length === 0) {
      stopLoop();
      return;
    }

    rafRef.current = requestAnimationFrame(step);
  }, [stopLoop]);

  const ensureLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTRef.current = 0;
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const spawnFromCard = useCallback(
    (cardEl: HTMLElement, emoji: string, opts: { cardTopBounce: boolean }) => {
      if (reduceMotion) return;
      const root = rootRef.current;
      if (!root) return;

      cardTopBounceRef.current = opts.cardTopBounce;

      const parts = particlesRef.current;
      while (parts.length >= MAX_PARTICLES) {
        const old = parts.shift();
        if (old?.el.parentNode === root) root.removeChild(old.el);
      }

      const cr = cardEl.getBoundingClientRect();
      const p = mountParticle(root, emoji);
      p.x = cr.right - 10 + Math.random() * 6;
      p.y = cr.top + cr.height * (0.26 + Math.random() * 0.42);
      p.vx = 380 + Math.random() * 260;
      p.vy = -(300 + Math.random() * 260);
      p.vr = (Math.random() - 0.5) * 7.5;
      p.born = performance.now();
      applyTransform(p);
      parts.push(p);
      ensureLoop();
    },
    [ensureLoop, reduceMotion],
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
      className="pointer-events-none fixed inset-0 z-[86] overflow-hidden"
      aria-hidden
    />
  );
});
