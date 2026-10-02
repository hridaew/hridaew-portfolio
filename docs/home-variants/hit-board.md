# Hit Board (`hit-board`)

> A cardboard-and-painter's-tape arcade cabinet with a giant flip-dot screen, built on what my Saving Baby J test found (the throw won): fling a plush orca, a shockwave of clacking discs flips into one of my projects, and a miss politely asks 'Did you step out of frame?'

Fonts: Jersey 10, Big Shoulders Stencil Display, Permanent Marker, Courier Prime  
Palette: #B68A5C, #C89C6C, #8E6640, #0C0D0F, #141518, #EEF0EC, #2F8FDB, #1A1A1A, #F5F7F6, #A9C9EA, #1B1C1E  
Source concepts: provocateur-2, play-1, play-3

# Hit Board: build spec

## 1. Concept & thesis
A walk-up arcade cabinet built from kraft cardboard and blue painter's tape, with a big black-and-white flip-dot board as its screen. You throw a plush orca at it:
- A hit sends a shockwave of clacking discs, and the board wipes into one of my projects as a dithered picture.
- A miss gets Virdio's no-blame line: 'DID YOU STEP OUT OF FRAME?'

Grounding:
- **Saving Baby J.** I tested giant cardboard orca controllers against throwing plushies at a projected hit board. The throw won and nobody needed a tutorial, so this page's input is the throw.
- **The real booth.** The cabinet copies its materials: a kraft box, blue tape, marker lettering and a blue tape throw line (giant-controllers.jpg).
- **The real game.** The board copies its parts: a boat with a Boat Health bar, a calf to free from a net, and hit / near-miss / miss feedback. The real hit board was 15 foam-core panels on an Arduino Leonardo, so this board is built from 15 modules in a 5×3 grid.
- **The real playtest lesson.** The outro arrived before anyone had a beat to react, so the finale here holds a beat.
- **Virdio.** AR artefacts doubled as hit boxes and reps were counted, so the targets are hit boxes, there is a THROWS/HITS counter, and the miss line is Virdio's recovery copy.
- **Flip-dots** are electro-mechanical, which fits my thesis of learning by making in the physical world. They are also black and white like an orca.

## 2. Visual system
**Fonts**
| Font | Use | Fallback |
|---|---|---|
| Jersey 10 | rasterised into the disc grid for every piece of board type | monospace |
| Big Shoulders Stencil Display 800 | box print: HIT BOARD, THIS SIDE UP, STAND BEHIND TAPE | Impact, sans-serif |
| Permanent Marker | short hand labels on tape only | cursive |
| Courier Prime 400/700 | typed index cards, 15px/1.5 | 'Courier New', monospace |

**Tokens**
| Token | Hex | Use |
|---|---|---|
| --kraft | #B68A5C | cabinet; marker ink on it 5.6:1 |
| --kraft-lt | #C89C6C | lit flaps |
| --flute | #8E6640 | cut edges, shadows |
| --panel | #0C0D0F | board backing |
| --disc-off | #141518 | disc, black face |
| --disc-on | #EEF0EC | disc, white face |
| --tape | #2F8FDB | painter's tape; marker on it 5.0:1 |
| --marker | #1A1A1A | marker ink |
| --card | #F5F7F6 | index card stock |
| --rule | #A9C9EA | card ruling |
| --type | #1B1C1E | card type |

There is no yellow anywhere.

**Textures**
- **Kraft:** SVG feTurbulence fibre noise, baked once into a static data-URL background.
- **Cut edges:** exposed corrugated flutes (repeating-linear-gradient, 3px).
- **Tape strips:** translucent --tape with a sheen gradient and jagged clip-path torn ends.
- **Box print:** a recycling mark and 'BOX 3 OF 3'.
- **Discs:** a sprite with a visible horizontal axle and a small glint mid-flip.
- **Board:** 15 module seams as 1px darker lines.

**Desktop 1440×900**
- The cabinet face fills the viewport.
- 'HIT BOARD' is stencilled top-left.
- The board sits left, off-axis (rotated −0.6°) and taped at three corners: 120×54 discs at an 8px pitch (960×432) at x 48, y 88. The pitch scales with width, up to 14px at 2560.
- Index cards are taped at angles down the right column (x 1050–1400).
- The bottom floor band holds the blue tape throw line (y≈610) and the resting orca.

**Phone 390×844**, stacked top to bottom:
- The board, full width minus 16px gutters: 40×60 discs at ≈8.9px pitch, with the name on two lines and the targets in a 2×2 grid.
- The throw zone (~130px) under it.
- The index cards in normal flow.
- A sticky tape button, 'CASE STUDIES ↓', with safe-area padding.

