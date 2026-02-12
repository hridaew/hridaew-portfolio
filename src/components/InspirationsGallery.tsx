"use client";

import { Reveal } from "./Reveal";

type BentoSize = "landscape" | "portrait" | "square";

interface Inspiration {
    src: string;
    caption: string;
    size: BentoSize;
}

const inspirations: Inspiration[] = [
    { src: "/assets/inspirations/Cyberpunk 2077.png", caption: "Cyberpunk 2077", size: "landscape" },
    { src: "/assets/inspirations/Arsenal.jpg", caption: "Arsenal", size: "portrait" },
    { src: "/assets/inspirations/Beksinski.jpg", caption: "Zdzislaw Beksinski", size: "square" },
    { src: "/assets/inspirations/Half Life Alyx.webp", caption: "Half-Life: Alyx", size: "landscape" },
    { src: "/assets/inspirations/Iron Giant.jpg", caption: "The Iron Giant", size: "portrait" },
    { src: "/assets/inspirations/Kid Cudi.jpg", caption: "Kid Cudi", size: "portrait" },
    { src: "/assets/inspirations/HalfLife.jpg", caption: "Half-Life 2", size: "landscape" },
    { src: "/assets/inspirations/Rodin.jpg", caption: "Auguste Rodin", size: "portrait" },
    { src: "/assets/inspirations/Space Age Design.png", caption: "Space Age Design", size: "square" },
    { src: "/assets/inspirations/MiT.png", caption: "MIT Media Lab", size: "landscape" },
    { src: "/assets/inspirations/Valve.jpg", caption: "Valve", size: "portrait" },
    { src: "/assets/inspirations/Warriors.jpg", caption: "Golden State Warriors", size: "portrait" },
    { src: "/assets/inspirations/not here not now.jpg", caption: "Not Here Not Now", size: "portrait" },
];

const sizeClasses: Record<BentoSize, string> = {
    landscape: "col-span-2 row-span-3",
    portrait: "col-span-1 row-span-4",
    square: "col-span-1 row-span-3",
};

export function InspirationsGallery() {
    return (
        <section className="py-16 md:py-24 border-t border-[var(--border-card)]">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                <Reveal>
                    <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-base mb-10">
                        Inspirations
                    </p>
                </Reveal>

                <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                    style={{ gridAutoRows: "clamp(60px, 8vw, 80px)", gridAutoFlow: "dense" }}
                >
                    {inspirations.map((item, i) => (
                        <Reveal key={i} delay={i * 0.03} className={sizeClasses[item.size]}>
                            <div
                                className="group relative w-full h-full overflow-hidden rounded-lg transition-all duration-300 ease-out border border-white/30 ring-1 ring-white/20"
                                style={{ transform: "scale(1)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.transform = "scale(1.06)";
                                    el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.15)";
                                    // Set z-index on the Reveal wrapper (parent) to escape its stacking context
                                    if (el.parentElement) el.parentElement.style.zIndex = "20";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.transform = "scale(1)";
                                    el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                                    if (el.parentElement) el.parentElement.style.zIndex = "";
                                }}
                            >
                                <img
                                    src={item.src}
                                    alt={item.caption}
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                    loading="lazy"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                                    <p className="font-[family-name:var(--font-dm-sans)] text-xs text-white">
                                        {item.caption}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
