# Property Grid Interactive — Design

**Goal:** Show how Domis home icons make many properties easy to tell apart.

**Placement:** Separate figure directly below `HomeAvatarConversion` in the Address Intelligence section.

**Interaction:** Autoplay loop (scroll into view, pause on hover), same pattern as other Domis live demos.

**Story beat:**
1. Solo Fillmore Home card (large, centered) — white card, icon + name
2. Card shrinks toward center of a 3×3
3. Eight surrounding cards fade/scale in with a light stagger
4. Hold on full grid
5. Reset and loop

**Cards:** Icon + name only (no address). Fillmore stays center. Eight new homes with distinct clay-style 3D icons (transparent PNGs) and short names.

**Tech:** `useAutoplayDemo` phases, CSS grid morph, fixture for homes + assets under `public/assets/domis/live/homes/`.
