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

export function StickySidebar({ sections, variant = "light" }: StickySidebarProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-45% 0px -45% 0px",
                threshold: 0,
            }
        );

        sections.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
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
                                    "font-[family-name:var(--font-dm-sans)] text-[10px] font-medium transition-colors duration-300 relative z-10",
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
                                    "block font-[family-name:var(--font-dm-sans)] text-xs font-medium transition-all duration-300",
                                    activeSection === section.id
                                        ? isDark
                                            ? "translate-x-0 opacity-100 text-neutral-100"
                                            : "translate-x-0 opacity-100 text-neutral-900"
                                        : isDark
                                            ? "-translate-x-3 opacity-0 text-neutral-400 group-hover:translate-x-0 group-hover:opacity-100"
                                            : "-translate-x-3 opacity-0 text-neutral-500 group-hover:translate-x-0 group-hover:opacity-100"
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
