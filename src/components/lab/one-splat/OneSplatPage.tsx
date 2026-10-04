"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { homepageProjects } from "@/data/homepage-projects";
import { HomeProjectCard } from "@/components/home/WorkSection";
import { HeroCard } from "@/components/home/HeroCard";
import { HomeChoomLingoProvider } from "@/components/home/HomeChoomLingoContext";
import { SplatEngine, type SplatKey } from "./splatEngine";
import { Masthead } from "./Masthead";
import { AboutSheet } from "./AboutSheet";
import styles from "./OneSplat.module.css";

const MEDIA = "/variants/one-splat/media"; // splat data

/** href: where the title, the splat and the screen all lead. links: extra links shown under the copy (side builds only). */
type Chapter = { k: Exclude<SplatKey, "about" | "overview">; t: string; sub: string; meta: string; p: string; href: string; links?: [string, string][]; cards?: boolean };

/** The home page's description for a case study, so the two stay in sync. */
const desc = (slug: string) => homepageProjects.find((p) => p.slug === slug)?.description ?? "";

const CHAPTERS: Chapter[] = [
  {
    k: "domis",
    t: "Domis",
    sub: "AI home maintenance app",
    meta: "Founding Product Designer · 2024–now",
    p: desc("domis"),
    href: "/domis",
    cards: true,
  },
  {
    k: "virdio",
    t: "Virdio",
    sub: "AR home fitness app",
    meta: "Product Designer · 2021–2022",
    p: desc("virdio"),
    href: "/virdio",
    cards: true,
  },
  {
    k: "obscura",
    t: "OBSCURA",
    sub: "Immersive VR exhibition",
    meta: "Interaction Designer · MOHAI · 2025",
    p: desc("obscura"),
    href: "/obscura",
    cards: true,
  },
  {
    k: "mc",
    t: "Memory Care",
    sub: "Multisensory dementia care",
    meta: "Interaction Designer · 2020–2023",
    p: desc("memory-care"),
    href: "/memory-care",
    cards: true,
  },
  {
    k: "side",
    t: "Side builds",
    sub: "Things I make to learn",
    meta: "Personal projects · ongoing",
    p: "Savor turns a phone video into a 3D Gaussian splat; this hand is one of its captures. Also: an arcade game played with plush orcas, a recorder you scrub like a turntable, and a serious butter chicken.",
    href: "/waffling/savor",
    links: [
      ["Savor", "/waffling/savor"],
      ["Saving Baby J", "/waffling/orca"],
      ["Recorder", "/waffling/recorder"],
      ["Butter chicken", "/butter-chicken"],
    ],
  },
];

const HomeCheatEasterEggs = dynamic(
  () => import("@/components/home/HomeCheatEasterEggs").then((m) => m.HomeCheatEasterEggs),
  { ssr: false },
);

// opens on Domis; the face only appears behind the open bio
const ORDER: SplatKey[] = CHAPTERS.map((c) => c.k);
const NARROW = 820;

/**
 * header "card": the site's HeroCard (its own expand holds the about content).
 * header "masthead": a light card-less header; About opens a sheet from the left.
 */
