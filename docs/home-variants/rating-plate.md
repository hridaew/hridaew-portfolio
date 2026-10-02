# Rating Plate (`rating-plate`)

> I am the riveted, brushed-aluminium rating plate of an appliance called HRIDAE WALIA, PRODUCT DESIGNER, lit by a live metal shader. Point a Domis-style scanner at it and three ink-printed searches slide into register: black where they agree, honest blanks where I'm not a house.

Fonts: Michroma, Barlow Condensed, Martian Mono  
Palette: #B4231A, #6E120D, #C9CED2, #F1F3F4, #121417, #FFFFFF, #F4F5F2, #00A0D6, #D9007E, #FFE100, #141414  
Source concepts: vernacular-1, provocateur-1, play-2

# Rating Plate: build spec

## 1. Concept & thesis
The home page is the riveted, brushed-aluminium rating plate of an appliance called HRIDAE WALIA, PRODUCT DESIGNER. It sits on hot range-red enamel and is lit by a live metal shader that follows your pointer. Point the Domis-style scanner at it and a staged agent 'researches the plate':
- three searches print as three offset process-ink lanes
- they slide into register, black only where all three agree
- an auto-researched guide follows, whose four 'manuals' are the case studies

Grounding: two Domis mechanics.
1. **The appliance-nameplate scanner.** A photo returns manuals, common repairs, the serial number and warranty tracking.
2. **The address flow.** Three independent home-fact searches; a review agent then returns a consensus payload of agreed fields and blanks.

The scanner prompt is word for word from my research shot (gemini-appliance-label.jpg). That shot's label is a household electric range, which sets the plate's model / serial / 'Assembled in' layout and is why the enamel is range red. Every field is a true fact in an invented format, and the page says plainly that it is a staged demo.

## 2. Visual system
**Fonts**
| Font | Use | Fallback |
|---|---|---|
| Michroma | plate name (44px desktop / 28px phone, caps, +0.06em) and section heads (18px) | 'Eurostile', 'Arial Black', sans-serif |
| Barlow Condensed 500/600 | plate labels (12px caps, +0.12em), values (18–20px), guide body (18px/1.45) | 'Arial Narrow', sans-serif |
| Martian Mono (wdth 75–112.5, wght 400–600) | scanner tags and readout, 12–13px | ui-monospace, Menlo, monospace |

**Tokens**
| Token | Hex | Use |
|---|---|---|
| --enamel | #B4231A | range red; white on it 6.6:1 |
| --enamel-deep | #6E120D | seams, louvre shadows |
| --alu | #C9CED2 | plate |
| --alu-hi | #F1F3F4 | plate highlight |
| --etch | #121417 | debossed type; 11.6:1 on --alu |
| --scan | #121417 | viewfinder brackets and OCR boxes |
| --scan-key | #FFFFFF | 1px keyline on scanner marks |
| --paper | #F4F5F2 | readout roll and guide |
| --ink-c | #00A0D6 | lane A (process cyan) |
| --ink-m | #D9007E | lane B (process magenta) |
| --ink-y | #FFE100 | lane C (process yellow) |
| --reg | #141414 | registration black |

There is no other accent: the scanner is black.

**Shader materials**
- orange-peel enamel clearcoat
- horizontally brushed aluminium with a few long scratches
- a thumbprint smudge on the plate's lower left
- four domed rivets and three debossed certification rings
- a shallow dent in the enamel, lower right
- five stamped louvres along the bottom, so the enamel reads as the side of a range

**DOM materials**
- a white-vinyl CAUTION decal with a black border
- four stamped tabs
- the readout as a paper roll feeding from a black slot

**Desktop 1440×900** (hero = 100dvh)
- The plate: left edge 6vw, top 11vh, width min(780px, 56vw), riveted flat.
- The readout column takes the right 32vw behind a 1px --etch rule. The paper roll feeds from a slot at its top.
- Below the hero, the guide is a --paper sheet with a perforated top edge, left-aligned at 6vw, max-width 1100px.

