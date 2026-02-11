import { type AnyCaseStudy, type LegacyCaseStudy } from "@/types/case-study";
import { virdio } from "./virdio";
import { obscura } from "./obscura";
import { memoryCare } from "./memory-care";

// Domis stays on legacy format until bento-grid migration
const domis: LegacyCaseStudy = {
  slug: "domis",
  title: "Domis",
  subtitle: "Home maintenance platform",
  description: "Leading product design to make home maintenance approachable and enjoyable for homeowners",
  image: "/images/domis.png",
  href: "/domis",
  role: "Founding Product Designer",
  timeline: "2024 —",
  team: "2 Designers, 4 Engineers, 1 PM",
  rotation: -3.5,
  yOffset: 8,
  challenge:
    "Creating intuitive interfaces for managing home maintenance services while building trust with homeowners.",
  solution:
    "Developed a clean, task-focused design system that prioritizes service scheduling, provider matching, and transparent pricing.",
  outcome: "40% increase in user engagement and 25% reduction in support tickets.",
  stats: [
    { value: "40%", label: "Increase in user engagement" },
    { value: "25%", label: "Reduction in support tickets" },
    { value: "4.8", label: "App store rating" },
  ],
};

export const caseStudies: AnyCaseStudy[] = [domis, virdio, obscura, memoryCare];
