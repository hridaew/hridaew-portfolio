"use client";

import { cn } from "@/lib/utils";

const PlatformSpectrum = ({ className }: { className?: string }) => {
    return (
        <div className={cn("w-full min-w-0", className)}>
            {/* Mobile column width = 50% of desktop column (1fr : 2fr) */}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start gap-10 md:gap-14">
                {/* Mobile device (left, narrower) */}
                <div className="flex min-w-0 flex-col gap-3">
                    <div className="rounded border border-ink/[0.096] bg-ink/[0.03] p-1.5">
                        <div className="rounded overflow-hidden aspect-video">
                            <img
                                src="/assets/virdio/virtual_session_mobile.png"
                                alt="Mobile AR workout: condensed metrics, minimal toolbar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="site-body text-ink">Mobile</p>
                        <p className="site-body text-sm font-medium text-emerald-400 mt-0.5">Most accessible</p>
                        <p className="site-gallery-caption mt-1.5 text-left text-ink-subtle">
                            Unstable placement, AR overlays compete for visibility.
                        </p>
                    </div>
                </div>

                {/* Desktop device (right, 2× mobile width) */}
                <div className="flex min-w-0 flex-col gap-3">
                    <div className="rounded border border-ink/[0.096] bg-ink/[0.03] p-1.5">
                        <div className="rounded overflow-hidden aspect-video">
                            <img
                                src="/assets/virdio/virtual_session_desktop.png"
                                alt="Desktop AR workout: full metrics, toolbar, participant controls"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="site-body text-ink">Desktop</p>
                        <p className="site-body text-sm font-medium text-violet-300 mt-0.5">Best AR quality</p>
                        <p className="site-gallery-caption mt-1.5 text-left text-ink-subtle">
                            Larger screen, stable camera, overlays complement the experience.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { PlatformSpectrum };
