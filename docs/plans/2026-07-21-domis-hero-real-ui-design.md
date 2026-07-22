# Domis Hero + Known Real UI Design

**Date:** 2026-07-21  
**Status:** Approved

## Goal

Replace cooked hero/known UI with tweakable React ports of real Domis surfaces; interactive create FAB on tasks; Mondrian inset in red media frame.

## Decisions

| Decision | Choice |
|----------|--------|
| Delivery | Hybrid C — React ports (tweakable) + generated inspection thumbs |
| Hero web | `CreateHomePanel` address-intelligence end state |
| Hero phone 1 | Home overview / profile (`HomeOverviewScreen`) |
| Hero phone 2 | Flutter `HomePage` (home tab) + interactive create FAB |
| Known | Same overview screen; keep appliance; new task thumbs; light bezels |
| Mondrian | Inset in rounded red `dcs-media` (fit + padding), sharp art unchanged |

## Components

- `HomeOverviewScreen` — Flutter HomeOverview port (avatar, address, stats, gallery)
- `CreateFabMenu` — FAB + dim + Add Pro / Space / Item / Task
- Wire into `HeroProductShot`, `HomePageScreen`, `DomisKnownCarousel`