## 3. First frame at rest
**The cardboard cabinet.** The flip-dot board shows white dots on black:
- 'HRIDAE WALIA', 12 discs tall.
- A crawling marquee: 'PRODUCT DESIGNER · FOUNDING PRODUCT DESIGNER AT DOMIS · SAN FRANCISCO · I LEARN BY MAKING'.
- Four labelled bullseyes (concentric rings, radius 7 discs): DOMIS / VIRDIO / OBSCURA / MEMORY CARE. A dotted net drapes across them, with a tiny calf, Baby J, tangled between targets 2 and 3.
- A dot fishing boat at top-right towing the net, with a 20-dot BOAT HEALTH bar.
- A small dithered face target labelled 'GO ON, HIT ME'.

**Taped on the right:** card 1 (bio), card 2 (the four case studies as links, plus the email, LinkedIn, GitHub and CV), and card 3 (SIDE PROJECTS).

**On the floor:**
- The blue tape line with the plush orca resting on it.
- A marker label: 'pull back + let go (or tap a target)'.
- A tape strip: 'THROWS 00 · HITS 00 · SOUND: OFF'.

Until Jersey 10 loads, the board text is drawn with a hand-authored 5×7 dot font. When the font arrives, the text re-rasterises with a column wipe.

## 4. Interaction model
**Throwing**
- **Mouse or trackpad (slingshot):** press the orca and pull back. A dashed --tape aim arc and a landing reticle draw live. Release to throw. Power is |pull|, capped at 160px.
- **Touch:** flick up from the throw zone. Velocity comes from the last 90ms of samples, normalised per pointerType so a 3cm trackpad drag and a thumb flick reach the same range.

**Flight**
- A 520ms parabola. The orca scales from 1 to 0.32, so it reads as flying into the board, and tumbles with angular velocity taken from its lateral speed.
- **Shadow:** it starts big and blurry on the cardboard floor (14px blur, 15% opacity), climbs onto the board and sharpens (0px, 45%) to meet the orca at impact.
- **Aim assist:** if the landing is within 1.2× a target's radius, the last 30% of the arc bends to its centre.

**Impact**
- The orca squashes to 1.25×0.8 for 90ms, then drops onto a floor pile (up to 6).
- Discs flip in an outward shockwave: delay 10ms × ring distance, radius 18 discs, each disc flipping over and back in 2×90ms.
- With sound on: a thump and a clack cascade.

**Hit**
1. The net tears at the impact point: strands within 6 discs are removed and loose ends of 2–3 discs dangle.
2. The board wipes column by column, left to right at 6ms per column, into that project's screen: a 54×54 Atkinson-dithered image on the left, a dot headline and a stat on the right.
3. The screen holds for 6s, or until WIPE BOARD, Esc or the next grab. Then it wipes home with that bullseye filled and checked, and the net hole kept.
4. Meanwhile:
   - The project's typed card slides in on the right with colour media, two sentences and 'Read the case study ↗'.
   - A marker circle scribbles around the card (SVG stroke-dashoffset, 380ms).
   - THROWS and HITS tick up, and BOAT HEALTH drops 25%.

The Memory Care hit is deliberately quieter: a single soft thump, with no clack cascade.

**Other results**
- **Near miss** (within 1.6× radius, no assist): the board flashes 'NEAR MISS. ONE MORE.' for 1s.
- **Miss:** the board flashes 'DID YOU STEP OUT OF FRAME?' for 1.4s, then returns home. No penalty.
- **Face target hit:** the dithered face flips to a dithered photo of kid me in sunglasses, and the marquee prints 'M.HCI+D UW 2024 · BFA CCA 2020 · I HAVE A CAT'.

**Finale** (all four projects hit)
1. Boat health reaches 0.
2. The net snaps, strands cascading down over 600ms.
3. A 2.5s beat while Baby J wriggles free.
4. The calf swims across the whole board on a sine path.
5. The board settles on 'BABY J IS FREE' / 'SAY HI: HRIDAEW@GMAIL.COM'.
6. Card 2 types a PLAYTEST LOG at 28ms per character, plus a link to Saving Baby J.

**Direct and keyboard**
- Each target label is a real <button> that auto-throws a guaranteed hit.
- Keys 1–4 do the same; 5 throws at the face.
- Space throws at board centre, S toggles sound, Esc wipes the board.

**Signature moment:** flinging a plush orca and watching a shockwave of discs clack over into Wayne Wong's 1946 photograph. The one people repeat: missing, and the board politely asking 'DID YOU STEP OUT OF FRAME?'.

