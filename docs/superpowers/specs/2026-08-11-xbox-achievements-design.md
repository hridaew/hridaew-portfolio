# Xbox 360 Achievement Toasts — Design

**Date:** 2026-08-11
**Status:** Approved design, pending implementation plan

## Goal

A session-only easter egg: when the visitor does one of 21 things on the site, an
Xbox 360 notification toast slides out at the bottom of the screen reading
"Achievement unlocked" plus a plain-language title, accompanied by the authentic
chime.

The toast is a deliberate, close recreation of the Xbox 360 dashboard
notification — geometry, choreography, and sound are all derived from measured
reference footage rather than approximated by eye.

There is no achievements list, no Gamerscore, no settings panel, and no
persistence beyond the browser tab. The whole feature is the toast.

## Reference material


| Asset               | Path                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Animation reference | `E:\Downloads\YTDown.com_YouTube_Xbox-360-Dashboard-Update-2025_Media_yEJQg8ygrdQ_001_1080p - Trim.mp4` |
| Chime               | `E:\Downloads\Xbox 360 Achievement Notification Sound 2008 Present.mp3`                                 |


The clip is 1080p at 60fps, 6.25s long, and contains exactly one notification
(a "signed in to Xbox LIVE" toast) from entrance through exit. The toast chrome
is identical to the achievement toast of the same era.

Note: the clip is from the later (NXE/Metro) dashboard, not the 2005–2008 Blades
dashboard. Blades used the same shape and choreography with a lighter, glossier
silver surface. We are building the charcoal version from this clip; see
"Skinning" below for how a Blades variant stays cheap.

### Reproducing the reference frames

Every measurement below comes from frames extracted with ffmpeg. To regenerate
them during implementation, for the settled state and the two animation phases:

```bash
# Settled state (frame 30)
ffmpeg -i "<clip>" -vf "select='eq(n\,30)'" -vsync 0 settled.png
# Entrance, first 48 frames, bottom strip, tiled
ffmpeg -i "<clip>" -vf "crop=1920:270:0:810,select='lt(n\,48)',tile=4x12" -vsync 0 entrance.png
# Exit frames
ffmpeg -i "<clip>" -vf "select='eq(n\,342)+eq(n\,346)+eq(n\,350)+eq(n\,353)+eq(n\,356)+eq(n\,359)',crop=560:120:700:873,tile=1x6" -vsync 0 exit.png
```

## Measured geometry

All values measured from frame 30 of the reference (settled state). The
dashboard renders natively at 720p, so the 720p column is the true design size
and maps directly to CSS pixels.


| Property                   | At 1080p                   | At 720p (design) |
| -------------------------- | -------------------------- | ---------------- |
| Overall width (orb + pill) | 454px                      | 303px            |
| Pill height                | 96px                       | 64px             |
| Corner radius              | height ÷ 2 (fully rounded) | 32px             |
| Offset above bottom edge   | 101px                      | 67px             |
| Orb diameter               | ~86px                      | ~57px            |
| Text inset from pill left  | ~113px                     | ~75px            |


Horizontal position is **centered** — measured center was 958.5 against a frame
center of 960.

The orb nests flush inside the pill's left cap, vertically centered, and does
not protrude past the pill's top or bottom edge.

### Colors


| Element                   | Value                       |
| ------------------------- | --------------------------- |
| Pill fill                 | `#434343`, effectively flat |
| Pill bottom rim highlight | `#595959`                   |
| Text                      | `#f6f6f6`                   |
| Orb accent green          | `#bcff46`                   |


The pill also carries a soft outer glow. There is no meaningful vertical
gradient in the fill — the apparent gloss comes from the rim highlight and the
glow, not a gradient ramp.

## Choreography

### Entrance — ~470ms

1. **0–130ms:** the orb fades in and scales up. The panel does not exist yet.
2. **130–400ms:** the panel grows rightward from behind the orb. Its left edge
  is pinned; the rounded right cap stays perfectly round throughout.
3. **270–470ms:** the two text lines fade in, overlapping the tail of the growth.

### Hold — ~5.25s

### Exit — ~300ms

The exit is **not** a mirror of the entrance.

1. The text fades out first and fast, roughly 65ms.
2. The orb scales down toward its own center.
3. The panel fades out while pulling in only slightly from the right. It never
  collapses back into the orb.

Total lifetime is ~6.0s.

### Icon slot — flips for the whole hold

The icon is not static. It alternates continuously between the Xbox orb and a
second, context-specific glyph for as long as the toast is up. In the reference
(a sign-in toast) that second glyph is a white exclamation mark; for us it is
**one glyph per achievement**.

Measured from frames 163–187, the transition is a two-stage cross-fade, not a
rotation:

1. The outgoing icon **dims to black in place** over ~115ms. It does not shrink,
  narrow, or move.
2. The incoming icon **expands horizontally from a center sliver** to full width
  over ~100ms, reading as a `rotateY` reveal.

