"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ProjectLink } from "../shared/ProjectLink";
import { useCopyEmail } from "../shared/useCopyEmail";
import { BIO, WAFFLINGS, projectBySlug, type CaseStudySlug } from "../shared/work";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import "./depth.css";

/* ── Chapters: each project sits one step further from the glass ───── */

type Prop = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Centre position inside the layer, % of viewport. */
  x: number;
  y: number;
  /** Width as % of viewport width (desktop). */
  width: number;
  /** Extra depth inside the layer (px). Positive = toward you. */
  z: number;
  rot?: number;
  cutout?: boolean;
};

type Chapter = {
  slug: CaseStudySlug;
  step: string;
  place: string;
  gauge: string;
  bg: string;
  fg: string;
  lead: string;
  props: Prop[];
};

const CHAPTERS: Chapter[] = [
  {
    slug: "domis",
    step: "01",
    place: "On the glass",
    gauge: "Glass",
    bg: "#ff5a5b",
    fg: "#ffffff",
    lead: "Domis learns a house from the smallest thing you’ll give it: an address, a photo of a nameplate, an inspection report.",
    props: [
      { src: "/assets/home/domis-card1-tasks-composite.png", w: 470, h: 700, alt: "Inspection report becoming tasks", x: 77, y: 34, width: 13, z: -260, rot: 5 },
      { src: "/assets/domis/hero-mobile.png", w: 473, h: 1024, alt: "Domis home screen", x: 63, y: 52, width: 16, z: 0, rot: -3 },
      { src: "/assets/domis/live/home-avatar-3d.png", w: 512, h: 512, alt: "3D avatar of a house", x: 82, y: 72, width: 17, z: 220, cutout: true },
    ],
  },
  {
    slug: "virdio",
    step: "02",
    place: "In the room",
    gauge: "Room",
    bg: "#171528",
    fg: "#ece8ff",
    lead: "Virdio turns a phone or TV camera into a coach. I designed calibration to feel like a warm-up, and kept the workout going when tracking failed.",
    props: [
      { src: "/assets/virdio/in_context.png", w: 2066, h: 1096, alt: "AR workout in a living room", x: 70, y: 40, width: 40, z: -220, rot: 0 },
      { src: "/assets/virdio/hero_ui.png", w: 1402, h: 786, alt: "Workout telemetry overlay", x: 80, y: 72, width: 22, z: 140, rot: -2 },
      { src: "/assets/virdio/cone.png", w: 1003, h: 1083, alt: "Purple AR cone", x: 57, y: 74, width: 9, z: 300, cutout: true, rot: -8 },
    ],
  },
  {
    slug: "obscura",
    step: "03",
    place: "Inside a headset",
    gauge: "Headset",
    bg: "#0b0b0b",
    fg: "#f4f4f3",
    lead: "OBSCURA puts you inside an archive of 300+ unseen photographs from post-war Japan. Where you look decides which one comes next.",
    props: [
      { src: "/assets/obscura/exhibition_743gm1tgvfizndo7gwveqtjp584.webp", w: 1024, h: 768, alt: "OBSCURA at MOHAI", x: 90, y: 20, width: 12, z: -520 },
      { src: "/assets/obscura/wayne_crowd_scene.jpg", w: 2400, h: 2304, alt: "Crowd scene, archival photograph", x: 64, y: 32, width: 17, z: -320, rot: -2 },
      { src: "/assets/obscura/wayne_girl_kimono.jpg", w: 1992, h: 2862, alt: "Girl in a kimono, archival photograph", x: 84, y: 50, width: 12, z: 60, rot: 3 },
      { src: "/assets/obscura/wayne_japanese_kids.jpg", w: 2286, h: 1505, alt: "Children, archival photograph", x: 66, y: 76, width: 20, z: 240, rot: -1 },
    ],
  },
  {
    slug: "memory-care",
    step: "04",
    place: "In your hands",
    gauge: "Hands",
    bg: "#ff9f73",
    fg: "#2b2a27",
    lead: "I wired plush cats with pressure sensors and haptic motors. Residents living with Alzheimer’s instinctively picked them up and held them.",
    props: [
      { src: "/assets/memory-care/station_full.jpg", w: 2400, h: 1800, alt: "The Memory Care Experience Station", x: 68, y: 38, width: 30, z: -200, rot: 1 },
      { src: "/assets/memory-care/cathero.png", w: 2073, h: 1181, alt: "Residents with the haptic cat", x: 85, y: 70, width: 21, z: 80, rot: -2 },
      { src: "/assets/grid/memorycare-cat-straight.png", w: 519, h: 481, alt: "The haptic plush cat", x: 60, y: 76, width: 15, z: 280, cutout: true },
    ],
  },
];

