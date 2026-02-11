"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Image from "next/image";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { caseStudies } from "@/data/case-studies/index";
import { AnimatedCard } from "@/components/AnimatedCard";
import { IconButton } from "@/components/IconButton";

import { CaseStudyModal } from "@/components/CaseStudyModal";
import { AboutMeSection } from "@/components/AboutMeSection";
import { WhiteboardCanvas } from "@/components/WhiteboardCanvas";
import { InspirationsGallery } from "@/components/InspirationsGallery";

import { CheatCodeInput } from "@/components/CheatCodeInput";
import { StickyNotes } from "@/components/StickyNotes";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { TextReveal } from "@/components/TextReveal";
import { MagneticButton } from "@/components/MagneticButton";
import { usePageTransition } from "@/components/PageTransition";
import { playClick } from "@/lib/audio";
import { DestroySequence } from "@/components/cheat-codes/DestroySequence";
import { ButterChicken } from "@/components/cheat-codes/ButterChicken";

export default function Home() {
  const router = useRouter();
  const { transitionTo } = usePageTransition();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeCheat, setActiveCheat] = useState<string | null>(null);
  // Refs for GSAP entrance animations
  const headerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);

  // Performance refs
  const mouseRef = useRef({ x: 0, y: 0 });
  const cardHandlersRef = useRef<Map<number, { xTo: gsap.QuickToFunc; yTo: gsap.QuickToFunc; el: HTMLDivElement }>>(new Map());
  const hoveredIndexRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Scroll to top on mount (e.g. returning from project pages)
  useEffect(() => {
    window.scrollTo(0, 0);
    (window as any).__lenis?.scrollTo(0, { immediate: true });
  }, []);

  // Sync state to ref for RAF loop
  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
  }, [hoveredIndex]);

  // Track mouse without re-renders
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // RAF Loop for physics
  useEffect(() => {
    const loop = () => {
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const hoveredIdx = hoveredIndexRef.current;

      cardHandlersRef.current.forEach((handler, index) => {
        const { xTo, yTo, el } = handler;
        const cardConfig = caseStudies[index];

        let targetX = 0;
        let targetY = cardConfig.yOffset;

        if (hoveredIdx !== null) {
          if (hoveredIdx === index) {
            targetX = 0;
            targetY = -20;
          } else {
            targetX = index < hoveredIdx ? -30 : 30;
            targetY = cardConfig.yOffset;
          }
        } else {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = mouseX - centerX;
          const deltaY = mouseY - centerY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const maxDistance = 600;

          if (distance < maxDistance) {
            const proximityFactor = 1 - distance / maxDistance;
            const strength = 4 + proximityFactor * 12;
            targetX = (deltaX / distance) * strength;
            targetY += (deltaY / distance) * strength;
          }
        }

        xTo(targetX);
        yTo(targetY);
      });

      rafIdRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const registerCard = useCallback((index: number, handlers: { xTo: gsap.QuickToFunc; yTo: gsap.QuickToFunc; el: HTMLDivElement }) => {
    cardHandlersRef.current.set(index, handlers);
  }, []);

  // Entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2 })
      .fromTo(actionsRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 }, "-=0.3")
      .fromTo(bottomRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
  }, []);

  // Animate main wrapper scale when modal opens/closes
  useEffect(() => {
    if (!mainWrapperRef.current) return;
    gsap.to(mainWrapperRef.current, {
      scale: selectedCase !== null ? 0.95 : 1,
      opacity: selectedCase !== null ? 0.6 : 1,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [selectedCase]);

  // Copy email
  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("hridaew@gmail.com");
      toast.success("Email copied to clipboard!", {
        duration: 2000,
        style: {
          background: "var(--surface-card)",
          border: "1px solid var(--border-card)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-dm-sans)",
        },
      });
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = "hridaew@gmail.com";
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, []);

  // Cheat code handler
  const handleCheatCode = useCallback((code: string) => {
    const codeMap: Record<string, string> = {
      "2004": "theme-2004",
      "choom": "theme-cyberpunk",
      "destroy": "destroy",
      "butter chicken": "butter-chicken",
    };

    const action = codeMap[code];
    if (!action) return;

    if (action.startsWith("theme-")) {
      // Remove any existing theme classes
      document.documentElement.classList.remove("theme-2004", "theme-cyberpunk");
      document.documentElement.classList.add(action);
      sessionStorage.setItem("activeCheat", action);
      setActiveCheat(action);
    } else {
      sessionStorage.setItem("activeCheat", action);
      setActiveCheat(action);
    }
  }, []);

  // Restore cheat on mount (sessionStorage persists within tab session)
  useEffect(() => {
    const saved = sessionStorage.getItem("activeCheat");
    if (saved) {
      if (saved.startsWith("theme-")) {
        document.documentElement.classList.add(saved);
        setActiveCheat(saved);
      }
      // Don't restore destructive cheats on reload — sessionStorage clears on tab close
      // but persists on reload. Since the plan says "reverse on reload", we clear it:
      sessionStorage.removeItem("activeCheat");
    }
  }, []);

  return (
    <div className="min-h-screen w-full relative">
      {/* Main content wrapper */}
      <div
        ref={mainWrapperRef}
        className="bg-background min-h-screen w-full transition-colors duration-500 flex flex-col"
      >
        {/* Header: location + email */}
        <div
          ref={headerRef}
          className="fixed top-0 left-0 right-0 z-10 pt-6 px-4 flex flex-col items-center gap-1 opacity-0 mix-blend-difference text-white pointer-events-none"
        >
          <p className="font-[family-name:var(--font-dm-sans)] font-semibold leading-normal text-base text-center uppercase tracking-wide">
            San Francisco, CA
          </p>
          <button
            onClick={copyEmail}
            className="font-[family-name:var(--font-dm-sans)] font-semibold leading-normal text-white/60 text-base text-center uppercase tracking-wide hover:text-white transition-colors cursor-pointer pointer-events-auto"
          >
            hridaew@gmail.com
          </button>
        </div>


        {/* Action buttons — top right */}
        <div
          ref={actionsRef}
          className="fixed top-6 md:top-8 right-4 md:right-8 z-10 flex gap-2 opacity-0"
        >
          <MagneticButton>
            <IconButton
              label="Download CV"

              href="https://drive.google.com/file/d/1Ha7vP0l5HG9IKC4rbd3Y58GZqCIeqGZa/view"
            >
              <p className="font-[family-name:var(--font-dm-sans)] font-semibold leading-normal text-[#a1a1a1] text-xs uppercase">
                CV
              </p>
            </IconButton>
          </MagneticButton>
          <MagneticButton>
            <IconButton label="LinkedIn" href="https://www.linkedin.com/in/hridae">
              <div className="relative size-4">
                <Image
                  alt="LinkedIn"
                  className="absolute inset-0 object-cover opacity-30 pointer-events-none"
                  src="/images/linkedin-icon.png"
                  fill
                  sizes="16px"
                />
              </div>
            </IconButton>
          </MagneticButton>
        </div>

        {/* Main content */}
        <main className="flex-1 w-full flex flex-col">
          {/* HERO SECTION */}
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
            <div className="flex flex-col items-center gap-6 md:gap-8 max-w-[1400px] w-full z-0">
              {/* Name */}
              <h1 className="font-[family-name:var(--font-instrument-serif)] leading-[0.95] text-foreground text-5xl md:text-7xl lg:text-[96px] text-center tracking-tight uppercase transition-colors duration-500">
                <HeroTextAnimation variant="wave" delay={0.2}>Hridae Walia</HeroTextAnimation>
              </h1>

              {/* Image Gallery */}
              <div className="w-full relative px-4 md:px-0">
                <div className="grid grid-cols-2 gap-4 justify-items-center p-4 md:flex md:items-center md:justify-center md:overflow-visible md:p-0 md:-space-x-[11px] lg:-space-x-[12.5px]">
                  {caseStudies.map((cs, i) => (
                    <div key={cs.slug} className="md:shrink-0">
                      <AnimatedCard
                        src={cs.image}
                        title={cs.title}
                        slug={cs.slug}
                        index={i}
                        rotation={cs.rotation}
                        yOffset={cs.yOffset}
                        isHovered={hoveredIndex}
                        selectedCase={selectedCase}
                        registerCard={registerCard}
                        onHoverChange={setHoveredIndex}
                        onClick={() => {
                          playClick();
                          if ("href" in cs && cs.href) {
                            transitionTo(cs.href);
                          } else {
                            setSelectedCase(i);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtitle */}
              <div
                className="font-[family-name:var(--font-instrument-serif)] leading-tight text-[var(--text-subtle)] text-3xl md:text-5xl lg:text-[64px] text-center tracking-tight uppercase max-w-[800px]"
              >
                <div className="mb-0">
                  <TextReveal delay={0.6}>Product Designer, Maker,</TextReveal>
                </div>
                <div>
                  <TextReveal delay={0.8}>Technologist</TextReveal>
                </div>
              </div>
            </div>

            {/* Bottom text - Intro */}
            <div
              ref={bottomRef}
              className="absolute bottom-12 left-0 right-0 font-[family-name:var(--font-dm-sans)] font-semibold leading-relaxed text-[var(--text-subtle)] text-base text-center uppercase pb-4 opacity-0"
            >
              <p className="mb-0">5+ years of experience in 0-to-1 design</p>
              <p>across AI, Emerging Tech, Startups, and immersive Experiences</p>
            </div>
          </div>

          {/* NEW SECTIONS */}
          <div className="relative z-0">
            <AboutMeSection />
            <WhiteboardCanvas />
            <InspirationsGallery />
            <CheatCodeInput onActivate={handleCheatCode} />

            {/* Footer */}
            <footer className="py-16 text-center">
              <p className="font-[family-name:var(--font-dm-sans)] text-[var(--text-subtle)] text-sm leading-relaxed max-w-[600px] mx-auto px-6">
                I built this portfolio website with Figma &rarr; Figma Make &rarr; Claude Code + Google Antigravity with GSAP &amp; Tailwind
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* Sticky Notes */}
      <StickyNotes />

      {/* Cheat Code Overlays */}
      {activeCheat === "destroy" && <DestroySequence />}
      {activeCheat === "butter-chicken" && <ButterChicken />}

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedCase !== null && (
          <CaseStudyModal
            key="modal"
            caseStudy={caseStudies[selectedCase]}
            caseStudies={caseStudies}
            selectedIndex={selectedCase}
            onClose={() => setSelectedCase(null)}
            onSelectCase={setSelectedCase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
