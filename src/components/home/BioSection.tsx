"use client";

import { useCallback } from "react";
import { playClick } from "@/lib/audio";
import { CHOOM } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";

const BIO_ICON_SIZE = 24;

const BIO_ICONS: Record<string, string> = {
  domis: "/assets/home/bio-icons/domis.webp",
  virdio: "/assets/home/bio-icons/virdio.webp",
  obscura: "/assets/home/bio-icons/mohai.webp",
  "memory-care": "/assets/home/bio-icons/sfcjl.webp",
};

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

  const iconSrc = BIO_ICONS[slug];

  return (
    <a
      href={`#${slug}`}
      onClick={onClick}
      className="whitespace-nowrap font-[family-name:var(--font-geist)] font-medium text-ink transition-colors hover:text-ink"
    >
      {iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconSrc}
          alt=""
          width={BIO_ICON_SIZE}
          height={BIO_ICON_SIZE}
          draggable={false}
          className="mr-1 inline-block size-6 shrink-0 align-[-0.35em] object-contain"
        />
      ) : null}
      <span className="underline decoration-solid underline-offset-[3px]">
        {children}
      </span>
    </a>
  );
}

export function BioSection() {
  const choom = useChoomLingo();
  return (
    <div className="flex w-full flex-col gap-6 font-[family-name:var(--font-geist)] text-base leading-6 text-ink-secondary">
      {choom ? (
        <>
          <p className="m-0">{CHOOM.bioP1}</p>
          <p className="m-0">{CHOOM.bioP2}</p>
        </>
      ) : (
        <>
          <p className="m-0">
            I&apos;m a Product Designer obsessed with making, and I have 6 years of
            experience designing for interaction models that barely exist yet. I
            focus on the user and learn by making, whether on the canvas, in
            code, or the physical world.
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
        </>
      )}
    </div>
  );
}
