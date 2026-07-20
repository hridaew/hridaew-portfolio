# Hero Face Badge — Design

**Goal:** Replace the round hero bio avatar with a face-shaped metallic pin of Hridae, with pointer tilt and the existing click-to-burst / spring-respawn interaction.

## Decisions

| Choice | Decision |
|--------|----------|
| Silhouette | Full head — hair + face + jaw (not a circle) |
| Metal | Bright polished silver chrome, chunky pin thickness |
| Size | Same height as current mark (~48px); width follows head aspect |
| Idle motion | Slight 3D tilt following pointer |
| Click | Same colored particle burst + spring remount as old signature GIF path |
| Build approach | Pre-cut transparent asset + layered CSS chrome shell |

## Asset

- **Source:** `/Users/hridaewalia/Downloads/IMG_0859 2.JPG`
- **Output:** `public/assets/home/hero-face-badge.webp` (+ optional PNG master)
- **Quality bar:** Pixel-perfect cutout — no background, no color halo, hair edges refined by hand after any auto pass
- **Export size:** ~144–192px tall for retina sharpness at ~48px display
- Chrome rim uses the same alpha silhouette (mask), so matte quality is the quality gate

## Component (`HeroFaceBadge`)

Layer stack (back → front):

1. Drop shadow — grounds thick pin
2. Chrome shell — bright silver bevel, masked to face silhouette, chunky rim
3. Face photo — transparent cutout, slightly inset inside chrome
4. Specular — soft highlight that shifts lightly with pointer
5. Hit target — button over the pin

**Tilt:** `perspective` + small `rotateX` / `rotateY` from pointer position (refs / rAF, not React state per frame). Disabled when `prefers-reduced-motion`.

## Interaction & wiring

- Lives in `HeroSignatureMark` inside `HeroCard.tsx`
- Replaces static `rounded-full` `/assets/aboutme.webp` circle
- Click calls existing `replayHeroAvatarAnimation` (burst particles + `avatarReplayTick` remount)
- During burst, pin hides/fades so particles read; then springs back
- Signature GIF remains gated (`SHOW_HERO_SIGNATURE_GIF = false`)
- Button must count as interactive so blank-card sketch-orb taps do not double-fire
- a11y: labeled button (e.g. “Replay avatar”); reduced motion skips tilt + burst, remount still ok

## Out of scope

- Changing bio copy or card layout beyond the mark
- Bringing back the signature GIF
- Face-shard dissolve particles (chose classic colored burst)