/** Distance between layers along z (px). */
const GAP = 1500;
/** CSS perspective (px) — layers past this are behind the camera. */
const PERSPECTIVE = 1100;
/** Layers: intro, 4 chapters, outro. */
const LAYERS = CHAPTERS.length + 2;
/** Fraction of each segment the camera holds still so copy can be read. */
const HOLD = 0.38;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Scroll progress (0..1) → camera position measured in layers. */
function cameraFromProgress(p: number) {
  const segs = LAYERS - 1;
  const s = Math.min(segs - 1e-6, Math.max(0, p * segs));
  const i = Math.floor(s);
  const t = s - i;
  const travel = t < HOLD ? 0 : easeInOut((t - HOLD) / (1 - HOLD));
  return i + travel;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const LAYER_BG = ["#f4f4f3", ...CHAPTERS.map((c) => c.bg), "#f4f4f3"].map(hexToRgb);
const LAYER_FG = ["#2b2a27", ...CHAPTERS.map((c) => c.fg), "#2b2a27"];

export function DepthHome() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLElement | null)[]>([]);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [flat, setFlat] = useState(false);
  const { email, copied, copy } = useCopyEmail();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setFlat(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!track || !stage || !world) return;
    if (flat) {
      // The 3D loop may have run before the preference was read: drop its inline state.
      stage.removeAttribute("style");
      delete stage.dataset.pin;
      world.removeAttribute("style");
      layerRefs.current.forEach((el) => {
        if (!el) return;
        el.style.removeProperty("visibility");
        el.style.removeProperty("transform");
        el.style.removeProperty("--o");
        el.style.removeProperty("--oc");
      });
      return;
    }

    let cam = 0;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    let lastActive = -1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tilt.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      tilt.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let pin = "";
    const loop = () => {
      const rect = track.getBoundingClientRect();
      // The page shell clips overflow-x, which disables position: sticky —
      // pin by hand: fixed while the track scrolls, parked at its end after.
      const nextPin = rect.bottom > window.innerHeight ? "fixed" : "end";
      if (nextPin !== pin) {
        pin = nextPin;
        stage.dataset.pin = pin;
      }
      const span = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / span));
      const target = cameraFromProgress(p);
      cam += (target - cam) * 0.14;
      if (Math.abs(target - cam) < 1e-4) cam = target;

      tilt.x += (tilt.tx - tilt.x) * 0.06;
      tilt.y += (tilt.ty - tilt.y) * 0.06;
      world.style.transform = `rotateY(${(tilt.x * 2.4).toFixed(3)}deg) rotateX(${(-tilt.y * 1.6).toFixed(3)}deg)`;

      for (let i = 0; i < LAYERS; i++) {
        const el = layerRefs.current[i];
        if (!el) continue;
        const z = (cam - i) * GAP; // 0 = at the glass, <0 = ahead, >0 = passing
        // Media fogs in from far away; copy only resolves once it's close,
        // so the next chapter never reads through the current one.
        let o: number;
        let oc: number;
        if (z <= 0) {
          o = Math.max(0, 1 + z / (GAP * 1.15));
          oc = Math.max(0, 1 + z / (GAP * 0.6));
        } else {
          o = oc = Math.max(0, 1 - z / (GAP * 0.42));
        }
        const hidden = o <= 0.001 || z > PERSPECTIVE * 0.85;
        el.style.visibility = hidden ? "hidden" : "visible";
        if (!hidden) {
          // Opacity on the layer itself would flatten preserve-3d; children read vars.
          el.style.setProperty("--o", o.toFixed(3));
          el.style.setProperty("--oc", oc.toFixed(3));
          el.style.transform = `translate3d(0, 0, ${z.toFixed(1)}px)`;
        }
      }

      // Background: blend between the two nearest layers' colours.
      const a = Math.floor(cam);
      const b = Math.min(LAYERS - 1, a + 1);
      const t = cam - a;
      const ca = LAYER_BG[a];
      const cb = LAYER_BG[b];
      const mix = (k: number) => Math.round(ca[k] + (cb[k] - ca[k]) * t);
      stage.style.backgroundColor = `rgb(${mix(0)} ${mix(1)} ${mix(2)})`;

      if (readoutRef.current) {
        readoutRef.current.textContent = `z −${Math.round(cam * GAP).toLocaleString("en-US")}`;
      }
      if (markerRef.current) {
        const g = Math.min(1, Math.max(0, (cam - 1) / (CHAPTERS.length - 1)));
        markerRef.current.style.transform = `translateY(${(g * 100).toFixed(2)}%)`;
      }

      const nearest = Math.round(cam);
      if (nearest !== lastActive) {
        lastActive = nearest;
        stage.style.setProperty("--hud", LAYER_FG[nearest]);
        setActive(nearest);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [flat]);

  const setLayer = (i: number) => (el: HTMLElement | null) => {
    layerRefs.current[i] = el;
  };

  const chapterIdx = active - 1;

  return (
    <main className="vd" data-flat={flat ? "" : undefined}>
      <div
        ref={trackRef}
        className="vd-track"
        style={{ "--vd-segs": LAYERS } as React.CSSProperties}
      >
        <div ref={stageRef} className="vd-stage">
          <div className="vd-hud v-mono" aria-hidden={flat || undefined}>
            <span className="vd-hud__name">
              {BIO.name} — {BIO.role}
            </span>
            <span ref={readoutRef} className="vd-hud__z">
              z −0
            </span>
          </div>

          <div className="vd-gauge v-mono">
            <ol aria-label="Distance from the screen">
              {CHAPTERS.map((c, i) => (
                <li key={c.slug} data-on={chapterIdx === i ? "" : undefined}>
                  {c.gauge}
                </li>
              ))}
            </ol>
            <span className="vd-gauge__track" aria-hidden>
              <span ref={markerRef} className="vd-gauge__marker" />
            </span>
          </div>

          <div className="vd-viewport" style={{ perspective: `${PERSPECTIVE}px` }}>
            <div ref={worldRef} className="vd-world">
              {/* Intro */}
              <section
                ref={setLayer(0)}
                className="vd-layer vd-layer--intro"
                data-active={active === 0 ? "" : undefined}
                style={{ "--fg": "#2b2a27", "--bg": "#f4f4f3" } as React.CSSProperties}
              >
                <div className="vd-intro">
                  <p className="v-mono vd-kicker">{BIO.name} · {BIO.role}</p>
                  <h1 className="v-display vd-intro__title">
                    Six years of moving design off the glass.
                  </h1>
                  <p className="v-sans vd-intro__lede">
                    Each project took a step further from the screen: onto a phone, into
                    a room, inside a headset, into someone&apos;s hands.
                  </p>
                  <p className="v-mono vd-intro__cue">
                    <ArrowDown className="size-3.5" aria-hidden /> Scroll to move forward
                  </p>
                </div>
              </section>

              {CHAPTERS.map((c, i) => {
                const p = projectBySlug(c.slug);
                return (
                  <section
                    key={c.slug}
                    ref={setLayer(i + 1)}
                    className="vd-layer"
                    data-active={active === i + 1 ? "" : undefined}
                    style={{ "--fg": c.fg, "--bg": c.bg } as React.CSSProperties}
                    aria-labelledby={`vd-${c.slug}`}
                  >
                    <div className="vd-props" aria-hidden>
                      {c.props.map((m) => (
                        <span
                          key={m.src}
                          className="vd-prop"
                          data-cutout={m.cutout ? "" : undefined}
                          style={
                            {
                              "--x": `${m.x}%`,
                              "--y": `${m.y}%`,
                              "--w": `${m.width}vw`,
                              "--z": `${m.z}px`,
                              "--r": `${m.rot ?? 0}deg`,
                              aspectRatio: `${m.w} / ${m.h}`,
                            } as React.CSSProperties
                          }
                        >
                          <Image src={m.src} alt="" fill sizes="40vw" className="object-cover" />
                        </span>
                      ))}
                    </div>

                    <div className="vd-copy">
                      <p className="v-mono vd-kicker">
                        {c.step} · {c.place}
                      </p>
                      <h2 id={`vd-${c.slug}`} className="v-display vd-name">
                        {p.name}
                      </h2>
                      <p className="v-sans vd-lead">{c.lead}</p>
                      <dl className="vd-facts">
                        <div>
                          <dt className="v-mono">Role</dt>
                          <dd className="v-sans">{p.role}</dd>
                        </div>
                        <div>
                          <dt className="v-mono">Years</dt>
                          <dd className="v-sans">{p.years}</dd>
                        </div>
                        <div>
                          <dt className="v-mono">Proof</dt>
                          <dd className="v-sans">
                            <strong>{p.outcome.value}</strong> {p.outcome.label}
                          </dd>
                        </div>
                      </dl>
                      <ProjectLink href={p.href} className="vd-cta v-mono">
                        Open the case study
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </ProjectLink>
                    </div>
                  </section>
                );
              })}

              {/* Outro */}
              <section
                ref={setLayer(LAYERS - 1)}
                className="vd-layer vd-layer--intro"
                data-active={active === LAYERS - 1 ? "" : undefined}
                style={{ "--fg": "#2b2a27", "--bg": "#f4f4f3" } as React.CSSProperties}
              >
                <div className="vd-intro">
                  <p className="v-mono vd-kicker">05 · Next</p>
                  <h2 className="v-display vd-intro__title">Wherever the interface goes next.</h2>
                  <p className="v-sans vd-intro__lede">
                    {BIO.now}. I learn by making, on the canvas, in code, and in the
                    physical world.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <section className="vd-after">
        <div className="vd-after__head">
          <p className="v-mono vd-kicker">Smaller builds</p>
          <h2 className="v-display vd-after__title">Things I made on the side.</h2>
        </div>
        <ul className="vd-builds">
          {WAFFLINGS.map((w) => (
            <li key={w.slug}>
              <ProjectLink href={w.href} className="vd-build">
                <span className="vd-build__img">
                  <Image src={w.media.src} alt={w.media.alt} fill sizes="(min-width: 900px) 25vw, 50vw" className="object-cover" />
                </span>
                <span className="v-sans vd-build__name">{w.name}</span>
                <span className="v-sans vd-build__line">{w.line}</span>
              </ProjectLink>
            </li>
          ))}
        </ul>

        <footer className="vd-foot">
          <button type="button" onClick={copy} className="v-display vd-foot__email">
            {copied ? "Copied." : email}
          </button>
          <div className="vd-foot__links v-mono">
            <a href={CV_HREF} target="_blank" rel="noopener noreferrer">CV</a>
            <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span>{BIO.education[0]}</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
