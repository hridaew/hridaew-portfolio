"use client";

import { StickySidebar } from "@/components/shared/StickySidebar";
import { DomisCaseStudyContent } from "@/components/domis/DomisCaseStudyContent";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { DomisRedMeshPointer } from "@/components/domis/DomisRedMeshPointer";
import { CaseStudyAchievementMount } from "@/components/achievements/CaseStudyAchievementMount";
import { DOMIS_SECTIONS } from "@/lib/case-study-sections";
import "@/components/domis/domis-case-study.css";

export default function DomisPage() {
  return (
    <>
      <CaseStudyAchievementMount id="domis" />
      <div className="site-editorial relative min-h-screen w-full overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-ink/[0.05] selection:text-ink">
        <DomisRedMeshPointer rootSelector=".site-editorial" />
        <StickySidebar sections={DOMIS_SECTIONS} />
        <DomisCaseStudyContent />
      </div>
      <CaseStudyPill projectSlug="domis" />
      <StickyNotes page="domis" />
    </>
  );
}
