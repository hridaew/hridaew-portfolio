"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sections = [
    { id: "hero", label: "Intro", number: "00" },
    { id: "setup", label: "Setup", number: "01" },
    { id: "resilience", label: "Resilience", number: "02" },
    { id: "scaling", label: "Scaling", number: "03" },
    { id: "reflection", label: "Reflection", number: "04" },
];

export function StickySidebar() {
    const [activeSection, setActiveSection] = useState("hero");

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
    }, []);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <nav className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-6 lg:flex">
            <div className="flex flex-col gap-3 bg-white/80 backdrop-blur-xl border border-neutral-200/60 p-3 rounded-2xl shadow-sm">
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
                                    className="absolute inset-0 rounded-full bg-paper-sunken"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span
                                className={cn(
                                    "type-caption-medium transition-colors duration-300 relative z-10 text-left",
                                    activeSection === section.id
                                        ? "text-ink"
                                        : "text-ink-muted group-hover:text-neutral-700"
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
                                        ? "translate-x-0 opacity-100 text-neutral-900"
                                        : "-translate-x-3 opacity-0 text-ink-muted group-hover:translate-x-0 group-hover:opacity-100"
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
