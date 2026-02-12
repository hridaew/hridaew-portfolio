"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EditorialLayout } from "./case-study/EditorialLayout";
import { Reveal } from "./Reveal";

export function AboutMeSection() {
    const [imageExpanded, setImageExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const socialLinks = [
        { label: "LinkedIn", url: "https://www.linkedin.com/in/hridae" },
        { label: "Email", url: "mailto:hridaew@gmail.com" },
    ];

    const experience = [
        { name: "Domis", years: "2024 —", url: "https://getdomis.com", subtitle: "Founding Product Designer for a consumer app leveraging AI, and premium design to make home maintenance a breeze." },
        { name: "Museum of History and Industry", years: "2024 – 2025", url: "https://mohai.org/event/transpacific-photography-and-the-obscura-project-post-world-war-ii-life-in-japan/", subtitle: "Design lead for an immersive exhibit based on photos from post WW2 Japan, sold out event on 09/13/2025." },
        { name: "Maria Mortati Experience Design", years: "2020 – 2023 (non-consecutive)", url: "https://mortatidesign.com", subtitle: "Interaction Design and Research for a project focused on multi-sensory, immersive experiences for people with Alzheimer's." },
        { name: "Virdio", years: "2021 – 2022", url: "https://virdiohealth.com", subtitle: "Product Designer, owned end-to-end Design for a cross-platform AR fitness app." },
    ];

    const education = [
        { name: "University of Washington", program: "MHCI+D", url: "https://mhcid.washington.edu" },
        { name: "California College of the Arts", program: "Interaction Design", url: "https://cca.edu/design/ixd/", note: "(RIP — closing 2027)" },
    ];

    return (
        <section className="py-24 md:py-32 bg-[var(--surface-card)] border-t border-[var(--border-card)]">
            <EditorialLayout width="breakout">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left Column: Bio */}
                    <div className="space-y-8">
                        {/* Clickable About Me Image */}
                        <Reveal>
                            <div
                                className="cursor-pointer rounded-2xl overflow-hidden"
                                onClick={() => setImageExpanded(true)}
                            >
                                <motion.img
                                    layoutId="aboutme-image"
                                    src="/assets/aboutme.png"
                                    alt="Hridae at Valve Software"
                                    className="w-full h-auto rounded-2xl"
                                    draggable={false}
                                />
                            </div>
                        </Reveal>

                        <Reveal delay={0.1}>
                            <p className="font-[family-name:var(--font-dm-sans)] text-base italic text-neutral-400 mb-2">
                                (pronounced ri-they waliaa)
                            </p>
                            <div className="space-y-6 font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
                                <p>
                                    I am a Product Designer and Technologist with a passion for building
                                    immersive, and interactive experiences for people. I&apos;m thrilled to be a designer in
                                    the current landscape — as someone with an ambitious imagination, I&apos;ve
                                    been having a lot of fun with experimenting and building at will.
                                </p>
                                <p>
                                    With over 5 years of experience, I&apos;ve helped startups and
                                    museums alike bring their visions to life, from 0-to-1 product
                                    launches to interactive exhibits that make you go :O.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div className="pt-8">
                                <Link
                                    href="https://drive.google.com/file/d/1Ha7vP0l5HG9IKC4rbd3Y58GZqCIeqGZa/view"
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-[family-name:var(--font-dm-sans)] font-semibold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
                                >
                                    Download CV
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>
                        </Reveal>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-12">
                        {/* Experience */}
                        <Reveal delay={0.3}>
                            <div className="space-y-4">
                                <h3 className="font-[family-name:var(--font-dm-sans)] font-semibold text-xs text-[var(--text-subtle)] uppercase tracking-widest">
                                    Experience
                                </h3>
                                <ul className="space-y-2">
                                    {experience.map((item, i) => (
                                        <li key={i} className="border-b border-[var(--border-card)] pb-3 last:border-0">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-foreground font-medium hover:underline underline-offset-4 transition-colors"
                                            >
                                                {item.name}
                                            </a>
                                            <p className="font-[family-name:var(--font-dm-sans)] text-xs text-[var(--text-subtle)] tracking-wide mt-0.5">
                                                {item.years}
                                            </p>
                                            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-[var(--text-muted)] leading-relaxed mt-1">
                                                {item.subtitle}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>

                        {/* Education */}
                        <Reveal delay={0.35}>
                            <div className="space-y-4">
                                <h3 className="font-[family-name:var(--font-dm-sans)] font-semibold text-xs text-[var(--text-subtle)] uppercase tracking-widest">
                                    Education
                                </h3>
                                <ul className="space-y-2">
                                    {education.map((item, i) => (
                                        <li key={i} className="border-b border-[var(--border-card)] pb-2 last:border-0">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-foreground font-medium hover:underline underline-offset-4 transition-colors"
                                            >
                                                {item.name} — {item.program}
                                            </a>
                                            {item.note && (
                                                <span className="font-[family-name:var(--font-dm-sans)] text-sm text-[var(--text-muted)] italic ml-2">
                                                    {item.note}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>

                        {/* Connect */}
                        <Reveal delay={0.4}>
                            <div className="space-y-4">
                                <h3 className="font-[family-name:var(--font-dm-sans)] font-semibold text-xs text-[var(--text-subtle)] uppercase tracking-widest">
                                    Connect
                                </h3>
                                <div className="flex flex-wrap gap-x-8 gap-y-4">
                                    {socialLinks.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            className="font-[family-name:var(--font-dm-sans)] text-base text-[var(--text-secondary)] hover:text-foreground hover:underline underline-offset-4 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </EditorialLayout>

            {/* Expanded Image Overlay — portaled to body for correct viewport centering */}
            {mounted && createPortal(
                <AnimatePresence>
                    {imageExpanded && (
                        <motion.div
                            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setImageExpanded(false)}
                        >
                            {/* Backdrop */}
                            <motion.div
                                className="absolute inset-0 bg-black/80"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            {/* Expanded image */}
                            <motion.img
                                layoutId="aboutme-image"
                                src="/assets/aboutme.png"
                                alt="Hridae at Valve Software"
                                className="relative z-10 max-w-[600px] w-full rounded-2xl"
                                draggable={false}
                            />

                            {/* Caption text */}
                            <motion.p
                                className="relative z-10 mt-6 font-[family-name:var(--font-dm-sans)] text-white/80 text-base md:text-lg text-center max-w-[500px] leading-relaxed"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >
                                This photo is from when I visited the offices of Valve Software, they also signed my Steam Deck. Pretty cool...
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}
