"use client";

import { cn } from "@/lib/utils";

const DecisionCards = ({ className }: { className?: string }) => {
    return (
        <div className={cn("w-full max-w-[1200px] mx-auto", className)}>
            {/* Option A & B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A */}
                <div className="bg-white/[0.04] rounded-xl border border-white/10 p-6">
                    <p className="type-caption-medium uppercase text-white/40 mb-2 text-left">
                        Option A
                    </p>
                    <h3 className="type-h3 text-white mb-3 text-left">
                        Desktop/Laptop First
                    </h3>
                    <p className="type-body text-white/55 text-left">
                        Focus on larger screens where AR overlays were most usable, then expand to mobile later. Ship a polished hero experience faster with our small team.
                    </p>
                </div>

                {/* Option B */}
                <div className="bg-white/[0.04] rounded-xl border border-white/10 p-6">
                    <p className="type-caption-medium uppercase text-white/40 mb-2 text-left">
                        Option B
                    </p>
                    <h3 className="type-h3 text-white mb-3 text-left">
                        All Platforms Simultaneously
                    </h3>
                    <p className="type-body text-white/55 text-left">
                        Launch everywhere at once to maximize accessibility and differentiate from hardware-locked competitors. Mobile is the most accessible entry point.
                    </p>
                </div>
            </div>

            {/* Compromise */}
            <div className="mt-4 bg-white/[0.06] border border-white/10 rounded-xl p-6 md:p-8 text-white">
                <div className="flex flex-col md:flex-row md:gap-12">
                    <div className="flex-1 mb-6 md:mb-0">
                        <p className="type-caption-medium uppercase text-white/40 mb-2 text-left">
                            What we chose
                        </p>
                        <p className="type-body text-white/80 text-left">
                            We shipped on all platforms but designed the UX to guide users toward the desktop/laptop experience as the recommended way to attend AR classes. Mobile retained full functionality but onboarding, class setup, and messaging nudged users toward larger screens.
                        </p>
                    </div>
                    <div className="flex-1 md:border-l md:border-white/10 md:pl-12">
                        <p className="type-caption-medium uppercase text-white/45 mb-2 text-left">
                            What I gave up
                        </p>
                        <p className="type-body text-white/55 text-left">
                            The ability to ship a deeply polished single-platform experience. I spread my effort across five platforms, which meant every surface got less iteration time than I wanted.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { DecisionCards };