**Phone 390×844**
- The plate reflows to portrait (real plates come in portrait): rows stack label-over-value, rivets stay at the corners, 16px gutters.
- 'Scan plate' sits directly under the plate, followed by the readout.
- The consensus becomes stacked field cards, each with three source chips (C / M / Y).
- The guide follows, with manual covers 2-up.

## 3. First frame at rest
**Full-bleed red enamel** with a soft two-pane window reflection and louvres along the bottom.

**The plate**, debossed:
- 'HRIDAE WALIA'
- 'PRODUCT DESIGNER · SAN FRANCISCO, CALIF.'
- 'pronounced ri-they waliaa'

Then these rows:
| Field | Value |
|---|---|
| MODEL PD-6Y | 'designs for interaction models that barely exist yet' |
| SERIAL | CCA2020·UW2024·DOMIS2024 |
| INSTALLED AT | 'Domis · Founding Product Designer · Nov 2024–' |
| INPUT | 'Pencil · Paper · Figma · Cursor · Claude Code · Xcode · Origami · ProtoPie' |
| OUTPUT | 'iOS · Android · Web · Desktop · Watch · TV · VR · Arduino' |
| SUB-ASSEMBLIES | four stamped tabs, DOMIS / VIRDIO / OBSCURA / MEMORY CARE STATION, each a real link |
| SERVICE | 'hridaew@gmail.com' [COPY] |

Also on the plate:
- Three rings along the bottom.
- A CAUTION decal: 'Obsessed with making. Will prototype in code, in foam core, or in a plush cat.'
- A razor-thin vertical streak of light across the brushing.

**Right column:** the readout slot with the prompt bubble, a black 'Scan plate' button, a quieter 'Skip to manuals ↓', and a small note: 'Staged demo: the flow Domis runs on a house, run on me.'

**Black viewfinder brackets** are parked on the plate's top-right corner.

## 4. Interaction model
**Light**
- Pointer position maps to light direction: normalize(x·.9, −y·.7, .6), followed through a critically damped spring (ω 9, about 600ms of lag).
- Touch: a tap anywhere on the hero sets the light target. Scrolling within the hero sweeps the light's elevation (passive listener).
- Idle: an 18s window-light drift loop.
- There are no device-orientation APIs.
- The plate is brushed along x, so Ward αx .06 / αy .45 makes a vertical razor streak that slides sideways with the light.
- Debossed letters get a lit bevel on one edge and a shadow on the other. Rivets get pin speculars. The clearcoat's window reflection drifts the opposite way.

**Scan, whole plate.** Click 'Scan plate', or press S, or Enter on the focused button.
- The viewfinder steps through MODEL, SERIAL, INSTALLED AT, INPUT, OUTPUT, SUB-ASSEMBLIES, SERVICE and the rings, one every 260ms.
- Each step: a 90ms snap with no bounce, a 1-frame white shutter flash, and a black OCR box with a key and an illustrative confidence tag ('model_no 0.99', 'serial 0.97', 'tools[] 0.94', 'listings[3] 0.91').

**Scan, one field.** Drag the viewfinder over any field and hold for 500ms.
- The viewfinder is the only touch-action:none element. Arrows move it 16px, Shift+arrows 64px.
- It locks with a relay tick and researches only that field.
- Framing a SUB-ASSEMBLIES tab scrolls to and expands that project's manual, the way one nameplate photo returns that appliance's manual.

**Research roll**
1. Paper feeds from the slot in six 40ms stepper jerks.
2. It prints the prompt: 'What information can you extract from this image? Try to find and research everything.'
3. Three lanes run with independent progress bars that finish at different times: A 'CV' (cyan), B 'hridaew.com' (magenta), C 'case studies' (yellow).
4. Each lane prints its own copy of the field table in its ink, with mix-blend-mode:multiply on the paper. The copies are offset (A −10/−4px, B +8/+3, C +3/+9) and rotated ±0.4°, so the whole thing reads as a misregistered three-colour print.

