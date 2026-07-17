"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarSection {
    id: string;
    label: string;
    number: string;
}

interface StickySidebarProps {
    sections: SidebarSection[];
    variant?: "light" | "dark";
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

/** Last section whose top has crossed ~38% of the viewport — works for short sections. */
function resolveActiveSection(sectionIds: string[]): string {
    const marker = window.innerHeight * 0.38;
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

export function StickySidebar({ sections, variant = "light" }: StickySidebarProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

    useEffect(() => {
        const ids = sections.map((s) => s.id);

        const update = () => {
            const next = resolveActiveSection(ids);
            setActiveSection((prev) => (prev === next ? prev : next));
        };

        update();

        // Lenis drives scroll on this site — native scroll listeners alone miss updates.
        let lenis = getLenis();
        const onLenisScroll = () => update();

        const attachLenis = () => {
            lenis = getLenis();
            if (!lenis) return false;
            lenis.on("scroll", onLenisScroll);
            return true;
        };

        // SmoothScroll mounts in parallel; retry briefly if Lenis isn't ready yet.
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
    }, [sections]);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const lenis = getLenis();
        if (lenis) {
            lenis.scrollTo(el, { offset: -24, duration: 1.1 });
            return;
        }

        el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const isDark = variant === "dark";

    return (
        <nav className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-6 lg:flex">
            <div
                className={cn(
                    "flex flex-col gap-3 backdrop-blur-xl border p-3 rounded-2xl shadow-sm",
                    isDark
                        ? "bg-neutral-900/80 border-neutral-700/60"
                        : "bg-white/80 border-neutral-200/60"
                )}
            >
                {sections.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(section.id)}
                        className="group relative flex items-center gap-2.5 text-left"
                    >
                        <div className="relative flex h-7 w-7 items-center justify-center">
                            {activeSection === section.id && (
                                <motion.div
                                    layoutId="activeSectionPill"
                                    className={cn(
                                        "absolute inset-0 rounded-full",
                                        isDark ? "bg-neutral-100" : "bg-neutral-900"
                                    )}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span
                                className={cn(
                                    "type-caption-medium transition-colors duration-300 relative z-10 text-left",
                                    activeSection === section.id
                                        ? isDark ? "text-neutral-900" : "text-white"
                                        : isDark
                                            ? "text-neutral-500 group-hover:text-neutral-300"
                                            : "text-neutral-400 group-hover:text-neutral-700"
                                )}
                            >
                                {section.number}
                            </span>
                        </div>

                        <div className="overflow-hidden">
                            <span
                                className={cn(
                                    "block type-caption-medium transition-all duration-300 text-left",
                                    activeSection === section.id
                                        ? isDark
                                            ? "translate-x-0 opacity-100 text-neutral-100"
                                            : "translate-x-0 opacity-100 text-neutral-900"
                                        : isDark
                                            ? "translate-x-0 opacity-50 text-neutral-500 group-hover:opacity-100 group-hover:text-neutral-300"
                                            : "translate-x-0 opacity-50 text-neutral-400 group-hover:opacity-100 group-hover:text-neutral-700"
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
