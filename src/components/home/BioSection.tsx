"use client";

import { useCallback } from "react";
import { playClick } from "@/lib/audio";

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
  return (
    <div className="w-full font-[family-name:var(--font-geist)] text-base leading-6 text-white/80">
      <p>
        Based in San Francisco, I&apos;m currently the Founding Product Designer
        at <BioProjectAnchor slug="domis">Domis</BioProjectAnchor> &ndash; building
        consumer experiences from 0-1, leveraging multi-modal AI to help people
        take better care of their homes.
      </p>
      <p className="mt-6">
        In the last 5+ years I&apos;ve designed AR consumer experiences at{" "}
        <BioProjectAnchor slug="virdio">Virdio</BioProjectAnchor>, designed and
        hosted a VR museum exhibit at MOHAI &ndash;{" "}
        <BioProjectAnchor slug="obscura">OBSCURA</BioProjectAnchor>, and created
        multi-sensory experiences for people with Alzheimer&apos;s, via the{" "}
        <BioProjectAnchor slug="memory-care">MCES</BioProjectAnchor>.
      </p>
      <p className="mt-6">
        I studied Interaction Design at California College of the Arts, and have
        a Master&apos;s in HCI from The University of Washington.
      </p>
    </div>
  );
}
