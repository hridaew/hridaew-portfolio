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
import { ButterChickenRecipeBody } from "./ButterChickenRecipeBody";
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

    const sheetRef = useRef<HTMLDivElement | null>(null);
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
        tweenPageShellBlur(false);
        setIsOpen(false);
        scheduleRestoreFallback();
    }, [scheduleRestoreFallback]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const shell = document.querySelector(PAGE_TRANSITION_SHELL_SELECTOR);
        shell?.setAttribute("inert", "");

        const raf = requestAnimationFrame(() => {
            tweenPageShellBlur(true);
        });

        document.body.style.overflow = "hidden";
        (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop();

        return () => {
            cancelAnimationFrame(raf);
        };
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen) return;
        sheetRef.current?.focus({ preventScroll: true });
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

    const portal =
        mounted &&
        createPortal(
            <AnimatePresence onExitComplete={onPortalExitComplete}>
                {isOpen
                    ? [
                          <motion.div
                              key="bc-backdrop"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, transition: recipeMotion.backdropExitTransition }}
                              transition={recipeMotion.backdropTransition}
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
                              className="pointer-events-none fixed inset-0 z-[200] flex min-h-[100dvh] items-center justify-center overflow-y-auto px-3 py-3 md:px-6 md:py-6"
                              initial={false}
                              animate={{ opacity: 1 }}
                              exit={{
                                  opacity: [1, 1],
                                  transition: {
                                      duration: STAGE_EXIT_HOLD_MS / 1000,
                                      ease: "linear",
                                  },
                              }}
                          >
                              <motion.div
                                  key="bc-sheet"
                                  ref={sheetRef}
                                  tabIndex={-1}
                                  initial={recipeMotion.sheetInitial}
                                  animate={recipeMotion.sheetAnimate}
                                  transition={recipeMotion.sheetTransition}
                                  exit={recipeMotion.sheetExit}
                                  style={{
                                      maxWidth: `min(100%, ${mw}px)`,
                                      maxHeight: `min(${mhVh}dvh, ${mhCap}px)`,
                                  }}
                                  className="pointer-events-auto relative flex min-h-0 w-full max-w-full flex-col overflow-hidden rounded-[40px] border border-white/10 bg-[rgba(29,29,29,0.7)] backdrop-blur-[54.45px] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
                                  onClick={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  role="dialog"
                                  aria-modal="true"
                                  aria-labelledby="butter-chicken-modal-title"
                              >
                                  <div className="scrollbar-hide relative z-0 min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                                      <ButterChickenRecipeBody />
                                  </div>
                              </motion.div>
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
