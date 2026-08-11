"use client";

import { cn } from "@/lib/utils";

const competitors = [
    {
        name: "Peloton",
        detail: "$1,500 bike",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Bike icon */}
                <circle cx="9" cy="22" r="5" />
                <circle cx="23" cy="22" r="5" />
                <path d="M9 22l5-10h4l2 4" />
                <path d="M18 16l5 6" />
                <path d="M14 12l-2-4h-3" />
                <line x1="14" y1="12" x2="20" y2="12" />
            </svg>
        ),
        highlighted: false,
    },
    {
        name: "Mirror",
        detail: "$1,500 screen",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Mirror/screen icon */}
                <rect x="8" y="4" width="16" height="20" rx="2" />
                <line x1="16" y1="24" x2="16" y2="28" />
                <line x1="12" y1="28" x2="20" y2="28" />
                <circle cx="16" cy="14" r="3" />
                <path d="M13 11a4.5 4.5 0 016 0" />
            </svg>
        ),
        highlighted: false,
    },
    {
        name: "YouTube",
        detail: "Free / No tracking",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Play button icon */}
                <rect x="4" y="7" width="24" height="18" rx="4" />
                <polygon points="13,11 22,16 13,21" fill="currentColor" stroke="none" />
            </svg>
        ),
        highlighted: false,
    },
    {
        name: "Virdio",
        detail: "Any camera",
        icon: (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Camera/webcam icon */}
                <rect x="5" y="9" width="22" height="16" rx="3" />
                <circle cx="16" cy="17" r="4" />
                <circle cx="16" cy="17" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="23" cy="12" r="1" fill="currentColor" stroke="none" />
            </svg>
        ),
        highlighted: true,
    },
];

const MarketComparison = ({ className }: { className?: string }) => {
    return (
        <div className={cn("w-full min-w-0", className)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {competitors.map((c) => (
                    <div
                        key={c.name}
                        className={cn(
                            "rounded-xl border p-5 md:p-6 text-left flex flex-col items-start gap-3",
                            c.highlighted
                                ? "bg-violet-500/10 border-violet-400/35"
                                : "bg-ink/[0.02] border-ink/[0.08]"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 flex items-center justify-center",
                            c.highlighted ? "text-violet-700" : "text-ink-subtle"
                        )}>
                            {c.icon}
                        </div>
                        <div>
                            <p className={cn(
                                "type-body",
                                c.highlighted ? "text-violet-900" : "text-ink"
                            )}>
                                {c.name}
                            </p>
                            <p className={cn(
                                "type-caption mt-0.5",
                                c.highlighted ? "text-violet-700/85" : "text-ink-subtle"
                            )}>
                                {c.detail}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { MarketComparison };
