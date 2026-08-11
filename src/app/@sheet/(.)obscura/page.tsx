"use client";

import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { ObscuraCaseStudyBody } from "@/components/obscura/ObscuraCaseStudyBody";
import { ObscuraPageLiquidCursor } from "@/components/obscura/ObscuraPageLiquidCursor";

export default function ObscuraSheet() {
  return (
    <div className="site-editorial relative w-full cursor-none overflow-x-hidden bg-paper font-sans antialiased selection:bg-amber-900/15 selection:text-amber-950 [&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_select]:cursor-pointer [&_textarea]:cursor-text">
      <GrainOverlay />
      <ObscuraCaseStudyBody />
      <ObscuraPageLiquidCursor elevated />
    </div>
  );
}
