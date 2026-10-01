"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Copy, RotateCcw } from "lucide-react";
import { ProjectLink } from "../shared/ProjectLink";
import { useCopyEmail } from "../shared/useCopyEmail";
import { BIO, PROJECTS, WAFFLINGS, type VariantMedia } from "../shared/work";
import {
  DEFAULT_VIEW,
  PERSONAS,
  THINKING_STEPS,
  type ItemId,
  type PersonaId,
} from "./personas";
import "./one-thing.css";

/* ── One list of everything the page can recommend ─────────────────── */

type Item = {
  id: ItemId;
  href: string;
  name: string;
  meta: string;
  fallbackWhy: string;
  media: VariantMedia;
  color: string;
  kind: "Case study" | "Waffling";
};

const ITEMS: Record<ItemId, Item> = Object.fromEntries([
  ...PROJECTS.map((p) => [
    p.slug,
    {
      id: p.slug,
      href: p.href,
      name: p.name,
      meta: `${p.role} · ${p.years}`,
      fallbackWhy: p.title + ".",
      media: p.cover,
      color: p.color,
      kind: "Case study" as const,
    },
  ]),
  ...WAFFLINGS.map((w) => [
    w.slug,
    {
      id: w.slug as ItemId,
      href: w.href,
      name: w.name,
      meta: "Waffling",
      fallbackWhy: w.line,
      media: w.media,
      color: "#e7e4dd",
      kind: "Waffling" as const,
    },
  ]),
]) as Record<ItemId, Item>;

const STORAGE_KEY = "hw-variant-one-thing";
const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const STEP_MS = 340;

function readStored(): PersonaId | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return PERSONAS.some((p) => p.id === v) ? (v as PersonaId) : null;
  } catch {
    return null;
  }
}

function writeStored(v: PersonaId | null) {
  try {
    if (v) window.localStorage.setItem(STORAGE_KEY, v);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / blocked storage: the page still works, it just forgets */
  }
}

