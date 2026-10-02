"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { homepageProjects } from "@/data/homepage-projects";
import { SITE_VERSION } from "@/components/home/HomePage";
import { HeroCard } from "@/components/home/HeroCard";
import { HomeChoomLingoProvider } from "@/components/home/HomeChoomLingoContext";
import { SplatEngine, type SplatKey } from "./splatEngine";
import styles from "./OneSplat.module.css";

const MEDIA = "/variants/one-splat/media";

type Media = { kind: "video" | "image"; src: string; poster?: string; shape: "phone" | "wide" | "photo"; alt: string };
/** href: where the title, the splat and the screen all lead. links: extra links shown under the copy (side builds only). */
type Chapter = { k: Exclude<SplatKey, "about">; t: string; meta: string; p: string; href: string; links?: [string, string][]; media?: Media };

const CHAPTERS: Chapter[] = [
  {
    k: "domis",
    t: "Domis",
    meta: "Founding Product Designer · 2024–now",
    p: "A home maintenance app that learns your house from the smallest thing you'll give it: an address, a nameplate photo, an inspection report. My 3D home-avatar prototypes lifted new-user engagement 60%.",
    href: "/domis",
    media: { kind: "video", src: `${MEDIA}/domis.mp4`, poster: `${MEDIA}/domis-poster.webp`, shape: "phone", alt: "Domis task detail screen" },
  },
  {
    k: "virdio",
    t: "Virdio",
    meta: "Product Designer · 2021–2022",
    p: "Hardware-free AR fitness: an ordinary camera reads your body and counts every rep. I designed calibration around virtual cones you walk to, across six platforms.",
    href: "/virdio",
    media: { kind: "video", src: `${MEDIA}/virdio.mp4`, poster: `${MEDIA}/virdio-poster.webp`, shape: "wide", alt: "A Virdio AR workout" },
  },
  {
    k: "obscura",
    t: "OBSCURA",
    meta: "Interaction design, Unity · MOHAI, 2025",
    p: "300+ never-seen photographs from 1946 Japan, curated by one visitor's gaze in VR while an audience outside watches through their eyes. It sold out.",
    href: "/obscura",
    media: { kind: "video", src: `${MEDIA}/obscura.mp4`, poster: `${MEDIA}/obscura-poster.webp`, shape: "wide", alt: "OBSCURA: the headset view beside the audience view" },
  },
  {
    k: "mc",
    t: "Memory Care",
    meta: "Interaction Designer · 2020–2023",
    p: "For people living with dementia, I wired plush cats with pressure sensors and haptic motors: pet one and it purrs. 98% positive across 200+ sessions; a Fast Company World Changing Ideas finalist.",
    href: "/memory-care",
    media: { kind: "image", src: `${MEDIA}/mc.webp`, shape: "photo", alt: "A resident at the Memory Care experience station" },
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

/** The home page's three carousel cards for a project, as stand-alone media. */
type CardMedia = { src: string; poster?: string; video: boolean; alt: string; bg: string };
function homeCards(href: string): CardMedia[] {
  const slug = href.replace(/^\//, "");
  const p = homepageProjects.find((x) => x.slug === slug);
  if (!p) return [];
  return p.cards.map((c) =>
    c.videoSrc
      ? { src: c.videoSrc, poster: c.imageSrc, video: true, alt: c.imageAlt, bg: p.bgColor }
      : { src: c.imageSrc, video: false, alt: c.imageAlt, bg: p.bgColor },
  );
}

const ORDER: SplatKey[] = ["about", ...CHAPTERS.map((c) => c.k)];
const NARROW = 820;

/** variant "one": a single hand-picked screen per project. "three": the home page's three carousel cards. */
export function OneSplatPage({ variant = "one" }: { variant?: "one" | "three" } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenSpaceRef = useRef<HTMLDivElement>(null);
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
    const hasScreen = !!CHAPTERS.find((c) => c.k === currentRef.current)?.media;
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
      onTurn: (yaw, pitch) => {
        // the screens sit in the same space: they turn a little with the object
        const s = screenSpaceRef.current;
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
      if (k === currentRef.current) return;
      setCurrent(k);
      currentRef.current = k;
      void engineRef.current?.select(k);
      frame();
    },
    [frame],
  );
  const hoverTimer = useRef<number | undefined>(undefined);
  const hoverSelect = useCallback(
    (k: SplatKey) => {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => go(k), 140);
    },
    [go],
  );
  const cancelHover = useCallback(() => window.clearTimeout(hoverTimer.current), []);

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
      <main className={styles.page} ref={pageRef}>
        <div className={styles.side} ref={sideRef}>
          <div className={styles.hero}>
            <HeroCard mark="signature" />
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
                      onMouseEnter={() => hoverSelect(c.k)}
                      onMouseLeave={cancelHover}
                      onFocus={() => go(c.k)}
                      onClick={(e) => {
                        // touch: the first tap shows the project here, the second opens it
                        if (!on && window.matchMedia("(hover: none)").matches) {
                          e.preventDefault();
                          go(c.k);
                        }
                      }}
                    >
                      <span className={styles.title}>{c.t}</span>
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
          <div className={styles.screenSpace} ref={screenSpaceRef} aria-live="polite">
            {variant === "one"
              ? CHAPTERS.filter((c) => c.media).map((c) => (
                  <Screen key={c.k} href={c.href} title={c.t} media={c.media!} active={c.k === current} />
                ))
              : CHAPTERS.filter((c) => c.media).map((c) => (
                  <CardFan key={c.k} href={c.href} title={c.t} cards={homeCards(c.href)} active={c.k === current} />
                ))}
          </div>
        </div>
      </main>
    </HomeChoomLingoProvider>
  );
}