## 5. Content map & copy
**Board screens** (desktop lines ≤12 characters; the phone wraps):
| Project | Dithered image | Headline | Stat |
|---|---|---|---|
| DOMIS | red-brick house | 'ADDRESS.' 'PHOTO.' 'REPORT.' | '+60% NEW-USER ENGAGEMENT' |
| VIRDIO | calibration stick-figure sketch | 'NO $1,500 BIKE.' 'A CAMERA.' | '−50% HANDOFF TIME' |
| OBSCURA | crop of Wayne Wong's girl in a kimono | 'WAYNE WONG' 'JAPAN 1946' | '300+ PHOTOS · SOLD OUT' |
| MEMORY CARE | plush cat | 'PET IT.' 'IT PURRS.' | '98% POSITIVE' |

**Card 1 (bio):** 'I'm Hridae Walia (ri-they waliaa), a product designer. I have 6 years of experience designing for interaction models that barely exist yet, and I learn by making, on the canvas, in code, or in the physical world. Founding Product Designer at Domis, San Francisco. M.HCI+D, University of Washington, 2024. BFA Interaction Design, California College of the Arts, 2020.' A small photo of kid me in sunglasses is taped on.

**Card 2 (index):** DOMIS ↗ · VIRDIO ↗ · OBSCURA ↗ · MEMORY CARE ↗, then 'hridaew@gmail.com [COPY]' and 'LinkedIn · GitHub · CV'.
- Copy calls clipboard.writeText inside the click and selects the text on rejection.
- All links are absolute, target=_blank rel=noopener.

**Project cards:**
- **DOMIS** (taped looping app video) → https://hridaew.com/domis: 'Founding Product Designer, Nov 2024–now. Domis is a home maintenance app that learns your house from the smallest action you'll actually take: an address, a nameplate photo, an inspection report. My 3D home-avatar prototypes drove a 60% lift in new-user engagement.'
- **VIRDIO** (photo of the AR workout) → https://hridaew.com/virdio: 'Product Designer, 2021–2022. Hardware-free AR fitness: an ordinary camera reads your body and counts punches, squats and jumps, and AR objects double as hit boxes. Shipped on six platforms; my design tokens cut handoff time 50% across four.'
- **OBSCURA** (spectator photo) → https://hridaew.com/obscura: 'Interaction design, prototyping, Unity. MOHAI, Seattle, 13 Sep 2025, sold out. 300+ never-seen photographs by Wayne Wong, a Signal Corps soldier in 1946 Japan; a visitor looks in VR while an audience watches through their eyes. Photograph on the board: Wayne Wong, 1946.'
- **MEMORY CARE** (residents with the haptic cat) → https://hridaew.com/memory-care: 'Interaction Designer with Maria Mortati Experience Design, 2020–2023. I hacked plush cats with pressure sensors and vibration motors so petting one makes it purr, and moved the haptics to a footrest so 100% of residents could reach them from their wheelchairs. 98% positive across 200+ sessions. Fast Company World Changing Ideas 2022 finalist · CABHI 2× award recipient · SCAN Foundation Innovation Award.'

**Card 3 (SIDE PROJECTS):**
- 'Saving Baby J: this board, basically ↗' → https://hridaew.com/waffling/orca
- 'Savor: phone video → 3D Gaussian splat, no cloud ↗' → https://hridaew.com/waffling/savor
- 'Recorder-Proto: scrub a voice memo like a turntable ↗' → https://hridaew.com/waffling/recorder
- 'Butter Chicken: taste scales linearly with butter ↗' → https://hridaew.com/butter-chicken

**PLAYTEST LOG** (typed into card 2 at the finale): 'PLAYTEST LOG · your browser · Throws 7 · Hits 4 · Near misses 1 · Accuracy 57% · Tutorials needed 0. Same as the real booth: the throw won.'

## 6. Plain path & accessibility
- Card 2 is always visible: in the right column on desktop, directly under the throw zone on phones.
- The first tab stop is 'Skip to case studies'.
- Target buttons auto-throw, so Tab then Enter frees any project with no aim.
- The visible board name is canvas pixels, so a real <h1> 'Hridae Walia, product designer' is visually hidden; card 1 repeats it.
- The board canvas is role=img with an aria-label for the current screen.
- Hit, near-miss and miss announcements go through aria-live=polite.
- Cards are <article>s, each with an <h2>.

## 7. Reduced motion & mobile
**Reduced motion:**
- the orca appears at the impact point with a 120ms fade instead of flying
- no shockwave
- the board swaps instantly instead of the column wipe
- a static freed calf instead of the swim
- the marquee holds still

