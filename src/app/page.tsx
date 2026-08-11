"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { HomePage } from "@/components/home/HomePage";
import { HomeChoomLingoProvider } from "@/components/home/HomeChoomLingoContext";
import { useHomeLayoutMode } from "@/hooks/useHomeLayoutMode";
import { cn } from "@/lib/utils";
import {
  consumeWafflingReturnScroll,
  scrollHomeToTopImmediate,
} from "@/lib/scrollHomeWafflings";

const StickyNotes = dynamic(
  () => import("@/components/StickyNotes").then((m) => m.StickyNotes),
  { ssr: false }
);

function getHomeRightPane(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-home-pane="right"]');
}

export default function Home() {
  const layoutMode = useHomeLayoutMode();
  // Split locks the document and scrolls inside panes; stack needs normal page scroll.
  const splitShell = layoutMode === "split";

  useEffect(() => {
    const pendingHash = sessionStorage.getItem("pendingHash");
    if (pendingHash) {
      sessionStorage.removeItem("pendingHash");
      requestAnimationFrame(() => {
        const el = document.getElementById(pendingHash.replace("#", ""));
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    // Returning from a waffling — restore the right pane scroll position.
    const wafflingReturnY = consumeWafflingReturnScroll();
    if (wafflingReturnY !== null) {
      const apply = () => {
        const pane = getHomeRightPane();
        if (pane) pane.scrollTop = wafflingReturnY;
      };
      apply();
      requestAnimationFrame(apply);
      return;
    }

    scrollHomeToTopImmediate();
    const left = document.querySelector<HTMLElement>('[data-home-pane="left"]');
    const right = getHomeRightPane();
    if (left) left.scrollTop = 0;
    if (right) right.scrollTop = 0;
  }, []);

  useEffect(() => {
    const { documentElement: root, body } = document;
    root.classList.add("scrollbar-hide");
    body.classList.add("scrollbar-hide");
    return () => {
      root.classList.remove("scrollbar-hide");
      body.classList.remove("scrollbar-hide");
    };
  }, []);

  return (
    <div
      data-cheat-theme-scope
      data-cheat-home-shell
      className={cn(
        "relative w-full max-w-[100vw]",
        splitShell
          ? "h-dvh overflow-hidden"
          : "min-h-dvh overflow-x-clip overflow-y-visible",
      )}
    >
      <HomeChoomLingoProvider>
        <div
          data-cheat-theme-scope
          className={cn(
            "w-full max-w-[100vw] bg-paper transition-colors duration-500",
            splitShell
              ? "h-dvh overflow-hidden"
              : "min-h-dvh overflow-x-clip overflow-y-visible",
          )}
        >
          <HomePage />
        </div>
      </HomeChoomLingoProvider>

      <StickyNotes page="home" />
    </div>
  );
}
