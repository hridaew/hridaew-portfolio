"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollerProvider } from "@/components/sheet/scroller-context";
import { useSheetNav } from "@/components/sheet/SheetNav";
import {
  getCachedSheetBody,
  loadSheetBody,
} from "@/components/sheet/sheet-bodies";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { getNextSheetRoute, getSheetRoute } from "@/lib/case-study-sheets";
import { SHEET_SECTIONS } from "@/lib/case-study-sections";
import { cn } from "@/lib/utils";

type LenisApi = { start: () => void; stop: () => void };

function getLenis(): LenisApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { __lenis?: LenisApi }).__lenis;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function SheetBodyHost({ body: Body }: { body: ComponentType }) {
  return <Body />;
}

export function CaseStudySheet({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const { activeKey, replaceSheet, clearActiveKey } = useSheetNav();

  const [closing, setClosing] = useState(false);
  const [, setBodyTick] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Stable ref callback — an inline ref is called with null on every re-render,
  // which briefly clears `scroller` and remounts every sheet ScrollTrigger (pin bounce).
  const setScrollEl = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setScroller((prev) => (prev === node ? prev : node));
  }, []);

  const open = activeKey !== null;
  const route = activeKey ? getSheetRoute(activeKey) : undefined;
  const next = activeKey ? getNextSheetRoute(activeKey) : undefined;
  const nextLabel =
    route?.kind === "waffling" ? "Next waffling" : "Next project";
  const tocSections = activeKey ? SHEET_SECTIONS[activeKey] : undefined;

  const Body: ComponentType | null = activeKey
    ? getCachedSheetBody(activeKey)
    : null;

  useEffect(() => {
    if (!activeKey) return;
    if (getCachedSheetBody(activeKey)) return;
    let cancelled = false;
    void loadSheetBody(activeKey).then((loaded) => {
      if (!cancelled && loaded) setBodyTick((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [activeKey]);

  const content = Body ? <SheetBodyHost body={Body} /> : children;

  const close = useCallback(() => setClosing(true), [setClosing]);

  const onExitComplete = useCallback(() => {
    if (!closing) return;
    clearActiveKey();
    setClosing(false);
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [closing, clearActiveKey, router]);

  const goToNext = useCallback(() => {
    setClosing(false);
    if (next) replaceSheet(next.href);
  }, [next, replaceSheet]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const html = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = bodyEl.style.overflow;
    html.style.overflow = "hidden";
    bodyEl.style.overflow = "hidden";
    getLenis()?.stop();

    const shell = document.querySelector<HTMLElement>(
      "[data-page-transition-shell]"
    );
    shell?.setAttribute("inert", "");

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      html.style.overflow = prevHtmlOverflow;
      bodyEl.style.overflow = prevBodyOverflow;
      shell?.removeAttribute("inert");
      // Twin-pane home keeps Lenis stopped for independent column scroll.
      if (!document.querySelector("[data-home-split-panes]")) {
        getLenis()?.start();
      }
      restoreFocusRef.current?.focus?.();
    };
  }, [open, close]);

  useEffect(() => {
    if (!scroller) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(id);
  }, [scroller, activeKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeKey]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrolled(e.currentTarget.scrollTop > 8);
  };

  const enterPanel = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };
  const exitPanel = {
    duration: reduceMotion ? 0.1 : 0.18,
    ease: [0.4, 0, 1, 1] as const,
  };

  if (!open || !activeKey) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="presentation">
      <motion.button
        type="button"
        aria-label={
          route?.kind === "waffling" ? "Close waffling" : "Close case study"
        }
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/[0.16] backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{
          duration: closing ? 0.14 : 0.16,
          ease: closing ? "easeIn" : "easeOut",
        }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(1280px,calc(100vw-3.5rem))] flex-col overflow-hidden rounded-l-[22px] border-y border-l border-white bg-paper shadow-e4",
          activeKey === "obscura" &&
            "cursor-none [&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_select]:cursor-pointer [&_textarea]:cursor-text",
        )}
        initial={{ x: "100%" }}
        animate={{ x: closing ? "100%" : 0 }}
        transition={closing ? exitPanel : enterPanel}
        onAnimationComplete={() => {
          if (closing) onExitComplete();
        }}
      >
        <header
          className={cn(
            "relative z-10 flex shrink-0 items-center gap-4 border-b px-5 py-3 transition-colors duration-200",
            scrolled
              ? "border-ink/[0.08] bg-paper/85 backdrop-blur-xl"
              : "border-transparent bg-paper"
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.28]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3.5 3.5L11.5 11.5M11.5 3.5L3.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="min-w-0">
              <p id={titleId} className="truncate type-body-medium text-ink">
                {route?.label ?? activeKey}
              </p>
            </div>
          </div>
        </header>

        <div
          ref={setScrollEl}
          onScroll={onScroll}
          className="relative flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
        >
          <ScrollerProvider scroller={scroller}>
            {/* Wait for the scroll element so pin/scrub never bind to the window first */}
            {scroller ? (
              <div key={activeKey} className="relative">
                {tocSections ? (
                  <StickySidebar sections={tocSections} />
                ) : null}
                {content ?? (
                  <div
                    className="px-8 py-16 type-caption text-ink-subtle"
                    aria-busy
                  >
                    Loading…
                  </div>
                )}
              </div>
            ) : null}
          </ScrollerProvider>

          {next ? (
            <div className="border-t border-ink/[0.08] py-10">
              <div className={SITE_COLUMN}>
                <button
                  type="button"
                  onClick={goToNext}
                  className="group relative flex w-full items-center rounded-2xl border border-ink/[0.07] bg-paper-raised p-6 text-left shadow-e1 transition-transform duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.28]"
                >
                  {/* Elevate via opacity — avoid animating box-shadow directly */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl shadow-e2 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
                  />
                  <span className="relative z-[1] min-w-0">
                    <span className="block type-caption text-ink-subtle">
                      {nextLabel}
                    </span>
                    <span className="mt-1 block type-h4 text-ink">
                      {next.label}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
