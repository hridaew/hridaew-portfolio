"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Matter from "matter-js";
import { ArrowUpRight, Shuffle } from "lucide-react";
import { ProjectLink } from "../shared/ProjectLink";
import { useCopyEmail } from "../shared/useCopyEmail";
import { useRootBackground } from "../shared/useRootBackground";
import { BIO, PROJECTS, RECOGNITION, WAFFLINGS } from "../shared/work";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import "./workbench.css";

/* ── Objects on the mat ──────────────────────────────────────────────
 * Sizes are designed for a 1440px-wide desk and scaled down on smaller
 * screens. `x`/`y` are the resting spot as a fraction of the desk.
 */

type Kind = "phone" | "cutout" | "print" | "polaroid" | "card" | "recipe" | "nametag" | "sticker";

type DeskObject = {
  id: string;
  kind: Kind;
  href?: string;
  label: string;
  hint: string;
  w: number;
  h: number;
  x: number;
  y: number;
  /** Mobile resting spot, if different. */
  mx?: number;
  my?: number;
  angle: number;
  src?: string;
  alt?: string;
  note?: string;
};

const OBJECTS: DeskObject[] = [
  { id: "phone", kind: "phone", href: "/domis", label: "Domis", hint: "The iOS app I’m designing as founding designer", w: 168, h: 348, x: 0.58, y: 0.34, mx: 0.2, my: 0.62, angle: -0.08, src: "/assets/domis/hero-mobile.png", alt: "Domis app on a phone" },
  { id: "house", kind: "cutout", href: "/domis", label: "Domis", hint: "A 3D avatar of your home, from one photo: +60% engagement", w: 196, h: 196, x: 0.72, y: 0.2, mx: 0.78, my: 0.6, angle: 0.05, src: "/assets/domis/live/home-avatar-3d.png", alt: "3D house avatar" },
  { id: "polaroid", kind: "polaroid", href: "/virdio", label: "Virdio", hint: "AR fitness for any room, across iOS, Android, Web, TV", w: 250, h: 192, x: 0.86, y: 0.42, mx: 0.62, my: 0.78, angle: 0.1, src: "/assets/virdio/in_context.png", alt: "Virdio AR workout in a living room", note: "the living room is the gym" },
  { id: "cone", kind: "cutout", href: "/virdio", label: "Virdio", hint: "An AR cone. Also not real.", w: 104, h: 112, x: 0.47, y: 0.8, mx: 0.9, my: 0.88, angle: -0.25, src: "/assets/virdio/cone.png", alt: "Purple AR cone" },
  { id: "print1", kind: "print", href: "/obscura", label: "OBSCURA", hint: "300+ unseen photographs, curated by where you look", w: 176, h: 176, x: 0.7, y: 0.74, mx: 0.38, my: 0.84, angle: -0.12, src: "/assets/obscura/wayne_crowd_scene.jpg", alt: "Archival photograph from OBSCURA" },
  { id: "print2", kind: "print", href: "/obscura", label: "OBSCURA", hint: "Exhibited at MOHAI, 13 September 2025. Sold out.", w: 132, h: 186, x: 0.79, y: 0.7, mx: 0.5, my: 0.94, angle: 0.16, src: "/assets/obscura/wayne_girl_kimono.jpg", alt: "Archival photograph of a girl in a kimono" },
  { id: "cat", kind: "cutout", href: "/memory-care", label: "Memory Care", hint: "The haptic cat: pressure sensors, purr motors, an Arduino", w: 212, h: 196, x: 0.92, y: 0.82, mx: 0.16, my: 0.9, angle: -0.06, src: "/assets/grid/memorycare-cat-straight.png", alt: "The haptic plush cat" },
  { id: "sticker", kind: "sticker", href: "/memory-care", label: "Memory Care", hint: "Fast Company World Changing Ideas, finalist 2022", w: 112, h: 112, x: 0.6, y: 0.66, mx: 0.86, my: 0.7, angle: 0.3, note: "Fast Company WCI · 2022" },
  { id: "recorder", kind: "cutout", href: "/waffling/recorder", label: "Recorder-Proto", hint: "A voice recorder with a turntable scrub", w: 138, h: 166, x: 0.95, y: 0.16, mx: 0.88, my: 0.96, angle: 0.12, src: "/assets/recorder/card.png", alt: "Recorder prototype" },
  { id: "savor", kind: "card", href: "/waffling/savor", label: "Savor", hint: "A phone video in, a 3D Gaussian splat out", w: 224, h: 126, x: 0.83, y: 0.08, mx: 0.3, my: 0.72, angle: -0.05, src: "/assets/savor/hero-poster.jpg", alt: "Savor capture of Rodin’s Mighty Hand" },
  { id: "orca", kind: "card", href: "/waffling/orca", label: "Saving Baby J", hint: "An arcade game you play by throwing orca plushies", w: 132, h: 156, x: 0.37, y: 0.74, mx: 0.66, my: 0.62, angle: 0.08, src: "/assets/orca/card.jpg", alt: "Saving Baby J title card" },
  { id: "recipe", kind: "recipe", href: "/butter-chicken", label: "Butter Chicken", hint: "Taste scales linearly with butter", w: 208, h: 138, x: 0.22, y: 0.82, mx: 0.44, my: 0.66, angle: -0.07 },
  { id: "nametag", kind: "nametag", label: "That’s me", hint: "Click to copy my email", w: 196, h: 136, x: 0.08, y: 0.72, mx: 0.12, my: 0.74, angle: -0.1, src: "/assets/home/hero-face-badge.webp", alt: "Hridae’s face" },
];

