# Velvet Nap (`velvet`)

> The whole page is a bolt of ultramarine velvet with my projects finger-written into the pile: stroke a word and its patch is stitched on beside it, and rest a finger and the fabric purrs, just as my hacked Memory Care cats did.

Fonts: Bodoni Moda, Azeret Mono, Caveat  
Palette: #1F2DB0, #0B1257, #8B9BFF, #E9ECFF, #F2B632, #121A7A, #ECEEF6  
Source concepts: generative-3, senses-1, provocateur-3

# Velvet Nap: build spec

## 1. Concept & thesis
The home page is a bolt of Klein-ultramarine velvet. My project names are finger-written into the pile against the grain, so they read only through sheen. You navigate by stroking: brush a word and its patch is stitched onto the fabric beside it. Rest a finger and the fabric purrs.

Grounding:
- **Memory Care Experience Station.** I hacked three plush cats with pressure sensors and vibration motors on an Arduino. Petting one triggered a purr and a synced video of that cat, and residents instinctively picked them up and held them. That exact loop (touch → purr → synced media) is this page's entire input model: a patch's video advances only while you keep petting.
- **Saving Baby J** taught me that nobody needed a tutorial, so there is none here, just fur.
- **Domis** is built around the smallest action a person will actually take, and a single stroke is that action.
- The settling pile is never described as 'forgetting'. Tone around dementia stays warm and factual.

## 2. Visual system
**Fonts**
- **Bodoni Moda** (opsz 6–96, wght 400–900, ital; fallback 'Bodoni 72', Didot, Georgia, serif).
  - Label name 'HRIDAE WALIA': opsz 96, wght 800, tracked caps +0.14em, 30px on desktop.
  - Patch titles: italic, opsz 48, wght 600, 30px.
  - Patch body: opsz 11, wght 500, 16px/1.5.
- **Azeret Mono** 400/600 (fallback ui-monospace, monospace): care lines, metadata and buttons, 12–13px uppercase at +0.06em.
- **Caveat** 700 is only the glyph source for the fur-word masks. It is never shown as flat type, except in the no-WebGL fallback.

**Tokens**
| Token | Hex | Use |
|---|---|---|
| --pile | #1F2DB0 | ultramarine pile |
| --root | #0B1257 | fibre roots, pile shadow |
| --sheen | #8B9BFF | sheen |
| --glint | #E9ECFF | fibre tips; any text on fur (8.7:1) |
| --saffron | #F2B632 | woven label, stitch thread |
| --thread-ink | #121A7A | text on saffron (7.9:1) |
| --cotton | #ECEEF6 | patch ground (thread-ink 13:1) |

**Materials**
- **Velvet:** short, dense pile with a directional sheen.
- **Label:** saffron twill, made from a 45° repeating-linear-gradient of 1px lines 6% darker. It has a 1px dashed --thread-ink seam 6px inside the edge and a folded end with a 10px triangle shadow.
- **Patches:** sharp-cornered cotton rectangles with a 2px saffron dashed stitch (dasharray 7 5) and a cast shadow on the pile of rgba(11,18,87,.5) 0 10px 24px.

**Desktop 1440×900**
- Velvet is full-bleed and fixed.
- The label hangs off the left edge: left −6px, top 8vh, 360px wide, rotated −1.5°.
- Words come from a layout table of viewport-normalised [x, y, width, rotation]:

| Word | x | y | width | rotation |
|---|---|---|---|---|
| domis | .62 | .07 | .33 | −4° |
| virdio | .30 | .34 | .26 | −6° |
| obscura | .58 | .45 | .33 | 3° |
| memory care | .30 | .71 | .52 | −3° |
| hello | .27 | .12 | .10 | −8° |
| savor | .88 | .35 | .09 | 6° |
| recorder | .27 | .55 | .12 | 4° |
| butter chicken | .70 | .90 | .18 | −2° |
| baby j | .87 | .84 | .10 | −5° |

Case-study words are 150–220px tall. Nothing is centred.

**Phone 390×844** (one screen, 100dvh)
- The label docks at the top as a 64px saffron strip: 'HRIDAE WALIA', 'Product designer · Founding PD at Domis', and a 'Contents' toggle.
- Portrait word table [x, y, width, rotation]:

| Word | x | y | width | rotation |
|---|---|---|---|---|
| domis | .08 | .13 | .70 | −5° |
| virdio | .22 | .31 | .66 | 4° |
| obscura | .06 | .49 | .82 | −3° |
| memory care (two lines) | .06 | .66 | .88 | −4° |

- The small words sit along the edges, each with a hit zone ≥44px tall.

