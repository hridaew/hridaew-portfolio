"use client";

import { DomisCaseStudyContent } from "@/components/domis/DomisCaseStudyContent";
import "@/components/domis/domis-case-study.css";

export default function DomisSheet() {
  return (
    <div className="site-editorial relative w-full overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-ink/[0.05] selection:text-ink">
      <DomisCaseStudyContent />
    </div>
  );
}