**Review**
1. A black lever handle, 'REVIEW AGENT', sits on the roll's edge. Drag it down, or press 'Cross-reference', or press R.
2. The lanes slide into register over 900ms (ease-out).
3. Rows where all three agree overprint to near-black and get a ✓.
4. On partial rows the ghosts fade to 35%, and the consensus column prints the kept value in --reg with '(1 of 3; kept)'.
5. Empty rows print '— (blank: not a house)'.

**Guide.** Always rendered below the hero; no scan is required.
- Clicking a manual cover expands it in place (280ms ease-out height) into a spec page with 3 bullets, 2 images and 'Open full manual ↗'.

**Attract.** After 6s idle (once per load), the viewfinder steps across two fields to demonstrate itself, then parks.

**Sound.** Off by default. The toggle enables a shutter tick and a relay click.

**Signature moment:** moving your hand and watching a razor streak sweep across the debossed HRIDAE WALIA. Then dragging REVIEW and watching three coloured lanes print black where they agree, leaving honest blanks like 'year built — (blank: not a house)'.

## 5. Content map & copy
**Consensus table** (header: 'review agent: cross-referencing 3 payloads').
| Field | Consensus | Status |
|---|---|---|
| name | Hridae Walia | ✓ |
| role | Product Designer | ✓ |
| current | Founding Product Designer, Domis (Nov 2024–) | ✓ |
| location | San Francisco | ✓ |
| education | M.HCI+D, University of Washington 2024 · BFA Interaction Design, CCA 2020 | ✓ |
| platforms shipped | iOS · Android · web · desktop · Apple Watch · smart TV · AR/VR | ✓ |
| toolkit | the INPUT list | ✓ |
| pronunciation | 'ri-they waliaa' | (1 of 3; kept) |
| accessories | '1 cat' | (1 of 3; kept) |
| signature dish | 'butter chicken' | (1 of 3; kept) |
| year built | '—' | (blank: not a house) |
| square footage | '—' | (blank: not a house) |
| roof type | '—' | (blank: not a house) |

Footer: 'Staged demo. Domis runs this for real on a house address.' There is deliberately no experience-years row, so the page never shows a discrepancy between my sources.

**Guide: MANUALS.** Four stapled covers with square corners, given equal weight. Links are absolute, target=_blank rel=noopener.

**1. 'DOMIS · Owner's Manual'** (cover: house avatar cutout) → https://hridaew.com/domis
- Summary: 'Founding Product Designer, Nov 2024–now. Domis learns a house from an address, a nameplate photo, an inspection PDF. My front-end prototypes of a personalised 3D home avatar drove a 60% lift in new-user engagement.'
- Bullets:
  - three independent searches + a review agent → a consensus payload of agreed fields and blanks
  - nameplate photo → an auto-researched guide: manuals, common repairs, serial number, warranty
  - messy inspection report → interactive 'Tasks found'
- Images: tasks composite, appliance-label research shot.

**2. 'VIRDIO · Setup & Calibration Guide'** (cover: AR workout room) → https://hridaew.com/virdio
- Summary: 'Product Designer, 2021–2022. Hardware-free AR fitness when engaging home fitness meant a $1,500 bike or mirror. Shipped across iOS, Android, web, desktop, Apple Watch and smart TV.'
- Bullets:
  - centre yourself with tilt indicators, walk to virtual cones at the corners, end on a green check
  - pushed desktop-first after testing showed mobile was the worst platform for the workout
  - design tokens cut asset and handoff time 50% across four platforms
- Images: calibration flow, 'Did you step out of frame?' recovery screen.

**3. 'OBSCURA · Exhibit Operating Instructions'** (cover: MOHAI vitrine) → https://hridaew.com/obscura
- Summary: 'MOHAI, Seattle, 13 Sep 2025, sold out. 300+ never-seen photos by Wayne Wong, a Signal Corps soldier in 1946 Japan.'
- Bullets:
  - gaze tracking in a VR booth (Meta Quest 3S)
  - an audience outside watches through the visitor's eyes
  - a photo-strip souvenir shows where each visitor looked
