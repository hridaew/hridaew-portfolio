"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { SITE_COLUMN } from "@/components/home/homeGrid";

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
            className="relative h-[100vh] w-full bg-[#0c0c0e]"
        >
            <div className="absolute inset-0 bg-[#0c0c0e]" />

            <div className={`relative h-full w-full ${SITE_COLUMN}`}>
                <div className="relative h-full w-full flex items-center">
                {/* Title + Subtitle */}
                <motion.div
                    style={{ y: yText, opacity }}
                    className="z-20 flex w-full min-w-0 flex-col items-start text-left"
                >
                    <h1 className="type-display-black text-white mb-6 py-3 text-left">
                        <HeroTextAnimation variant="slide-up">Virdio </HeroTextAnimation>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="relative z-30 space-y-10"
                    >
                        <p className="site-body text-white/55 w-full text-left">
                            Designing an AR Fitness Platform Across Every Screen
                        </p>

                        {/* Metadata */}
                        <div className="flex w-full flex-wrap justify-start gap-x-10 gap-y-4 border-t border-white/10 pt-6">
                            {[
                                { label: "Role", val: "Product Designer" },
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
                                    <span className="site-label text-white/40">{item.label}</span>
                                    <span className="site-body text-white/70">{item.val}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Floating Cones — subtle, decorative */}
                <motion.div
                    style={{ y: yCone1, rotate: rotateCone1 }}
                    className="absolute -left-2 md:left-0 top-[18%] w-36 md:w-52 aspect-square z-0 pointer-events-none opacity-25"
                >
                    <img src="/assets/virdio/cone.png" alt="" className="w-full h-full object-contain" />
                </motion.div>

                <motion.div
                    style={{ y: yCone2, rotate: rotateCone2 }}
                    className="absolute -right-2 md:right-0 bottom-[15%] w-44 md:w-64 aspect-square z-0 pointer-events-none opacity-20"
                >
                    <img src="/assets/virdio/cone.png" alt="" className="w-full h-full object-contain -rotate-12 scale-x-[-1]" />
                </motion.div>

                </div>
            </div>
        </section>
    );
};
export { ParallaxHero };
