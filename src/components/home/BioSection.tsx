"use client";

import { useCallback } from "react";
import { playClick } from "@/lib/audio";
import { CHOOM } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";

function scrollToHomeProject(slug: string) {
  const el = document.getElementById(slug);
  if (!el) return;
  const lenis = (
    window as unknown as {
      __lenis?: {
        scrollTo: (
          t: HTMLElement,
          o: { offset: number; duration: number }
        ) => void;
      };
    }
  ).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: -80, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function BioProjectAnchor({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      playClick();
      scrollToHomeProject(slug);
    },
    [slug]
  );

  return (
    <a
      href={`#${slug}`}
      onClick={onClick}
      className="font-[family-name:var(--font-geist)] font-medium text-white underline decoration-solid transition-colors hover:text-white/90"
    >
      {children}
    </a>
  );
}

export function BioSection() {
  const choom = useChoomLingo();
  return (
    <div className="flex w-full flex-col gap-6 font-[family-name:var(--font-geist)] text-base leading-6 text-white/80">
      {choom ? (
        <>
          <p className="m-0">{CHOOM.bioP1}</p>
          <p className="m-0">{CHOOM.bioP2}</p>
        </>
      ) : (
        <>
          <p className="m-0">
            I&apos;m a Product Designer obsessed with making, and I have 6 years of
            experience doing it.
          </p>
          <p className="m-0">
            I&apos;ve designed features that help people understand their homes at{" "}
            <BioProjectAnchor slug="domis">Domis</BioProjectAnchor>, AR fitness
            for any space at{" "}
            <BioProjectAnchor slug="virdio">Virdio</BioProjectAnchor>, an
            interactive exhibition at{" "}
            <BioProjectAnchor slug="obscura">MOHAI</BioProjectAnchor>, and
            tangible, accessible experiences for people living with
            Alzheimer&apos;s at the{" "}
            <BioProjectAnchor slug="memory-care">SFCJL</BioProjectAnchor>.
          </p>
          <p className="m-0">
            Most of it has meant designing for interaction models that barely
            exist yet. I focus on the user and learn by making, whether on the
            canvas, in code, or the physical world.
          </p>
        </>
      )}
    </div>
  );
}
