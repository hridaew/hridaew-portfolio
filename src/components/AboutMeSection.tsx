"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";

export function AboutMeSection() {
    const [imageExpanded, setImageExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const bentoImgRefs = useRef<(HTMLDivElement | null)[]>([]);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const tiltStateRef = useRef([
        { rx: 0, ry: 0, scale: 1 },
        { rx: 0, ry: 0, scale: 1 },
        { rx: 0, ry: 0, scale: 1 },
    ]);
    const tiltRafRef = useRef<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouseMove);

        const loop = () => {
            const { x: mx, y: my } = mousePosRef.current;

            bentoImgRefs.current.forEach((el, i) => {
                if (!el) return;
                const state = tiltStateRef.current[i];
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const isInside = mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom;

                let targetRx: number, targetRy: number, targetScale: number;

                if (isInside) {
                    const nx = ((mx - rect.left) / rect.width) * 2 - 1;
                    const ny = ((my - rect.top) / rect.height) * 2 - 1;
                    targetRx = -ny * 4.5;
                    targetRy = nx * 4.5;
                    targetScale = 1.02;
                } else {
                    const dx = mx - cx;
                    const dy = my - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const radius = 320;
                    if (dist < radius) {
                        const strength = (1 - dist / radius) * 0.25;
                        const nx = dx / (dist || 1);
                        const ny = dy / (dist || 1);
                        targetRx = -ny * 4 * strength;
                        targetRy = nx * 4 * strength;
                        targetScale = 1 + 0.008 * (1 - dist / radius);
                    } else {
                        targetRx = 0;
                        targetRy = 0;
                        targetScale = 1;
                    }
                }

                const lerpSpeed = isInside ? 0.14 : 0.07;
                state.rx += (targetRx - state.rx) * lerpSpeed;
                state.ry += (targetRy - state.ry) * lerpSpeed;
                state.scale += (targetScale - state.scale) * lerpSpeed;

                if (Math.abs(state.rx) > 0.005 || Math.abs(state.ry) > 0.005 || Math.abs(state.scale - 1) > 0.0003) {
                    el.style.transform = `perspective(900px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) scale(${state.scale})`;
                    el.style.zIndex = isInside ? "10" : "";
                } else {
                    el.style.transform = "";
                    el.style.zIndex = "";
                }
            });

            tiltRafRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
        };
    }, []);

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
            <div className="max-w-[1558px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left Column: Bio */}
                    <div className="space-y-8">
                        {/* Bento image grid */}
                        <Reveal>
                            <div
                                className="grid gap-3 h-[480px] md:h-[580px]"
                                style={{
                                    gridTemplateColumns: "3fr 2fr",
                                    gridTemplateRows: "3fr 2fr",
                                }}
                            >
                                {/* Main image — spans full height, clickable */}
                                <div
                                    ref={el => { bentoImgRefs.current[0] = el; }}
                                    className="row-span-2 cursor-pointer overflow-hidden rounded-3xl border border-white/70"
                                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.08)", willChange: "transform" }}
                                    onClick={() => setImageExpanded(true)}
                                >
                                    <motion.img
                                        layoutId="aboutme-image"
                                        src="/assets/aboutme.png"
                                        alt="Hridae at Valve Software"
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </div>
                                {/* Whiteboard / working photo — taller */}
                                <div
                                    ref={el => { bentoImgRefs.current[1] = el; }}
                                    className="overflow-hidden rounded-3xl border border-white/70"
                                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.08)", willChange: "transform" }}
                                >
                                    <img
                                        src="/assets/about/whiteboard.png"
                                        alt="Affinity mapping during research"
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </div>
                                {/* Childhood / glasses photo — smaller */}
                                <div
                                    ref={el => { bentoImgRefs.current[2] = el; }}
                                    className="overflow-hidden rounded-3xl border border-white/70"
                                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.08)", willChange: "transform" }}
                                >
                                    <img
                                        src="/assets/about/childhood.png"
                                        alt="Childhood"
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </div>
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
                                    launches to interactive exhibits that make you go 😮.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div className="pt-8">
                                <motion.div
                                    className="inline-block"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 0, scale: 0.98 }}
                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                >
                                    <Link
                                        href="https://drive.google.com/file/d/1Ha7vP0l5HG9IKC4rbd3Y58GZqCIeqGZa/view"
                                        target="_blank"
                                        className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full overflow-hidden font-[family-name:var(--font-dm-sans)]"
                                        style={{
                                            background: "linear-gradient(170deg, #ffffff 0%, #f0f0f0 100%)",
                                            border: "1px solid rgba(255,255,255,0.9)",
                                            boxShadow: [
                                                "inset 0 1px 0 rgba(255,255,255,1)",
                                                "inset 0 -1px 0 rgba(0,0,0,0.05)",
                                                "0 1px 2px rgba(0,0,0,0.07)",
                                                "0 4px 12px rgba(0,0,0,0.09)",
                                                "0 16px 36px rgba(0,0,0,0.06)",
                                            ].join(", "),
                                            backdropFilter: "blur(24px) saturate(1.6)",
                                            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                                        }}
                                    >
                                        {/* Top specular edge */}
                                        <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                                        {/* Arrow icon */}
                                        <svg
                                            width="11" height="11" viewBox="0 0 12 12" fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-[#1c1c1e]"
                                        >
                                            <path d="M6 1V11M6 11L1 6M6 11L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>

                                        {/* Label */}
                                        <span className="text-[#1c1c1e] text-xs font-semibold tracking-[0.1em] uppercase">
                                            Download CV
                                        </span>
                                    </Link>
                                </motion.div>
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
            </div>

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
