"use client";

import { useRef, useEffect } from "react";
import { experiments, type ExperimentItem } from "@/data/experiments";
import { Reveal } from "@/components/Reveal";

const aspectWidths: Record<ExperimentItem["aspect"], string> = {
    landscape: "w-[320px] md:w-[400px]",
    portrait: "w-[220px] md:w-[280px]",
    square: "w-[260px] md:w-[320px]",
};

const aspectRatios: Record<ExperimentItem["aspect"], string> = {
    landscape: "aspect-[16/10]",
    portrait: "aspect-[3/4]",
    square: "aspect-square",
};

export function ExperimentsGallery() {
    return (
        <section id="experiments" className="py-16 md:py-24">
            <Reveal>
                <h2 className="type-caption-medium uppercase text-[var(--text-subtle)] mb-8 px-6 md:px-12 text-left">
                    Experiments
                </h2>
            </Reveal>

            {/* Horizontal scroll container */}
            <div className="relative">
                {/* Left fade */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
                {/* Right fade */}
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

                <div
                    role="region"
                    aria-label="Experiments gallery"
                    className="flex gap-4 md:gap-5 overflow-x-auto px-6 md:px-12 pb-4 scrollbar-hide"
                    style={{ overscrollBehaviorX: "contain" }}
                >
                    {experiments.map((item, i) => (
                        <ExperimentCard key={i} item={item} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ExperimentCard({
    item,
    index,
}: {
    item: ExperimentItem;
    index: number;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Play/pause video on intersection
    useEffect(() => {
        if (item.type !== "video" || !videoRef.current || !cardRef.current)
            return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => {});
                } else {
                    videoRef.current?.pause();
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [item.type]);

    const isEmpty = !item.src;

    return (
        <div
            ref={cardRef}
            className={`flex-shrink-0 ${aspectWidths[item.aspect]} group`}
        >
            <div
                className={`relative ${aspectRatios[item.aspect]} rounded-2xl overflow-hidden border border-[var(--border-card)] transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-lg ${
                    isEmpty
                        ? "border-dashed bg-[var(--surface-card)]"
                        : "bg-[var(--surface-card)]"
                }`}
            >
                {isEmpty ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="type-body text-[var(--text-subtle)] text-left">
                            Coming soon
                        </span>
                    </div>
                ) : item.type === "video" ? (
                    <video
                        ref={videoRef}
                        src={item.src}
                        poster={item.poster}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <img
                        src={item.src}
                        alt={item.alt}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                        loading="lazy"
                    />
                )}
            </div>

            {item.caption && (
                <p className="mt-2 type-caption text-[var(--text-subtle)] truncate text-left">
                    {item.caption}
                </p>
            )}
        </div>
    );
}
