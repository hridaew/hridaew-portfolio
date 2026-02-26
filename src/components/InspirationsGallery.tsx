"use client";

import { Reveal } from "./Reveal";

interface Inspiration {
    src: string;
    caption: string;
}

const inspirations: Inspiration[] = [
    { src: "/assets/inspirations/Cyberpunk 2077.png", caption: "Cyberpunk 2077" },
    { src: "/assets/inspirations/Arsenal.jpg", caption: "Arsenal" },
    { src: "/assets/inspirations/Beksinski.jpg", caption: "Zdzislaw Beksinski" },
    { src: "/assets/inspirations/Half Life Alyx.webp", caption: "Half-Life: Alyx" },
    { src: "/assets/inspirations/Iron Giant.jpg", caption: "The Iron Giant" },
    { src: "/assets/inspirations/Kid Cudi.jpg", caption: "Kid Cudi" },
    { src: "/assets/inspirations/HalfLife.jpg", caption: "Half-Life 2" },
    { src: "/assets/inspirations/Rodin.jpg", caption: "Auguste Rodin" },
    { src: "/assets/inspirations/Space Age Design.png", caption: "Space Age Design" },
    { src: "/assets/inspirations/MiT.png", caption: "MIT Media Lab" },
    { src: "/assets/inspirations/Valve.jpg", caption: "Valve" },
    { src: "/assets/inspirations/Warriors.jpg", caption: "Golden State Warriors" },
    { src: "/assets/inspirations/not here not now.jpg", caption: "Not Here Not Now" },
];

export function InspirationsGallery() {
    return (
        <section className="py-16 md:py-24 border-t border-[var(--border-card)]">
            <div className="max-w-[1558px] mx-auto px-4 md:px-8">
                <Reveal>
                    <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-secondary)] text-base mb-10">
                        Inspirations
                    </p>
                </Reveal>

                <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                    {inspirations.map((item, i) => (
                        <Reveal key={i} delay={i * 0.03} className="break-inside-avoid mb-3">
                            <div
                                className="group relative w-full overflow-hidden rounded-lg transition-all duration-300 ease-out border border-white/30 ring-1 ring-white/20"
                                style={{ transform: "scale(1)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.transform = "scale(1.06)";
                                    el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.15)";
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
                                    className="w-full h-auto block"
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
