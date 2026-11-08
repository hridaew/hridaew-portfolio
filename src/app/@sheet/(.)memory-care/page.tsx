"use client";

import { MemoryCareCaseStudyBody } from "@/components/memory-care/MemoryCareCaseStudyBody";

export default function MemoryCareSheet() {
  return (
    <div className="site-editorial relative w-full overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-ink/[0.05] selection:text-ink">
      <MemoryCareCaseStudyBody />
    </div>
  );
}
