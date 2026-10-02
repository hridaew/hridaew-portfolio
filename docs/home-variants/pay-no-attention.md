# Pay No Attention (`pay-no-attention`)

> A fictional 1980s LCD handheld where you play the hidden Wizard of Oz behind four of my prototypes, pulling the right lever to fake each one before the test participant gets suspicious; lose, and the curtain falls on me.

Fonts: Doto, Archivo  
Palette: #1F5A49, #3B7A66, #CFE3C4, #C7C9C2, #8E918A, #B3B79B, #1A1C14, #D61F69, #E1E6E3, #15171A  
Source concepts: play-2, instrument-1, vernacular-2

# Pay No Attention: build spec

## 1. Concept & thesis
The page is a fictional 1980s LCD handheld, the HW-26 'Wizard of Oz'. You are the hidden operator behind my prototypes. A test participant tries four of my projects, and you pull the lever that fakes each one before they get suspicious. Lose, and the curtain falls on me.

Grounding: I prototype by faking it first. For Saving Baby J I Wizard-of-Oz tested giant cardboard orca controllers against throwing plushies while someone scored hits offstage. The throw won.

Each lever is one project's core interaction model, the thing a hidden wizard would have to fake if it weren't built:
| Lever | Project | Interaction model |
|---|---|---|
| PURR | Memory Care | the hacked plush cats: pressure sensor → purr |
| COUNT | Virdio | counting squats from an ordinary camera |
| RESEARCH | Domis | a nameplate photo or an address → three searches → one consensus |
| RELAY | OBSCURA | one visitor's gaze relayed to an outside audience |

The LCD's ghost segments, every state pre-drawn and lit only on demand, are how a prototype's states work. The device's tactile skeuomorphism nods to Recorder-Proto.

## 2. Visual system
**Fonts**
- **Doto** (dot-matrix variable, wght 600; fallback 'Courier New', monospace): the 20×4 character LCD.
- **Archivo** (wdth 62–125, wght 100–900; fallback 'Arial Narrow', Arial, sans-serif):
  - Silkscreen labels: wdth 62, wght 800, uppercase, +0.08em, 10–13px.
  - Manual body: wdth 100, 400/700, 16px/1.5.
  - Manual heads: wdth 75, wght 800, 28–44px.
- 7-segment digits are SVG, not a font.

**Tokens**
| Token | Hex | Use |
|---|---|---|
| --mat | #1F5A49 | page background |
| --mat-grid | #3B7A66 | 1px lines every 38px, heavier every 190px |
| --mat-ink | #CFE3C4 | ruler numerals (5.9:1) |
| --alu | #C7C9C2 | faceplate |
| --alu-shade | #8E918A | faceplate shade |
| --lcd | #B3B79B | LCD glass |
| --seg | #1A1C14 | lit segments (8.3:1); ghosts at 7% |
| --lever | #D61F69 | rhodamine magenta: levers, faceplate band, manual spot colour |
| --paper | #E1E6E3 | cool manual stock |
| --print | #15171A | manual ink (14:1) |