- Images: spectator photo, photo strip.

**4. 'MEMORY CARE STATION · Care & Handling'** (cover: residents with the cat) → https://hridaew.com/memory-care
- Summary: 'With Maria Mortati Experience Design, 2020–2023, at the SF Campus for Jewish Living.'
- Bullets:
  - three plush cats I hacked with pressure sensors and vibration motors on an Arduino: petting → purr + synced video
  - haptics moved to a footrest so 100% of residents could reach them from their wheelchairs
  - 98% positive across 200+ sessions
- Images: Arduino wiring, resident at the driving simulator.

**Guide: COMMON REPAIRS** (the smaller builds):
- 'Symptom: photos don't do Rodin's Mighty Hand justice → Fix: Savor, phone video to Gaussian splat, no cloud ↗' → https://hridaew.com/waffling/savor
- 'Symptom: walk-up visitors won't read instructions → Fix: Saving Baby J, just throw the plush orca ↗' → https://hridaew.com/waffling/orca
- 'Symptom: voice memos feel mundane → Fix: Recorder-Proto, turntable scrub + cassette eject ↗' → https://hridaew.com/waffling/recorder
- 'Symptom: butter chicken tastes flat → Fix: more butter (taste scales linearly) ↗' → https://hridaew.com/butter-chicken

**Guide: WARRANTY & LISTINGS.** Three rings set as plain type, not logos, captioned 'Memory Care Experience Station':
- Fast Company World Changing Ideas 2022 finalist
- CABHI 2× award recipient
- SCAN Foundation Innovation Award

**Guide: SERVICE**
- 'hridaew@gmail.com [COPY]': clipboard.writeText inside the click, selecting the text on rejection.
- LinkedIn, GitHub, 'Service manual (CV, PDF) ↗'.
- 'Accessories: 1 cat (included)', with a photo of me holding my cat.

**Index.** A static block at the bottom of the page repeats every link.

## 6. Plain path & accessibility
- The four SUB-ASSEMBLIES tabs are plain case-study links, visible in the first frame.
- 'Skip to manuals ↓' is the first tab stop after the skip link. The guide is always rendered, and the email is selectable on the plate.
- The plate is a <section aria-labelledby> wrapping a <dl> of real text; the shader only lights it. The canvas is aria-hidden.
- The viewfinder is a <button aria-label='Viewfinder. Arrow keys move it, Enter researches the framed field.'>.
- The readout is aria-live=polite and announces phases ('Search B finished', 'Consensus: 7 agreed, 3 kept, 3 blank').
- Manual covers are buttons with aria-expanded.

## 7. Reduced motion & mobile
**Reduced motion:**
- the light follows the pointer without spring lag, with no idle drift
- no shutter flash
- the viewfinder jumps without travelling
- the lanes print already in register, with a 'Show the three searches' toggle
- no attract

**Mobile:**
- portrait plate; the height map regenerates from the new layout
- tap-to-light
- only the viewfinder is touch-action:none, so page scroll is untouched
- the shader canvas covers only the hero and pauses via IntersectionObserver when scrolled away
- DPR ≤2 (1.5 on phone)

## 8. Tech plan
One WebGL1 canvas behind the hero DOM. No libraries, no CDN. Override the artifact host reset: margin, background, font and img max-width.

**Height map**
- After document.fonts.ready, measure each plate text node with Range.getClientRects.
- Draw the same strings, in the same computed font, at those rects on an offscreen 2D canvas, into R as recessed text. Put rivets, rings, louvres, the dent and the plate rectangle into G and B. Blur 2px and upload.
- Rebuild on a debounced (150ms) ResizeObserver and on font load.
- The DOM text stays real and selectable, coloured --etch. A CSS text-shadow driven by --lx/--ly (from the same light spring) seats it inside the shader's bevel.

