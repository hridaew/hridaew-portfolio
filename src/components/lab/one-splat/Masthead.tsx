"use client";

import { useState } from "react";
import { CopyEmailPill } from "@/components/shared/CopyEmailPill";
import { HeroSignatureReplay } from "@/components/home/HeroCard";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import { playClick } from "@/lib/audio";
import { Glass } from "./Glass";
import type { SplatKey } from "./splatEngine";
import styles from "./OneSplat.module.css";

type ProjectKey = "domis" | "virdio" | "obscura" | "mc";

/** The home bio's project links (same icons); here they open the project on this page. */
const BIO_LINKS: Record<ProjectKey, { href: string; icon: string }> = {
  domis: { href: "/domis", icon: "/assets/home/bio-icons/domis.webp" },
  virdio: { href: "/virdio", icon: "/assets/home/bio-icons/virdio.webp" },
  obscura: { href: "/obscura", icon: "/assets/home/bio-icons/mohai.webp" },
  mc: { href: "/memory-care", icon: "/assets/home/bio-icons/sfcjl.webp" },
};

function BioLink({ k, onProject, children }: { k: ProjectKey; onProject: (k: SplatKey) => void; children: string }) {
  const { href, icon } = BIO_LINKS[k];
  return (
    <a
      href={href}
      className={styles.bioLink}
      onClick={(e) => {
        e.preventDefault();
        playClick();
        onProject(k);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" width={24} height={24} draggable={false} />
      <span>{children}</span>
    </a>
  );
}

/** A light, card-less header for the splat page: signature, name, intro, and the hero card's quick actions. */
export function Masthead({ onAbout, aboutOpen, onProject }: { onAbout: () => void; aboutOpen: boolean; onProject: (k: SplatKey) => void }) {
  const [pron, setPron] = useState(false);
  return (
    <header className={styles.mast}>
      <div className={styles.mastSignature}>
        <HeroSignatureReplay />
      </div>
      {/* hover (or focus) the name to see how to say it, as on the hero card */}
      <h1
        className={styles.mastName}
        data-pron={pron ? "" : undefined}
        onPointerEnter={() => setPron(true)}
        onPointerLeave={() => setPron(false)}
        onFocusCapture={() => setPron(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPron(false);
        }}
      >
        <button
          type="button"
          className={styles.mastNameBtn}
          aria-expanded={pron}
          aria-controls="mast-pronunciation"
          aria-label="Hridae Walia, pronunciation ri-they waaliaa"
          onClick={() => setPron((v) => !v)}
        >
          Hridae Walia
        </button>
        <span id="mast-pronunciation" className={styles.mastPron} aria-hidden={!pron}>
          <span>· ri-they waaliaa</span>
        </span>
      </h1>
      <div className={styles.mastIntro}>
        <p>
          I&apos;m a Product Designer obsessed with making, and I have 6 years of experience designing for interaction
          models that barely exist yet. I focus on the user and learn by making, whether on the canvas, in code, or the
          physical world.
        </p>
        <p>
          I&apos;ve designed features that help people understand their homes at{" "}
          <BioLink k="domis" onProject={onProject}>Domis</BioLink>, AR fitness for any space at{" "}
          <BioLink k="virdio" onProject={onProject}>Virdio</BioLink>, an interactive exhibition at{" "}
          <BioLink k="obscura" onProject={onProject}>MOHAI</BioLink>, and tangible, accessible experiences for people
          living with Alzheimer&apos;s at the <BioLink k="mc" onProject={onProject}>SFCJL</BioLink>.
        </p>
      </div>
      <div className={styles.mastActions}>
        <Glass>
          <button type="button" className={styles.mastAbout} onClick={onAbout} aria-expanded={aboutOpen} aria-haspopup="dialog">
            About me
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Glass>
        <Glass>
          <CopyEmailPill />
        </Glass>
        <Glass>
          <a href={CV_HREF} target="_blank" rel="noopener noreferrer" className={styles.mastIcon}>
            CV
          </a>
        </Glass>
        <Glass>
          <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" className={styles.mastIcon} aria-label="LinkedIn">
            in
          </a>
        </Glass>
      </div>
    </header>
  );
}
