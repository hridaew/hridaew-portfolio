"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useScroller } from "@/components/sheet/scroller-context";
import { cn } from "@/lib/utils";

interface SidebarSection {
  id: string;
  label: string;
  number: string;
}

interface StickySidebarProps {
  sections: SidebarSection[];
}

type LenisScroll = {
  scrollTo: (
    target: HTMLElement | number,
    opts?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
  on: (event: "scroll", cb: () => void) => void;
  off: (event: "scroll", cb: () => void) => void;
};

function getLenis(): LenisScroll | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __lenis?: LenisScroll }).__lenis;
}

/** Last section whose top has crossed ~38% of the scroll viewport. */
function resolveActiveSection(
  sectionIds: string[],
  scroller: HTMLElement | null,
): string {
  const marker = scroller
    ? scroller.getBoundingClientRect().top + scroller.clientHeight * 0.38
    : window.innerHeight * 0.38;
  let active = sectionIds[0] ?? "";

  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= marker) {
      active = id;
    }
  }

  return active;
}

export function StickySidebar({ sections }: StickySidebarProps) {
  const scroller = useScroller();
  const inSheet = !!scroller;
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);

    const update = () => {
      const next = resolveActiveSection(ids, scroller);
      setActiveSection((prev) => (prev === next ? prev : next));
    };

    update();

    if (scroller) {
      scroller.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      return () => {
        scroller.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
      };
    }

    // Full page: Lenis drives scroll — native listeners alone miss updates.
    let lenis = getLenis();
    const onLenisScroll = () => update();

    const attachLenis = () => {
      lenis = getLenis();
      if (!lenis) return false;
      lenis.on("scroll", onLenisScroll);
      return true;
    };

    let tries = 0;
    const retryId = window.setInterval(() => {
      tries += 1;
      if (attachLenis() || tries > 20) {
        window.clearInterval(retryId);
      }
    }, 50);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.clearInterval(retryId);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      getLenis()?.off("scroll", onLenisScroll);
    };
  }, [sections, scroller]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (scroller) {
      const scrollerTop = scroller.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const top = scroller.scrollTop + (elTop - scrollerTop) - 24;
      scroller.scrollTo({ top, behavior: "smooth" });
      return;
    }

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, { offset: -24, duration: 1.1 });
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className={cn(
        "z-40 hidden flex-col gap-6 lg:flex",
        inSheet
          ? "pointer-events-none absolute bottom-0 left-3 top-0 w-max"
          : "fixed left-5 top-1/2 -translate-y-1/2",
      )}
      aria-label="Case study sections"
    >
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-ink/[0.08] bg-paper-raised/80 p-3 shadow-e2 backdrop-blur-xl",
          inSheet && "pointer-events-auto sticky top-1/2 -translate-y-1/2",
        )}
      >
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center gap-2.5 text-left transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <div className="relative flex h-7 w-7 items-center justify-center">
              {activeSection === section.id && (
                <motion.div
                  layoutId={
                    inSheet ? "activeSectionPill-sheet" : "activeSectionPill"
                  }
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "type-caption-medium relative z-10 text-left transition-colors duration-150",
                  activeSection === section.id
                    ? "text-paper"
                    : "text-ink-subtle group-hover:text-ink-secondary",
                )}
              >
                {section.number}
              </span>
            </div>

            <div className="overflow-hidden">
              <span
                className={cn(
                  "type-caption-medium block text-left transition-all duration-150",
                  activeSection === section.id
                    ? "text-ink opacity-100"
                    : "text-ink-subtle opacity-70 group-hover:text-ink-secondary group-hover:opacity-100",
                )}
              >
                {section.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}