**Shader**
- Normals come from finite differences of the height map.
- **Plate:**
  - Ward anisotropic specular with tangent x, αx .06, αy .45
  - hash-noise brushing and sparse scratches
  - the smudge mask lowers roughness locally
- **Rivets:** dome normals.
- **Enamel:**
  - Blinn clearcoat (n 180) with value-noise orange peel
  - a fake environment: two soft vertical window bars as a function of the reflected vector, plus a floor bounce
- The plate casts a drop shadow onto the enamel, offset opposite the light.
- A filmic tonemap finishes the image.

**DOM and CSS:** the readout, the OCR boxes (positioned from field rects, transform-only), the three lane copies (absolutely positioned, color var(--ink-x), multiply) and the guide. Lane transforms animate via rAF.

**Fallback without WebGL:** CSS brushed metal (repeating-linear-gradient hairlines plus a streak gradient positioned by --lx) and flat enamel with a radial highlight.

**Render loop:** render only when the light moves by more than 0.001. Pause when the hero is off-screen or the tab is hidden.

**Hardest part:** keeping the height map in exact register with live DOM text through font load, resize and the portrait reflow, and making the metal read as real brushed aluminium rather than a grey gradient.

**Performance budget:** shader ≤3ms on a mid-range phone; JS ≤45KB; media ≤4MB.

## 9. Media
All sources are under public/assets; outputs go to media/.

| Source | Processing | Output |
|---|---|---|
| domis/live/home-avatar-3d.png | 512px, keep alpha | domis-cover.webp |
| home/domis-card1-tasks-composite.png | — | domis-tasks.webp |
| domis/live/gemini-appliance-label.jpg | 800w | domis-scan.webp |
| virdio/in_context.png | 1000w | virdio-cover.webp |
| virdio/calibration_flow.png | 1000w | virdio-cal.webp |
| virdio/step_out_of_frame.png | 800w | virdio-step.webp |
| obscura/exhibition_743gm1tgvfizndo7gwveqtjp584.webp | — | obscura-cover.webp |
| obscura/spectatorIMG.png | 800w | obscura-spec.webp |
| obscura/photostrip_faces.png | 300w | obscura-strip.webp |
| memory-care/cathero.png | 1000w | mc-cover.webp |
| memory-care/cat_arduino_wiring.jpg | 900w | mc-wiring.webp |
| memory-care/resident_driving.png | 700w | mc-driving.webp |
| savor/mighty-hand-1.jpg | 360w | repair thumbnail |
| orca/throw-test.jpg | 360w | repair thumbnail |
| recorder/card.png | 360w | repair thumbnail |
| butter-chicken/hero.jpg | 360w | repair thumbnail |
| about/cat.png | 480w | cat.webp |

## 10. Acceptance checklist
- [ ] With no input, at 1440×900 and 390×844, the plate shows the name, role, rows, four linked sub-assembly tabs and the email with COPY, plus a visible light streak.
- [ ] Moving the pointer sweeps the streak with about 600ms of lag; a tap moves the light on touch; idle drift runs.
- [ ] Debossed text and the shader bevel stay in register after a resize from 1440 to 390 and back.
- [ ] 'Scan plate' steps through every field with OCR tags; drag-and-hold on the OBSCURA tab opens the OBSCURA manual.
- [ ] The three ink lanes print misregistered; REVIEW (drag, button or R) registers them; agreed rows read black; the 3 blanks read '— (blank: not a house)'.
- [ ] The guide's four manuals expand in place and link out (absolute, new tab); no 'CV says 5+' anywhere.
- [ ] The attract demo runs once after 6s idle; it is off under reduced motion.
- [ ] With WebGL disabled, the CSS metal fallback works and everything stays functional.
- [ ] The viewfinder works with arrow keys; the readout announces phases.
- [ ] No console errors; the shader pauses off-screen; no horizontal overflow from 360 to 2560px.
- [ ] Only Michroma, Barlow Condensed and Martian Mono load.