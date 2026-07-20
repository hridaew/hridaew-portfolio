# Hero Face Badge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the round hero bio avatar with a face-shaped metallic chrome pin (full-head cutout) that tilts with the pointer and dissolves/respawns on click using the existing burst path.

**Architecture:** Pre-process a transparent full-head WebP, then render a small layered `HeroFaceBadge` (shadow → chrome shell → face → specular) inside `HeroSignatureMark`. Wire click to existing `replayHeroAvatarAnimation`; pointer tilt via refs + rAF.

**Tech Stack:** Next.js Image, Framer Motion (burst/spring already in HeroCard), Tailwind, CSS `mask-image` / layered gradients for chrome, transparent WebP asset.

**Design doc:** `docs/plans/2026-07-19-hero-face-badge-design.md`

---

### Task 1: Pixel-perfect face cutout asset

**Files:**
- Create: `hridaew-portfolio/public/assets/home/hero-face-badge.webp`
- Optional master: `hridaew-portfolio/public/assets/home/hero-face-badge.png`
- Source (local only, do not commit): `/Users/hridaewalia/Downloads/IMG_0859 2.JPG`

**Step 1: Generate initial cutout**

Use the best available local tool (e.g. `rembg` / similar) on the source JPG to produce a transparent PNG of the full head (hair + face + jaw). Crop tightly to the opaque bounds with a few pixels of padding.

**Step 2: Hand-refine for pixel perfection**

Inspect at 100% and at ~48px preview size. Fix:

- Leftover red/yellow background
- Color halo / fringe on hair and jaw
- Soft/jagged hair matte (refine edge; prefer slightly harder clean edge over fuzzy green-screen look at small size)

If automated tools cannot reach quality, refine in an image editor and re-export. **Do not ship a soft/haloed matte.**

**Step 3: Export**

- Height ~144–192px (retina for ~48px display)
- WebP with alpha → `public/assets/home/hero-face-badge.webp`
- Keep PNG master if useful for iteration

**Step 4: Commit**

```bash
git add public/assets/home/hero-face-badge.webp
git commit -m "$(cat <<'EOF'
assets: add hero face badge cutout

EOF
)"
```

---

### Task 2: `HeroFaceBadge` component (visual pin)

**Files:**
- Create: `hridaew-portfolio/src/components/home/HeroFaceBadge.tsx`
- Modify later: `HeroCard.tsx` (Task 3)

**Step 1: Scaffold component**

Create a client component with props:

```tsx
type HeroFaceBadgeProps = {
  replayTick: number;
  burstActive: boolean;
  onReplay: () => void;
  reduceMotion: boolean | null;
  replayLabel: string;
  replayTitle: string;
  className?: string;
};
```

Display height: `h-12` (48px). Width: auto from image aspect (`w-auto`), or fixed wrapper sized to asset ratio so layout doesn’t jump.

**Step 2: Layer stack**

Inside a `relative` wrapper (button):

1. **Shadow** — `drop-shadow` or pseudo behind, soft dark shadow offset down slightly
2. **Chrome shell** — slightly larger than face (chunky rim). Bright silver via layered linear/conic gradients (highlights + dark edge). Use CSS `mask-image: url(/assets/home/hero-face-badge.webp)` (and `-webkit-mask-image`) so the shell follows the face silhouette exactly
3. **Face** — `next/image` or `img` of the cutout, inset ~2–3px visually (scale ~0.88–0.92 of shell) so chrome rim reads
4. **Specular** — semi-transparent white gradient ellipse, `mix-blend-mode: soft-light` or `overlay`, low opacity; position shifts with tilt (CSS vars `--badge-px`, `--badge-py`)

No `rounded-full` crop. No rectangular card chrome.

**Step 3: Pointer tilt**

- On `pointermove` over the button, compute normalized -1..1 from center
- Store in refs; drive `transform: perspective(400px) rotateX(...) rotateY(...)` on the pin stack via rAF or direct style (avoid per-frame `setState`)
- Max tilt ~8–12deg; spring/lerp back to 0 on `pointerleave`
- If `reduceMotion`, skip tilt entirely

**Step 4: Burst / remount hooks**

- When `burstActive`, hide or fade the pin layers (`opacity: 0`) so particles show
- `key={replayTick}` on the visual stack with Framer Motion spring entrance matching existing GIF remount (`stiffness: 560`, `damping: 26`, `mass: 0.85`) unless `reduceMotion`

**Step 5: a11y**

- Root is `<button type="button">` with `aria-label={replayLabel}` and `title={replayTitle}`
- `onClick={onReplay}`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-white/35` consistent with hero controls

**Step 6: Commit**

```bash
git add src/components/home/HeroFaceBadge.tsx
git commit -m "$(cat <<'EOF'
feat: add HeroFaceBadge metallic pin component

EOF
)"
```

---

### Task 3: Wire into `HeroSignatureMark`

**Files:**
- Modify: `hridaew-portfolio/src/components/home/HeroCard.tsx` (`HeroSignatureMark` ~253–335)

**Step 1: Replace round avatar**

Remove the static:

```tsx
<div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
  <Image ... src="/assets/aboutme.webp" ... />
</div>
```

Replace with:

```tsx
<HeroFaceBadge
  replayTick={avatarReplayTick}
  burstActive={Boolean(avatarBurst)}
  onReplay={onReplay}
  reduceMotion={reduceMotion}
  replayLabel={replayLabel}
  replayTitle={replayTitle}
/>
```

**Step 2: Move burst overlay onto the badge**

Either:

- Render `AvatarBurstParticle` list inside `HeroFaceBadge`, **or**
- Keep burst overlay as a sibling absolutely centered on the badge wrapper in `HeroSignatureMark`

Prefer particles centered on the badge hitbox. Reuse `createAvatarBurst` / `AvatarBurstParticle` as-is (colored burst).

**Step 3: Leave GIF path alone**

Keep `SHOW_HERO_SIGNATURE_GIF = false` and existing GIF block unchanged.

**Step 4: Verify interactive target**

Confirm badge is a `<button>` so `isHeroInteractiveTarget` prevents sketch-orb spawn on badge click (already matches `button` selector).

**Step 5: Commit**

```bash
git add src/components/home/HeroCard.tsx src/components/home/HeroFaceBadge.tsx
git commit -m "$(cat <<'EOF'
feat: use face badge in hero signature mark

EOF
)"
```

---

### Task 4: Visual QA in browser

**Steps:**

1. Run `npm run dev` in `hridaew-portfolio`
2. Open home page hero card
3. Check:
   - Cutout edges clean at display size (no halo, no bg crumbs)
   - Chrome rim readable at 48px height; pin feels thick
   - Pointer tilt feels subtle, not dizzy; resets on leave
   - Click → colored burst → spring respawn
   - Click badge does **not** spawn sketch orbs
   - `prefers-reduced-motion`: no tilt, no burst (or instant), remount ok
   - Mobile + desktop layouts both show the badge
4. Fix any matte/chrome issues; re-export asset if needed
5. Commit polish if any

```bash
git commit -m "$(cat <<'EOF'
polish: hero face badge chrome and cutout

EOF
)"
```

---

### Task 5: Done checklist

- [ ] `hero-face-badge.webp` pixel-perfect full-head cutout
- [ ] Round `aboutme.webp` circle removed from hero mark
- [ ] Chrome pin + pointer tilt + burst/respawn working
- [ ] Reduced motion respected
- [ ] No sketch-orb double interaction on badge click