## 3. First frame at rest
- **The velvet:** rich ultramarine with visible pile and a soft sheen from the upper left.
- **Case-study words:** 'domis', 'virdio', 'obscura' and 'memory care' read clearly as darker, ruffled handwriting dragged against the grain. Each has a faint pressed shadow.
- **Small words:** 'hello', 'savor', 'baby j', 'recorder' and 'butter chicken' sit near the edges.
- **The pile breathes** (length ±3% at 0.22Hz).
- **The saffron label** carries the full index (copy in §5).

Before WebGL boots (≤150ms) the body is solid --pile and the label is already complete.

## 4. Interaction model
1. **Stroke** (mouse button, finger or pen) writes stroke direction into a nap field with a gaussian brush: radius 28px for mouse, 40px for touch.
   - Mouse hover with no button down is a light touch (25% strength, 18px radius), so visitors who only move the mouse still ruffle it.
   - With the grain smooths and lightens; against the grain raises and darkens.
   - Fast strokes lift fibres (B+); slow strokes press them (B−).
   - Pressure comes from PointerEvent.pressure for pens; otherwise clamp(1 − speed/1.4 px·ms⁻¹, .2, 1).
2. **Hold** still for 350ms (under 4px of movement) and the pile flattens into a darker, matte fingertip dent and purrs:
   - The fibres jitter at 25Hz under a 2.4s inhale/exhale envelope.
   - The label and patches tremble ±0.6px in sync through one wrapper transform.
   - If sound is on, the purr plays. On Android, navigator.vibrate([18,22,18,22,18]) is re-issued every 200ms while holding.
   - On release, fibres spring back (stiffness 260, damping 22).
3. **Pet a word.** Each word builds pet energy from stroke length over its mask at gentle speeds (.15–1.2 px/ms), or from holding on it.
   - The threshold is 700px of stroking or a 350ms hold. The word's fibres then lift and catch the light.
   - Its patch is stitched on beside it: the dashed border draws round the rectangle in 280ms (stroke-dashoffset), then the contents fade in over 120ms.
   - A tap (under 6px and 250ms) opens it at once; a quick pat works too.
4. **Synced media.** In a patch, video playbackRate follows petting of the word or of the patch's 12px fur hem: rate = .25 + .75·energy, pausing when energy drops below .1 (about 2s after the last stroke).
   - A visible ▶/❚❚ button plays normally for anyone who just wants to watch.
   - Memory Care has stills, so it pans slowly across three photos while petted. It has a ▶ too.
5. **Skin twitch.** A fast stroke (>1.6px/ms) against the grain (dot < −.6) sends a radial pile ripple across the whole screen (900px/s, 0.9s decay) and halves the purr. Limited to one per second.
6. **Both hands.** Two active pointers fill the purr twice as fast, and a woven 'both hands' tag appears on the label for 2s.
7. **Settling.** The field relaxes back to the combed base with about a 5s half-life. 'Comb flat' on the label resets it with one sweeping comb pass (300ms).
8. **Patches.** Up to two on desktop (a third replaces the oldest) and one on phone (as a bottom sheet). '×' unstitches: the stitch retracts over 200ms.
9. **Keyboard.**
   - Each fur word is a DOM button over its mask. Tab draws a saffron stitched outline around the word; Enter or Space pets it (1s purr) and opens the patch.
   - The velvet itself is focusable: arrows move a visible fingertip ring 6px/frame, brushing as it goes, and holding Shift presses and purrs.
   - Esc closes the newest patch.
10. **Light.** The light direction drifts on an 18s loop. On desktop it leans ±12° toward the pointer, so the sheen flashes across the words as you move.

**Signature moment:** rest your thumb on 'memory care' on a phone. The pile dents, the surface trembles and the phone buzzes (Android). A patch is stitched on beside your thumb showing residents petting the haptic cat this page borrows its idea from. The runner-up: writing your own name in the fur and watching it shimmer, then settle.

## 5. Content map & copy
**Label (DOM):**
- 'HRIDAE WALIA'
- 'PRODUCT DESIGNER · SAN FRANCISCO · ri-they waliaa'
- 'I'm a Product Designer obsessed with making, and I have 6 years of experience designing for interaction models that barely exist yet. Founding Product Designer at Domis.'
- 'CONTENTS: Domis ↗ · Virdio ↗ · OBSCURA ↗ · Memory Care Experience Station ↗'
- 'ALSO: Savor ↗ · Saving Baby J ↗ · Recorder-Proto ↗ · Butter Chicken ↗'
- 'CARE: Stroke with or against the nap. Rest a finger on a word. Hand-made. Do not tumble dry.'
- 'hridaew@gmail.com [Copy]'
- 'LinkedIn · GitHub · CV'
- 'Purr sound: off' · 'Comb flat'

