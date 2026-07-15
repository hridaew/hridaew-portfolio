import { type AnyCaseStudy, type LegacyCaseStudy } from "@/types/case-study";
import { virdio } from "./virdio";
import { obscura } from "./obscura";
import { memoryCare } from "./memory-care";

// Domis stays on legacy format until bento-grid migration
const domis: LegacyCaseStudy = {
  slug: "domis",
  title: "Domis",
  subtitle: "AI-native home maintenance",
  description:
    "Founding design for an AI-native home maintenance app that learns your home instead of asking about it.",
  image: "/images/domis.png",
  href: "/domis",
  role: "Founding Product Designer",
  timeline: "2024 —",
  rotation: -3.5,
  yOffset: 8,
  tags: ["Consumer App", "AI-Native", "0-to-1"],
  challenge:
    "Domis only works if it knows your home, and nobody wants to fill out a form about their house.",
  solution:
    "Address intelligence, appliance intelligence, and progressive profiling so the system learns the home instead of asking.",
  stats: [],
};

export const caseStudies: AnyCaseStudy[] = [domis, virdio, obscura, memoryCare];
