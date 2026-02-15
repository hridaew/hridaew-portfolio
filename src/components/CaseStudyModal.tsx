"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";
import { motion } from "framer-motion";
import { type AnyCaseStudy, type LegacyCaseStudy, type CaseStudy, isLegacyCaseStudy } from "@/types/case-study";
import { ContentBlockRenderer } from "./case-study/ContentBlockRenderer";
import { EditorialLayout } from "./case-study/EditorialLayout";
import { Reveal } from "./Reveal";

// ===== Next Case Study button =====
function NextCaseStudyButton({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full group bg-[var(--surface-card)] p-8 rounded-none  border border-[var(--border-card)] hover:border-[var(--text-subtle)] transition-all hover:shadow-lg text-left"
    >
      <h2 className="font-[family-name:var(--font-instrument-serif)] text-[var(--text-muted)] text-3xl md:text-4xl leading-tight mb-3 flex items-center justify-center gap-4 group-hover:gap-6 transition-all">
        Next Case Study
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-transform group-hover:translate-x-2"
        >
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </h2>
      <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[var(--text-muted)] leading-relaxed text-center">
        {title} — {subtitle}
      </p>
    </button>
  );
}

// ===== Legacy Domis Renderer (temporary until bento-grid migration) =====
function LegacyModalContent({ caseStudy, scroller, layoutId }: { caseStudy: LegacyCaseStudy; scroller?: string | Element | null; layoutId?: string }) {
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero */}
      <EditorialLayout width="text">
        <motion.div
          layoutId={layoutId}
          className="relative aspect-[16/9] rounded-[16px] md:rounded-[24px] overflow-hidden shadow-lg"
        >
          <Image
            alt={caseStudy.title}
            className="object-cover"
            src={caseStudy.image}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 920px"
          />
        </motion.div>
      </EditorialLayout>

      <EditorialLayout width="text">
        <div className="space-y-4">
          <h1 id="modal-title" className="font-[family-name:var(--font-instrument-serif)] text-[48px] md:text-[64px] lg:text-[72px] leading-[1.05] text-[var(--text-primary)] tracking-tight">
            {caseStudy.title}
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[20px] md:text-[24px] text-[var(--text-muted)] leading-relaxed">
            {caseStudy.subtitle}
          </p>
        </div>
      </EditorialLayout>

      {/* Metadata */}
      <EditorialLayout width="text">
        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2 pb-4 border-t border-b border-[var(--border-card)]">
          <div className="flex flex-col gap-1">
            <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[11px] text-[var(--text-subtle)] uppercase tracking-[0.12em]">Role</p>
            <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-snug">{caseStudy.role}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[11px] text-[var(--text-subtle)] uppercase tracking-[0.12em]">Timeline</p>
            <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-snug">{caseStudy.timeline}</p>
          </div>
          {caseStudy.team && (
            <div className="flex flex-col gap-1">
              <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[11px] text-[var(--text-subtle)] uppercase tracking-[0.12em]">Team</p>
              <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-snug">{caseStudy.team}</p>
            </div>
          )}
        </div>
      </EditorialLayout>

      {/* Challenge */}
      {caseStudy.challenge && (
        <Reveal scroller={scroller}>
          <EditorialLayout width="text">
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[12px] text-[var(--text-subtle)] uppercase tracking-[0.1em] mb-2">The Challenge</p>
              <p className="font-[family-name:var(--font-dm-sans)] text-[17px] md:text-[19px] text-[var(--text-secondary)] leading-[1.65]">{caseStudy.challenge}</p>
            </div>
          </EditorialLayout>
        </Reveal>
      )}

      {/* Solution */}
      {caseStudy.solution && (
        <Reveal scroller={scroller}>
          <EditorialLayout width="text">
            <div>
              <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[12px] text-[var(--text-subtle)] uppercase tracking-[0.1em] mb-2">The Solution</p>
              <p className="font-[family-name:var(--font-dm-sans)] text-[17px] md:text-[19px] text-[var(--text-secondary)] leading-[1.65]">{caseStudy.solution}</p>
            </div>
          </EditorialLayout>
        </Reveal>
      )}

      {/* Stats */}
      <Reveal scroller={scroller}>
        <EditorialLayout width="breakout">
          <div className="bg-gradient-to-br from-[#525252] to-[#363636] border-[#525252] p-8 md:p-10 rounded-none  border">
            <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3">
              {caseStudy.stats.map((stat, i) => (
                <div key={i} className="text-center sm:text-left">
                  <p className="font-[family-name:var(--font-instrument-serif)] text-[40px] md:text-[48px] text-white leading-none mb-2">{stat.value}</p>
                  <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-white/60 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </EditorialLayout>
      </Reveal>
    </div>
  );
}

// ===== Main Modal Component =====
interface CaseStudyModalProps {
  caseStudy: AnyCaseStudy;
  caseStudies: AnyCaseStudy[];
  selectedIndex: number;
  onClose: () => void;
  onSelectCase: (index: number) => void;
}

export function CaseStudyModal({
  caseStudy,
  caseStudies,
  selectedIndex,
  onClose,
  onSelectCase,
}: CaseStudyModalProps) {
  // Lock body scroll when modal is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Capture the element that triggered the modal (for focus restore)
  useEffect(() => {
    triggerRef.current = document.activeElement;
    return () => {
      // Return focus to triggering element on unmount
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Auto-focus close button when modal opens
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Scroll to top on case change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedIndex]);

  // Handle close - AnimatePresence handles the exit animation
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  const nextIndex = (selectedIndex + 1) % caseStudies.length;
  const nextCase = caseStudies[nextIndex];

  const handleNext = useCallback(() => {
    onSelectCase(nextIndex);
  }, [nextIndex, onSelectCase]);

  const isLegacy = isLegacyCaseStudy(caseStudy);
  const layoutId = `card-image-${caseStudy.slug}`;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed inset-0 z-40 backdrop-blur-md bg-black/10"
        onClick={handleClose}
      />

      {/* Modal container — centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-3 md:p-6 lg:p-8">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ scale: 0.92, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 30 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} // Expo out equiv
          className="pointer-events-auto w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={scrollRef}
            data-lenis-prevent
            className="bg-[var(--surface-modal)] w-full h-full rounded-3xl overflow-y-auto scrollbar-hide shadow-[0px_8px_60px_0px_rgba(0,0,0,0.25)] modal-scroll overscroll-y-contain"
          >
            {/* Close button — sticky */}
            <div className="sticky top-0 z-20 flex justify-end p-0 pointer-events-none">
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="pointer-events-auto w-10 h-10 rounded-full bg-[var(--surface-modal)] hover:bg-[var(--border-card)] flex items-center justify-center transition-colors border border-[var(--border-card)] shadow-sm backdrop-blur-sm"
                aria-label="Close case study"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-[1000px] px-4 md:px-8 lg:px-0 pb-12 md:pb-16 lg:pb-24 -mt-4">
              {isLegacy ? (
                <LegacyModalContent caseStudy={caseStudy as LegacyCaseStudy} scroller=".modal-scroll" layoutId={layoutId} />
              ) : (
                <ContentBlockRenderer blocks={(caseStudy as CaseStudy).content} scroller=".modal-scroll" layoutId={layoutId} />
              )}

              {/* Next Case Study */}
              <div className="mt-16 md:mt-20 lg:mt-24">
                <EditorialLayout width="text">
                  <Reveal>
                    <NextCaseStudyButton
                      title={nextCase.title}
                      subtitle={nextCase.subtitle}
                      onClick={handleNext}
                    />
                  </Reveal>
                </EditorialLayout>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
