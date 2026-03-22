export interface CaseStudy {
  slug: string;
  // Gallery card data
  title: string;
  subtitle: string;
  description: string;
  image: string;
  rotation: number;
  yOffset: number;
  tags?: string[];
  // Optional dedicated page URL (bypasses modal)
  href?: string;
}

// Legacy interface for Domis (will be migrated to bento-grid later)
export interface LegacyCaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  role: string;
  timeline: string;
  team?: string;
  platforms?: string;
  rotation: number;
  yOffset: number;
  tags?: string[];
  href?: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  keyLesson?: string;
  stats: { value: string; label: string }[];
}

export type AnyCaseStudy = CaseStudy | LegacyCaseStudy;
