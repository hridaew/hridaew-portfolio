# Brief: five radically new home pages for Hridae Walia

## The ask (the client's own words)

> "It feels like you are still tied to my existing visual aesthetic and typography. I don't want that. Ditch everything and make it completely independent, don't use my fonts and colors at all and create truly new and distinct and novel interactive variants. You are advertised as being good at creative design so I want you to make things however you like and push the envelope."

The only thing that must be retained: **each page is based in Hridae's real work.** Everything else (visual language, type, color, layout, interaction model, tone) is open. The client has already rejected a round that felt safe. Take real aesthetic and interaction risks. These are home-page explorations, so each must still work as a front door: a visitor should understand who Hridae is and reach the work and contact info.

## Hard bans

- **Fonts**: no Bricolage Grotesque, Geist, Geist Mono, DM Sans (the current site). Also avoid the AI-default safe faces Inter and Space Grotesk.
- **Palette**: do not use the current site's paper/ink look (#f4f4f3 off-white with #2b2a27 warm ink) or its accent set (coral #ff5a5b, apricot #ff9f73, deep purple #171528) as a page palette. Project photos keep their own colors; the page chrome must be new.
- **Code**: nothing from the site's CSS, Tailwind tokens, or React components. Each variant is a standalone HTML document.
- **Already-tried concepts (do not reuse these mechanics)**: (1) editorial index list with a cursor-following image preview; (2) dark field where a cursor lens reveals images and dwelling "develops" them; (3) scroll-driven 3D camera dolly through project planes; (4) matter-js desk of draggable project objects; (5) persona chips that reorder a card grid.
- **AI-design clichés to avoid**: warm cream background with serif display and terracotta accent; near-black with one acid-green or vermilion pop; broadsheet hairline-rule newspaper columns; purple-to-blue gradient hero; emoji as section markers; everything centered; rounded-lg cards everywhere; 01/02/03 numbering on things that aren't a real sequence; glassmorphism for its own sake.

## Who Hridae is (facts only; do not invent claims)

- **Name**: Hridae Walia (pronounced "ri-they waliaa"). Use first person ("I") for page copy.
- **Role**: Product Designer. Currently **Founding Product Designer at Domis** (Nov 2024 – present). Based in San Francisco.
- **Thesis line (their own)**: "I'm a Product Designer obsessed with making, and I have 6 years of experience designing for interaction models that barely exist yet. I focus on the user and learn by making, whether on the canvas, in code, or the physical world."
- **CV summary**: product designer with 5+ years (site says 6) and a formal design education, shipping production software across mobile, web, and AR/VR; strong craft plus the ability to build what they design in code; work spans consumer apps, AI products, immersive installations, and spatial computing.
- **Education**: M.HCI+D, University of Washington (2024). BFA Interaction Design, California College of the Arts (2020).
- **Toolkit**: Pencil, Paper, Figma, Cursor, Claude Code, Xcode, Origami, ProtoPie. Also: Unity, ARKit, RealityKit, visionOS, Android XR, shaders; Framer, Rive, Spline, After Effects; React, Next.js, TypeScript, SwiftUI, GSAP; multimodal LLM APIs, Stable Diffusion.
- **Contact**: hridaew@gmail.com · LinkedIn https://www.linkedin.com/in/hridae · GitHub https://github.com/hridaew · CV https://drive.google.com/file/d/1f11tgSCoo4GY0DuVhdmOVG17lPRpGb3Z/view?usp=sharing
- **Personal**: has a cat; grew up as a kid who wore cool sunglasses (childhood photo); cooks a very serious butter chicken; loves cyberpunk ("braindances"), Rodin's Mighty Hand at the Legion of Honor.

## The work

