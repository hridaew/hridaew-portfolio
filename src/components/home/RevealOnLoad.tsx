"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";
import { isLikelySafari } from "@/lib/obscuraLiquidGlass";

interface RevealOnLoadProps {
  delay?: number;
  children: ReactNode;
}

export function RevealOnLoad({ delay = 0, children }: RevealOnLoadProps) {
  const [useSafeReveal, setUseSafeReveal] = useState(false);

  useLayoutEffect(() => {
    if (isLikelySafari()) {
      setUseSafeReveal(true);
    }
  }, []);

  const animation = useSafeReveal
    ? `reveal-unblur-safe 0.7s ease-out ${delay}s both`
    : `reveal-unblur 0.7s ease-out ${delay}s both`;

  return (
    <div
      style={{ animation }}
      className="motion-reduce:!animate-none motion-reduce:!opacity-100 motion-reduce:!filter-none"
    >
      {children}
    </div>
  );
}
