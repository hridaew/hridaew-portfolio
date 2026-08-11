"use client";

import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { ObscuraCaseStudyBody } from "@/components/obscura/ObscuraCaseStudyBody";
import { ObscuraPageLiquidCursor } from "@/components/obscura/ObscuraPageLiquidCursor";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { OBSCURA_SECTIONS } from "@/lib/case-study-sections";
import { cn } from "@/lib/utils";

export default function ObscuraPage() {
    return (
        <>
            <div
                className={cn(
                    "site-editorial bg-paper relative min-h-screen w-full overflow-x-hidden font-sans antialiased selection:bg-amber-900/15 selection:text-amber-950",
                    "[&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_textarea]:cursor-text [&_select]:cursor-pointer cursor-none"
                )}
            >
                <GrainOverlay />
                <StickySidebar sections={OBSCURA_SECTIONS} />

                <ObscuraCaseStudyBody />
            </div>
            <ObscuraPageLiquidCursor />
            <CaseStudyPill projectSlug="obscura" />
            <StickyNotes page="obscura" />
        </>
    );
}