**Patches.** Every link is absolute, target=_blank rel=noopener, and each patch ends with 'Open the case study ↗'.
- **domis** (video) → https://hridaew.com/domis
  - 'Domis · Founding Product Designer · Nov 2024–now'
  - 'A home maintenance app that learns your house from the smallest action you'll actually take: an address, a photo of an appliance nameplate, an inspection report. Useful structure, without the busywork getting in the way.'
  - '+60% new-user engagement from my 3D home-avatar prototypes.'
- **virdio** (video) → https://hridaew.com/virdio
  - 'Virdio · Product Designer · 2021–2022'
  - 'Hardware-free AR fitness: an ordinary camera reads your body and counts punches, squats and jumps. Shipped across iOS, Android, web, desktop, Apple Watch and smart TV with no prior design system.'
  - 'Design tokens cut asset and handoff time 50% across four platforms.'
- **obscura** (video) → https://hridaew.com/obscura
  - 'OBSCURA · Interaction design, prototyping, Unity · MOHAI, 13 Sep 2025, sold out'
  - '300+ never-seen photographs by Wayne Wong, a Signal Corps soldier in 1946 Japan. A visitor looks in VR while an audience outside watches through their eyes, then takes home a photo strip of where they looked.'
  - 'Photographs: Wayne Wong, 1946.'
- **memory care** (three stills) → https://hridaew.com/memory-care
  - 'Memory Care Experience Station · with Maria Mortati Experience Design · 2020–2023'
  - 'For people living with mid-to-late stage dementia. I hacked three plush cats with pressure sensors and vibration motors so petting one makes it purr and plays that cat's video, and moved the haptics to a footrest so 100% of residents could reach them without leaving their wheelchairs.'
  - '98% positive across 200+ sessions · Fast Company World Changing Ideas 2022 finalist · CABHI 2× award recipient · SCAN Foundation Innovation Award.'
- **savor:** 'Savor · phone video → 3D Gaussian splat, on-device, no cloud. I built it to capture Rodin's Mighty Hand properly.' → https://hridaew.com/waffling/savor
- **baby j:** 'Saving Baby J · a walk-up arcade game: throw orca plushies at a projected hit board to free a calf from a net. The throw won; nobody needed a tutorial.' → https://hridaew.com/waffling/orca
- **recorder:** 'Recorder-Proto · a voice recorder with a turntable scrub and a cassette-eject sound. I wanted to make something cool from a mundane task.' → https://hridaew.com/waffling/recorder
- **butter chicken:** 'Butter Chicken · a vibes-based recipe. Taste scales linearly with butter.' → https://hridaew.com/butter-chicken
- **hello:** a photo of me holding my cat, plus:
  - the full thesis
  - 'M.HCI+D, University of Washington, 2024 · BFA Interaction Design, California College of the Arts, 2020'
  - toolkit 'Pencil, Paper, Figma, Cursor, Claude Code, Xcode, Origami, ProtoPie'
  - LinkedIn, GitHub, CV
  - email + Copy

The Copy button calls navigator.clipboard.writeText inside the click; on rejection it selects the text.

## 6. Plain path & accessibility
- The first tab stop is 'Skip to contents'.
- The label is a complete plain index: always visible on desktop, and opened by 'Contents' on phones.
- Every fur word is a <button aria-haspopup=dialog> and needs no stroking.
- Patches are <section role=dialog aria-modal=false aria-labelledby>. Focus moves to the patch heading and is restored on close.
- Structure:
  - <aside> label with the <h1> and <nav aria-label=Contents>.
  - <main> with the word buttons and the patches.
  - The canvas is aria-hidden. The focusable velvet has aria-label 'Velvet surface. Arrow keys brush, Shift presses.'

## 7. Reduced motion & mobile
**Reduced motion:**
- no breathing, purr jitter, tremble or ripple
- a purr shows as a still dent plus a woven 'purring' tag; audio still plays if on
- stitch outlines appear instantly
- patch media only plays via ▶
- strokes still write the nap, because that is direct manipulation

**Mobile:**
- touch-action:none on the velvet canvas only.
- The label strip and sheets scroll natively (touch-action:pan-y, overscroll-behavior:contain).
- Patches are bottom sheets, max 72dvh, with env(safe-area-inset-bottom) padding.
- Field at 1/4 resolution; fur pass at .66× (.5× if frame time stays above 20ms for 30 frames).
- 8 shell taps on phone vs 12 on desktop; DPR ≤2.

## 8. Tech plan
No CDN libraries. Override the artifact host reset by setting html/body margin, background, font and height explicitly.

