"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { homepageProjects } from "@/data/homepage-projects";
import { HomeProjectCard } from "@/components/home/WorkSection";
import { SITE_VERSION } from "@/components/home/HomePage";
import { HeroCard } from "@/components/home/HeroCard";
import { HomeChoomLingoProvider } from "@/components/home/HomeChoomLingoContext";
import { SplatEngine, type SplatKey } from "./splatEngine";
import styles from "./OneSplat.module.css";

const MEDIA = "/variants/one-splat/media"; // splat data

/** href: where the title, the splat and the screen all lead. links: extra links shown under the copy (side builds only). */
type Chapter = { k: Exclude<SplatKey, "about">; t: string; sub?: string; meta: string; p: string; href: string; links?: [string, string][]; cards?: boolean };

const CHAPTERS: Chapter[] = [
  {
    k: "domis",
    t: "Domis",
    sub: "Home maintenance made easy",
    meta: "Founding Product Designer · 2024–now",
    p: "A home maintenance app that learns your house from the smallest thing you'll give it: an address, a nameplate photo, an inspection report. My 3D home-avatar prototypes lifted new-user engagement 60%.",
    href: "/domis",
    cards: true,
  },
  {
    k: "virdio",
    t: "Virdio",
    sub: "AR home fitness app",
    meta: "Product Designer · 2021–2022",
    p: "Hardware-free AR fitness: an ordinary camera reads your body and counts every rep. I designed calibration around virtual cones you walk to, across six platforms.",
    href: "/virdio",
    cards: true,
  },
  {
    k: "obscura",
    t: "OBSCURA",
    sub: "A social, immersive experience",
    meta: "Interaction design, Unity · MOHAI, 2025",
    p: "300+ never-seen photographs from 1946 Japan, curated by one visitor's gaze in VR while an audience outside watches through their eyes. It sold out.",
    href: "/obscura",
    cards: true,
  },
  {
    k: "mc",
    t: "Memory Care Experience Station",
    sub: "Multisensory memory care",
    meta: "Interaction Designer · 2020–2023",
    p: "For people living with dementia, I wired plush cats with pressure sensors and haptic motors: pet one and it purrs. 98% positive across 200+ sessions; a Fast Company World Changing Ideas finalist.",
    href: "/memory-care",
    cards: true,
  },
  {
    k: "side",
    t: "Side builds",
    meta: "Things I make to learn",
    p: "Savor turns a phone video into a 3D Gaussian splat; this hand is one of its captures. Also: an arcade game played by throwing plush orcas, a voice recorder you scrub like a turntable, and a serious butter chicken.",
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

const ORDER: SplatKey[] = ["about", ...CHAPTERS.map((c) => c.k)];
const NARROW = 820;

export function OneSplatPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const engineRef = useRef<SplatEngine | null>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
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
    const hasScreen = !!CHAPTERS.find((c) => c.k === currentRef.current)?.cards;
    if (narrow) {
      engine.setFrame(W / 2, H * 0.5, Math.min(W * 0.8, H * 0.72), instant);
      return;
    }
    // the canvas spans the whole page so wide objects never clip; frame within the area right of the column
    const side = sideRef.current?.offsetWidth ?? 0;
    pageRef.current?.style.setProperty("--side-w", `${side}px`);
    const aw = W - side;
    const size = Math.min(aw * 0.62, H * 0.74);
    engine.setFrame(side + aw * (hasScreen ? 0.4 : 0.5), H * 0.5, size, instant);
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
      onTap: () => {
        const c = CHAPTERS.find((x) => x.k === currentRef.current);
        if (!c) return false;
        routerRef.current.push(c.href);
        return true;
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
      if (window.innerWidth <= NARROW || !onLabPage()) return;
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
      if (!onLabPage()) return;
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
      <main className={styles.page} ref={pageRef}>
        <div className={styles.side} ref={sideRef}>
          <div className={styles.hero}>
            <HeroCard mark="signature" orbs={false} />
          </div>
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
                      <span className={styles.title}>{c.t}</span>
                      {c.sub ? <span className={styles.sub}>{c.sub}</span> : null}
                    </Link>
                    <div className={styles.detail} id={`ch-${c.k}`}>
                      <div>
                        <p className={styles.meta}>{c.meta}</p>
                        <p className={styles.copy}>{c.p}</p>
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
            <p className={styles.version}>
              Hridae Walia - {new Date().getFullYear()} - {SITE_VERSION}
            </p>
          </footer>
        </div>

        <div className={styles.stage} ref={stageRef} data-linked={chapter ? "" : undefined}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={`A 3D gaussian splat of ${chapter ? chapter.t : "Hridae"}. Drag to turn it${chapter ? "; click to open the project" : "; tap to make it jiggle"}.`}
          />
          <p className={styles.fallback}>This page draws with WebGL2, which this browser doesn&apos;t support.</p>
          <div className={styles.screenSpace} aria-live="polite">
            {chapter?.cards ? <CardFan key={chapter.k} slug={chapter.href.replace(/^\//, "")} /> : null}
          </div>
        </div>
      </main>
    </HomeChoomLingoProvider>
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
