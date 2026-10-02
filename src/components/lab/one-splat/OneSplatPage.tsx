"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HeroCard } from "@/components/home/HeroCard";
import { HomeChoomLingoProvider } from "@/components/home/HomeChoomLingoContext";
import { SplatEngine, type SplatKey } from "./splatEngine";
import styles from "./OneSplat.module.css";

const MEDIA = "/variants/one-splat/media";

type Media = { kind: "video" | "image"; src: string; poster?: string; shape: "phone" | "wide" | "photo"; alt: string };
type Chapter = { k: Exclude<SplatKey, "about">; t: string; meta: string; p: string; links: [string, string][]; media?: Media };

const CHAPTERS: Chapter[] = [
  {
    k: "domis",
    t: "Domis",
    meta: "Founding Product Designer · 2024–now",
    p: "A home maintenance app that learns your house from the smallest thing you'll give it: an address, a nameplate photo, an inspection report. My 3D home-avatar prototypes lifted new-user engagement 60%.",
    links: [["Case study", "/domis"]],
    media: { kind: "video", src: `${MEDIA}/domis.mp4`, poster: `${MEDIA}/domis-poster.webp`, shape: "phone", alt: "Domis task detail screen" },
  },
  {
    k: "virdio",
    t: "Virdio",
    meta: "Product Designer · 2021–2022",
    p: "Hardware-free AR fitness: an ordinary camera reads your body and counts every rep. I designed calibration around virtual cones you walk to, across six platforms.",
    links: [["Case study", "/virdio"]],
    media: { kind: "video", src: `${MEDIA}/virdio.mp4`, poster: `${MEDIA}/virdio-poster.webp`, shape: "wide", alt: "A Virdio AR workout" },
  },
  {
    k: "obscura",
    t: "OBSCURA",
    meta: "Interaction design, Unity · MOHAI, 2025",
    p: "300+ never-seen photographs from 1946 Japan, curated by one visitor's gaze in VR while an audience outside watches through their eyes. It sold out.",
    links: [["Case study", "/obscura"]],
    media: { kind: "video", src: `${MEDIA}/obscura.mp4`, poster: `${MEDIA}/obscura-poster.webp`, shape: "wide", alt: "OBSCURA: the headset view beside the audience view" },
  },
  {
    k: "mc",
    t: "Memory Care",
    meta: "Interaction Designer · 2020–2023",
    p: "For people living with dementia, I wired plush cats with pressure sensors and haptic motors: pet one and it purrs. 98% positive across 200+ sessions; a Fast Company World Changing Ideas finalist.",
    links: [["Case study", "/memory-care"]],
    media: { kind: "image", src: `${MEDIA}/mc.webp`, shape: "photo", alt: "A resident at the Memory Care experience station" },
  },
  {
    k: "side",
    t: "Side builds",
    meta: "Things I make to learn",
    p: "Savor turns a phone video into a 3D Gaussian splat; this hand is one of its captures. Also: an arcade game played by throwing plush orcas, a voice recorder you scrub like a turntable, and a serious butter chicken.",
    links: [
      ["Savor", "/waffling/savor"],
      ["Saving Baby J", "/waffling/orca"],
      ["Recorder", "/waffling/recorder"],
      ["Butter chicken", "/butter-chicken"],
    ],
  },
];

const ORDER: SplatKey[] = ["about", ...CHAPTERS.map((c) => c.k)];
const NARROW = 820;

