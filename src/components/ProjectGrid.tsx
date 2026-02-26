"use client";

import { gridProjects } from "@/data/project-grid";
import { ProjectCard } from "@/components/ProjectCard";

export function ProjectGrid() {
  return (
    <section id="projects" className="w-full px-4 md:px-8 py-24 md:py-40">
      <div className="max-w-[1558px] mx-auto">
        <h2 className="font-[family-name:var(--font-dm-sans)] font-semibold text-base text-[var(--text-muted)] uppercase tracking-wide mb-6 md:mb-8">
          Case Studies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {gridProjects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
