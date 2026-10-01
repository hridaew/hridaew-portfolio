"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Lightbulb, LightbulbOff } from "lucide-react";
import { ProjectLink } from "../shared/ProjectLink";
import { useCopyEmail } from "../shared/useCopyEmail";
import { useRootBackground } from "../shared/useRootBackground";
import { BIO, PROJECTS, WAFFLINGS } from "../shared/work";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import "./gaze.css";

/* ── The archive ─────────────────────────────────────────────────────
 * 16 frames, art-directed on a 12-column grid (desktop). `col` is a CSS
 * grid-column value; `dy` nudges the frame off the row line so the field
 * reads like prints scattered on a table rather than a gallery wall.
 */

type Frame = {
  id: string;
  href: string;
  label: string;
  src: string;
  w: number;
  h: number;
  alt: string;
  caption: string;
  col: string;
  dy: number;
};

const FRAMES: Frame[] = [
  { id: "f1", href: "/domis", label: "Domis", src: "/assets/domis/hero-mobile.png", w: 473, h: 1024, alt: "Domis home screen", caption: "Designed to log every detail while feeling light.", col: "2 / span 2", dy: 0 },
  { id: "f2", href: "/obscura", label: "OBSCURA", src: "/assets/obscura/wayne_crowd_scene.jpg", w: 2400, h: 2304, alt: "Crowd in post-war Japan, archival photograph", caption: "One of 300+ photographs of post-war Japan, unseen until 2025.", col: "5 / span 4", dy: 60 },
  { id: "f3", href: "/virdio", label: "Virdio", src: "/assets/virdio/in_context.png", w: 2066, h: 1096, alt: "Virdio AR workout in a living room", caption: "AR fitness for any space, no hardware.", col: "10 / span 3", dy: 140 },
  { id: "f4", href: "/memory-care", label: "Memory Care", src: "/assets/memory-care/cathero.png", w: 2073, h: 1181, alt: "Residents petting the haptic cat", caption: "Residents meeting the haptic cat I built.", col: "1 / span 4", dy: 40 },
  { id: "f5", href: "/domis", label: "Domis", src: "/assets/domis/live/home-avatar-3d.png", w: 512, h: 512, alt: "A 3D avatar of a house", caption: "A 3D avatar of your house, from one photo. +60% new-user engagement.", col: "6 / span 2", dy: 120 },
  { id: "f6", href: "/obscura", label: "OBSCURA", src: "/assets/obscura/exhibition_743gm1tgvfizndo7gwveqtjp584.webp", w: 1024, h: 768, alt: "OBSCURA vitrine at MOHAI", caption: "At MOHAI, 13 September 2025. Sold out.", col: "9 / span 3", dy: -20 },
  { id: "f7", href: "/virdio", label: "Virdio", src: "/assets/virdio/hero_ui.png", w: 1402, h: 786, alt: "Virdio workout telemetry", caption: "Telemetry you can read mid-squat.", col: "2 / span 4", dy: 30 },
  { id: "f8", href: "/obscura", label: "OBSCURA", src: "/assets/obscura/sketches/IMG_9519.jpg", w: 1730, h: 1526, alt: "Sketch of the immersed visitor and the audience", caption: "Early sketch: the immersed visitor, and the audience outside.", col: "7 / span 2", dy: 110 },
  { id: "f9", href: "/memory-care", label: "Memory Care", src: "/assets/memory-care/cat_arduino_wiring.jpg", w: 2400, h: 1800, alt: "Arduino wiring for the haptic cat", caption: "Sensors, an Arduino, and a lot of tape.", col: "10 / span 3", dy: 0 },
  { id: "f10", href: "/waffling/savor", label: "Savor", src: "/assets/savor/hero-poster.jpg", w: 1280, h: 720, alt: "Rodin's Mighty Hand as a Gaussian splat", caption: "Rodin’s Mighty Hand, from a phone video to a Gaussian splat.", col: "1 / span 3", dy: 70 },
  { id: "f11", href: "/domis", label: "Domis", src: "/assets/home/domis-card1-tasks-composite.png", w: 470, h: 700, alt: "Inspection report turning into tasks", caption: "A messy inspection PDF becomes a list of tasks.", col: "5 / span 2", dy: 0 },
  { id: "f12", href: "/obscura", label: "OBSCURA", src: "/assets/obscura/wayne_girl_kimono.jpg", w: 1992, h: 2862, alt: "Girl in a kimono, archival photograph", caption: "Your gaze decides which photograph comes next.", col: "8 / span 2", dy: 90 },
  { id: "f13", href: "/waffling/orca", label: "Saving Baby J", src: "/assets/orca/final-booth.jpg", w: 1600, h: 1200, alt: "The Saving Baby J arcade booth", caption: "An arcade game played by throwing orca plushies.", col: "10 / span 3", dy: 40 },
  { id: "f14", href: "/virdio", label: "Virdio", src: "/assets/virdio/sketch_setup.jpg", w: 1144, h: 1000, alt: "Sketch of the Virdio camera setup", caption: "Making calibration feel like a warm-up, not a scan.", col: "2 / span 3", dy: 20 },
  { id: "f15", href: "/obscura", label: "OBSCURA", src: "/assets/obscura/spectatorIMG.png", w: 1620, h: 1712, alt: "Audience watching the shared display", caption: "The audience watches what the visitor is looking at.", col: "6 / span 2", dy: 100 },
  { id: "f16", href: "/memory-care", label: "Memory Care", src: "/assets/memory-care/station_full.jpg", w: 2400, h: 1800, alt: "The Memory Care Experience Station", caption: "The station at SFCJL. 98% positive across 200+ sessions.", col: "9 / span 4", dy: 30 },
];

