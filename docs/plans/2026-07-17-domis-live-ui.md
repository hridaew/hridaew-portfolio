# Domis Live UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Domis case study `dcs-replace-tag` blocks with pixel-accurate, autoplaying, cursor-driven recreations of real Domis web + mobile UI (fixtures only).

**Architecture:** Isolated React modules under `src/components/domis/live/`, screen-by-screen ports from Flutter (merged design branches) and Lab web create-home. Wired into `DomisCaseStudyBody.tsx` only where notes ask. Zero network; never push to getdomis.

**Tech Stack:** Next.js 16, React 19, GSAP / Framer Motion, Tailwind 4, existing `domis-case-study.css` + scoped `.domis-live` styles.

**Design doc:** `docs/plans/2026-07-17-domis-live-ui-design.md`

**Reference sources (local only):**
- `../vendor/Design-Prototype-Lab/web-app-settings`
- `../vendor/mobile-app` (+ design zips to merge)

---

### Task 1: Local vendor setup (mobile merge + gitignore)

**Files:**
- Modify: workspace / portfolio `.gitignore` to ignore `vendor/` if needed
- Local only: merge design branch files into `vendor/mobile-app`

**Step 1: Confirm vendor clones exist**

```bash
ls "/Users/hridaewalia/Portfolio Domis/vendor/Design-Prototype-Lab/web-app-settings/src/app/App.tsx"
ls "/Users/hridaewalia/Portfolio Domis/vendor/mobile-app/lib/main.dart"
```

Expected: both paths exist.

**Step 2: Merge design zips into mobile-app (disjoint files)**

Copy in order (any order OK; no overlaps):

```bash
VENDOR="/Users/hridaewalia/Portfolio Domis/vendor"
# edge fade
cp "$VENDOR/mobile-app-design-tasks-edge-fade/lib/views/components/brand_bottom_gradient.dart" \
  "$VENDOR/mobile-app/lib/views/components/"
cp "$VENDOR/mobile-app-design-tasks-edge-fade/lib/views/pages/app_widget_tree.dart" \
  "$VENDOR/mobile-app/lib/views/pages/"
cp "$VENDOR/mobile-app-design-tasks-edge-fade/lib/views/components/brand_page_overview.dart" \
  "$VENDOR/mobile-app/lib/views/components/"
cp "$VENDOR/mobile-app-design-tasks-edge-fade/lib/views/pages/home/home_page.dart" \
  "$VENDOR/mobile-app/lib/views/pages/home/"
cp "$VENDOR/mobile-app-design-tasks-edge-fade/lib/views/pages/home/widgets/home_header.dart" \
  "$VENDOR/mobile-app/lib/views/pages/home/widgets/"
# task cards
cp "$VENDOR/mobile-app-design-task-card-visuals/lib/custom_widgets/cards/task_card.dart" \
  "$VENDOR/mobile-app/lib/custom_widgets/cards/"
cp "$VENDOR/mobile-app-design-task-card-visuals/lib/custom_widgets/cards/custom_card.dart" \
  "$VENDOR/mobile-app/lib/custom_widgets/cards/"
cp "$VENDOR/mobile-app-design-task-card-visuals/lib/utility/app_constants/app_shadows.dart" \
  "$VENDOR/mobile-app/lib/utility/app_constants/"
# FAB
cp "$VENDOR/mobile-app-design-fab-create-menu/lib/views/components/floating_button.dart" \
  "$VENDOR/mobile-app/lib/views/components/"
```

Verify with `diff` that copies landed. **Do not `git push` from `vendor/mobile-app`.**

**Step 3: Ensure vendor is not committed to portfolio**

Add to `hridaew-portfolio/.gitignore` if not present:

```
# Local Domis reference checkouts (never ship)
/vendor/
```

Note: vendor currently lives at workspace sibling `Portfolio Domis/vendor/`, outside the portfolio git root — confirm with `git status` that it is not tracked.

**Step 4: Commit**

```bash
cd "/Users/hridaewalia/Portfolio Domis/hridaew-portfolio"
git add .gitignore docs/plans/2026-07-17-domis-live-ui-design.md docs/plans/2026-07-17-domis-live-ui.md
git commit -m "$(cat <<'EOF'
docs: add Domis live UI design and implementation plan

EOF
)"
```

---

### Task 2: Live UI scaffolding (frames, cursor, autoplay hook)

**Files:**
- Create: `src/components/domis/live/PhoneFrame.tsx`
- Create: `src/components/domis/live/BrowserFrame.tsx`
- Create: `src/components/domis/live/DemoCursor.tsx`
- Create: `src/components/domis/live/useAutoplayDemo.ts`
- Create: `src/components/domis/live/domis-live.css`
- Create: `src/components/domis/live/index.ts`