**Textures**
- **Faceplate:** brushed aluminium from repeating-linear-gradient hairlines plus SVG noise.
- **LCD:** polarizer gradient (#B3B79B → #A7AC8E) with faint reflector speckle. Every lit segment casts a 1.5px offset shadow onto the reflector, the giveaway of a real LCD.
- **Levers:** domed (radial-gradient specular) and press 2px.
- **Cutting mat:** faint knife scratches (SVG lines at 4%).
- **Manual:** a folded leaflet with crease shading. Thumbnails are two-colour halftones (greyscale × --lever, multiply).

**Desktop 1440×900**
- The open clamshell stands in the left third: x 6vw, rotated −2°, height ≤100dvh−64px, width ≈ .62×height.
- The manual lies open on the right (x 46vw → 95vw), rotated +1.5°, crossing the mat's ruler edge.
- Nothing is centred.

**Phone 390×844**
- The device is full width inside 16px gutters, unrotated. Top to bottom: character LCD (20 chars at ≥14px), hinge, 4:3 segment LCD, 2×2 levers of 72px, then a slim row with GAME A / GAME B / TIME / SOUND.
- It fits 844px.
- The manual follows in normal scroll; a 'MANUAL ↓' silkscreen tab on the device jumps to it.

## 3. First frame at rest
- **Background:** the green cutting mat.
- **The handheld:**
  - It opens in its ACL test: every segment lit for 1.2s, so the whole cast is visible at once (participant, cat, cone, appliance, headset, wires, curtain, wizard at four levers, audience heads, '8888'). Then it drops into attract mode.
  - Top LCD: 'HRIDAE WALIA' / 'PRODUCT DESIGNER, SF' / 'FOUNDING PD @ DOMIS' / 'PRESS ANY LEVER'.
  - Silkscreen above the screen: 'HW-26 · WIZARD OF OZ'.
- **The manual cover, on the right:** 'PAY NO ATTENTION. Instruction manual. You are the wizard. A participant is testing four of my prototypes. Make each one work before they notice it's you.'
- **The contents:** HOW TO PLAY · THE LEVERS (the four case-study links) · ALSO AVAILABLE · ABOUT THE WIZARD · CUSTOMER SERVICE, all visible.

## 4. Interaction model
**Controls**
- Four lever buttons: PURR (cat icon), COUNT (cone), RESEARCH (house), RELAY (eye). Keys 1–4 or A/S/D/F also work.
- Small buttons: GAME A, GAME B, TIME, a recessed ACL.
- A SOUND slide switch, off by default.
- A 'PRACTICE: no fuse' checkbox in the manual.

**Attract mode**
- After the ACL test, an always-right demo wizard plays: the participant reaches for cat → cone → nameplate → headset, one every ~2.4s.
- Each success prints that project's fact on the top LCD and lights its faceplate lamp.
- A visitor who touches nothing sees all four projects within about 10s.
- The first lever press starts GAME A instantly, with no menu.

**GAME A**
- Beats start at 280ms and speed up ×0.95 per success, down to 170ms.
- **Turns.** The participant reaches for a prop drawn from a shuffled bag, so all four appear in the first four turns. A 5-dot fuse burns one dot per 440ms: a 2.2s first window, never shorter than 1.0s.
- **Correct lever:**
  1. The lever segment flips.
  2. A dashed wire carries the signal across in three steps.
  3. The prototype responds:
     - PURR: purr arcs over the cat.
     - COUNT: rep digits tick above the cone, then a check.
     - RESEARCH: three tiny search bars converge into one check over the appliance.
     - RELAY: three audience heads turn toward a small screen with a gaze dot.
  4. Score +1 on the 7-segment display; the project's lamp lights; the top LCD prints its fact.
  5. In the manual, the matching entry gets a magenta marker underline and its halftone thumbnail swaps to the real colour still over 400ms.
- **Wrong or late lever:** a '?' eyebrow lights above the participant.
- **The third '?':**
  1. The curtain drops in three clunky steps of 160ms.
  2. It reveals the wizard: my thresholded silhouette at the levers, which was faintly visible as a 7% ghost the whole time.
  3. The top LCD scrolls 'PAY NO ATTENTION TO THE DESIGNER BEHIND THE CURTAIN', then 'HI. I'M HRIDAE.', then 'HRIDAEW@GMAIL.COM', then 'SCORE 014 · ANY LEVER'.
  4. A typed slip, PARTICIPANT NOTES, slides out from under the device at 28ms per character: 'Session {n} · Levers pulled {x} · In time {y} · Participant got suspicious at {lever}.'
  5. A 1.2s lockout runs before a restart is possible.

**Other modes**
- **GAME B:** faster, and sometimes shows two props at once. Pressing both within 150ms plays a chord.
- **Bonus:** between props, an orca plush crosses the top of the LCD in six steps. Any lever catches it for +5, and the top LCD reads 'WOZ-TESTED: THE THROW WON'.
- **TIME:** San Francisco time on the 7-segment digits (Intl, America/Los_Angeles), colon blinking at 1Hz.
- **ACL:** resets everything.
- **Tab hidden mid-game:** play pauses and the top LCD reads 'WIZARD AWAY. PARTICIPANT IS WAITING.' Any lever resumes, with no penalty.

**Timing and feedback**
- Segments switch with a 90ms opacity transition; levers depress in 60ms.
- navigator.vibrate(12) on each lever press (Android).
- With SOUND on, square-wave piezo beeps:
  - lever: 1.4kHz, 40ms
  - success: 2.1kHz twice
  - fail: 220Hz, 180ms

**Signature moment:** losing. The third eyebrow lights, the curtain drops in three steps, and there I am at the levers, a ghost segment that was visible the whole time.

## 5. Content map & copy
**Top-LCD facts** (20 chars × 4 lines):
| Project | Line 1 | Line 2 | Line 3 | Line 4 |
|---|---|---|---|---|
| Memory Care | MEMORY CARE 2020-23 | PLUSH CATS PURR | 98% POSITIVE | 200+ SESSIONS |
| Virdio | VIRDIO 2021-22 | CAMERA COUNTS REPS | NO $1,500 BIKE | 6 PLATFORMS |
| Domis | DOMIS 2024-NOW | 3 SEARCHES -> 1 | PHOTO -> GUIDE | +60% ENGAGEMENT |
| OBSCURA | OBSCURA MOHAI 2025 | GAZE -> AUDIENCE | WAYNE WONG 1946 | SOLD OUT |

**Manual**
- **HOW TO PLAY:** the rules and keys from §4.
- **WHY A WIZARD:** 'Before I build something, I often fake it. For Saving Baby J I Wizard-of-Oz tested two controllers: giant cardboard orcas, and throwing plushies at a screen while someone scored hits offstage. The throw won, and nobody needed a tutorial. The four levers here are things I did build for real.'
- **THE LEVERS:** one entry per project with lever name, role, years, two sentences, a halftone thumbnail, and 'Read the case study ↗'. Links are absolute, target=_blank rel=noopener.
  - **PURR · Memory Care Experience Station** → https://hridaew.com/memory-care
    - Interaction Designer with Maria Mortati Experience Design, 2020–2023.
    - 'For people living with mid-to-late stage dementia, I hacked three plush cats with pressure sensors and vibration motors on an Arduino: petting one makes it purr and plays that cat's video. I moved the haptics to a footrest so 100% of residents could reach them from their wheelchairs, and evaluations were 98% positive across 200+ sessions.'
    - Recognition: 'Fast Company World Changing Ideas 2022 finalist · CABHI 2× award recipient · SCAN Foundation Innovation Award'.
  - **COUNT · Virdio** → https://hridaew.com/virdio
    - Product Designer, 2021–2022.
    - 'Hardware-free AR fitness: machine vision reads your body through an ordinary camera and counts punches, squats and jumps. I shipped it across iOS, Android, web, desktop, Apple Watch and smart TV, and my design tokens cut asset and handoff time 50% across four platforms.'
  - **RESEARCH · Domis** → https://hridaew.com/domis
    - Founding Product Designer, Nov 2024–now.
    - 'Domis learns a house from the smallest action a person will take: an address (three independent searches, then a review agent keeps what they agree on), a nameplate photo (an auto-researched guide), an inspection report (tasks found). My 3D home-avatar prototypes drove a 60% lift in new-user engagement.'
  - **RELAY · OBSCURA** → https://hridaew.com/obscura
    - Interaction design, prototyping, Unity. MOHAI, Seattle, 13 Sep 2025, sold out.
    - 'MOHAI handed us 300+ never-seen photographs by Wayne Wong, a Signal Corps soldier in 1946 Japan. A visitor views them in VR while gaze tracking relays what they look at to an audience outside, and leaves with a photo strip of where they looked.'
- **ALSO AVAILABLE FROM THE SAME WIZARD:** a mock catalogue of handhelds, each linked:
  - Savor: 'phone video → 3D Gaussian splat, no cloud' → https://hridaew.com/waffling/savor
  - Saving Baby J: 'throw orca plushies at a hit board' → https://hridaew.com/waffling/orca
  - Recorder-Proto: 'turntable scrub, cassette eject' → https://hridaew.com/waffling/recorder
  - Butter Chicken: 'taste scales linearly with butter' → https://hridaew.com/butter-chicken
- **ABOUT THE WIZARD:**
  - the full thesis line
  - 'Founding Product Designer at Domis, San Francisco. Pronounced ri-they waliaa.'
  - 'M.HCI+D, University of Washington, 2024 · BFA Interaction Design, California College of the Arts, 2020'
  - toolkit: Pencil, Paper, Figma, Cursor, Claude Code, Xcode, Origami, ProtoPie
  - 'I have a cat.', with a halftone of me holding my cat
- **CUSTOMER SERVICE:** 'hridaew@gmail.com [COPY]', LinkedIn, GitHub, CV. Copy calls clipboard.writeText inside the click and selects the text on rejection.

## 6. Plain path & accessibility
- The manual is the plain index: always on screen on desktop, directly below the device on phones.
- The first tab stop is 'Skip to manual', and the device also has its 'MANUAL ↓' tab.
- Semantics:
  - The device is a <section aria-label='HW-26 handheld game'>.
  - The segment SVG is role=img with a state summary.
  - A polite live region mirrors the top LCD when facts print and on game over (not every beat).
  - During play, a visually hidden assertive cue announces each prop, e.g. 'Plush cat. PURR.'
  - Levers are <button>s with aria-keyshortcuts.
- PRACTICE (no fuse) makes the game playable with a screen reader.

## 7. Reduced motion & mobile
**Reduced motion:**
- the device isn't rotated
- levers change colour without a depress animation
- attract beats slow to 600ms
- the curtain drops in a single step
- the ACL fades segments on rather than flashing
- game rules are unchanged, since they are already discrete

**Mobile:**
- Laid out as in §2.
- Buttons use pointerdown with touch-action:manipulation for zero latency.
- No hover-only content.
- The device plus the manual tab fit in 844px.

## 8. Tech plan
Pure DOM, CSS, inline SVG and vanilla JS: no canvas render loop and no CDN. Override the artifact host reset: margin, background, font and img max-width.

**Segment LCD.** One inline SVG, viewBox 0 0 400 300, in a fixed 4:3 box.
- About 40 segment groups, each a <g data-seg> of filled paths (no strokes) in --seg.
- Opacity goes from .07 (ghost) to .93 (lit) with a 90ms transition.
- One drop-shadow(1.5px 1.5px 0 rgba(26,28,20,.28)) filter on the segment layer.

Segment inventory:
- **Participant:** five poses (idle, stroking the cat, squatting by the cone, phone to the nameplate, wearing the headset).
- **Props and scenery:** four props, the table, three eyebrows, five fuse dots.
- **Wires and levers:** 4×3 wire dashes; four levers, each with up and down states.
- **Wizard:** the wizard mask plus four arms; the curtain at ⅓, ⅔ and full.
- **Responses:**
  - purr arcs ×3
  - 2-digit rep counter and checks ×2
  - three search bars apart plus one converged
  - audience heads, three in two poses, with a screen and a gaze dot
- **Game furniture:** the orca at six positions; the 4-digit score; the colon.

**Photo-derived segments.** The plush cat, the cone and my silhouette are 1-bit PNG masks thresholded at build time with ImageMagick, with a separate threshold per image so the cat's eyes and my smile survive.
- They are inlined as data URIs and used as SVG <mask>, positioned in the same % coordinates.

**Character LCD.** 80 cells (20×4) of Doto glyphs, each over a CSS radial-gradient 5×8 ghost dot grid at 7%.

**Game loop.** A fixed-step rAF accumulator with states ATTRACT / PLAY / OVER / TIME / PAUSED. DOM writes only toggle classes when state changes. It pauses on visibilitychange.

**Audio.** WebAudio square-wave beeps, with the context created when the SOUND switch is first flipped.

**Hardest part:** drawing about 40 segments that read instantly at 340px wide, never overlap ambiguously, and are still charming; and tuning the mask thresholds.

**Performance budget:** JS ≤40KB, SVG ≤30KB, media ≤1.5MB.

## 9. Media
Paths are relative to public/assets.

**Masks (inline data URIs):**
| Source | Processing | Output |
|---|---|---|
| grid/memorycare-cat-straight.png | 1-bit mask, 180px | seg-cat |
| virdio/cone.png | 1-bit mask, 140px | seg-cone |
| home/hero-face-badge.png | thresholded, ~120px, eyes, brows and smile kept | seg-wizard |

**Manual thumbnails (media/).** Each project image gets a greyscale webp at 520w for the halftone and a colour webp at 520w for the success swap:
- memory-care/cathero.png
- virdio/in_context.png
- domis/hero-mobile.png
- obscura/spectatorIMG.png

**Catalogue thumbnails (media/, 300w greyscale webp):** savor/mighty-hand-1.jpg, orca/throw-test.jpg, recorder/card.png, butter-chicken/hero.jpg.

**About:** about/cat.png → 400w webp.

## 10. Acceptance checklist
- [ ] The ACL test plays, then attract mode prints all four project facts within 12s with no input.
- [ ] The first frame shows name and role on the top LCD, plus the manual cover and contents with four case-study links.
- [ ] Pressing 1 during attract starts GAME A immediately.
- [ ] A correct lever adds score, lights the lamp, prints the fact, and swaps the manual entry's underline and thumbnail to colour.
- [ ] Three misses drop the curtain in three steps, light the wizard silhouette, scroll the email, and show the participant notes.
- [ ] Keys 1–4 and A/S/D/F work; PRACTICE disables the fuse.
- [ ] Hiding the tab mid-game pauses with 'WIZARD AWAY'; a lever resumes.
- [ ] The device fits 390×844 with ≥72px levers; there is no horizontal overflow from 360 to 2560px.
- [ ] Manual links are absolute with target=_blank; Copy works with its fallback.
- [ ] Reduced motion behaves as specified.
- [ ] No console errors; only Doto and Archivo load.