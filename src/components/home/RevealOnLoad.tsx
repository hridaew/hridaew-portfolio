"use client";

import type { ReactNode } from "react";

interface RevealOnLoadProps {
  delay?: number;
  children: ReactNode;
}

export function RevealOnLoad({ delay = 0, children }: RevealOnLoadProps) {
  return (
    <div
      style={{
        animation: `reveal-unblur 0.7s ease-out ${delay}s both`,
      }}
      className="motion-reduce:!animate-none motion-reduce:!opacity-100 motion-reduce:!filter-none"
    >
      {children}
    </div>
  );
}