### Domis (case study: https://hridaew.com/domis) — Founding Product Designer, 2024–now
AI-powered home maintenance app (iOS + web) that helps people understand their house and take care of it "without the busywork getting in the way". Setup is the hard part (owners don't know their own homes), so the design gets useful structure from **the smallest action a person will actually take**:
- **Address** → Domis researches the house. Under the hood: three independent home-fact searches, then a review agent cross-references them and returns a consensus payload of agreed fields and blanks.
- **Appliance nameplate photo** → an agentic, multimodal scanner returns an auto-researched guide: manuals, common repairs, serial number, warranty tracking.
- **Inspection report** (a messy PDF) → localized, interactive task modules ("Tasks found").
- **Personalized 3D home avatar** from AI image translation; front-end prototypes drove a **60% lift in new-user engagement**.
- Location- and season-aware nudges; multi-home management; sharing home context with Pros.

### Virdio (https://hridaew.com/virdio) — Product Designer, 2021–2022
Hardware-free AR fitness. Machine vision reads body poses through an ordinary camera and simulates equipment in AR (punches, squats, jumps counted; AR artifacts double as hit boxes). In 2021 engaging home fitness was gated by hardware (Peloton $1,500 bike, Mirror $1,500 screen). Shipped across iOS, Android, web, desktop, Apple Watch, and smart TV with no prior design system, engineering 12 hours ahead. Pushed for desktop-first after testing showed mobile was the worst platform for the AR workout. Calibration: user centers themself with tilt indicators, then walks to **virtual cones** at the corners of their space, ending in a green check. No-blame recovery UI: "Did you step out of frame?" Light mode for browsing, dark mode for class. Built a design-token system that cut asset/handoff time **by 50% across four platforms**.

### OBSCURA (https://hridaew.com/obscura) — Interaction design, prototyping, Unity dev; MOHAI, Seattle; exhibited 13 Sep 2025 (sold out)
The Museum of History and Industry handed the team a box of film: hundreds of photographs by **Wayne Wong, a Signal Corps soldier in 1946 Japan**, never seen (300+ photos). The brief was three words: "create something boundary-pushing". OBSCURA is a gaze-driven documentary system: a visitor in a VR booth (Meta Quest 3S) views the photos while gaze tracking records what they dwell on, and an **audience outside watches through the first visitor's eyes** ("Why are they focused on the clothing instead of the temple?"). A **photo-strip souvenir** visualizes which parts of each image a participant looked at most. Research: 80+ concepts, five "North Star" adjectives; interviews with younger Asian Americans about historical imagery ("when you look at a photograph, who is really doing the looking?").

### Memory Care Experience Station (https://hridaew.com/memory-care) — Interaction Designer with Maria Mortati Experience Design, 2020–2023, SF Campus for Jewish Living
Multi-sensory installation for people living with mid-to-late stage Alzheimer's/dementia. R&D lead for 10+ digital/physical experiences. **"Hacked" three plush cats** with pressure sensors and haptic vibration motors wired to an Arduino: petting triggers a purr vibration and a synced video of that cat; residents instinctively picked them up and held them. Moved haptics from a floor panel to a **footrest** so **100% of residents could access it without leaving their wheelchairs**. Paired with a **driving simulator** (Logitech force-feedback wheel + POV driving footage + haptic footrest: "simulated agency"). Simplified the caregiver digital library: session flow over data entry, Quick Add, staff notes. **98% positive evaluations across 200+ test sessions.** Recognition: **Fast Company World Changing Ideas 2022 finalist**, **CABHI 2× award recipient**, **SCAN Foundation Innovation Award**.

### Smaller builds ("wafflings")
- **Savor** (https://hridaew.com/waffling/savor): Mac-native tool that turns an ordinary phone video of an object into a **3D Gaussian splat** you can orbit. AVFoundation frames, Metal training, Vision cleanup, RealityKit viewer; no cloud. Born from loving Rodin's Mighty Hand and cyberpunk braindances.
- **Saving Baby J** (https://hridaew.com/waffling/orca): walk-up arcade game for the Puget Sound: throw **orca plushies** at a projected hit board to free Baby J (an orca calf in a net). Wizard-of-Oz tested two controllers (giant cardboard orcas vs. throwing); the throw won; nobody needed a tutorial.
- **Recorder-Proto** (https://hridaew.com/waffling/recorder): skeuomorphic mobile voice recorder: turntable scrub, audio-reactive center, cassette-eject sound.
- **Butter Chicken** (https://hridaew.com/butter-chicken): a vibes-based recipe; "taste scales linearly with butter".
- Also: Stanford AI Tinkery, a conversational multi-modal voice experience (no page).

## Media library (copy what you use into your variant's own `media/` folder, optimized)

Paths are relative to the repo root `/home/user/hridaew-portfolio/`.

| Path | Size | What it is |
|---|---|---|
| public/assets/home/domis-card2-anim.mp4 | 480×1038, 0.9MB | Domis task detail screen, looping UI video |
| public/assets/domis/appliance-item-recording.mp4 | 1320×2868, 1.3MB | Domis appliance scanner flow screen recording |
| public/assets/home/virdio-hero-crop.mp4 | 1280×720, 2.4MB | Virdio AR workout video |
| public/assets/home/obscura-sbs-video.mp4 | 1280×720, 3MB | OBSCURA headset view + audience view side by side |
| public/assets/obscura/spectator.mp4 | 540×644, 10.8MB (re-encode smaller if used) | audience watching the spectator screen |
| public/assets/orca/story.mp4 | 1920×1080, 7MB (re-encode if used) | Saving Baby J story video |
| public/assets/domis/hero-mobile.png | 473×1024 | Domis home screen (phone UI) |
| public/assets/grid/domis-screen-straight.png | 1170×2532, alpha | Domis phone screen cutout |
| public/assets/domis/live/home-avatar-3d.png | 512×512, alpha | AI 3D house avatar (brick mansion, cutout) |
| public/assets/domis/live/home-avatar.png | 800×800, alpha | red-brick house avatar cutout |
| public/assets/domis/live/empty-home-silhouette.png | 1024×1024, alpha | clay-white 3D house silhouette (empty state) |
| public/assets/domis/live/property-map-thumb.png | 1024×1024 | photo of a real red-brick house |
| public/assets/home/domis-card1-tasks-composite.png | 470×700, alpha | inspection report → "Tasks Found" composite |
| public/assets/domis/live/gemini-appliance-label.jpg | 1024×865 | AI reading an appliance nameplate (dark UI) |
| public/assets/domis/live/inspection-blippy.png | 410×512, alpha | green line-drawing mascot of a house reading a report |
| public/assets/domis/live/task-roof-flashing.png | 1024×1024 (2.6MB, optimize) | roof flashing photo (a task) |
| public/assets/virdio/in_context.png | 2066×1096 | AR workout in a red-lit room with telemetry |
| public/assets/virdio/hero_ui.png | 1402×786 | AR workout HUD over a living room |
| public/assets/virdio/cone.png | 1003×1083, alpha | glossy purple AR cone cutout |
| public/assets/virdio/sketch_setup.jpg | 1144×1000 | pencil sketch: person + camera setup |
| public/assets/virdio/sketch_angle_calibration.jpg | 1116×1000 | stick-figure calibration sketch |
| public/assets/virdio/calibration_flow.png | 1752×1188 | calibration flow diagram (screens + arrows) |
| public/assets/virdio/step_out_of_frame.png | 1402×786 | "Did you step out of frame?" recovery UI |
| public/assets/grid/virdio-phone-straight.png | 375×812, alpha | Virdio classes list phone UI |
| public/assets/obscura/wayne_crowd_scene.jpg | 2400×2304 | 1946 Japan: crowd before a temple-like theater |
| public/assets/obscura/wayne_girl_kimono.jpg | 1992×2862 | girl in a kimono |
| public/assets/obscura/wayne_japanese_kids.jpg | 2286×1505 | group of children |
| public/assets/obscura/wayne_marketplace.jpg | 1000×982 | soldier with kids at a market |
| public/assets/obscura/wayne_lady_shop.jpg | 1676×2600 | woman in a shop doorway |
| public/assets/obscura/wayne_students_street.jpg | 2400×1828 | students on a street |
| public/assets/obscura/wayne_soldiers_group.jpg | 2400×1764 | group of soldiers |
| public/assets/obscura/wayne_japanese_family.jpg | 1948×2742 | Japanese family portrait |
| public/assets/obscura/exhibition_743gm1tgvfizndo7gwveqtjp584.webp | 1024×768 | exhibition vitrine at MOHAI |
| public/assets/obscura/spectatorIMG.png | 1620×1712 | spectator watching the shared display |
| public/assets/obscura/photostrip_faces.png | 792×3435 | the photo-strip souvenir (tall strip) |
| public/assets/obscura/sketches/IMG_9519.jpg | 1730×1526 | sketch: immersed visitor vs audience |
| public/assets/obscura/zone_breakdown_noui.png | 1836×2070 | archival photo used for gaze-zone breakdown |
| public/assets/memory-care/station_full.jpg | 2400×1800 | resident at the driving-simulator station |
| public/assets/memory-care/cathero.png | 2073×1181 | residents petting the haptic cat |
| public/assets/grid/memorycare-cat-straight.png | 519×481, alpha | the plush cat cutout |
| public/assets/memory-care/cat_arduino_wiring.jpg | 2400×1800 | Arduino wiring + taped sensors |
| public/assets/memory-care/cat_sensors.jpg | 2400×1800 | breadboard + pressure sensor + artificial grass |
| public/assets/memory-care/resident_driving.png | 958×889 | resident in wheelchair at the wheel |
| public/assets/memory-care/footrest_haptic.jpg | 2400×3200 | haptic footrest prototype (wood frame) |
| public/assets/memory-care/ui_dashboard.jpg | 1024×575 | caregiver dashboard UI |
| public/assets/savor/hero-poster.jpg | 1280×720 | Mighty Hand sculpture splat frame (letterboxed) |
| public/assets/savor/mighty-hand-1.jpg | 1600×2844 | Rodin's Mighty Hand on a plinth |
| public/assets/orca/final-booth.jpg | 1600×1200 | the Saving Baby J booth |
| public/assets/orca/throw-test.jpg | 1033×685 | someone throwing a plushie at the projection |
| public/assets/orca/giant-controllers.jpg | 1600×1047 | giant cardboard orca controllers prototype |
| public/assets/orca/game-ui.jpg | 1600×904 | pixel-ish ocean game UI with a boat |
| public/assets/recorder/card.png | 390×470, alpha | recorder prototype (grey device, turntable) |
| public/assets/butter-chicken/hero.jpg | 797×733 | butter chicken in a pan |
| public/assets/home/hero-face-badge.png | 250×360, alpha | Hridae's face cutout (smiling) |
| public/assets/about/cat.png | 720×540 | Hridae holding their cat |
| public/assets/about/whiteboard.png | 512×512 | Hridae at a whiteboard of sticky notes |
| public/assets/about/childhood.png | 263×171 | kid Hridae in sunglasses with a thought bubble |

Optimize with ImageMagick, e.g. `convert SRC -resize '1600x1600>' -quality 78 DST.webp` (keep alpha: webp supports it). Re-encode heavy video with `ffmpeg -i SRC -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -an -movflags +faststart DST.mp4`. Keep each variant's `media/` folder under ~8MB total.

## Technical contract (each variant must satisfy all of this)

These pages are published two ways: as files on the site branch, and as standalone claude.ai Artifacts (a locked-down sandbox). Build to the stricter of the two.

1. **One self-contained HTML document per variant** at `public/variants/<slug>/index.html`, with media in `public/variants/<slug>/media/`, referenced by **relative** URLs (`media/foo.webp`). Write a full document (`<!doctype html>`, `<html lang="en">`, `<head>` with charset + `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<body>`), but **put no attributes on `<html>` or `<body>`** and keep all page markup inside `<body>` (the publisher re-wraps the content). All CSS and JS inline in the file.
2. **`<title>`**: a 2–4 word name for the page (not "X — explainer").
3. **Fonts**: Google Fonts only (`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">`), each with a real fallback stack. Nothing from the banned list.
4. **Scripts**: only from `https://cdnjs.cloudflare.com` (preferred), `https://cdn.jsdelivr.net/npm/`, or `https://unpkg.com`, exact pinned versions, UMD builds placed before the inline script that uses them. Vanilla JS, Canvas 2D, WebGL, raw GLSL, CSS are all welcome. No fetch/XHR to any other host. No iframes/embeds.
5. **Links** out to case studies use absolute `https://hridaew.com/...` URLs with `target="_blank" rel="noopener"`. No `window.open`, no `alert/confirm/prompt`. Email must be visible, selectable text plus a copy button (`navigator.clipboard.writeText` inside the click handler, catch rejection, fall back to selecting the text). Don't rely on `mailto:`.
6. **Theme**: commit to the page's own look. A single-theme design is fine: set `background` and every color explicitly; if the look is dark, set `color-scheme: dark` on `:root`. Define colors as CSS custom properties on `:root`.
7. **Layout**: must work from 360px to 2560px wide. Never scroll horizontally. ≥16px side gutter on phones. One-screen app pages size with `height: 100%` on `html, body` (or `100dvh`), not bare `100vh`. Fixed bars add `env(safe-area-inset-*)` to their padding.
8. **Input**: works with mouse, trackpad, touch, and keyboard. Touch must be first-class (no hover-only content). Visible `:focus-visible` states. Containers that handle their own drags need `touch-action: none`; don't break native page scroll elsewhere.
9. **Motion & perf**: respect `prefers-reduced-motion` (offer a calmer but still complete version). Smooth 60fps: drive animation with `requestAnimationFrame` and refs, not layout thrash; cap canvas DPR at 2; pause loops when the tab is hidden or the canvas is off-screen. No console errors.
10. **Complete at rest**: the first frame (no scrolling, no input) must already show who this is and what the page is. Never leave readable content at `opacity:0` waiting for a scroll observer.
11. **Usability floor**: within ~5 seconds a visitor knows "Hridae Walia, product designer" and what kind of work; all four case studies and the email are reachable without finishing a game or puzzle (provide an obvious plain path, e.g. a small index or skip control). Sound only after a user gesture, default off or clearly toggleable.

## Local preview + testing

- **No server is left running.** Run every browser test through the wrapper, which brings up the static servers only for that command (ref-counted, safe in parallel): `bash <scratchpad>/tools/with-servers.sh node your-test.mjs`. While it runs, `public/` is served at **http://localhost:4173** (your page: `http://localhost:4173/variants/<slug>/index.html`) and artifact-mode previews at **http://localhost:4174/<slug>/preview.html**. Never start a server any other way, never leave one running, and never kill processes you didn't start.
- Chromium for Playwright: `/opt/pw-browsers/chromium` (use `executablePath`). Import Playwright from `/home/user/hridaew-portfolio/node_modules/@playwright/test/index.mjs`.
- A ready-made interaction/screenshot runner: `node <scratchpad>/tools/act.mjs <url> <width> <height> <steps.json>` (see <scratchpad>/tools/README.md). Write screenshots to your own scratch subfolder.