const BASE_W = 1440;
const IDLE_HINT = {
  pointer: "Drag to move \u00b7 flick to throw \u00b7 click to open",
  touch: "Drag to move \u00b7 flick to throw \u00b7 tap to open",
};

type Live = { def: DeskObject; body: Matter.Body; el: HTMLElement; w: number; h: number };

export function WorkbenchHome() {
  const deskRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const objRefs = useRef<Record<string, HTMLElement | null>>({});
  const liveRef = useRef<Live[]>([]);
  const tidyRef = useRef<() => void>(() => {});
  const dragRef = useRef<{
    id: string;
    constraint: Matter.Constraint;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const wasDragRef = useRef(false);
  const [hover, setHover] = useState<DeskObject | null>(null);
  const [ready, setReady] = useState(false);
  const [touch, setTouch] = useState(false);
  const { email, copied, copy } = useCopyEmail();
  useRootBackground("#24493e");

  useEffect(() => {
    const desk = deskRef.current;
    const head = headRef.current;
    if (!desk || !head) return;
    const { Engine, Bodies, Body, Composite, Constraint } = Matter;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engine.positionIterations = 8;
    engine.velocityIterations = 6;

    let W = desk.clientWidth;
    let H = desk.clientHeight;
    const mobile = W < 760;
    const s = Math.max(0.5, Math.min(1.05, (W / BASE_W) * (mobile ? 1.55 : 1)));

    // Walls + a collider under the printed headline so nothing covers it.
    let statics: Matter.Body[] = [];
    const buildStatics = () => {
      Composite.remove(engine.world, statics);
      const t = 400;
      const hr = head.getBoundingClientRect();
      const dr = desk.getBoundingClientRect();
      statics = [
        Bodies.rectangle(W / 2, -t / 2, W + t * 2, t, { isStatic: true }),
        Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, H / 2, t, H + t * 2, { isStatic: true }),
        Bodies.rectangle(W + t / 2, H / 2, t, H + t * 2, { isStatic: true }),
        Bodies.rectangle(
          hr.left - dr.left + hr.width / 2,
          hr.top - dr.top + hr.height / 2,
          hr.width + 24,
          hr.height + 24,
          { isStatic: true, chamfer: { radius: 24 } },
        ),
      ];
      Composite.add(engine.world, statics);
    };
    buildStatics();

    const live: Live[] = [];
    for (const def of OBJECTS) {
      const el = objRefs.current[def.id];
      if (!el) continue;
      const w = def.w * s;
      const h = def.h * s;
      const fx = mobile ? (def.mx ?? def.x) : def.x;
      const fy = mobile ? (def.my ?? def.y) : def.y;
      const x = Math.min(W - w / 2 - 8, Math.max(w / 2 + 8, fx * W));
      const y = Math.min(H - h / 2 - 8, Math.max(h / 2 + 8, fy * H));
      const body = Bodies.rectangle(x, y, w, h, {
        angle: def.angle,
        frictionAir: 0.09,
        friction: 0.2,
        restitution: 0.3,
        density: def.kind === "cutout" ? 0.003 : 0.0018,
        chamfer: { radius: def.kind === "sticker" ? Math.min(w, h) / 2 - 1 : 6 * s },
      });
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      live.push({ def, body, el, w, h });
    }
    Composite.add(engine.world, live.map((l) => l.body));
    liveRef.current = live;

    // Let any overlaps from the initial layout resolve before first paint.
    for (let i = 0; i < 60; i++) Engine.update(engine, 1000 / 60);
    const home = live.map((l) => ({ x: l.body.position.x, y: l.body.position.y, a: l.body.angle }));
    for (const l of live) {
      Body.setVelocity(l.body, { x: 0, y: 0 });
      Body.setAngularVelocity(l.body, 0);
    }

    // Tidy: everything glides home, passing through each other on the way.
    const TIDY_MS = 1100;
    let tidyUntil = 0;
    const setGhost = (ghost: boolean) => {
      for (const l of live) l.body.collisionFilter.mask = ghost ? 0 : 0xffffffff;
    };
    tidyRef.current = () => {
      tidyUntil = performance.now() + TIDY_MS;
      setGhost(true);
    };
    const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(1000 / 30, now - last);
      last = now;
      if (tidyUntil) {
        if (now < tidyUntil) {
          live.forEach((l, i) => {
            const hm = home[i];
            Body.setVelocity(l.body, {
              x: (hm.x - l.body.position.x) * 0.14,
              y: (hm.y - l.body.position.y) * 0.14,
            });
            Body.setAngularVelocity(l.body, wrapAngle(hm.a - l.body.angle) * 0.14);
          });
        } else {
          tidyUntil = 0;
          setGhost(false);
        }
      }
      Engine.update(engine, dt);
      for (const l of live) {
        const { x, y } = l.body.position;
        l.el.style.transform = `translate3d(${(x - l.w / 2).toFixed(2)}px, ${(y - l.h / 2).toFixed(2)}px, 0) rotate(${l.body.angle.toFixed(4)}rad)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    setReady(true);
    setTouch(window.matchMedia("(hover: none)").matches);

    const onResize = () => {
      W = desk.clientWidth;
      H = desk.clientHeight;
      buildStatics();
      for (const l of live) {
        const { x, y } = l.body.position;
        Body.setPosition(l.body, {
          x: Math.min(W - l.w / 2, Math.max(l.w / 2, x)),
          y: Math.min(H - l.h / 2, Math.max(l.h / 2, y)),
        });
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(desk);

    // Grab with a spring constraint: the object pivots around where you hold it.
    const toDesk = (e: PointerEvent) => {
      const r = desk.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    let z = 10;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-obj]");
      if (!target) return;
      const l = live.find((x) => x.def.id === target.dataset.obj);
      if (!l) return;
      const p = toDesk(e);
      const constraint = Constraint.create({
        pointA: p,
        bodyB: l.body,
        pointB: { x: p.x - l.body.position.x, y: p.y - l.body.position.y },
        stiffness: 0.2,
        damping: 0.12,
        length: 0,
      });
      Composite.add(engine.world, constraint);
      dragRef.current = { id: l.def.id, constraint, startX: e.clientX, startY: e.clientY, moved: false };
      wasDragRef.current = false;
      target.setPointerCapture(e.pointerId);
      target.dataset.lifted = "";
      target.style.zIndex = String(++z);
    };
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      d.constraint.pointA = toDesk(e);
      if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) {
        d.moved = true;
        wasDragRef.current = true;
      }
    };
    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      Composite.remove(engine.world, d.constraint);
      const el = objRefs.current[d.id];
      if (el) delete el.dataset.lifted;
      dragRef.current = null;
      // The click that follows pointerup still needs to see the drag flag;
      // clear it afterwards so a later keyboard Enter isn't swallowed.
      window.setTimeout(() => {
        wasDragRef.current = false;
      }, 0);
    };
    desk.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      desk.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      Engine.clear(engine);
    };
  }, []);

  const shouldNavigate = useCallback(() => !wasDragRef.current, []);

  const setObj = (id: string) => (el: HTMLElement | null) => {
    objRefs.current[id] = el;
  };

  const objProps = (o: DeskObject, i: number) => ({
    "data-obj": o.id,
    "data-kind": o.kind,
    className: "vw-obj",
    draggable: false,
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
    onPointerEnter: () => setHover(o),
    onPointerLeave: () => setHover((h) => (h?.id === o.id ? null : h)),
    onFocus: () => setHover(o),
    onBlur: () => setHover((h) => (h?.id === o.id ? null : h)),
    style: { "--i": i } as React.CSSProperties,
  });

  return (
    <main className="vw">
      <section ref={deskRef} className="vw-desk" data-ready={ready ? "" : undefined} aria-label="A desk of things I made">
        <div className="vw-ruler vw-ruler--top" aria-hidden />
        <div className="vw-ruler vw-ruler--left" aria-hidden />

        <div ref={headRef} className="vw-head">
          <p className="v-mono vw-kicker">
            {BIO.name} · {BIO.role} · {BIO.location}
          </p>
          <h1 className="v-display vw-title">Everything on this desk is something I made.</h1>
          <p className="v-sans vw-lede">
            Six years designing for interaction models that barely exist yet: apps, AR,
            VR, and things with fur. Pick anything up.
          </p>
          <div className="vw-head__links">
            <a href={CV_HREF} target="_blank" rel="noopener noreferrer" className="vw-chip v-mono">
              CV <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
            <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" className="vw-chip v-mono">
              LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>

        {OBJECTS.map((o, i) => {
          const body = <DeskObjectBody o={o} copied={copied} />;
          if (o.kind === "nametag") {
            return (
              <button
                key={o.id}
                ref={setObj(o.id)}
                type="button"
                aria-label={`Copy email address ${email}`}
                onClick={() => {
                  if (!wasDragRef.current) void copy();
                }}
                {...objProps(o, i)}
              >
                {body}
              </button>
            );
          }
          return (
            <ProjectLink
              key={o.id}
              ref={setObj(o.id)}
              href={o.href!}
              shouldNavigate={shouldNavigate}
              aria-label={`${o.label}: ${o.hint}`}
              {...objProps(o, i)}
            >
              {body}
            </ProjectLink>
          );
        })}

        <div className="vw-caption v-mono" aria-live="polite">
          {hover ? (
            <>
              <span className="vw-caption__label">{hover.label}</span>
              <span className="vw-caption__hint">{hover.hint}</span>
            </>
          ) : (
            <span className="vw-caption__hint">{touch ? IDLE_HINT.touch : IDLE_HINT.pointer}</span>
          )}
        </div>
        <button type="button" className="vw-tidy v-mono" onClick={() => tidyRef.current()}>
          <Shuffle className="size-3.5" aria-hidden /> Tidy up
        </button>
      </section>

      <section className="vw-list" aria-labelledby="vw-list-title">
        <p className="v-mono vw-list__kicker" id="vw-list-title">The same desk, as a list</p>
        <ul className="vw-rows">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <ProjectLink href={p.href} className="vw-row">
                <span className="v-display vw-row__name">{p.name}</span>
                <span className="v-sans vw-row__title">{p.title}</span>
                <span className="v-mono vw-row__meta">
                  {p.role} · {p.years}
                </span>
              </ProjectLink>
            </li>
          ))}
        </ul>
        <div className="vw-cols">
          <div>
            <p className="v-mono vw-list__kicker">Smaller builds</p>
            <ul className="vw-mini">
              {WAFFLINGS.map((w) => (
                <li key={w.slug}>
                  <ProjectLink href={w.href} className="vw-mini__row">
                    <strong>{w.name}</strong> <span>{w.line}</span>
                  </ProjectLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="v-mono vw-list__kicker">Recognition</p>
            <ul className="vw-mini">
              {RECOGNITION.map((r) => (
                <li key={r.label} className="vw-mini__row">
                  <strong>{r.label}</strong> <span>{r.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button type="button" onClick={copy} className="v-display vw-email">
          {copied ? "Copied." : email}
        </button>
      </section>
    </main>
  );
}

/* ── How each kind of object is drawn ──────────────────────────────── */

function DeskObjectBody({ o, copied }: { o: DeskObject; copied: boolean }) {
  switch (o.kind) {
    case "phone":
      return (
        <span className="vw-inner vw-phone">
          <span className="vw-phone__screen">
            <Image src={o.src!} alt={o.alt!} fill sizes="180px" className="object-cover object-top" draggable={false} />
          </span>
        </span>
      );
    case "cutout":
      return (
        <span className="vw-inner vw-cutout">
          <Image src={o.src!} alt={o.alt!} fill sizes="220px" className="object-contain" draggable={false} />
        </span>
      );
    case "print":
      return (
        <span className="vw-inner vw-print">
          <span className="vw-print__img">
            <Image src={o.src!} alt={o.alt!} fill sizes="200px" className="object-cover" draggable={false} />
          </span>
        </span>
      );
    case "polaroid":
      return (
        <span className="vw-inner vw-polaroid">
          <span className="vw-polaroid__img">
            <Image src={o.src!} alt={o.alt!} fill sizes="260px" className="object-cover" draggable={false} />
          </span>
          <span className="vw-polaroid__note">{o.note}</span>
        </span>
      );
    case "card":
      return (
        <span className="vw-inner vw-card">
          <Image src={o.src!} alt={o.alt!} fill sizes="240px" className="object-cover" draggable={false} />
        </span>
      );
    case "recipe":
      return (
        <span className="vw-inner vw-recipe">
          <span className="vw-recipe__title">Butter Chicken</span>
          <span className="vw-recipe__line">butter ............ yes</span>
          <span className="vw-recipe__line">more butter ... also yes</span>
          <span className="vw-recipe__line">amounts ......... vibes</span>
        </span>
      );
    case "sticker":
      return (
        <span className="vw-inner vw-sticker">
          <span className="vw-sticker__top">Finalist</span>
          <span className="vw-sticker__mid">World Changing Ideas</span>
          <span className="vw-sticker__bot">Fast Company 2022</span>
        </span>
      );
    case "nametag":
      return (
        <span className="vw-inner vw-tag">
          <span className="vw-tag__head">
            <span className="vw-tag__hello">HELLO</span>
            <span className="vw-tag__sub">my name is</span>
          </span>
          <span className="vw-tag__body">
            <span className="vw-tag__face">
              <Image src={o.src!} alt={o.alt!} fill sizes="60px" className="object-contain" draggable={false} />
            </span>
            <span className="vw-tag__name">{copied ? "Copied!" : "Hridae"}</span>
          </span>
        </span>
      );
  }
}
