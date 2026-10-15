"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import { TextReveal } from "@/components/TextReveal";
import { LightboxImage } from "@/components/virdio/Lightbox";

/** Chapter header: number label + chapter heading, matching the site's editorial pattern. */
export function VirdioChapterHead({
    number,
    eyebrow,
    title,
    lede,
}: {
    number: string;
    eyebrow: string;
    title: string;
    lede?: ReactNode;
}) {
    return (
        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
            <Reveal>
                <span className="site-label text-ink-subtle">
                    {number} · {eyebrow}
                </span>
            </Reveal>
            <h2 className="site-chapter-heading text-ink text-left">
                <TextReveal>{title}</TextReveal>
            </h2>
            {lede ? (
                <Reveal delay={0.1}>
                    <p className="site-body text-ink-muted text-left">{lede}</p>
                </Reveal>
            ) : null}
        </div>
    );
}

const GLANCE = [
    {
        label: "Problem",
        body: "Engaging home fitness was locked behind $1,500 hardware. Virdio’s machine vision could make any camera the equipment.",
    },
    {
        label: "Insight",
        body: "The device everyone owns gave the worst AR. And once class starts, the user is across the room, mid-rep.",
    },
    {
        label: "What I built",
        body: "Room setup you walk through, AR equipment that teaches and counts, a HUD per device, and one system across six surfaces.",
    },
    {
        label: "Outcome",
        body: "Shipped on every platform in mid-2022 to a few good reviews, then didn’t take off. The lesson I kept was focus.",
    },
];

/** Four-cell summary for the 90-second skim. */
export function VirdioGlance({ className }: { className?: string }) {
    return (
        <div className={cn("w-full min-w-0", className)}>
            <p className="site-label mb-4 text-ink-subtle text-left">At a glance</p>
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-ink/[0.08] ring-1 ring-ink/[0.08] sm:grid-cols-2">
                {GLANCE.map((g) => (
                    <div key={g.label} className="flex flex-col gap-2 bg-paper-raised p-6 md:p-7">
                        <dt className="site-label text-ink-subtle">{g.label}</dt>
                        <dd className="site-body m-0 text-ink-secondary">{g.body}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/**
 * Statement band for the story's turn. Deep violet keeps white body text
 * above 4.5:1 (≈6:1 on #5B3FD6).
 */
export function VirdioPrinciple({
    eyebrow,
    statement,
    note,
}: {
    eyebrow: string;
    statement: string;
    note?: string;
}) {
    return (
        <aside
            aria-label={eyebrow}
            className="rounded-3xl bg-[#5B3FD6] px-6 py-10 text-left text-[#F4F2F8] md:px-14 md:py-16"
        >
            <p className="site-label mb-5 text-[#E4DCFF]">{eyebrow}</p>
            <p className="type-h2 m-0 text-[#F4F2F8] [text-wrap:balance]">{statement}</p>
            {note ? <p className="site-body mt-6 mb-0 text-[#E4DCFF]">{note}</p> : null}
        </aside>
    );
}

/** Last line of a chapter: names the problem the next chapter solves. */
export function VirdioBridge({ children }: { children: ReactNode }) {
    return (
        <Reveal>
            <p className="site-body m-0 flex items-start gap-4 font-medium text-ink">
                <span aria-hidden className="mt-3 h-px w-6 shrink-0 bg-[#5B3FD6]" />
                <span>{children}</span>
            </p>
        </Reveal>
    );
}

type Shot = { src: string; alt: string; caption: string; strong?: string };

/** A row of captioned screens; stacks on mobile. */
export function VirdioShotRow({
    shots,
    cols = 2,
    contain = false,
    className,
}: {
    shots: Shot[];
    cols?: 2 | 3 | 4;
    contain?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 items-start case-study-grid-gap",
                cols === 4 ? "grid-cols-2 md:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
                className,
            )}
        >
            {shots.map((s) => (
                <figure key={s.src} className="m-0 flex min-w-0 flex-col gap-3">
                    <div
                        className={cn(
                            "overflow-hidden rounded-2xl border border-ink/[0.08]",
                            contain ? "bg-paper-raised" : "bg-paper-sunken",
                        )}
                    >
                        <LightboxImage
                            src={s.src}
                            alt={s.alt}
                            className={cn("h-auto w-full", contain ? "object-contain" : "object-cover")}
                            draggable={false}
                            loading="lazy"
                            hoverScale={1.02}
                        />
                    </div>
                    <figcaption className="site-gallery-caption text-left text-ink-subtle">
                        {s.strong ? <span className="font-semibold text-ink-secondary">{s.strong} </span> : null}
                        {s.caption}
                    </figcaption>
                </figure>
            ))}
        </div>
    );
}

type Card = { kind: string; title: string; body: string; accent?: boolean };

/** Three bordered columns: outcome, reflection. */
export function VirdioCardRow({ cards }: { cards: Card[] }) {
    return (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3">
            {cards.map((c) => (
                <li
                    key={c.title}
                    className={cn(
                        "flex flex-col gap-2 rounded-2xl p-5 md:p-6 ring-1",
                        c.accent ? "bg-[#5B3FD6]/[0.07] ring-[#5B3FD6]/30" : "bg-paper-raised ring-ink/[0.08]",
                    )}
                >
                    <span className="site-label text-ink-subtle">{c.kind}</span>
                    <span className="site-subheading text-ink">{c.title}</span>
                    <span className="site-body text-ink-muted">{c.body}</span>
                </li>
            ))}
        </ul>
    );
}
