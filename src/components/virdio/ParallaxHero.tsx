"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";

const ParallaxHero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
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
            className="relative h-[100vh] w-full bg-white"
        >
            <div className="absolute inset-0 bg-white" />

            <div className="relative h-full w-full flex items-center justify-center">

                {/* Title + Subtitle */}
                <motion.div
                    style={{ y: yText, opacity }}
                    className="z-20 flex flex-col items-center text-center px-6 max-w-5xl mx-auto overflow-visible"
                >
                    <h1 className="font-[family-name:var(--font-instrument-serif)] text-[72px] md:text-[120px] lg:text-[160px] leading-[0.9] tracking-tighter mb-6 py-3 text-neutral-900">
                        <HeroTextAnimation variant="slide-up">Virdio</HeroTextAnimation>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="relative z-30 space-y-10"
                    >
                        <p className="font-[family-name:var(--font-dm-sans)] text-neutral-500 text-lg md:text-xl leading-relaxed max-w-xl mx-auto font-normal">
                            Democratizing home fitness by replacing expensive gym hardware with computer vision — across iOS, Android, Web, and TV.
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 pt-6 border-t border-neutral-200/60 max-w-2xl mx-auto">
                            {[
                                { label: "Role", val: "Sole Product Designer" },
                                { label: "Timeline", val: "2021 – 2022" },
                                { label: "Platforms", val: "iOS, Android, Web, TV" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                                    className="flex flex-col gap-1 text-left"
                                >
                                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.12em]">{item.label}</span>
                                    <span className="text-sm font-normal text-neutral-700">{item.val}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Floating Cones — subtle, decorative */}
                <motion.div
                    style={{ y: yCone1, rotate: rotateCone1 }}
                    className="absolute left-[4%] top-[18%] w-36 md:w-52 aspect-square z-0 pointer-events-none opacity-20"
                >
                    <img src="/assets/virdio/cone.png" alt="" className="w-full h-full object-contain" />
                </motion.div>

                <motion.div
                    style={{ y: yCone2, rotate: rotateCone2 }}
                    className="absolute right-[6%] bottom-[15%] w-44 md:w-64 aspect-square z-0 pointer-events-none opacity-15"
                >
                    <img src="/assets/virdio/cone.png" alt="" className="w-full h-full object-contain -rotate-12 scale-x-[-1]" />
                </motion.div>

            </div>
        </section>
    );
};
export { ParallaxHero };
