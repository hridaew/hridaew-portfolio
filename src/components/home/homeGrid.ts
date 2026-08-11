/**
 * Swiss grid for the home page: 800px shell / 592px text measure.
 * Side gutters are fluid via `--home-gutter` (see globals.css + data-home-layout);
 * column max-width tracks gutter so content stays ≤592px.
 * Tailwind px-* remains a no-JS / SSR fallback.
 */
export const HOME_COLUMN =
  "home-column mx-auto w-full min-w-0 max-w-[800px] px-4 md:px-[104px]" as const;

/** Same shell as home — editorial column for case studies, about, etc. */
export const SITE_COLUMN = HOME_COLUMN;

/**
 * Embla viewport: full breakout track. Overflow visible so slides stay visible while dragging.
 * Breakout distance follows `--home-gutter` under `data-home-layout`.
 */
export const HOME_PROJECT_EMBLA_VIEWPORT =
  "home-project-embla scrollbar-hide relative isolate z-0 -ml-4 -mr-4 w-[calc(100%+2rem)] touch-pan-x overflow-visible overscroll-x-contain md:-ml-[104px] md:-mr-[104px] md:w-[calc(100%+208px)]" as const;

/** Wafflings: Embla viewport like work galleries but no gutter breakout — cards line up with body text. */
export const HOME_WAFFLINGS_EMBLA_VIEWPORT =
  "scrollbar-hide relative isolate z-0 w-full min-w-0 touch-pan-x overflow-visible overscroll-x-contain" as const;

/** Card captions: modest inset under each image (16px). */
export const HOME_CARD_CAPTION_PAD = "pl-4" as const;

/**
 * Hero glass card: 32px bleed past the text column on each side (592 + 64 = 656).
 * Inner `p-8` keeps copy on the same spine as Bio / Toolkit (card starts 32px left of that line).
 */
export const HOME_HERO_BLEED =
  "relative w-full md:-mx-8 md:w-[calc(100%+4rem)] md:max-w-[656px]" as const;

/** Design size of desktop work gallery cards (stage pattern scales from this). */
export const HOME_WORK_CARD_W = 696;
export const HOME_WORK_CARD_H = 392;
