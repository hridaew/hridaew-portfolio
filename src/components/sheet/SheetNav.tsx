"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import {
  getSheetRoute,
  isSheetHref,
  sheetKeyFromSegments,
} from "@/lib/case-study-sheets";
import { loadSheetBody, prefetchSheetBody } from "@/components/sheet/sheet-bodies";
import {
  isHomeSplitLayout,
  subscribeHomeLayoutMode,
} from "@/lib/home-layout";
import { useCaseStudyAchievement } from "@/hooks/useCaseStudyAchievement";

interface SheetNavValue {
  /** Currently displayed sheet key (optimistic — set before the route resolves). */
  activeKey: string | null;
  openSheet: (href: string) => boolean;
  replaceSheet: (href: string) => boolean;
  prefetchSheet: (href: string) => void;
  clearActiveKey: () => void;
}

const SheetNavContext = createContext<SheetNavValue>({
  activeKey: null,
  openSheet: () => false,
  replaceSheet: () => false,
  prefetchSheet: () => {},
  clearActiveKey: () => {},
});

export function useSheetNav() {
  return useContext(SheetNavContext);
}

function hrefToKey(href: string): string | null {
  if (!isSheetHref(href)) return null;
  return href.replace(/^\//, "");
}

export function SheetNavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSelectedLayoutSegments("sheet");
  const routeKey = sheetKeyFromSegments(segments);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  useCaseStudyAchievement(activeKey);
  // After a close we clear local state before the URL catches up — ignore the
  // stale intercept segment so the sheet doesn't bounce back open.
  const skipRouteSync = useRef(false);

  useEffect(() => {
    if (skipRouteSync.current) {
      if (!routeKey) skipRouteSync.current = false;
      return;
    }
    // Sheets only exist in twin-pane; ignore intercept segments in stack.
    if (!isHomeSplitLayout()) return;
    if (!routeKey || !getSheetRoute(routeKey)) return;
    // Async so this isn't a sync setState-in-effect (React Compiler).
    const id = window.setTimeout(() => {
      setActiveKey((prev) => (prev === routeKey ? prev : routeKey));
      void loadSheetBody(routeKey);
    }, 0);
    return () => window.clearTimeout(id);
  }, [routeKey]);

  const prefetchSheet = useCallback(
    (href: string) => {
      const key = hrefToKey(href);
      if (!key) return;
      // Full-page stack: warm the route only. Split: also warm sheet body.
      router.prefetch(href);
      if (isHomeSplitLayout()) prefetchSheetBody(key);
    },
    [router]
  );

  const openSheet = useCallback(
    (href: string) => {
      if (!isHomeSplitLayout()) return false;
      const key = hrefToKey(href);
      if (!key || !getSheetRoute(key)) return false;
      skipRouteSync.current = false;
      setActiveKey(key);
      void loadSheetBody(key);
      router.push(href, { scroll: false });
      return true;
    },
    [router]
  );

  // Split → stack while a sheet is open: drop chrome, then hard-nav so the
  // real case-study page mounts in `children` (intercept soft-nav would stick).
  useEffect(() => {
    return subscribeHomeLayoutMode((mode) => {
      if (mode !== "stack") return;
      setActiveKey((prev) => {
        if (!prev) return prev;
        skipRouteSync.current = true;
        const href = `/${prev}`;
        window.setTimeout(() => {
          window.location.replace(href);
        }, 0);
        return null;
      });
    });
  }, []);

  const replaceSheet = useCallback(
    (href: string) => {
      if (!isHomeSplitLayout()) return false;
      const key = hrefToKey(href);
      if (!key || !getSheetRoute(key)) return false;
      skipRouteSync.current = false;
      setActiveKey(key);
      void loadSheetBody(key);
      router.replace(href, { scroll: false });
      return true;
    },
    [router]
  );

  const clearActiveKey = useCallback(() => {
    skipRouteSync.current = true;
    setActiveKey(null);
  }, []);

  const value = useMemo(
    () => ({
      activeKey,
      openSheet,
      replaceSheet,
      prefetchSheet,
      clearActiveKey,
    }),
    [activeKey, openSheet, replaceSheet, prefetchSheet, clearActiveKey]
  );

  return (
    <SheetNavContext.Provider value={value}>{children}</SheetNavContext.Provider>
  );
}