const DWELL_MS = 650;
const LENS_R = 230;
const RING_C = 2 * Math.PI * 19;

export function GazeHome() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Ordered list of developed frame ids — the visitor's own path.
  const [path, setPath] = useState<string[]>([]);
  const developedRef = useRef<Set<string>>(new Set());
  const [lightsOn, setLightsOn] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const { email, copied, copy } = useCopyEmail();
  useRootBackground("#0a0a0a");

  const develop = useCallback((id: string) => {
    if (developedRef.current.has(id)) return;
    developedRef.current.add(id);
    setPath((p) => [...p, id]);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouchMode(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Gaze loop: lens position, dwell timer, reticle. Refs only. */
  useEffect(() => {
    const field = fieldRef.current;
    const dark = darkRef.current;
    if (!field || !dark) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hoverless = window.matchMedia("(hover: none)").matches;

    const pointer = { x: -1, y: -1, inWindow: false };
    const lens = { x: 0, y: 0, r: 0 };
    const reticle = { x: 0, y: 0 };
    let dwellId: string | null = null;
    let dwellStart = 0;
    let visible = true;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inWindow = true;
    };
    const onLeave = () => {
      pointer.inWindow = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(field);

    function loop(now: number) {
      raf = 0;
      if (!visible) return;
      // Reads first…
      const fr = field!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Recomputed every frame so scrolling under a still cursor keeps working.
      const inside =
        pointer.inWindow &&
        pointer.x >= fr.left &&
        pointer.x <= fr.right &&
        pointer.y >= fr.top &&
        pointer.y <= fr.bottom;
      const gazing = hoverless || inside;
      const gx = hoverless ? vw / 2 : pointer.x;
      const gy = hoverless ? vh / 2 : pointer.y;

      let hit: string | null = null;
      if (gazing) {
        for (let i = 0; i < FRAMES.length; i++) {
          const el = tileRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (gx >= r.left && gx <= r.right && gy >= r.top && gy <= r.bottom) {
            hit = FRAMES[i].id;
            break;
          }
        }
      }

      // …then writes.
      const targetR = gazing ? (hoverless ? Math.min(vw * 0.48, LENS_R) : LENS_R) : 0;
      const k = reduce ? 1 : 0.2;
      lens.x += (gx - fr.left - lens.x) * k;
      lens.y += (gy - fr.top - lens.y) * k;
      lens.r += (targetR - lens.r) * (reduce ? 1 : 0.1);
      dark!.style.setProperty("--gx", `${lens.x.toFixed(1)}px`);
      dark!.style.setProperty("--gy", `${lens.y.toFixed(1)}px`);
      dark!.style.setProperty("--gr", `${lens.r.toFixed(1)}px`);

      if (hit !== dwellId) {
        dwellId = hit;
        dwellStart = now;
      }
      let progress = 0;
      if (dwellId && !developedRef.current.has(dwellId)) {
        progress = Math.min(1, (now - dwellStart) / DWELL_MS);
        if (progress >= 1) {
          develop(dwellId);
          reticleRef.current?.animate(
            [
              { boxShadow: "0 0 0 0 rgb(255 255 255 / 0.5)" },
              { boxShadow: "0 0 0 22px rgb(255 255 255 / 0)" },
            ],
            { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        }
      }

      const ret = reticleRef.current;
      if (ret) {
        const rx = hoverless ? vw / 2 : pointer.x;
        const ry = hoverless ? vh / 2 : pointer.y;
        reticle.x += (rx - reticle.x) * (reduce ? 1 : 0.35);
        reticle.y += (ry - reticle.y) * (reduce ? 1 : 0.35);
        ret.style.transform = `translate3d(${reticle.x}px, ${reticle.y}px, 0)`;
        ret.dataset.on = gazing ? "1" : "0";
        ret.dataset.dwell = progress > 0 ? "1" : "0";
      }
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = `${RING_C * (1 - progress)}`;
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [develop]);

  // Lights on: develop everything, in archive order, for the impatient.
  const toggleLights = () => {
    if (!lightsOn) FRAMES.forEach((f) => develop(f.id));
    setLightsOn(!lightsOn);
  };

  const developedCount = path.length;
  const pathFrames = path
    .map((id) => FRAMES.find((f) => f.id === id))
    .filter((f): f is Frame => !!f);
  const pathProjects = Array.from(new Set(pathFrames.map((f) => f.href)))
    .map((href) => ({
      href,
      label: pathFrames.find((f) => f.href === href)!.label,
    }));

  return (
    <main className="vg" data-lights={lightsOn ? "on" : "off"}>
      <div ref={reticleRef} className="vg-reticle" data-touch={touchMode ? "1" : "0"} aria-hidden>
        <svg viewBox="0 0 44 44" width="44" height="44">
          <circle cx="22" cy="22" r="19" className="vg-reticle__track" />
          <circle
            ref={ringRef}
            cx="22"
            cy="22"
            r="19"
            className="vg-reticle__ring"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C}
          />
          <circle cx="22" cy="22" r="2.5" className="vg-reticle__dot" />
        </svg>
      </div>

      <header className="vg-bar v-mono">
        <span>
          {BIO.name} <span className="vg-dim">— {BIO.role}</span>
        </span>
        <span className="vg-bar__right">
          <span aria-live="polite" className="vg-count">
            {String(developedCount).padStart(2, "0")} / {FRAMES.length} developed
          </span>
          <button type="button" onClick={toggleLights} className="vg-lights" aria-pressed={lightsOn}>
            {lightsOn ? <LightbulbOff className="size-3.5" aria-hidden /> : <Lightbulb className="size-3.5" aria-hidden />}
            {lightsOn ? "Lights off" : "Lights on"}
          </button>
        </span>
      </header>

      <section className="vg-intro">
        <p className="v-mono vg-kicker">A home page that works like OBSCURA</p>
        <h1 className="v-display vg-title">
          Where you look
          <br />
          decides what you see.
        </h1>
        <p className="vg-lede v-sans">
          For MOHAI, I built an exhibit where a visitor&apos;s gaze curated 300+ unseen
          photographs in real time. This page works the same way.{" "}
          <span className="vg-hint">
            {touchMode
              ? "Scroll slowly. Whatever rests in the middle of your screen develops."
              : "Rest your cursor on anything in the dark to develop it."}
          </span>
        </p>
      </section>

      <section ref={fieldRef} className="vg-field" aria-label="Archive of work">
        <div ref={darkRef} className="vg-dark" aria-hidden />
        <ol className="vg-grid">
          {FRAMES.map((f, i) => {
            const isDev = path.includes(f.id);
            return (
              <li
                key={f.id}
                className="vg-cell"
                style={{ "--col": f.col, "--dy": `${f.dy}px` } as React.CSSProperties}
              >
                <ProjectLink
                  ref={(el) => {
                    tileRefs.current[i] = el;
                  }}
                  href={f.href}
                  className="vg-tile"
                  data-dev={isDev ? "" : undefined}
                  onFocus={() => develop(f.id)}
                  aria-label={`${f.label}: ${f.caption}`}
                >
                  <span className="vg-print" style={{ aspectRatio: `${f.w} / ${f.h}` }}>
                    <Image src={f.src} alt={f.alt} fill sizes="(min-width: 900px) 30vw, 50vw" className="vg-img" />
                  </span>
                  <span className="vg-cap">
                    <span className="v-mono vg-cap__label">
                      {f.label}
                      <ArrowUpRight className="size-3" aria-hidden />
                    </span>
                    <span className="v-sans vg-cap__text">{f.caption}</span>
                  </span>
                </ProjectLink>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="vg-path" aria-labelledby="vg-path-title">
        <p className="v-mono vg-kicker" id="vg-path-title">Your path through the archive</p>
        {developedCount === 0 ? (
          <h2 className="v-display vg-path__title">Nothing developed yet. The dark is patient.</h2>
        ) : (
          <>
            <h2 className="v-display vg-path__title">
              You developed {developedCount} of {FRAMES.length} frames.
              <span className="vg-dim"> No one else will see them in this order.</span>
            </h2>
            <ol className="vg-strip">
              {pathFrames.map((f, n) => (
                <li key={f.id} className="vg-strip__frame">
                  <span className="vg-strip__img">
                    <Image src={f.src} alt="" fill sizes="120px" className="object-cover" />
                  </span>
                  <span className="v-mono vg-strip__n">{String(n + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ol>
            <div className="vg-path__links">
              {pathProjects.map((p) => (
                <ProjectLink key={p.href} href={p.href} className="vg-pill v-mono">
                  Open {p.label}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </ProjectLink>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="vg-index" aria-labelledby="vg-index-title">
        <p className="v-mono vg-kicker" id="vg-index-title">Or, with the lights on</p>
        <ul className="vg-index__list">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <ProjectLink href={p.href} className="vg-index__row">
                <span className="v-display vg-index__name">{p.name}</span>
                <span className="v-sans vg-index__title">{p.title}</span>
                <span className="v-mono vg-index__meta">{p.years}</span>
              </ProjectLink>
            </li>
          ))}
          {WAFFLINGS.map((w) => (
            <li key={w.slug}>
              <ProjectLink href={w.href} className="vg-index__row vg-index__row--small">
                <span className="v-sans vg-index__name--small">{w.name}</span>
                <span className="v-sans vg-index__title">{w.line}</span>
                <span className="v-mono vg-index__meta">Waffling</span>
              </ProjectLink>
            </li>
          ))}
        </ul>
      </section>

      <footer className="vg-foot">
        <p className="v-sans vg-foot__bio">{BIO.long}</p>
        <div className="vg-foot__links">
          <button type="button" onClick={copy} className="vg-pill vg-pill--plain v-mono">
            {copied ? "Copied" : email}
          </button>
          <a href={CV_HREF} target="_blank" rel="noopener noreferrer" className="vg-pill v-mono">
            CV <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
          <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" className="vg-pill v-mono">
            LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </footer>
    </main>
  );
}
