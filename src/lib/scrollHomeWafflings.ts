/**
 * DOM id on home `WafflingsSection` — scroll target for butter-chicken deep links.
 * Keep in sync with the section root `id` attribute.
 */
export const HOME_WAFFLINGS_SECTION_ID = "wafflings";

/** sessionStorage key set on home when opening a waffling, read on home re-mount to
 * restore the exact scroll position the user left from (so close → home doesn't
 * snap to top or to the wafflings rail). One-shot — consumed and cleared on read. */
export const WAFFLING_RETURN_Y_KEY = "wafflingReturnY";

/** Call from a waffling-card click handler to remember where the user was on home. */
export function rememberHomeScrollForWafflingReturn(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(WAFFLING_RETURN_Y_KEY, String(window.scrollY));
  } catch {
    // sessionStorage may be unavailable in privacy modes; navigation still works.
  }
}

/** Reads and consumes the saved Y. Returns the number, or `null` if absent/invalid. */
export function consumeWafflingReturnScroll(): number | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(WAFFLING_RETURN_Y_KEY);
    if (raw !== null) sessionStorage.removeItem(WAFFLING_RETURN_Y_KEY);
  } catch {
    return null;
  }
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

type LenisScroll = {
  scrollTo: (
    target: HTMLElement | number,
    opts: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

function getLenis(): LenisScroll | undefined {
  return (window as unknown as { __lenis?: LenisScroll }).__lenis;
}

/** Instant jump to document top; pairs `window` scroll with Lenis when present. */
export function scrollHomeToTopImmediate(): void {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  getLenis()?.scrollTo(0, { immediate: true });
}

export function getHomeWafflingsSection(): HTMLElement | null {
  return document.getElementById(HOME_WAFFLINGS_SECTION_ID);
}

/** Returns true if an element was found and a scroll was requested. */
export function scrollHomeWafflingsIntoView(options: { immediate?: boolean } = {}): boolean {
  const el = getHomeWafflingsSection();
  if (!el) return false;
  const immediate = options.immediate !== false;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, immediate ? { offset: -80, immediate: true } : { offset: -80, duration: 0.65 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo(0, Math.max(0, top));
  }
  return true;
}

/**
 * Scrolls to `#wafflings` once it exists (home section may load after layout), then runs `then`.
 * Always invokes `then` so the recipe modal can still open if the section is missing (non-home paths).
 */
export function scrollHomeWafflingsForDeepLinkThen(then: () => void): void {
  const tick = () => {
    if (scrollHomeWafflingsIntoView()) {
      requestAnimationFrame(then);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      if (scrollHomeWafflingsIntoView()) {
        clearInterval(id);
        requestAnimationFrame(then);
      } else if (n >= 90) {
        clearInterval(id);
        then();
      }
    }, 40);
  };
  requestAnimationFrame(tick);
}
