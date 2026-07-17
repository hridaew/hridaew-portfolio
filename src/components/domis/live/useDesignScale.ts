"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Scales a fixed design canvas to the shell’s width (transform-origin: top center). */
export function useDesignScale(designWidth: number) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell || designWidth <= 0) return;

    const update = () => {
      const w = shell.clientWidth;
      if (w <= 0) return;
      setScale(w / designWidth);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [designWidth]);

  return { shellRef, scale };
}