**Step 1: Add scoped CSS shell**

Create `domis-live.css` with `.domis-live` root isolating light product UI (fonts loaded for Domis screens only — Material Symbols / Outfit for web ports; match per-screen type from Flutter when porting mobile). Include cursor z-index and frame overflow rules.

**Step 2: Implement `PhoneFrame` / `BrowserFrame`**

- Phone: fixed 390×844 design canvas, scale to fit container width via `transform: scale(...)`, `transform-origin: top center`.
- Browser: simple window chrome + content area sized for create-home panel.
- Both accept `children`, `className`, `aria-label`.

**Step 3: Implement `DemoCursor`**

Large pointer (reuse path from `DomisCaseStudyBody` `#dcs-ptr` or larger variant). Position via absolute % or px inside a relative demo stage. GSAP-friendly `ref` for x/y.

**Step 4: Implement `useAutoplayDemo`**

API sketch:

```ts
type DemoPhase = string;

function useAutoplayDemo(options: {
  phases: { id: DemoPhase; durationMs: number }[];
  enabled?: boolean;
}): {
  phase: DemoPhase;
  progress: number; // 0–1 within phase
  paused: boolean;
  containerRef: RefObject<HTMLElement | null>;
  replay: () => void;
}
```

Behavior:
- Loop phases; hold last before reset
- IntersectionObserver pause when < ~20% visible
- `prefers-reduced-motion`: jump to final phase, no ticker
- Optional pause on hover

**Step 5: Export from `index.ts`**

**Step 6: Manual smoke** — temporarily mount frames on Domis page or a throwaway; remove before commit if throwaway.

**Step 7: Commit**

```bash
git add src/components/domis/live
git commit -m "$(cat <<'EOF'
feat(domis): add live UI frames, cursor, and autoplay hook

EOF
)"
```

---

### Task 3: Fixtures + assets

**Files:**
- Create: `src/components/domis/live/fixtures/addressProfile.ts`
- Create: `src/components/domis/live/fixtures/applianceCapture.ts`
- Create: `src/components/domis/live/fixtures/inspectionTasks.ts`
- Add assets under `public/assets/domis/live/` as needed (plate image, avatar, profile photo — copy from Lab imports or existing public assets; verify paths exist)

**Step 1: Address fixture** — match page copy (2140 Fillmore St, 1974, 2 bath, 1840 sq ft, single family).

**Step 2: Appliance fixture** — Rheem water heater fields from page.

**Step 3: Task fixtures** — three cards: High priority roof flashing, Monitor water heater, Dismissed kitchen GFCI.

**Step 4: Commit fixtures + assets**

```bash
git add src/components/domis/live/fixtures public/assets/domis/live
git commit -m "$(cat <<'EOF'
feat(domis): add live UI demo fixtures and assets

EOF
)"
```

---

### Task 4: `WebCreateHomeDemo` (address intelligence note)

**Files:**
- Create: `src/components/domis/live/WebCreateHomeDemo.tsx`
- Create: `src/components/domis/live/web/CreateHomePanel.tsx` (ported/simplified from Lab `CreateHomeProfilePanel`)
- Modify: `src/components/domis/DomisCaseStudyBody.tsx` (~lines 365–520) — replace replace-tag block with demo
- Reference: `vendor/Design-Prototype-Lab/web-app-settings/src/app/App.tsx` (`CreateHomeProfilePanel`)

**Step 1: Port create-home panel UI pixel-close** — address field, confirm, enriching state, filled profile rows. Stub enrich with fixture + delay (~1.2s). No Google/Gemini.

**Step 2: Wire autoplay + large cursor** — type address char-by-char, click confirm, watch fields fill, hold, reset, loop.

**Step 3: Swap into case study** — remove `dcs-replace-tag` and the temporary `dcs-io` mock OR keep pipeline labels only if they still serve the story; prefer real UI as the media as the note asks (“centered on a web screen like an onboarding screen”).

**Step 4: Visual check vs Lab create-home at 1440 and 375.**

**Step 5: Commit**

```bash
git add src/components/domis/live src/components/domis/DomisCaseStudyBody.tsx
git commit -m "$(cat <<'EOF'
feat(domis): add autoplaying web create-home demo

EOF
)"
```

---

### Task 5: `ConsensusRunsPanel` + `HomeAvatarConversion`

**Files:**
- Create: `src/components/domis/live/ConsensusRunsPanel.tsx`
- Create: `src/components/domis/live/HomeAvatarConversion.tsx`
- Modify: `DomisCaseStudyBody.tsx` (~527–560 and ~582+)