**Mobile:**
- A 40×60 board.
- The throw zone is the only touch-action:none region; the page scrolls natively everywhere else.
- Clack voices are capped at 6 per frame, and the column wipe steps 2 columns at a time.
- DPR ≤2.

## 8. Tech plan
Canvas 2D and vanilla JS, no CDN. Override the artifact host reset: margin, background, font and img max-width.

**Board canvas** (DPR ≤2)
- A sprite atlas, regenerated on resize, holds 2 faces × 7 flip phases at the current disc size. The disc's y-scale is |cos φ|, the face swaps past 90°, and each sprite carries the axle and a mid-flip glint.
- Disc state lives in typed arrays: face, target and t0.
- A ring-buffer dirty list means each rAF redraws only animating discs and drops them when they finish.
- 6,480 discs on desktop, 2,400 on phone.

**Content to bitmaps**, built once at load:
- **Text:** Jersey 10 drawn into an offscreen canvas at board resolution and thresholded at 50%.
- **Images:** drawImage down to board resolution, then Atkinson dither with a per-image gamma and threshold. Results are cached as Uint8 bitsets.
- **Sprites:** Baby J, the boat and the net are hand-authored 1-bit arrays. The net is a diamond lattice with a tear mask.
- **Pixel sources:** inlined as data-URI webp, so readback is never tainted.

**Overlay canvas**
- The orca: an inline-SVG stitched plush, pre-rasterised at 3 sizes.
- The aim arc and reticle.
- Shadow sprites pre-blurred at 4 levels.

**Throw mapping.** Release velocity v sets the landing point L:
- L.x = orcaX + vx·k
- L.y = boardBottom − clamp(−vy·s, 0, boardH)
- anything past the top edge is a miss

**Audio**, after the toggle:
- **Clack:** a 4ms noise burst through a 2.5kHz bandpass, randomised. All clacks in a frame are mixed into one AudioBuffer and played by a single source.
- **Thump:** a 70Hz sine with a 120ms decay.

**Lifecycle.** Loops pause on visibilitychange and when an IntersectionObserver reports the board off-screen.

**Hardest part:** 60fps disc cascades on phones, and a throw feel and aim assist that land where people meant across mouse, trackpad and touch.

**Performance budget:** JS ≤55KB, media ≤3MB.

## 9. Media
Paths are relative to public/assets.

**Dither sources** (tight-cropped greyscale webp, ~200px, inlined):
- domis/live/home-avatar.png
- virdio/sketch_angle_calibration.jpg
- obscura/wayne_girl_kimono.jpg, cropped to face and upper body
- grid/memorycare-cat-straight.png
- home/hero-face-badge.png, at 64px
- about/childhood.png, cropped to the kid (x 55–185) at 64px

**Card media (media/):**
| Source | Processing |
|---|---|
| home/domis-card2-anim.mp4 | 300w, crf 30, -an, with poster |
| virdio/in_context.png | 800w webp |
| obscura/spectatorIMG.png | 700w webp |
| memory-care/cathero.png | 900w webp |
| about/childhood.png | 263w webp |
| orca/throw-test.jpg | 300w webp |
| savor/mighty-hand-1.jpg | 300w webp |
| recorder/card.png | 300w webp |
| butter-chicken/hero.jpg | 300w webp |

**Reference only, not copied:** orca/giant-controllers.jpg, orca/final-booth.jpg and orca/game-ui.jpg, for cabinet, boat and net styling.

## 10. Acceptance checklist
- [ ] With no input, the first frame shows the name on the board, four labelled targets, card 1 and card 2 with all links and the email, at 1440×900 and 390×844.
- [ ] A slingshot throw and a touch flick both reach all four targets; aim assist snaps landings within 1.2× radius.
- [ ] A hit triggers the shockwave, net tear, column wipe to the project screen, project card, counters and a 25% health drop.
- [ ] A miss shows 'DID YOU STEP OUT OF FRAME?' for about 1.4s; a near miss shows 'NEAR MISS. ONE MORE.'
- [ ] The face target flips to the childhood photo and prints the bio line.
- [ ] Four hits run the finale: snap, beat, swim, email on the board, and the typed playtest log.
- [ ] Keys 1–5 and the target buttons auto-throw; Esc wipes; S toggles sound (off by default).
- [ ] A full-board cascade holds ≥55fps on desktop Chrome and a mid-range phone profile.
- [ ] Reduced motion behaves as specified.
- [ ] The page scrolls natively outside the throw zone on phones; no horizontal overflow from 360 to 2560px.
- [ ] No console errors; only the four specified fonts load.