function Screen({ href, title, media, active }: { href: string; title: string; media: Media; active: boolean }) {
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
    <div className={`${styles.screen} ${styles[media.shape]} ${active ? styles.screenOn : ""}`} aria-hidden={!active}>
      <Link href={href} className={styles.screenLink} tabIndex={active ? 0 : -1} aria-label={`Open ${title}`}>
      {media.kind === "video" ? (
        <video ref={videoRef} src={armed ? media.src : undefined} poster={media.poster} muted loop playsInline preload="none" aria-label={media.alt} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} loading="lazy" />
      )}
      </Link>
    </div>
  );
}

/**
 * Three cards fanned beside the object, each at a slightly different angle and depth.
 * Each card takes its media's own shape (portrait phone screens, wide stills), measured on load.
 */
function CardFan({ href, title, cards, active }: { href: string; title: string; cards: CardMedia[]; active: boolean }) {
  const [armed, setArmed] = useState(false);
  if (active && !armed) setArmed(true);
  return (
    <div className={`${styles.fan} ${active ? styles.fanOn : ""}`} aria-hidden={!active}>
      {cards.map((c, i) => (
        <FanCard key={c.src} card={c} index={i} href={href} title={title} active={active} armed={armed} />
      ))}
    </div>
  );
}

function FanCard({ card, index, href, title, active, armed }: { card: CardMedia; index: number; href: string; title: string; active: boolean; armed: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // each card takes its media's own proportions, on the project's card colour (as on the home carousel)
  const [ratio, setRatio] = useState(4 / 3);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) void v.play().catch(() => {});
    else v.pause();
  }, [active, armed]);
  const measure = (w: number, h: number) => setRatio(Math.min(1.9, Math.max(0.46, w / h)));
  // videos load lazily, so read their shape from the poster frame
  useEffect(() => {
    if (!card.video || !card.poster) return;
    const im = new Image();
    im.onload = () => measure(im.naturalWidth, im.naturalHeight);
    im.src = card.poster;
  }, [card.video, card.poster]);
  return (
    <div
      className={`${styles.card} ${styles[`card${index}`]} ${ratio < 0.95 ? styles.tall : styles.wide} ${card.video ? styles.cardVideo : ""}`}
      style={{ aspectRatio: String(ratio), backgroundColor: card.bg }}
    >
      <Link href={href} className={styles.screenLink} tabIndex={active ? 0 : -1} aria-label={`Open ${title}`}>
        {card.video ? (
          <video
            ref={videoRef}
            src={armed ? card.src : undefined}
            poster={card.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={card.alt}
            onLoadedMetadata={(e) => measure(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.src} alt={card.alt} loading="lazy" onLoad={(e) => measure(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />
        )}
      </Link>
    </div>
  );
}