export function OneSplatPage({ header = "card" }: { header?: "card" | "masthead" } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const engineRef = useRef<SplatEngine | null>(null);
  const [current, setCurrent] = useState<SplatKey>("domis");
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutOpenRef = useRef(false);
  const currentRef = useRef<SplatKey>("domis");

  const chapter = CHAPTERS.find((c) => c.k === current);

  /** Frame the object: centred alone, or shifted left to make room for the project screen. */
  const frame = useCallback((instant = false) => {
    const engine = engineRef.current;
    const stage = stageRef.current;
    if (!engine || !stage) return;
    const W = stage.clientWidth, H = stage.clientHeight;
    const narrow = window.innerWidth <= NARROW;
    const hasScreen = !aboutOpenRef.current && !!CHAPTERS.find((c) => c.k === currentRef.current)?.cards;
    const place = (cx: number, cy: number, s: number) => engine.setFrame(cx, cy, s, instant);
    if (narrow) {
      if (hasScreen) place(W / 2, H * 0.34, Math.min(W * 0.62, H * 0.5));
      else place(W / 2, H * 0.5, Math.min(W * 0.8, H * 0.72));
      return;
    }
    // the canvas spans the whole page so wide objects never clip; frame within the area right of the column
    const side = sideRef.current?.offsetWidth ?? 0;
    pageRef.current?.style.setProperty("--side-w", `${side}px`);
    const aw = W - side;
    const size = Math.min(aw * 0.62, H * 0.74);
    place(side + aw * (hasScreen ? 0.33 : 0.5), H * 0.5, hasScreen ? size * 0.92 : size);
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
    });
    engineRef.current = engine;
    frame(true);
    void engine.select("domis");
    const t = window.setTimeout(() => engine.preload([...CHAPTERS.map((c) => c.k), "about"]), 1200);
    const onResize = () => frame(true);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [frame]);

  const openAbout = useCallback(() => {
    aboutOpenRef.current = true;
    setAboutOpen(true);
    void engineRef.current?.select("about");
    frame();
  }, [frame]);
  const closeAbout = useCallback(() => {
    aboutOpenRef.current = false;
    setAboutOpen(false);
    void engineRef.current?.select(currentRef.current);
    frame();
  }, [frame]);

  const go = useCallback(
    (k: SplatKey) => {
      if (k === currentRef.current) return;
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
    const onLabPage = () => window.location.pathname.startsWith("/lab/");
    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth <= NARROW || !onLabPage() || aboutOpenRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("[data-testid='hero-card-expanded-scroll']")) return;
      // over the left column the wheel scrolls it (it can be taller than the window); projects step only over the stage
      if (t && sideRef.current?.contains(t)) return;
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
      if (!onLabPage() || aboutOpenRef.current) return;
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
      <main className={styles.page} ref={pageRef} data-proj={current}>
        <div className={styles.side} ref={sideRef}>
          {header === "card" ? (
            <div className={styles.hero}>
              <HeroCard mark="signature" orbs={false} />
            </div>
          ) : (
            <Masthead onAbout={openAbout} aboutOpen={aboutOpen} onProject={go} />
          )}
          <nav aria-label="Work">
            <ol className={styles.index}>
              {CHAPTERS.map((c) => {
                const on = c.k === current;
                return (
                  <li key={c.k} className={on ? styles.on : undefined}>
                    <Link
                      href={c.href}
                      className={styles.row}
                      aria-describedby={`ch-${c.k}`}
                      onClick={(e) => {
                        // the first click expands the project here; clicking it again opens it
                        if (!on) {
                          e.preventDefault();
                          go(c.k);
                        }
                      }}
                    >
                      <span className={styles.head}>
                        <span className={styles.title}>{c.t}</span>
                        <GoArrow />
                      </span>
                      <span className={styles.sub}>{c.sub}</span>
                    </Link>
                    <div className={styles.detail} id={`ch-${c.k}`}>
                      <div>
                        {/* the description opens the project too (as do its title, once open, and its cards) */}
                        <Link href={c.href} className={styles.detailLink} tabIndex={on ? undefined : -1}>
                          <p className={styles.meta}>{c.meta}</p>
                          <p className={styles.copy}>{c.p}</p>
                        </Link>
                        {c.links ? (
                          <p className={styles.links}>
                            {c.links.map(([label, href]) => (
                              <Link key={href} href={href}>
                                {label}
                              </Link>
                            ))}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
          <footer className={styles.footer}>
            <HomeCheatEasterEggs />
          </footer>
        </div>

        <div className={styles.stage} ref={stageRef}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={
              chapter
                ? `A 3D gaussian splat of ${chapter.t}. Drag to turn it; tap to make it jiggle.`
                : "3D gaussian splats of five projects, floating. Drag to turn them; click one to see that project."
            }
          />
          <p className={styles.fallback}>This page draws with WebGL2, which this browser doesn&apos;t support.</p>
          <div className={styles.screenSpace} aria-live="polite">
            {chapter?.cards && !aboutOpen ? <CardFan key={chapter.k} slug={chapter.href.replace(/^\//, "")} /> : null}
          </div>
        </div>
      </main>
      {header === "masthead" ? <AboutSheet open={aboutOpen} onClose={closeAbout} /> : null}
    </HomeChoomLingoProvider>
  );
}

/** The open project's "go to case study" mark: drawn to match the About chevron (1.5 stroke, round caps). */
function GoArrow() {
  return (
    <svg className={styles.go} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.25 8h9.5M8.75 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The project's three home cards (the exact components from the home carousel), stacked on the
 * right in a slight arc that wraps toward the object. Mounted only while the project is open.
 */
function CardFan({ slug }: { slug: string }) {
  const project = homepageProjects.find((p) => p.slug === slug);
  if (!project) return null;
  return (
    <div className={styles.fan}>
      {([0, 1, 2] as const).map((i) => (
        <div key={i} className={`${styles.arcCard} ${styles[`arc${i}`]}`}>
          <HomeProjectCard project={project} index={i} hideCaption />
        </div>
      ))}
    </div>
  );
}
