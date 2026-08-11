"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ButterChickenRecipeBody, ButterChickenRecipeCloseButton } from "./ButterChickenRecipeBody";
import { cn } from "@/lib/utils";
import {
  buildButterChickenModalMotion,
  BUTTER_CHICKEN_MODAL_DIAL_DEFAULTS,
} from "./butterChickenRecipeModalMotionFromDial";
import {
    PAGE_TRANSITION_SHELL_SELECTOR,
    resetPageShellBlurHard,
    tweenPageShellBlur,
} from "@/lib/tweenPageShellBlur";

/** `bc-stage` holds visibility so nested sheet exit can finish (stage wrapper must be `motion` for AnimatePresence). */
const STAGE_EXIT_HOLD_MS = 420;
/** Mobile sheet slides off with a tween — stage hold should match so nothing “hangs” before unmount. */
const MOBILE_SHEET_EXIT_DURATION_S = 0.38;
const MOBILE_SLIDE_EASE: [number, number, number, number] = [0.32, 0, 0.67, 1];

export type ButterChickenOpenSource = "card" | "deeplink";

type Ctx = {
    open: (source?: ButterChickenOpenSource) => void;
    close: () => void;
    isOpen: boolean;
};

const ButterChickenRecipeModalContext = createContext<Ctx | null>(null);

export function useButterChickenRecipeModal() {
    const ctx = useContext(ButterChickenRecipeModalContext);
    if (!ctx) {
        throw new Error("useButterChickenRecipeModal must be used within ButterChickenRecipeModalProvider");
    }
    return ctx;
}

/** Safe when provider is absent (e.g. tests); returns no-ops. */
export function useButterChickenRecipeModalOptional(): Ctx | null {
    return useContext(ButterChickenRecipeModalContext);
}

function dialScalar(v: number | number[]): number {
    return typeof v === "number" ? v : (v[0] ?? 0);
}

const WAFFLING_QUERY = "waffling";
const WAFFLING_VALUE = "butter-chicken";
/** Matches Tailwind `md` breakpoint used by the sheet layout. */
const SHEET_MOBILE_MQ = "(max-width: 767px)";

/** Failsafe if `onExitComplete` never runs (e.g. HMR). */
const RESTORE_INTERACTION_FALLBACK_MS = 1600;

function syncWafflingQuery(
    router: ReturnType<typeof useRouter>,
    pathname: string,
    mode: "set" | "clear",
) {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    if (mode === "set") {
        p.set(WAFFLING_QUERY, WAFFLING_VALUE);
    } else if (p.get(WAFFLING_QUERY) === WAFFLING_VALUE) {
        p.delete(WAFFLING_QUERY);
    } else {
        return;
    }
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
}

export function ButterChickenRecipeModalProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const recipeMotion = useMemo(
        () => buildButterChickenModalMotion(BUTTER_CHICKEN_MODAL_DIAL_DEFAULTS),
        [],
    );

    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const closeButtonDesktopRef = useRef<HTMLButtonElement | null>(null);
    const closeButtonMobileRef = useRef<HTMLButtonElement | null>(null);
    /** Captured once when the modal opens so scrollbar / `overflow: hidden` can’t flip Tailwind breakpoints mid-motion. */
    const [sheetLayout, setSheetLayout] = useState<"mobile" | "desktop">("desktop");
    /** Oversized default until `useLayoutEffect` sets `innerHeight + 96` on open (avoids a short first slide). */
    const [mobileSlidePx, setMobileSlidePx] = useState(960);
    const closingLockRef = useRef(false);
    const restoreFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const restorePageInteraction = useCallback(() => {
        if (restoreFallbackTimerRef.current !== null) {
            clearTimeout(restoreFallbackTimerRef.current);
            restoreFallbackTimerRef.current = null;
        }
        const shell = document.querySelector(PAGE_TRANSITION_SHELL_SELECTOR);
        shell?.removeAttribute("inert");
        document.body.style.overflow = "";
        (window as unknown as { __lenis?: { start: () => void } }).__lenis?.start();
        closingLockRef.current = false;
    }, []);

    const resetShellVisual = useCallback(() => {
        resetPageShellBlurHard();
    }, []);

    const scheduleRestoreFallback = useCallback(() => {
        if (restoreFallbackTimerRef.current !== null) {
            clearTimeout(restoreFallbackTimerRef.current);
        }
        restoreFallbackTimerRef.current = setTimeout(() => {
            restoreFallbackTimerRef.current = null;
            resetShellVisual();
            restorePageInteraction();
            syncWafflingQuery(router, pathname, "clear");
        }, RESTORE_INTERACTION_FALLBACK_MS);
    }, [restorePageInteraction, resetShellVisual, router, pathname]);

    const onPortalExitComplete = useCallback(() => {
        resetShellVisual();
        restorePageInteraction();
        syncWafflingQuery(router, pathname, "clear");
    }, [resetShellVisual, restorePageInteraction, router, pathname]);

    const open = useCallback(
        (src: ButterChickenOpenSource = "card") => {
            closingLockRef.current = false;
            setIsOpen(true);
            if (src === "card") {
                syncWafflingQuery(router, pathname, "set");
            }
        },
        [router, pathname],
    );

    const close = useCallback(() => {
        if (closingLockRef.current) return;
        closingLockRef.current = true;
        if (typeof window !== "undefined" && window.matchMedia(SHEET_MOBILE_MQ).matches) {
            setMobileSlidePx(window.innerHeight + 96);
        }
        // Clear immediately so `ButterChickenRecipeDeepLink` cannot reopen while `isOpen`
        // flips false before exit animation finishes (and matches the address bar to UI).
        syncWafflingQuery(router, pathname, "clear");
        tweenPageShellBlur(false);
        setIsOpen(false);
        scheduleRestoreFallback();
    }, [scheduleRestoreFallback, router, pathname]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const shell = document.querySelector(PAGE_TRANSITION_SHELL_SELECTOR);
        shell?.setAttribute("inert", "");

        const raf = requestAnimationFrame(() => {
            // Shell blur must not tween while this sheet is open: `backdrop-filter` on the
            // portaled card samples the shell’s pixels, so a ramping `filter: blur()` on
            // the shell reads as “blur behind the card” changing (not the card opacity).
            tweenPageShellBlur(true, { instant: true });
        });

        document.body.style.overflow = "hidden";
        (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop();

        return () => {
            cancelAnimationFrame(raf);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        const apply = () => {
            const mobile = window.matchMedia(SHEET_MOBILE_MQ).matches;
            const layout = mobile ? "mobile" : "desktop";
            const slide = window.innerHeight + 96;
            setSheetLayout((prev) => (prev === layout ? prev : layout));
            setMobileSlidePx((prev) => (prev === slide ? prev : slide));
            const el = mobile ? closeButtonMobileRef.current : closeButtonDesktopRef.current;
            el?.focus({ preventScroll: true });
        };
        apply();
        const raf = requestAnimationFrame(apply);
        return () => cancelAnimationFrame(raf);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close]);

    useEffect(
        () => () => {
            resetShellVisual();
            restorePageInteraction();
        },
        [resetShellVisual, restorePageInteraction],
    );

    const value = useMemo(
        () => ({
            open,
            close,
            isOpen,
        }),
        [open, close, isOpen],
    );

    const mw = dialScalar(recipeMotion.modal.maxWidthPx);
    const mhVh = dialScalar(recipeMotion.modal.maxHeightVh);
    const mhCap = dialScalar(recipeMotion.modal.maxHeightCapPx);

    const isMobileSheet = sheetLayout === "mobile";

    const sheetInitial = isMobileSheet
        ? { opacity: 1, scale: 1, y: mobileSlidePx, filter: "blur(0px)" as const }
        : recipeMotion.sheetInitial;
    const sheetAnimate = isMobileSheet
        ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" as const }
        : recipeMotion.sheetAnimate;
    const sheetExit = isMobileSheet
        ? {
              opacity: 1,
              scale: 1,
              y: mobileSlidePx,
              filter: "blur(0px)" as const,
              transition: {
                  y: { duration: MOBILE_SHEET_EXIT_DURATION_S, ease: MOBILE_SLIDE_EASE },
                  opacity: { duration: 0 },
                  scale: { duration: 0 },
                  filter: { duration: 0 },
              },
          }
        : recipeMotion.sheetExit;
    const sheetTransition = isMobileSheet
        ? {
              y: { type: "spring" as const, stiffness: 520, damping: 42, mass: 0.9 },
              opacity: { duration: 0 },
              scale: { duration: 0 },
              filter: { duration: 0 },
          }
        : recipeMotion.sheetTransition;

    const stageExitDuration =
        sheetLayout === "mobile" ? MOBILE_SHEET_EXIT_DURATION_S + 0.04 : STAGE_EXIT_HOLD_MS / 1000;

    const portal =
        mounted &&
        createPortal(
            <AnimatePresence onExitComplete={onPortalExitComplete}>
                {isOpen
                    ? [
                          <motion.div
                              key="bc-backdrop"
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, transition: recipeMotion.backdropExitTransition }}
                              transition={{ duration: 0 }}
                              className="fixed inset-0 z-[190] cursor-pointer bg-black/50"
                              aria-hidden
                              onPointerDown={(e) => {
                                  e.preventDefault();
                                  close();
                              }}
                              onClick={close}
                          />,
                          <motion.div
                              key="bc-stage"
                              className={cn(
                                  "pointer-events-none fixed inset-0 z-[200] flex min-h-[100dvh] overflow-y-auto",
                                  isMobileSheet ? "items-end p-0" : "items-center justify-center px-6 py-6",
                              )}
                              initial={false}
                              animate={{ opacity: 1 }}
                              exit={{
                                  opacity: [1, 1],
                                  transition: {
                                      duration: stageExitDuration,
                                      ease: "linear",
                                  },
                              }}
                          >
                              <div
                                  className={cn(
                                      "pointer-events-none flex w-full flex-col items-center",
                                      isMobileSheet ? "min-h-0 flex-1 justify-end" : "min-h-0 flex-1 justify-center",
                                  )}
                              >
                                  <div
                                      className={cn(
                                          "pointer-events-none flex w-full flex-col items-center",
                                          isMobileSheet ? "max-h-[min(92dvh,1200px)] w-full" : "mx-auto",
                                      )}
                                      style={
                                          !isMobileSheet
                                              ? { maxWidth: `min(100%, ${mw}px)`, width: "100%" }
                                              : undefined
                                      }
                                  >
                                      <motion.div
                                          key="bc-sheet"
                                          tabIndex={-1}
                                          initial={sheetInitial}
                                          animate={sheetAnimate}
                                          transition={sheetTransition}
                                          exit={sheetExit}
                                          style={{
                                              maxWidth: isMobileSheet ? "100%" : `min(100%, ${mw}px)`,
                                              maxHeight: isMobileSheet
                                                  ? "min(92dvh, 1200px)"
                                                  : `min(${mhVh}dvh, ${mhCap}px)`,
                                              width: "100%",
                                          }}
                                          className="pointer-events-auto relative flex min-h-0 w-full max-w-full flex-col outline-none focus:outline-none focus-visible:outline-none"
                                          onClick={(e) => e.stopPropagation()}
                                          onPointerDown={(e) => e.stopPropagation()}
                                          role="dialog"
                                          aria-modal="true"
                                          aria-labelledby="butter-chicken-modal-title"
                                      >
                                          {/** Glass lives on a non-animated inner node so Framer transform/exit filter lifecycles do not retarget `backdrop-filter` sampling. */}
                                          <div
                                              className={cn(
                                                  "relative flex min-h-0 flex-1 flex-col overflow-hidden border border-ink/[0.08] bg-[rgba(29,29,29,0.78)] backdrop-blur-[140px]",
                                                  isMobileSheet
                                                      ? "rounded-b-none rounded-t-[32px] border-b-0 shadow-[0_-2px_6px_rgb(var(--ink-rgb)/0.05),0_-8px_24px_rgb(var(--ink-rgb)/0.06),0_-20px_48px_rgb(var(--ink-rgb)/0.06)]"
                                                      : "rounded-[40px] shadow-e3",
                                              )}
                                          >
                                              <div
                                                  className={cn(
                                                      "scrollbar-hide relative z-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
                                                      isMobileSheet &&
                                                          "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
                                                  )}
                                              >
                                                  <ButterChickenRecipeBody />
                                              </div>
                                          </div>
                                          {/** Outside the frosted layer: transforms on the hit target were recompositing `backdrop-filter` on press. */}
                                          {isMobileSheet ? (
                                              <div className="pointer-events-none absolute right-4 top-4 z-30">
                                                  <ButterChickenRecipeCloseButton
                                                      ref={closeButtonMobileRef}
                                                      onClose={close}
                                                      className="pointer-events-auto"
                                                  />
                                              </div>
                                          ) : null}
                                      </motion.div>

                                      {!isMobileSheet ? (
                                          <div className="pointer-events-auto mt-5 flex w-full justify-center">
                                              <ButterChickenRecipeCloseButton
                                                  ref={closeButtonDesktopRef}
                                                  onClose={close}
                                              />
                                          </div>
                                      ) : null}
                                  </div>
                              </div>
                          </motion.div>,
                      ]
                    : null}
            </AnimatePresence>,
            document.body,
        );

    return (
        <ButterChickenRecipeModalContext.Provider value={value}>
            {children}
            {portal}
        </ButterChickenRecipeModalContext.Provider>
    );
}
