"use client";

import Link from "next/link";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { usePageTransition } from "@/components/PageTransition";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { playClick } from "@/lib/audio";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
  /** Return false to swallow the click (e.g. it was really a drag). */
  shouldNavigate?: () => boolean;
};

/**
 * Same navigation contract as the live home: case studies open in the side
 * sheet on desktop split widths and hard-navigate on smaller screens.
 */
export const ProjectLink = forwardRef<HTMLAnchorElement, Props>(
  function ProjectLink(
    { href, children, shouldNavigate, onClick, onPointerEnter, onFocus, ...rest },
    ref,
  ) {
    const { transitionTo } = usePageTransition();
    const { prefetchSheet } = useSheetNav();

    return (
      <Link
        ref={ref}
        href={href}
        scroll={false}
        onPointerEnter={(e) => {
          prefetchSheet(href);
          onPointerEnter?.(e);
        }}
        onFocus={(e) => {
          prefetchSheet(href);
          onFocus?.(e);
        }}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          // Let modified clicks (new tab, etc.) behave natively.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          if (shouldNavigate && !shouldNavigate()) return;
          playClick();
          transitionTo(href);
        }}
        {...rest}
      >
        {children}
      </Link>
    );
  },
);
