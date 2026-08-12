"use client";

import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { MemoryCareCaseStudyBody } from "@/components/memory-care/MemoryCareCaseStudyBody";
import { CaseStudyAchievementMount } from "@/components/achievements/CaseStudyAchievementMount";
import { MEMORY_CARE_SECTIONS } from "@/lib/case-study-sections";

export default function MemoryCarePage() {
    return (
        <>
            <CaseStudyAchievementMount id="memory-care" />
            <div className="site-editorial relative min-h-screen w-full overflow-x-hidden bg-background text-foreground selection:bg-ink/[0.05] selection:text-ink font-sans antialiased">
                <StickySidebar sections={MEMORY_CARE_SECTIONS} />

                <MemoryCareCaseStudyBody />
            </div>
        <CaseStudyPill projectSlug="memory-care" />
        <StickyNotes page="memory-care" />
        </>
    );
}
