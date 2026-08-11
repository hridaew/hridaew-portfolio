import { homepageProjects } from "@/data/homepage-projects";
import { homepageWafflings } from "@/data/homepage-wafflings";

export type SheetKind = "case-study" | "waffling";

export interface SheetRoute {
  /** Path without leading slash — `domis`, `waffling/savor`, `butter-chicken`. */
  key: string;
  href: string;
  label: string;
  title: string;
  meta: string;
  kind: SheetKind;
}

/** Homepage titles are full sentences; the sheet chrome needs a short name. */
const CASE_STUDY_LABEL: Record<string, string> = {
  domis: "Domis",
  virdio: "Virdio",
  obscura: "Obscura",
  "memory-care": "Memory Care",
};

const CASE_STUDY_ORDER = ["domis", "virdio", "obscura", "memory-care"] as const;

export const CASE_STUDY_SHEETS: SheetRoute[] = CASE_STUDY_ORDER.map((slug) => {
  const project = homepageProjects.find((p) => p.slug === slug);
  return {
    key: slug,
    href: `/${slug}`,
    label: CASE_STUDY_LABEL[slug] ?? slug,
    title: project?.title ?? CASE_STUDY_LABEL[slug] ?? slug,
    meta: project?.contextTags?.join(" · ") ?? "",
    kind: "case-study" as const,
  };
});

/** Live wafflings from the home rail, in the same order they appear there. */
const WAFFLING_SHEETS: SheetRoute[] = homepageWafflings
  .filter((w) => w.href && !w.isPlaceholder && w.opacity === 1)
  .map((w) => {
    const href = w.href!;
    const key = href.replace(/^\//, "");
    return {
      key,
      href,
      label: w.title,
      title: w.title,
      meta: "Waffling",
      kind: "waffling" as const,
    };
  });

/** All routes that open in the side sheet (case studies + wafflings). */
export const SHEET_ROUTES: SheetRoute[] = [
  ...CASE_STUDY_SHEETS,
  ...WAFFLING_SHEETS,
];

export function getSheetRoute(key: string): SheetRoute | undefined {
  return SHEET_ROUTES.find((route) => route.key === key);
}

/** Cycle within the same kind so next from Domis stays in case studies, etc. */
export function getNextSheetRoute(key: string): SheetRoute | undefined {
  const current = getSheetRoute(key);
  if (!current) return undefined;
  const pool = SHEET_ROUTES.filter((route) => route.kind === current.kind);
  const index = pool.findIndex((route) => route.key === key);
  if (index < 0 || pool.length === 0) return undefined;
  return pool[(index + 1) % pool.length];
}

export function isSheetHref(href: string): boolean {
  return SHEET_ROUTES.some((route) => route.href === href);
}

/** Join parallel-route segments into a sheet key (`waffling` + `savor` → `waffling/savor`). */
export function sheetKeyFromSegments(segments: string[]): string | null {
  const cleaned = segments
    .filter((s) => s && s !== "__DEFAULT__")
    // Drop route-group markers Next sometimes surfaces (`(slot)`, `(.)`, etc.).
    .filter((s) => !/^\([^)]+\)$/.test(s))
    .map((s) => s.replace(/^\(\.+\)/, ""))
    .filter(Boolean);
  if (cleaned.length === 0) return null;
  return cleaned.join("/");
}
