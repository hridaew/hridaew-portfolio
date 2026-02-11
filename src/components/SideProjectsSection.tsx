import Link from "next/link";
import { sideProjects } from "@/data/side-projects";
import { EditorialLayout } from "./case-study/EditorialLayout";
import { Reveal } from "./Reveal";

export function SideProjectsSection() {
    return (
        <section className="py-24 md:py-32 bg-background border-t border-[var(--border-card)]">
            <EditorialLayout width="breakout">
                <div className="space-y-16">
                    {/* Section Header */}
                    <Reveal>
                        <div className="space-y-4">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl text-foreground">
                                Side Projects
                            </h2>
                            <div className="h-px w-full bg-[var(--border-card)] opacity-50" />
                        </div>
                    </Reveal>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {sideProjects.map((project, index) => (
                            <Reveal key={index} delay={index * 0.1}>
                                <Link
                                    href={project.link || "#"}
                                    className="group block space-y-4 cursor-pointer"
                                >
                                    <div className="relative aspect-[4/3] bg-[var(--surface-card)] rounded-xl overflow-hidden border border-[var(--border-card)] group-hover:border-[var(--text-subtle)] transition-colors duration-300">
                                        {/* Placeholder for now, or actual image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-[var(--text-subtle)] opacity-30 group-hover:scale-105 transition-transform duration-500">
                                            Coming Soon
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-[family-name:var(--font-dm-sans)] text-xl text-foreground font-semibold group-hover:underline decoration-1 underline-offset-4">
                                                {project.title}
                                            </h3>
                                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-[var(--text-subtle)] uppercase tracking-wider">
                                                {project.year}
                                            </span>
                                        </div>
                                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-[var(--text-muted)] leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </EditorialLayout>
        </section>
    );
}