export function OneSplatPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SplatEngine | null>(null);
  const [current, setCurrent] = useState<SplatKey>("about");
  const currentRef = useRef<SplatKey>("about");

  const chapter = CHAPTERS.find((c) => c.k === current);

  /** Frame the object: centred alone, or shifted left to make room for the project screen. */
  const frame = useCallback((instant = false) => {
    const engine = engineRef.current;
    const stage = stageRef.current;
    if (!engine || !stage) return;
    const W = stage.clientWidth, H = stage.clientHeight;
    const narrow = window.innerWidth <= NARROW;
    const hasScreen = !!CHAPTERS.find((c) => c.k === currentRef.current)?.media;
    if (narrow) engine.setFrame(W / 2, H * 0.5, Math.min(W * 0.8, H * 0.72), instant);
    else if (hasScreen) engine.setFrame(W * 0.3, H * 0.5, Math.min(W * 0.4, H * 0.6), instant);
    else engine.setFrame(W * 0.5, H * 0.5, Math.min(W * 0.8, H * 0.74), instant);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!SplatEngine.supported()) {
      stageRef.current?.setAttribute("data-unsupported", "");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = new SplatEngine(canvas, {
      baseUrl: MEDIA,
      reducedMotion: reduced,
      onTurn: (yaw, pitch) => {
        // the screen sits in the same space: it turns a little with the object
        const s = screenRef.current;
        if (!s) return;
        s.style.setProperty("--turn-y", `${(yaw * 9).toFixed(2)}deg`);
        s.style.setProperty("--turn-x", `${(-pitch * 6).toFixed(2)}deg`);
      },
    });
    engineRef.current = engine;
    frame(true);
    void engine.select("about");
    const t = window.setTimeout(() => engine.preload(CHAPTERS.map((c) => c.k)), 1200);
    const onResize = () => frame(true);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [frame]);

  const go = useCallback(
    (k: SplatKey) => {
      setCurrent(k);
      currentRef.current = k;
      void engineRef.current?.select(k);
      frame();
    },
    [frame],
  );

  // One chapter per scroll gesture on desktop (the canvas and index own the wheel; the hero card scrolls itself).
  useEffect(() => {
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth <= NARROW) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-testid='hero-card-expanded-scroll']")) return;
      // the bio is open: let it scroll
      if (document.querySelector("button[aria-expanded='true'][aria-label*='bio' i]")) return;
      if (Math.abs(e.deltaY) + Math.abs(e.deltaX) < 8) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      lock = now + 900;
      const i = ORDER.indexOf(currentRef.current);
      const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, i + (e.deltaY + e.deltaX > 0 ? 1 : -1)))];
      if (next !== currentRef.current) go(next);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest("input, textarea")) return;
      const i = ORDER.indexOf(currentRef.current);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(ORDER[Math.min(ORDER.length - 1, i + 1)]);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(ORDER[Math.max(0, i - 1)]);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  return (
    <HomeChoomLingoProvider>
      <main className={styles.page}>
        <div className={styles.side}>
          <div className={styles.hero}>
            <HeroCard />
          </div>
          <nav aria-label="Work">
            <ol className={styles.index}>
              {CHAPTERS.map((c) => {
                const on = c.k === current;
                return (
                  <li key={c.k} className={on ? styles.on : undefined}>
                    <button type="button" aria-expanded={on} aria-controls={`ch-${c.k}`} onClick={() => go(on ? "about" : c.k)}>
                      <span className={styles.title}>{c.t}</span>
                    </button>
                    <div className={styles.detail} id={`ch-${c.k}`}>
                      <div>
                        <p className={styles.meta}>{c.meta}</p>
                        <p className={styles.copy}>{c.p}</p>
                        <p className={styles.links}>
                          {c.links.map(([label, href]) => (
                            <Link key={href} href={href}>
                              {label}
                              <span aria-hidden> ↗</span>
                            </Link>
                          ))}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className={styles.stage} ref={stageRef}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={`A 3D gaussian splat of ${chapter ? chapter.t : "Hridae"}. Drag to turn it; tap to make it jiggle.`}
          />
          <p className={styles.fallback}>This page draws with WebGL2, which this browser doesn&apos;t support.</p>
          <div className={styles.screenSpace} aria-live="polite">
            {CHAPTERS.filter((c) => c.media).map((c) => (
              <Screen key={c.k} media={c.media!} active={c.k === current} refFn={c.k === current ? screenRef : undefined} />
            ))}
          </div>
        </div>
      </main>
    </HomeChoomLingoProvider>
  );
}

function Screen({ media, active, refFn }: { media: Media; active: boolean; refFn?: React.RefObject<HTMLDivElement | null> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // load the video the first time its chapter opens, then keep it
  const [armed, setArmed] = useState(false);
  if (active && !armed) setArmed(true);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) void v.play().catch(() => {});
    else v.pause();
  }, [active, armed]);
  return (
    <div ref={refFn} className={`${styles.screen} ${styles[media.shape]} ${active ? styles.screenOn : ""}`} aria-hidden={!active}>
      {media.kind === "video" ? (
        <video ref={videoRef} src={armed ? media.src : undefined} poster={media.poster} muted loop playsInline preload="none" aria-label={media.alt} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} loading="lazy" />
      )}
    </div>
  );
}
