# Domis Case Study — Live UI Embed Design

**Date:** 2026-07-17  
**Branch:** `cursor/domis-case-study-redesign-c2d5`  
**Status:** Approved

## Goal

Replace the `dcs-replace-tag` media blocks on the Domis case study with pixel-accurate, front-end-only recreations of real Domis UI (web + mobile), autoplaying on loop with a large animated cursor. No backends, no pushes to `getdomis/*`.

## Decisions

| Decision | Choice |
|----------|--------|
| Architecture | Isolated React modules in `src/components/domis/live/` |
| Mobile | Screen-by-screen React recreation from Flutter (not a cleaned token system; org/DS is messy) |
| Web | Port Create Home / profile UI from `Design-Prototype-Lab/web-app-settings` into React |
| Interaction | Autoplay loops + large cursor showing user input; pause offscreen; reduced-motion → end state |
| Scope | Only what page notes ask for |
| Data | Hardcoded fixtures only; zero network |

## Source of truth

- **Page notes:** `src/components/domis/DomisCaseStudyBody.tsx` (`dcs-replace-tag` / placeholders)
- **Web UI:** `vendor/Design-Prototype-Lab/web-app-settings` (Lab clone; not the older zip)
- **Mobile UI:** `vendor/mobile-app` after locally merging design zips:
  - `mobile-app-design-fab-create-menu`
  - `mobile-app-design-task-card-visuals`
  - `mobile-app-design-tasks-edge-fade`
- **Never push** to `getdomis/mobile-app` or `getdomis/Design-Prototype-Lab`

## Pixel fidelity method

1. Recreate **one screen at a time** from the Flutter widget tree / web `App.tsx` panel for that surface.
2. Match colors, type, spacing, radii, and shadows as that screen actually renders — do not abstract a “Domis DS” from scattered mobile tokens first.
3. Build at fixed design size (phone 390×844 ScreenUtil base; web create-home at prototype panel width), scale with CSS transform inside frames.
4. Side-by-side visual check against source before marking a slot done.

## Component map (notes → modules)

| Page note | Module | Behavior |
|-----------|--------|----------|
| Home profile creation from web… simulated… animated cursor | `WebCreateHomeDemo` | Loop: cursor → type address → confirm → mock enrich → fields fill |
| Redo consensus chips in Domis design system | `ConsensusRunsPanel` | Same Run 1/2/3 → Shown story; restyle to web Domis visuals |
| Real home profile conversion | `HomeAvatarConversion` | Map thumb → real profile/avatar treatment from web Homes UI |
| Capture left, updated fields right | `ApplianceCaptureDemo` | Loop: cursor → shutter → scan → form fields fill |
| Update v1/v2 panes with Domis styling | `ApplianceV1V2Compare` | Keep structure; restyle to real item UI |
| Inspection left, task cards right | `InspectionToTasksDemo` | Loop: cursor → PDF → real TaskCard recreations appear |

**Shared:** `PhoneFrame`, `BrowserFrame`, `DemoCursor`, `useAutoplayDemo` (viewport pause, reduced-motion, loop).

**Out of scope** unless a note appears: hero composition, full tab shell / FAB playground as standalone embeds, Gemini screenshot placeholder, cobweb illustration placeholder.

## Data flow

- Fixtures in `src/components/domis/live/fixtures/*.ts`
- No `fetch`, auth, Firebase, Maps, or Gemini
- Web enrich: timer + fixture profile (Fillmore / existing page numbers)
- Capture: bundled plate/demo image + Rheem field fixtures matching page copy
- Inspection tasks: three cards matching current copy, styled as real task cards

## Motion / cursor

- Large cursor drives all “user” input
- Play → hold on result → reset → loop
- `IntersectionObserver`: pause when offscreen
- Hover/focus may pause for inspection
- `prefers-reduced-motion`: static end state, no cursor choreography

## Error handling

- Fixtures always succeed
- Missing asset → labeled placeholder inside frame
- Demo JS failure → static end-state composition
- Never block case-study scroll

## Constraints

- Live CSS scoped under `.domis-live` (light product UI must not inherit portfolio dark text rules incorrectly — existing `domis-case-study.css` already isolates mock UI)
- Nested radii match parent frames
- Portfolio stack: Next.js 16, React 19, GSAP, Framer Motion, Tailwind 4
- Vendor Domis repos stay local reference only

## Definition of done

- [ ] Every listed `dcs-replace-tag` replaced
- [ ] Pixel-matched to source screens
- [ ] Autoplay loops + large cursor
- [ ] Pause offscreen; reduced-motion OK
- [ ] Zero network from live modules
- [ ] No upstream pushes to getdomis
- [ ] Verified 375 / 768 / 1440
