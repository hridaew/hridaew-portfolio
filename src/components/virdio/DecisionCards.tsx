"use client";

import { cn } from "@/lib/utils";

const DecisionCards = ({ className }: { className?: string }) => {
    return (
        <div className={cn("w-full max-w-[1200px] mx-auto", className)}>
            {/* Option A & B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A */}
                <div className="bg-ink/[0.02] rounded-xl border border-ink/[0.08] p-6">
                    <p className="type-caption-medium uppercase text-ink-subtle mb-2 text-left">
                        Option A
                    </p>
                    <h3 className="type-h3 text-ink mb-3 text-left">
                        Desktop/Laptop First
                    </h3>
                    <p className="type-body text-ink-muted text-left">
                        Focus on larger screens where AR overlays were most usable, then expand to mobile later. Ship a polished hero experience faster with our small team.
                    </p>
                </div>

                {/* Option B */}
                <div className="bg-ink/[0.02] rounded-xl border border-ink/[0.08] p-6">
                    <p className="type-caption-medium uppercase text-ink-subtle mb-2 text-left">
                        Option B
                    </p>
                    <h3 className="type-h3 text-ink mb-3 text-left">
                        All Platforms Simultaneously
                    </h3>
                    <p className="type-body text-ink-muted text-left">
                        Launch everywhere at once to maximize accessibility and differentiate from hardware-locked competitors.
                    </p>
                </div>
            </div>

            {/* Compromise */}
            <div className="mt-4 bg-ink/[0.03] border border-ink/[0.08] rounded-xl p-6 md:p-8 text-ink">
                <div className="flex flex-col md:flex-row md:gap-12">
                    <div className="flex-1 mb-6 md:mb-0">
                        <p className="type-caption-medium uppercase text-ink-subtle mb-2 text-left">
                            What we chose
                        </p>
                        <p className="type-body text-ink-secondary text-left">
                            We shipped on all platforms but the UX guided users toward desktop and laptop as the recommended way to attend AR classes.
                        </p>
                    </div>
                    <div className="flex-1 md:border-l md:border-ink/[0.08] md:pl-12">
                        <p className="type-caption-medium uppercase text-ink-subtle mb-2 text-left">
                            What I gave up
                        </p>
                        <p className="type-body text-ink-muted text-left">
                            The chance to build one deeply focused experience.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { DecisionCards };
