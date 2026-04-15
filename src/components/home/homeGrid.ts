/**
 * Swiss grid for the home page: 800px max column, 104px side gutters → 592px text measure.
 * Project galleries break out of the padded box by −104px so cards start flush with the column edge.
 */
export const HOME_COLUMN =
  "mx-auto w-full min-w-0 max-w-[800px] px-4 md:px-[104px]" as const;

/** Same shell as home — editorial column for case studies, about, etc. */
export const SITE_COLUMN = HOME_COLUMN;

/**
 * Embla viewport: full breakout track. Overflow visible so slides stay visible while dragging.
 * Page-level `overflow-x-clip` (home `page.tsx`) clips only past the viewport—no crop at the column.
 */
export const HOME_PROJECT_EMBLA_VIEWPORT =
  "scrollbar-hide relative isolate z-0 -ml-4 -mr-4 w-[calc(100%+2rem)] touch-pan-x overflow-visible overscroll-x-contain md:-ml-[104px] md:-mr-[104px] md:w-[calc(100%+208px)]" as const;

/** Wafflings: Embla viewport like work galleries but no −104px breakout — cards line up with body text. */
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