**GL tiers**
1. WebGL2 with EXT_color_buffer_float or EXT_color_buffer_half_float.
2. WebGL1 with OES_texture_half_float + EXT_color_buffer_half_float.
3. RGBA8, with the direction packed into two bytes.
4. No WebGL: a static CSS velvet (layered radial gradients + SVG feTurbulence), with the words drawn as Caveat in --sheen and every patch working.

**Base field** (built once per layout, on the CPU).
- Curl-noise grain, combed mostly down-right.
- Inside the word masks the direction flips against the grain, with B = +.3.
- Word masks: draw Caveat 700 to an offscreen 2D canvas at field resolution, then fill plus a round-cap strokeText (lineWidth .14em) so stroke ends are fingertip-round, then a 1px blur.
- A CPU Uint8 word-ID mask handles hit-testing.

**Nap field.** Ping-pong RGBA16F at 1/4 of the viewport. RG holds the tangent, B lift(+)/press(−), A the purr. Each frame:
1. Relax toward the base by 1−exp(−dt/7s).
2. Diffuse lightly across 4 neighbours.
3. Apply up to 16 brush capsules from uniform arrays. The pointer path is interpolated between events so fast strokes stay continuous.
4. Write the purr.

**Fur pass.** One full-screen draw at .66–1× resolution.
- A 12-tap parallax shell march along −tangent·length, where length = 6px·(1+.6B)·breath. It samples a 256² tileable strand-hash texture generated in JS (a height per strand).
- Colour runs --root → --pile → --glint by shell height, with ambient occlusion.
- Lighting = a Kajiya-Kay highlight on a 3D fibre tangent (dir·cos lean, sin lean), plus a directional albedo term. Tune it so with-grain vs against-grain differ by ≥1.6:1 in luminance.
- A permanent 12% pressed shadow inside the word masks keeps words legible on dim phones before any sheen catches.
- Purr = 25Hz tangent jitter ×A. Ripple = a radial wave uniform on B.

**Audio.** Pink noise → lowpass at 280Hz → a gain driven by a 25Hz pulse × the 2.4s breath × the purr level, max .12. The AudioContext is created inside the toggle click.

**DOM.**
- The label.
- Word buttons, repositioned from the layout table on resize.
- Patches with <video muted playsinline loop preload=metadata poster>.
- One rAF loop, paused on visibilitychange; videos pause when hidden.

**Hardest part:** shading that reads unmistakably as velvet, not carpet or static, and keeps the words legible from sheen alone on dim phones and bright monitors at 60fps.

**Performance budget:** fur pass ≤6ms on a mid-range phone; JS ≤50KB.

## 9. Media
All paths are relative to public/assets; output goes to media/.

| Source | Processing | Output |
|---|---|---|
| home/domis-card2-anim.mp4 | scale 360:-2, crf 30, -an | v-domis.mp4 |
| home/virdio-hero-crop.mp4 | 640:-2, crf 30, -an | v-virdio.mp4 |
| home/obscura-sbs-video.mp4 | 640:-2, crf 30, -an | v-obscura.mp4 |
| memory-care/cathero.png | 1000w | mc-1.webp |
| memory-care/resident_driving.png | 700w | mc-2.webp |
| memory-care/footrest_haptic.jpg | crop to the frame, 700w | mc-3.webp |
| savor/hero-poster.jpg | 800w | savor.webp |
| orca/throw-test.jpg | 800w | babyj.webp |
| recorder/card.png | 390w, keep alpha | recorder.webp |
| butter-chicken/hero.jpg | 700w | butter.webp |
| about/cat.png | 600w | hello.webp |

Each video also gets a first-frame webp poster. Total media ≤6MB.

## 10. Acceptance checklist
- [ ] With no input, at 1440×900 and 390×844, all four case-study words are legible on the velvet, and the label (on phone, the strip) shows name and role.
- [ ] Words stay legible at the least favourable light angle (screenshots at 4 angles).
- [ ] Mouse hover leaves a faint trail; a drag leaves a strong one that settles in about 15s; Comb flat resets instantly.
- [ ] A 350ms hold dents and trembles; purr audio plays only after the toggle.
- [ ] Petting 'domis' stitches its patch; the video advances only while petting; ▶ plays normally.
- [ ] Tab reaches every word; Enter opens its patch; Esc closes it and focus returns.
- [ ] A fast against-grain stroke triggers exactly one ripple; two touch points show 'both hands'.
- [ ] Reduced motion: no breathing, jitter or ripple.
- [ ] With WebGL disabled, the CSS fallback shows visible words and working patches.
- [ ] No console errors; rAF stops when hidden; no horizontal overflow from 360 to 2560px.
- [ ] Only Bodoni Moda, Azeret Mono and Caveat load.