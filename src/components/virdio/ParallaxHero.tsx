"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { useScroller } from "@/components/sheet/scroller-context";

function ParallaxHeroView({
    scrollContainer,
}: {
    scrollContainer: HTMLElement | null;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    // Initialized from props; parent remounts this view when the scroller
    // appears so we don't need to write the ref during render.
    const scrollContainerRef = useRef<HTMLElement | null>(scrollContainer);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        // Sheet: measure against the panel. Page: window (home scroll offset
        // would otherwise leave this stuck near progress=1 → faded + pushed down).
        container: scrollContainer ? scrollContainerRef : undefined,
        offset: ["start start", "end start"],
    });

    const yText = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const yCone1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const rotateCone1 = useTransform(scrollYProgress, [0, 1], [-3, -12]);
    const yCone2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const rotateCone2 = useTransform(scrollYProgress, [0, 1], [3, 10]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative flex h-[min(72dvh,640px)] min-h-[480px] w-full items-center bg-paper"
        >
            <div className="absolute inset-0 bg-paper" />

            <div className={`relative w-full ${SITE_COLUMN}`}>
                <div className="relative flex w-full items-center py-16 md:py-20">
                    <motion.div
                        style={{ y: yText, opacity }}
                        className="z-20 flex w-full min-w-0 flex-col items-start text-left"
                    >
                        <h1 className="type-display-black text-ink mb-6 py-3 text-left">
                            <HeroTextAnimation variant="slide-up">Virdio</HeroTextAnimation>
                        </h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="relative z-30 space-y-10"
                        >
                            <p className="site-body w-full text-left text-ink-secondary">
                                Designing an AR Fitness Platform Across Every
                                Screen
                            </p>

                            <div className="flex w-full flex-wrap justify-start gap-x-10 gap-y-4 border-t border-ink/[0.08] pt-6">
                                {[
                                    { label: "Role", val: "Product Designer" },
                                    { label: "Timeline", val: "2021 – 2022" },
                                    {
                                        label: "Platforms",
                                        val: "iOS, Android, Web, TV",
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.7 + i * 0.1,
                                        }}
                                        className="flex flex-col gap-1 text-left"
                                    >
                                        <span className="site-label text-ink-subtle">
                                            {item.label}
                                        </span>
                                        <span className="site-body text-ink-secondary">
                                            {item.val}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        style={{ y: yCone1, rotate: rotateCone1 }}
                        className="pointer-events-none absolute -left-2 top-[18%] z-0 aspect-square w-36 opacity-[0.06] blur-[2px] md:left-0 md:w-52"
                    >
                        <img
                            src="/assets/virdio/cone.png"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </motion.div>

                    <motion.div
                        style={{ y: yCone2, rotate: rotateCone2 }}
                        className="pointer-events-none absolute -right-2 bottom-[15%] z-0 aspect-square w-44 opacity-[0.05] blur-[3px] md:right-0 md:w-64"
                    >
                        <img
                            src="/assets/virdio/cone.png"
                            alt=""
                            className="h-full w-full -rotate-12 scale-x-[-1] object-contain"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

const ParallaxHero = () => {
    const scroller = useScroller();
    // Remount when entering/leaving the sheet so useScroll rebinds its container.
    return (
        <ParallaxHeroView
            key={scroller ? "sheet" : "page"}
            scrollContainer={scroller}
        />
    );
};

export { ParallaxHero };
