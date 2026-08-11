"use client";

import { createContext, useContext } from "react";

/**
 * The element that scrolls the current content. `null` means the window.
 * Case-study bodies render both on their own page (window scroll) and inside
 * the sheet (panel scroll), so ScrollTrigger needs to be told which one.
 */
const ScrollerContext = createContext<HTMLElement | null>(null);

export function ScrollerProvider({
  scroller,
  children,
}: {
  scroller: HTMLElement | null;
  children: React.ReactNode;
}) {
  return (
    <ScrollerContext.Provider value={scroller}>
      {children}
    </ScrollerContext.Provider>
  );
}

export function useScroller() {
  return useContext(ScrollerContext);
}
