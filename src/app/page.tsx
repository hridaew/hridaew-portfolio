"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { HomePage } from "@/components/home/HomePage";
import { HomeChoomLingoProvider } from "@/components/home/HomeChoomLingoContext";
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
      className="relative h-dvh w-full max-w-[100vw] overflow-hidden"
    >
      <HomeChoomLingoProvider>
        <div
          data-cheat-theme-scope
          className="h-dvh w-full max-w-[100vw] overflow-hidden bg-paper transition-colors duration-500"
        >
          <HomePage />
        </div>
      </HomeChoomLingoProvider>

      <StickyNotes page="home" />
    </div>
  );
}
