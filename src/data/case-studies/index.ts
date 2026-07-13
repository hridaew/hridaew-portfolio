import { type AnyCaseStudy, type LegacyCaseStudy } from "@/types/case-study";
import { virdio } from "./virdio";
import { obscura } from "./obscura";
import { memoryCare } from "./memory-care";

// Domis stays on legacy format until bento-grid migration
const domis: LegacyCaseStudy = {
  slug: "domis",
  title: "Domis",
  subtitle: "AI-powered home maintenance",
  description:
    "Founding design for an AI home-maintenance app that turns the chaos of owning a home into calm, personalized action.",
  image: "/images/domis.png",
  href: "/domis",
  role: "Founding Product Designer",
  timeline: "2024 —",
  rotation: -3.5,
  yOffset: 8,
  tags: ["Consumer App", "AI"],
  challenge:
    "Homeowners drown in unstructured information — inspection reports, manuals, warranties, seasonal upkeep — and end up doing nothing until something breaks.",
  solution:
    "An AI product that turns scattered, unstructured inputs into trustworthy, personalized, low-effort action — using AI only where it genuinely removes work.",
  stats: [],
};

export const caseStudies: AnyCaseStudy[] = [domis, virdio, obscura, memoryCare];