export function OneThingHome() {
  const reduce = useReducedMotion();
  // `picked` is the chip; `applied` is what the page has actually rearranged for.
  const [picked, setPicked] = useState<PersonaId | null>(null);
  const [applied, setApplied] = useState<PersonaId | null>(null);
  const [step, setStep] = useState(-1);
  const [remembered, setRemembered] = useState(false);
  const timers = useRef<number[]>([]);
  const { email, copied, copy } = useCopyEmail();

  useEffect(() => {
    const stored = readStored();
    if (!stored) return;
    // Defer so restoring isn't a synchronous setState inside the effect.
    const id = window.setTimeout(() => {
      setPicked(stored);
      setApplied(stored);
      setStep(THINKING_STEPS.length);
      setRemembered(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const choose = useCallback(
    (id: PersonaId) => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setPicked(id);
      setRemembered(false);
      writeStored(id);
      if (reduce) {
        setApplied(id);
        setStep(THINKING_STEPS.length);
        return;
      }
      // Staged: read → re-rank (the layout moves here) → proof → done.
      setStep(0);
      THINKING_STEPS.forEach((_, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setStep(i + 1);
            if (i === 0) setApplied(id);
          }, STEP_MS * (i + 1)),
        );
      });
    },
    [reduce],
  );

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setPicked(null);
    setApplied(null);
    setStep(-1);
    setRemembered(false);
    writeStored(null);
  };

  const persona = PERSONAS.find((p) => p.id === applied) ?? null;
  const view = persona ?? DEFAULT_VIEW;
  const items = useMemo(() => view.order.map((id) => ITEMS[id]), [view.order]);
  const thinking = step >= 0 && step < THINKING_STEPS.length;
  const done = step >= THINKING_STEPS.length;

  return (
    <main className="vo">
      <header className="vo-bar">
        <span className="vo-me">
          <span className="vo-me__face">
            <Image src="/assets/home/hero-face-badge.webp" alt="" fill sizes="36px" className="object-contain" priority />
          </span>
          <span className="v-mono">
            {BIO.name} · {BIO.role}
          </span>
        </span>
        <button type="button" onClick={copy} className="vo-chip vo-chip--ghost v-mono">
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : email}
        </button>
      </header>

      <section className="vo-hero">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={view.headline}
            className="v-display vo-title"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {view.headline}
          </motion.h1>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={view.sub}
            className="v-sans vo-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.08 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            {view.sub}
          </motion.p>
        </AnimatePresence>

        <div className="vo-ask">
          <p className="v-mono vo-ask__label" id="vo-ask">
            {remembered ? "Welcome back. Still true?" : "What brings you here?"}
          </p>
          <div role="group" aria-labelledby="vo-ask" className="vo-chips">
            {PERSONAS.map((p) => {
              const on = picked === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(p.id)}
                  className="vo-chip vo-chip--ask v-sans"
                  data-on={on ? "" : undefined}
                  data-dim={picked && !on ? "" : undefined}
                  whileTap={reduce ? undefined : { scale: 0.94 }}
                  transition={SPRING}
                >
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        className="vo-chip__check"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 16, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={SPRING}
                      >
                        <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {p.chip}
                </motion.button>
              );
            })}
          </div>

          <div className="vo-status v-mono" aria-live="polite">
            {picked ? (
              <>
                <ol className="vo-steps">
                  {THINKING_STEPS.map((label, i) => (
                    <li key={label} data-state={step > i ? "done" : step === i ? "now" : "todo"}>
                      <span className="vo-steps__dot" aria-hidden>
                        {step > i ? <Check className="size-3" strokeWidth={3} /> : null}
                      </span>
                      {label}
                    </li>
                  ))}
                </ol>
                {done && (
                  <button type="button" onClick={reset} className="vo-reset">
                    <RotateCcw className="size-3" aria-hidden /> Change answer
                  </button>
                )}
              </>
            ) : (
              <span className="vo-status__idle">One tap. No sign-up, no tracking, just a different page.</span>
            )}
          </div>
        </div>
      </section>

      <section className="vo-proof" aria-label="Proof">
        {view.proof.map((p, i) => (
          <AnimatePresence key={i} mode="wait" initial={false}>
            <motion.div
              key={p.value + p.label}
              className="vo-stat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.36, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
            >
              <span className="v-display vo-stat__value">{p.value}</span>
              <span className="v-sans vo-stat__label">{p.label}</span>
              <span className="v-mono vo-stat__src">{p.src}</span>
            </motion.div>
          </AnimatePresence>
        ))}
      </section>

      <LayoutGroup>
        <motion.ol className="vo-grid" data-thinking={thinking ? "" : undefined} layout={!reduce}>
          {items.map((it, i) => {
            const why = view.why[it.id] ?? it.fallbackWhy;
            const featured = i === 0;
            // Hierarchy: 1 to start with, 3 to look at next, the rest compact.
            const tier = featured ? 1 : i <= 3 ? 2 : 3;
            const portrait = it.media.h > it.media.w;
            return (
              <motion.li
                key={it.id}
                layout={!reduce}
                transition={SPRING}
                className="vo-cell"
                data-tier={tier}
                data-featured={featured ? "" : undefined}
              >
                <ProjectLink href={it.href} className="vo-card">
                  <motion.span layout={!reduce ? "position" : false} transition={SPRING} className="vo-card__media" style={{ background: it.color }}>
                    <span
                      className="vo-card__frame"
                      data-portrait={portrait ? "" : undefined}
                      style={{ aspectRatio: `${it.media.w} / ${it.media.h}` }}
                    >
                      <Image
                        src={it.media.src}
                        alt={it.media.alt}
                        fill
                        sizes={featured ? "(min-width: 900px) 55vw, 100vw" : tier === 2 ? "(min-width: 900px) 30vw, 100vw" : "160px"}
                        className="object-cover"
                      />
                    </span>
                  </motion.span>
                  <motion.span layout={!reduce ? "position" : false} transition={SPRING} className="vo-card__text">
                    {featured && applied ? (
                      <span className="v-mono vo-card__flag">Start here</span>
                    ) : (
                      <span className="v-mono vo-card__kind">{it.kind}</span>
                    )}
                    <span className="v-display vo-card__name">
                      {it.name}
                      <ArrowUpRight className="vo-card__arrow" strokeWidth={2.5} aria-hidden />
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={why}
                        className="v-sans vo-card__why"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.28, delay: 0.12 } }}
                        exit={{ opacity: 0, transition: { duration: 0.12 } }}
                      >
                        {why}
                      </motion.span>
                    </AnimatePresence>
                    <span className="v-mono vo-card__meta">{it.meta}</span>
                  </motion.span>
                </ProjectLink>
              </motion.li>
            );
          })}
        </motion.ol>
      </LayoutGroup>

      <section className="vo-end">
        <div className="vo-tools">
          <p className="v-mono vo-end__label">{persona ? "Tools for this" : "Current toolkit"}</p>
          <ul>
            {view.tools.map((t) => (
              <motion.li key={t} layout={!reduce} transition={SPRING} className="v-sans">
                {t}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="vo-cta">
          <p className="v-sans vo-cta__bio">{BIO.long}</p>
          <div className="vo-cta__row">
            {view.cta.external ? (
              <a href={view.cta.href} target="_blank" rel="noopener noreferrer" className="vo-chip vo-chip--solid v-mono">
                {view.cta.label} <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            ) : (
              <ProjectLink href={view.cta.href} className="vo-chip vo-chip--solid v-mono">
                {view.cta.label} <ArrowUpRight className="size-3.5" aria-hidden />
              </ProjectLink>
            )}
            <button type="button" onClick={copy} className="vo-chip vo-chip--ghost v-mono">
              {copied ? "Copied" : email}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
