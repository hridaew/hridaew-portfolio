"use client";

import { CopyEmailPill } from "@/components/shared/CopyEmailPill";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import styles from "./OneSplat.module.css";

/** A light, card-less header for the splat page: signature, name, role, and the same quick actions as the hero card. */
export function Masthead({ onAbout, aboutOpen }: { onAbout: () => void; aboutOpen: boolean }) {
  return (
    <header className={styles.mast}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/home/hero-avatar.gif" alt="" width={73} height={32} className={styles.mastSignature} draggable={false} />
      <h1 className={styles.mastName}>Hridae Walia</h1>
      <p className={styles.mastRole}>Product Designer · Founding Product Designer at Domis</p>
      <div className={styles.mastActions}>
        <button type="button" className={styles.mastAbout} onClick={onAbout} aria-expanded={aboutOpen} aria-haspopup="dialog">
          About me
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <CopyEmailPill />
        <a href={CV_HREF} target="_blank" rel="noopener noreferrer" className={styles.mastIcon}>
          CV
        </a>
        <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" className={styles.mastIcon} aria-label="LinkedIn">
          in
        </a>
      </div>
    </header>
  );
}
