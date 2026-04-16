/**
 * DOM id on home `WafflingsSection` — scroll target for butter-chicken deep links.
 * Keep in sync with the section root `id` attribute.
 */
export const HOME_WAFFLINGS_SECTION_ID = "wafflings";

type LenisScroll = {
  scrollTo: (
    target: HTMLElement | number,
    opts: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

function getLenis(): LenisScroll | undefined {
  return (window as unknown as { __lenis?: LenisScroll }).__lenis;
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
