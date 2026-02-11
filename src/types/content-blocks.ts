// ===== Content Block Type Definitions =====

interface BaseBlock {
  id: string;
}

export interface HeroBlock extends BaseBlock {
  type: "hero";
  title: string;
  subtitle: string;
  description: string;
  image: string;
  metadata: {
    role: string;
    timeline: string;
    team?: string;
    location?: string;
    platforms?: string;
  };
  recognition?: string; // e.g. "Fast Company World Changing Ideas Finalist"
}

export interface SectionBlock extends BaseBlock {
  type: "section";
  number?: string; // "01", "02", etc.
  title: string;
  subtitle?: string;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
  label?: string; // "The Constraint", "The Solution", "The Insight", etc.
  variant?: "body" | "lead" | "caption" | "emphasis";
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  layout: "text-width" | "breakout" | "full-width";
  aspectRatio?: "16/10" | "16/9" | "4/3" | "3/2" | "1/1" | "21/9";
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  src: string;
  poster?: string;
  caption?: string;
  layout: "text-width" | "breakout" | "full-width";
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  content: string;
  attribution?: string;
  variant?: "default" | "large" | "inline";
}

export interface TestimonialBlock extends BaseBlock {
  type: "testimonial";
  quote: string;
  role: string;
  name?: string;
}

export interface StatsBlock extends BaseBlock {
  type: "stats";
  stats: { value: string; label: string }[];
  variant?: "dark" | "gradient" | "light";
}

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  items: string[];
  variant?: "awards" | "info" | "highlight";
}

export interface ReflectionBlock extends BaseBlock {
  type: "reflection";
  title?: string;
  outcome?: string;
  keyLesson?: string;
}

export type ContentBlock =
  | HeroBlock
  | SectionBlock
  | TextBlock
  | ImageBlock
  | VideoBlock
  | QuoteBlock
  | TestimonialBlock
  | StatsBlock
  | CalloutBlock
  | ReflectionBlock;
