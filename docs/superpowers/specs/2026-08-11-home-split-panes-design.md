# Home split panes — design

**Date:** 2026-08-11  
**Status:** Approved for experiment (desktop)  
**Branch context:** cream-light / home experiments  

## Goal

Present the home page as two side-by-side columns with **independent vertical scrolling**: intro on the left, projects on the right.

## Approach

**A — Twin viewport panes (native overflow)**  
Full-viewport two-column shell. Each column is its own `overflow-y: auto` scroller. Document / Lenis scroll is locked while this layout is active.

## Layout

| Pane | Contents (top → bottom) |
|------|-------------------------|
| **Left** | HeroCard → Bio → Toolkit → footer (`Hridae Walia - {year} - {version}`) |
| **Right** | Selected Work → Wafflings (if enabled) |

- Split ratio: ~42% / 58% (left / right), slightly favoring projects. Tunable.
- Shared background: existing cream paper + dot mesh behind both panes (one surface, not two cards).
- Gutters: reuse / adapt `HOME_COLUMN` padding per pane so type spines stay intentional; avoid a hard vertical rule unless needed for separation.

## Scroll & chrome

- Shell height: `100svh` / `100dvh`; page body does not scroll.
- Disable Lenis (and document overflow) on home for this experiment so wheel events only move the hovered pane.
- Case-study / waffling sheet soft-nav unchanged; sheet overlays the split shell.
- HeroCard expand: lock left-pane scroll (document already locked).

## Responsive (implemented)

- **≥ 1024px:** twin-pane split; soft-nav side sheets; fluid work-card stage scale + `--home-gutter`.
- **< 1024px:** single-column document stack; full-page navigation (no sheets).
- Mode swap: ~200ms opacity crossfade (`AnimatePresence mode="wait"`); hysteresis ±8px.

## Verification

- [ ] Left and right scroll independently (pointer over each pane).
- [ ] Portaled HeroCard positions correctly inside the left scroller; expand still works.
- [ ] Work carousels (Embla / horizontal) do not fight vertical pane scroll.
- [ ] Sheet opens above the split; footer reads correctly in the left pane.
- [ ] Toolkit remains on the left; wafflings on the right.

## Non-goals

- Dual Lenis instances
- Sticky-left / document-scroll-right hybrid
- Restyling project cards for the narrower right column beyond necessary overflow fixes
