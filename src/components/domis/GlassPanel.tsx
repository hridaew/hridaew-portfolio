"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  /** Tighter padding for media-only panels */
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article";
}

const paddingMap = {
  none: "p-0",
  sm: "p-5 md:p-6",
  md: "p-6 md:p-8",
  lg: "p-7 md:p-10",
} as const;

export function GlassPanel({
  children,
  className,
  padding = "md",
  as: Tag = "div",
}: GlassPanelProps) {
  return (
    <Tag className={cn("glass-panel", paddingMap[padding], className)}>
      {children}
    </Tag>
  );
}
