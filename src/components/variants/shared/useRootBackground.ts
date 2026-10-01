"use client";

import { useEffect } from "react";

/**
 * Paint <html> while a dark variant is mounted so overscroll bounce and
 * short pages don't flash the paper colour at the edges.
 */
export function useRootBackground(color: string) {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.backgroundColor;
    root.style.backgroundColor = color;
    return () => {
      root.style.backgroundColor = prev;
    };
  }, [color]);
}
