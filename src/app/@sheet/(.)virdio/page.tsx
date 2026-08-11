"use client";

import { VirdioCaseStudyBody } from "@/components/virdio/VirdioCaseStudyBody";

export default function VirdioSheet() {
  return (
    <div className="site-editorial isolate relative w-full overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-ink/[0.05] selection:text-ink [--csp-dot-x:50%] [--csp-dot-y:50%] [--csp-dot-heat:0]">
      <div className="pointer-events-none absolute inset-0 -z-10 min-h-full" aria-hidden>
        <div className="case-study-page-dot-mesh absolute inset-0 min-h-full" />
      </div>
      <div className="relative z-[1]">
        <VirdioCaseStudyBody />
      </div>
    </div>
  );
}