**Step 1: Restyle consensus runs** using web Domis chip/card look from Lab (not abstract tokens). Keep Run 1/2/3 → Shown logic and copy. Light cursor optional.

**Step 2: Home profile conversion** — left map thumb (existing asset OK), right real home profile card/avatar from Lab Homes UI. Match note: “real home profile conversion.”

**Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(domis): restyle consensus and home profile conversion demos

EOF
)"
```

---

### Task 6: `ApplianceCaptureDemo` (capture + fields note)

**Files:**
- Create: `src/components/domis/live/ApplianceCaptureDemo.tsx`
- Create: `src/components/domis/live/mobile/ItemScannerScreen.tsx`
- Create: `src/components/domis/live/mobile/ItemFieldsPanel.tsx`
- Modify: `DomisCaseStudyBody.tsx` (~698–765)
- Reference Flutter (merged):  
  `lib/views/components/item_scanner/in_app_item_scanner.dart`  
  `lib/views/components/item_creation/item_creation_form.dart`

**Step 1: Recreate scanner screen pixel-close** (viewfinder, shutter, chrome) — screen-by-screen from Dart, not from generic tokens.

**Step 2: Recreate fields panel** matching filled item form look.

**Step 3: Autoplay loop** — cursor → shutter → brief scanning → fields populate → hold → reset.

**Step 4: Swap into replace-tag slot; keep figcaption.**

**Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(domis): add autoplaying appliance capture demo

EOF
)"
```

---

### Task 7: `ApplianceV1V2Compare` (Domis styling note)

**Files:**
- Create: `src/components/domis/live/ApplianceV1V2Compare.tsx`
- Modify: `DomisCaseStudyBody.tsx` (~789+)

**Step 1: Keep v1 vs v2 content structure** from the page.

**Step 2: Restyle panes/rows to match real Domis item detail / form chrome** from the mobile port visuals used in Task 6.

**Step 3: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(domis): restyle appliance v1/v2 compare with Domis UI

EOF
)"
```

---

### Task 8: `InspectionToTasksDemo` (task cards note)

**Files:**
- Create: `src/components/domis/live/InspectionToTasksDemo.tsx`
- Create: `src/components/domis/live/mobile/TaskCard.tsx` — recreate from merged `task_card.dart` + `custom_card.dart` + shadows
- Modify: `DomisCaseStudyBody.tsx` (~1045–1152)

**Step 1: Pixel-port TaskCard** from design-task-card-visuals Flutter (chips, thumb size, shadows, type).

**Step 2: Keep inspection.pdf left affordance; right side = three TaskCards** with fixture copy from page.

**Step 3: Autoplay** — cursor engages PDF → cards appear / highlight → hold → loop.

**Step 4: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(domis): add inspection-to-task-cards live demo

EOF
)"
```

---

### Task 9: Integration polish + verification

**Files:**
- Modify: `DomisCaseStudyBody.tsx` (remove leftover replace-tags, ensure imports)
- Possibly: `domis-case-study.css` (avoid double borders / radius gaps)

**Step 1: Grep for remaining replace tags**

```bash
rg "dcs-replace-tag" src/components/domis/DomisCaseStudyBody.tsx
```

Expected: no matches for the six scoped notes (hero/Gemini placeholders may remain).

**Step 2: Network check** — run `npm run dev`, open `/domis`, confirm live modules issue no XHR/fetch while demos run.

**Step 3: Reduced motion** — emulate in DevTools; demos show end state.

**Step 4: Viewports** — 375, 768, 1440; frames scale; cursor readable.

**Step 5: Lint**

```bash
npm run lint:eslint
npm run lint:typography
```

**Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
fix(domis): polish live UI embeds and remove replace tags

EOF
)"
```

---

### Task 10: Final definition-of-done checklist

- [ ] Notes in DomisCaseStudyBody for the six slots satisfied
- [ ] Screen-by-screen fidelity (not token-first mobile DS)
- [ ] Autoplay + large cursor on demos that show user input
- [ ] Offscreen pause + reduced-motion
- [ ] Zero network from live modules
- [ ] No push to getdomis
- [ ] Design + plan docs present under `docs/plans/`

Do **not** bump build number or push until user asks.

---

## Execution notes

- Prefer GSAP timelines for cursor paths (portfolio already uses GSAP); keep phase durations under control so a full loop feels ~12–20s.
- YAGNI: no full settings shell, no Flutter web, no real camera.
- If a Flutter screen is too entangled, still recreate the **visible pixels** of that screen only — do not port Riverpod/services.
