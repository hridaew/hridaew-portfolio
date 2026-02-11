"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { image: "/assets/virdio/setup1.png", label: "Start Setup" },
  { image: "/assets/virdio/setup2.png", label: "Approach Cone" },
  { image: "/assets/virdio/setup3.png", label: "Capturing" },
  { image: "/assets/virdio/setup4.png", label: "Cone Complete" },
  { image: "/assets/virdio/setup5.png", label: "Next Cone" },
  { image: "/assets/virdio/setup6.png", label: "Capturing" },
  { image: "/assets/virdio/setup7.png", label: "Setup Complete" },
] as const;

interface ScrollRevealFlowProps {
  className?: string;
}

function ScrollRevealFlow({ className }: ScrollRevealFlowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    const progressBar = progressBarRef.current;
    if (!section || !pinContainer || !progressBar) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: pinContainer,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      const segmentDuration = 1 / STEPS.length;

      for (let i = 0; i < STEPS.length - 1; i++) {
        const position = (i + 0.7) * segmentDuration;
        const duration = 0.3 * segmentDuration;

        // Fade out current image
        tl.to(
          imageRefs.current[i],
          { opacity: 0, duration, ease: "none" },
          position
        );

        // Fade in next image
        tl.to(
          imageRefs.current[i + 1],
          { opacity: 1, duration, ease: "none" },
          position
        );

        // Dim previous label
        tl.to(
          labelRefs.current[i],
          {
            opacity: 0.4,
            color: "#a3a3a3",
            fontWeight: 400,
            duration,
            ease: "none",
          },
          position
        );

        // Highlight next label
        tl.to(
          labelRefs.current[i + 1],
          {
            opacity: 1,
            color: "#171717",
            fontWeight: 500,
            duration,
            ease: "none",
          },
          position
        );
      }

      // Progress bar: scaleX from 0 to 1 across entire timeline
      tl.fromTo(
        progressBar,
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "none" },
        0
      );

      return () => {
        tl.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("relative md:h-[500vh]", className)}
    >
      <div
        ref={pinContainerRef}
        className="md:h-screen flex items-center justify-center py-16 md:py-0"
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-neutral-50 rounded-2xl p-6 md:p-10 overflow-hidden">
            {/* Desktop: stacked images */}
            <div className="relative w-full overflow-hidden rounded-lg hidden md:block">
              {/* Invisible spacer image to set container height */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STEPS[0].image}
                alt=""
                className="w-full h-auto object-contain invisible"
                loading="eager"
              />

              {/* Stacked images */}
              {STEPS.map((step, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={step.label}
                  ref={(el) => {
                    imageRefs.current[i] = el;
                  }}
                  src={step.image}
                  alt={step.label}
                  className="absolute inset-0 w-full h-full object-contain will-change-[opacity]"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                  loading="eager"
                />
              ))}
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory flex gap-4 -mx-2 px-2 pb-4">
              {STEPS.map((step) => (
                <div
                  key={step.label}
                  className="snap-center flex-shrink-0 w-[85%]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image}
                    alt={step.label}
                    className="w-full h-auto object-contain rounded-lg"
                    loading="eager"
                  />
                  <p className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-500 text-center mt-2">
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress bar (desktop only) */}
            <div className="hidden md:block mt-6">
              <div className="h-[2px] bg-neutral-200 rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-neutral-900 rounded-full origin-left"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>

              {/* Step labels */}
              <div className="flex justify-between mt-3">
                {STEPS.map((step, i) => (
                  <span
                    key={step.label}
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    className="font-[family-name:var(--font-dm-sans)] text-xs sm:text-sm"
                    style={{
                      opacity: i === 0 ? 1 : 0.4,
                      color: i === 0 ? "#171717" : "#a3a3a3",
                      fontWeight: i === 0 ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { ScrollRevealFlow };
