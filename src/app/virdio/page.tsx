"use client";

import { useCallback, useRef } from "react";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { VirdioCaseStudyBody } from "@/components/virdio/VirdioCaseStudyBody";
import { VIRDIO_SECTIONS } from "@/lib/case-study-sections";

export default function VirdioPage() {
    const pageRootRef = useRef<HTMLDivElement>(null);

    const onPagePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = pageRootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const w = Math.max(1, r.width);
        const h = Math.max(1, r.height);
        const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / w) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / h) * 100));
        el.style.setProperty("--csp-dot-x", `${x}%`);
        el.style.setProperty("--csp-dot-y", `${y}%`);
        el.style.setProperty("--csp-dot-heat", "1");
    }, []);

    const onPagePointerLeave = useCallback(() => {
        const el = pageRootRef.current;
        if (!el) return;
        el.style.setProperty("--csp-dot-heat", "0");
    }, []);

    return (
        <>
            <div
                ref={pageRootRef}
                className="site-editorial isolate relative min-h-screen w-full overflow-x-hidden bg-paper text-ink selection:bg-ink/[0.05] selection:text-ink font-sans antialiased [--csp-dot-x:50%] [--csp-dot-y:50%] [--csp-dot-heat:0]"
                onPointerMove={onPagePointerMove}
                onPointerLeave={onPagePointerLeave}
            >
                <div className="pointer-events-none absolute inset-0 -z-10 min-h-full" aria-hidden>
                    <div className="case-study-page-dot-mesh absolute inset-0 min-h-full" />
                    <div className="case-study-page-dot-mesh-pop absolute inset-0 min-h-full" />
                </div>

                <div className="relative z-[1] min-h-screen">
                <StickySidebar sections={VIRDIO_SECTIONS} />

                <VirdioCaseStudyBody />
                </div>
            </div>
        <CaseStudyPill projectSlug="virdio" />
        <StickyNotes page="virdio" />
        </>
    );
}
