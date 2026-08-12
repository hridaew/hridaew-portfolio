"use client";

import { cn } from "@/lib/utils";

const TLDRCard = ({ className }: { className?: string }) => {
    const items = [
        "Home fitness users wanted engaging classes without expensive equipment, but no product delivered AR workouts across all devices.",
        "Virdio's AR fitness tech could run on anything with a screen and camera, my role was to adapt the technology into a cross platform AR fitness subscription service.",
        "I designed critical features across platforms: room setup, HUD, scheduling, onboarding, and a cross-platform design system.",
        "Virdio successfully launched on all platforms, partnering with gyms and trainers to host hundreds of classes.",
    ];

    return (
        <div className={cn("relative w-full min-w-0 bg-paper", className)}>
            <p className="site-label mb-4 text-ink-subtle text-left">
                TL;DR
            </p>
            <div className="flex flex-col gap-2">
                {items.map((text, i) => (
                    <div
                        key={i}
                        className={cn(
                            "group relative text-left overflow-hidden rounded-lg",
                            /* Opaque lift off page bg so the dot mesh does not read through */
                            "bg-paper-raised",
                            "shadow-e2",
                            "ring-1 ring-ink/[0.07]",
                            "transition-[box-shadow,ring-color] duration-150",
                            "hover:shadow-e3",
                            "hover:ring-ink/[0.11]"
                        )}
                    >
                        <p className="p-6 md:p-8 site-body text-ink-secondary text-left">
                            {text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { TLDRCard };