Each icon then holds for ~800–1200ms before flipping again. Total transition is
~220ms.

The surrounding ring chrome never moves through any of this: a dark circle with
four silver quadrant segments separated by black notches at the four compass
points, with a green arc over the top-left quadrant. Only the inner disc changes.

In the reference that green arc is an animated sign-in progress spinner. For an
achievement there is nothing to make progress on, so ours is **static**.

### Implementation technique

The panel must animate **width**, not `scaleX`. Scaling would smear the rounded
cap and distort the text; the reference shows neither.

This is the measure-and-animate pattern from the project's UI wiki (§8):

- Outer element animates `width` with `overflow: hidden`.
- Inner element holds the content at natural width and is measured with a
`ResizeObserver` attached via a callback ref.
- Guard against a measured width of 0 on the first frame.
- The orb renders above the pill, positioned against the pill's left edge.

Because growth is left-anchored but the settled toast is centered, the wrapper's
left edge sits at `calc(50% - finalWidth / 2)`. The inner width must therefore be
measured before the entrance runs.

## Sound

The source mp3 is mostly silence: 715ms of lead-in, a 340ms chime from 0.715s to
1.054s, then 3.9s of trailing silence. Played raw, the chime would land a quarter
second after the animation had already finished.

Build step: trim to the chime plus ~30ms of pre-roll and ship the result as
`public/assets/achievements/unlock.mp3`.

Playback follows the existing `src/lib/audio.ts` conventions:

- A module-level `HTMLAudioElement` preloaded with `.load()` when the provider
mounts, so the delayed case-study unlock does not lose gesture context.
- `currentTime = 0` before every `.play()`.
- Suppressed entirely under `prefers-reduced-motion`, matching how `audio.ts`
already self-gates.
- Playback failures are swallowed. A case study opened from a direct URL load has
no prior user gesture, so autoplay policy may block that one toast's sound.

## Architecture

A single global toast bus. Every trigger site calls `unlock(id)` and knows
nothing else about the system.


| File                                                  | Responsibility                                            |
| ----------------------------------------------------- | --------------------------------------------------------- |
| `src/data/achievements.ts`                            | Definitions: `id`, `title`, `icon`                        |
| `src/components/achievements/AchievementProvider.tsx` | Context exposing `unlock(id)`; FIFO queue; session dedupe |
| `src/components/achievements/AchievementToast.tsx`    | The portalled renderer; one toast at a time               |
| `src/components/achievements/AchievementIcon.tsx`     | Static ring chrome plus the flipping inner disc           |


The provider mounts in `src/app/layout.tsx` inside `SheetNavProvider`, following
the existing root-provider pattern, so both sheet routes and dedicated pages
share one instance.

`unlock` takes an achievement id typed as a union derived from the definitions
file, so a typo is a compile error rather than a silent no-op. It fires
immediately and owns no timing of its own — the ~1s delay on case-study opens
belongs to the trigger site, as a timer that clears on unmount.

### Layering

The toast portals to `document.body` at `z-[240]`. This clears the case-study
sheet (`z-[200]`) and Obscura's elevated cursor (`z-[210]`), and sits below the
cheat-code theme intros (`99999`), which are full-screen takeovers where a
notification would be wrong anyway.

Portalling is required, not stylistic: the sheet is a fixed container with
`overflow: hidden`, so an in-tree toast would be clipped.

### Queue

Strictly FIFO. One toast completes its full ~6s lifecycle before the next
begins, with a ~250ms gap between them. Nothing is dropped, nothing stacks.

### Session dedupe

Unlocked ids live in `sessionStorage`, not React state.

This matters because the site hard-navigates (`window.location.assign`) in stack
mode and for non-sheet routes, which would wipe in-memory state and re-fire the
same toast every time the visitor moved between pages. `sessionStorage` survives
hard navigation within a tab and clears when the tab closes — which is exactly
the "re-earnable on a fresh visit" behavior we want.

### Reduced motion

Under `prefers-reduced-motion: reduce` the toast still appears and still holds
for its full duration, but it snaps in and out with no width or scale animation,
and no sound plays.

### Skinning

Surface treatment (fill, rim, glow, text color) lives in CSS custom properties
rather than being hardcoded, so switching to a Blades-era silver skin later is a
token change rather than a rebuild. Geometry and choreography are shared between
skins because the reference confirms they are identical.

## The 21 achievements

Titles are short and in-voice — nods to the thing the visitor just touched
rather than literal descriptions of the action. Authored by Hridae.

### Case studies — fire ~1s after open


| id            | Title               | Hook      |
| ------------- | ------------------- | --------- |
| `domis`       | Hello homeowner     | see below |
| `virdio`      | Get moving!         | see below |
| `obscura`     | Witness the Obscura | see below |
| `memory-care` | Meow                | see below |


Two entry paths, which never both fire for one open because the sheet renders
*instead of* the page:

- **Sheets:** an effect on `activeKey` in `SheetNav` (`src/components/sheet/SheetNav.tsx`).
This single source covers `openSheet`, `replaceSheet`, and intercept-route sync.
- **Dedicated pages:** a mount effect in each of `src/app/{domis,virdio,obscura,memory-care}/page.tsx`.

Session dedupe makes any overlap harmless regardless.

### Home page


| id                | Title                 | Hook                                                       |
| ----------------- | --------------------- | ---------------------------------------------------------- |
| `about`           | Hello there           | `HeroCard` — `isExpanded` transitions false → true         |
| `hero-face`       | I'm touched           | `HeroFaceBadge` — `playSpin`                               |
| `painting-orb`    | Must've been the wind | `HeroCard` — `onHeroShellPointerUp`, after the orb spawns  |
| `copy-email`      | Hit me up             | `CopyEmailPill` — `copyEmail`                              |
| `album`           | Is this taste?        | `AlbumArt` — `handleClick`, on the first-focus branch only |
| `game-cyberpunk`  | No gonks allowed      | `HeroCardExpandedBody` — Cyberpunk cover click             |
| `game-halflife2`  | Pick up that can      | `HeroCardExpandedBody` — Half-Life 2 cover click           |
| `game-dishonored` | Whiskey and cigars?   | `HeroCardExpandedBody` — Dishonored cover click            |


One achievement for opening any album, not one per album.

### Case-study interactives


| id             | Title              | Hook                                                                        |
| -------------- | ------------------ | --------------------------------------------------------------------------- |
| `virdio-space` | Setup done!        | `ConePlayground` — when the second cone lands and state flips to calibrated |
| `punch-bag`    | Good work!         | `PunchBag` — first `punch()`                                                |
| `pet-cat`      | MRRROWWW           | `CatPettingInteractive` — when it crosses into petting, not the click-meow  |
| `sticky-note`  | Noted.             | `StickyNotes` — after `handlePlacement` commits the note                    |
| `gaze`         | I see what you see | `GazeSimulator` — first dwell past the 1.5s threshold                       |


The gaze indicator lives in **Obscura**, not Virdio, contrary to the original
brief.

### Cheat codes

All four resolve through one handler, `handleCheatCode` in
`src/components/home/HomeCheatEasterEggs.tsx`, which already returns early on an
unrecognised code — so the unlock fires only on a real hit. Codes come from
`src/lib/homeCheats.ts`.


| id                     | Code typed       | Title            | Note                 |
| ---------------------- | ---------------- | ---------------- | -------------------- |
| `cheat-2004`           | `2004`           | COYG             | Retro 2004 web theme |
| `cheat-choom`          | `choom`          | Wake up, samurai | Cyberpunk theme      |
| `cheat-destroy`        | `destroy`        | Oops.            | Destroy sequence     |
| `cheat-butter-chicken` | `butter chicken` | Extra butter     | Recipe overlay       |


Titles here are drafts pending Hridae's edit, matching the voice of the others.

### Icons

White monochrome Lucide glyphs on the black inner disc (static green arc). Mapping:

| id | Lucide |
| --- | --- |
| `domis` | `House` |
| `virdio` | `Dumbbell` |
| `obscura` | `Eye` |
| `memory-care` | `Cat` |
| `about` | `Hand` |
| `hero-face` | `Smile` |
| `painting-orb` | `Wind` |
| `copy-email` | `Mail` |
| `album` | `Disc3` |
| `game-cyberpunk` | `Cpu` |
| `game-halflife2` | `Trash2` |
| `game-dishonored` | `Cigarette` |
| `virdio-space` | `ScanLine` |
| `punch-bag` | `Zap` |
| `pet-cat` | `PawPrint` |
| `sticky-note` | `StickyNote` |
| `gaze` | `Focus` |
| `cheat-2004` | `Construction` |
| `cheat-choom` | `Sword` |
| `cheat-destroy` | `Bomb` |
| `cheat-butter-chicken` | `CookingPot` |

## Deliberate deviations from house rules

`CLAUDE.md` and the UI wiki cap user-initiated animation at 300ms. This toast's
entrance is ~470ms and it holds for ~5.25s. That is intentional: it is a system
announcement whose entire purpose is fidelity to the Xbox 360, and the timings
are measured from the reference rather than chosen. The exception should be noted
in the component so it does not read as an oversight.

The reference's green ring arc is an animated sign-in progress spinner. Ours is
static, because an achievement has no progress to report.

## Out of scope

- Achievements list or gallery UI
- Gamerscore
- Persistence across visits
- A settings toggle for sounds
- Custom-drawn icon art (Lucide glyphs stand in; see "Icons")

## Verification

Manual browser verification, per the project's animation rule:

- Every one of the 21 triggers fires exactly once per tab session.
- The icon keeps flipping for the full hold, and the ring chrome never moves.
- Two rapid unlocks queue rather than overlap or drop.
- The toast renders above an open case-study sheet.
- Reduced motion snaps and stays silent.
- Behavior is correct in both split and stack home layouts.
- Geometry checked side by side against the measured reference frames.

