"use client";

import { useEffect } from "react";
import { CloseButton } from "@/components/virdio/CloseButton";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";

export default function DomisPage() {
    useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    return (
        <LightboxProvider>
            <div className="bg-white min-h-screen w-full relative overflow-x-hidden selection:bg-neutral-200 selection:text-black font-sans antialiased text-neutral-900">
                <CloseButton />

                {/* ─── HERO ─── */}
                <section className="relative pt-32 pb-16 md:pt-40 md:pb-24">
                    <div className="relative max-w-[720px] mx-auto px-6 md:px-12 text-center">
                        <Reveal>
                            <img
                                src="/assets/domis/domis_icon.png"
                                alt="Domis app icon"
                                className="w-20 h-20 md:w-24 md:h-24 rounded-[22%] shadow-lg mx-auto mb-8"
                                draggable={false}
                            />
                        </Reveal>

                        <HeroTextAnimation variant="wave" className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-6xl text-neutral-900 leading-[1.1] mb-4">
                            Domis
                        </HeroTextAnimation>

                        <Reveal delay={0.2}>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-500 leading-relaxed mb-8 max-w-[520px] mx-auto">
                                I&rsquo;m leading product design at Domis &mdash; creating a fun, delightful way for homeowners to take care of their homes and take pride in doing it right.
                            </p>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500">
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider mb-0.5">Role</span>
                                    Founding Product Designer
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider mb-0.5">Timeline</span>
                                    2024 &mdash;
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ─── 4-Image Grid ─── */}
                <section className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 pb-16 md:pb-24">
                    <Reveal>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { src: "/assets/domis/1.png", alt: "Domis — home dashboard overview" },
                                { src: "/assets/domis/2.png", alt: "Domis — service scheduling interface" },
                                { src: "/assets/domis/3.png", alt: "Domis — provider matching view" },
                                { src: "/assets/domis/4.png", alt: "Domis — maintenance tracking" },
                            ].map((img) => (
                                <div key={img.alt} className="rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm">
                                    <LightboxImage
                                        src={img.src}
                                        alt={img.alt}
                                        className="w-full h-auto object-cover"
                                        draggable={false}
                                        hoverScale={1.02}
                                    />
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </section>

                {/* ─── App Store CTA ─── */}
                <section className="max-w-[720px] mx-auto px-6 md:px-12 pb-24 md:pb-32 text-center">
                    <Reveal>
                        <a
                            href="https://apps.apple.com/us/app/domis-home-maintenance/id6746832568"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-neutral-900 text-white font-medium font-[family-name:var(--font-dm-sans)] hover:bg-neutral-800 transition-colors shadow-lg"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            <span className="text-lg">Download on the App Store</span>
                        </a>
                    </Reveal>
                </section>

                {/* Bottom spacer */}
                <div className="h-12" />
            </div>
        </LightboxProvider>
    );
}
