# Hridae Walia, Fitted (`converge`)

> My work is fitted live out of thousands of soft gaussians, the way Savor turns a phone video into a splat: orbit a capture, rewind the fit to one blob, and watch one project tear loose and re-fit into the next.

Fonts: Anybody, Fragment Mono  
Palette: #6E706C, #5D5F5B, #232421, #FFFFFF, #A9ABA6, #111210  
Source concepts: generative-1, instrument-2, instrument-1, vernacular-2

# Converge: build spec

## 1. Concept & thesis
My work, fitted live out of soft gaussians. The stage shows one capture at a time.
- A shipped coarse seed paints a recognisable image on frame 1.
- The page then keeps fitting on-device (more splats, lower loss) while a real loss curve falls along the bottom.
- You can orbit the capture, rewind the fit to a single blob, see every splat as a ring, and switch projects. Switching makes one capture's splats tear loose and re-fit into the next.

Grounding:
- **Savor** is my Mac-native tool that turns an ordinary phone video into an orbitable 3D Gaussian splat: AVFoundation frames, Metal training, Vision cleanup, a RealityKit viewer, and no cloud. I built it because photos don't do Rodin's Mighty Hand justice.
- Coarse-to-fine refinement makes my thesis literal: *I learn by making*.
- The first splat is Domis's 'smallest action', the one structure grows from.
- The fit targets are real artefacts: Domis's AI 3D home avatar, Virdio's red-lit AR workout room, Wayne Wong's 1946 portrait of a girl in a kimono (OBSCURA), the hacked plush cat (Memory Care), the Mighty Hand (Savor) and my face.
- The 'Where it looked' splat-density view is this page's version of OBSCURA's photo-strip souvenir, which showed where each visitor looked.

## 2. Visual system
**Fonts**
- **Anybody** (variable wdth 50–150, wght 100–900; fallback 'Arial Narrow', system-ui, sans-serif).
  - H1 'Hridae Walia': wdth 150, wght 260, clamp(36px, 5vw, 96px), line-height .92, tracking −0.01em.
  - Thesis: wdth 100, wght 400, 17px/1.45, max 36ch.
  - Panel title: wdth 70, wght 800, uppercase, 30px. Its wdth tracks orbit yaw, wdth = 110 − 40·|yaw|/38, so the type foreshortens with the object.
  - Links: wdth 90, wght 600, 15px, 1px underline offset 3px.
- **Fragment Mono** 400 (fallback ui-monospace, Menlo, monospace) for every readout, the patch labels and the email: 12–13px, labels uppercase at +0.04em.

**Tokens**
| Token | Hex | Use |
|---|---|---|
| --cove | #6E706C | stage (white text 5.0:1) |
| --floor | #5D5F5B | cove floor and loss band |
| --ink | #232421 | project panel |
| --type | #FFFFFF | type |
| --type-2 | #A9ABA6 | secondary text, only on --ink (6.7:1) |
| --frame | #111210 | patch gutters, print strip |

There is no chromatic accent anywhere in the chrome: the only colour on the page is the work (fits, patch fills, reference media). The focus ring is 2px #FFFFFF plus a 1px #111210 outer ring.

**Materials.** An 18%-grey photographer's cove:
- vertical gradient --cove→--floor with a soft horizon at 70% height
- an elliptical contact shadow under the capture (rgba(17,18,16,.32), 40px blur)
- square corners everywhere, no grain, no glass, no UI shadows. The softness lives in the gaussians.

**Desktop 1440×900**
- H1 and thesis top-left (x 48, y 40).
- Capture centred at 62% x / 45% y in a 560px fit box.
- ColorChecker block on the right edge: 2×3 squares of 64px with 6px --frame gutters on a --frame plate, Fragment Mono 11px labels beneath.
- Ink panel bottom-left: x 48, 440px wide, 24px above the loss band.
- Loss band: full-bleed, 110px tall.
- Top-right: 'Index' and 'Tour' text buttons.

**Phone 390×844** (one screen, 100dvh, no page scroll), top to bottom:
- Header ~96px: H1 in Anybody wdth 130 / wght 300 / 34px, plus one role line.
- Stage: 48dvh, full-bleed.
- Loss scrubber: 48px.
- Patch row: six 52px squares, 8px gaps, 16px gutters, 11px labels.
- Ink panel as a bottom sheet.

## 3. First frame at rest
- **Top-left:** 'Hridae Walia', huge and very wide. Under it: 'I'm a product designer obsessed with making, and I have 6 years of experience designing for interaction models that barely exist yet. Founding Product Designer at Domis, San Francisco.' Then: 'Everything on this stage is being fitted in your browser out of soft gaussians, the way Savor fits a phone video. No cloud.'
- **Centre-right:** the Domis brick house, already recognisable from the 1,536-splat seed. It is painterly and soft, and sharpens visibly as live splats arrive.
- **Bottom band:** the seed's shipped loss history as a dashed white line and the live curve as a solid one. Readout: 'FITTING domis/home-avatar · SPLATS 1,536 · LOSS 0.0412 · SEED 1,536 SHIPPED · REFINING ON-DEVICE, NO CLOUD'.
- **Right edge:** six patches filled with each capture's mean fit colour, labelled DOMIS / VIRDIO / OBSCURA / MEMORY CARE / SAVOR / ME, with DOMIS pressed.
- **Ink panel:** the Domis copy, a small looping Domis app video, 'Read the Domis case study ↗', and 'hridaew@gmail.com [Copy]'.

## 4. Interaction model
- **Fitting needs no input.** After the seed, splats are added within a 4ms/frame budget until 16k (desktop) or 5k (phone). Numbers only ever count up.
- **Orbit.** Drag the stage with mouse, trackpad or one finger.
  - yaw += dx·0.25°, pitch −= dy·0.2°, clamped to ±38° and ±16°.
  - On release, velocity carries with friction 0.92/frame. After 1.2s idle, a spring (stiffness 40, damping 12) returns to the front over about 2s.
  - With the stage focused: arrows turn ±4° (Shift ±12°); 0 resets.
- **Rewind.** The loss band is a role=slider scrubber.
  - x maps on a log scale to splat count k (1…N). This is the same log axis the curve is drawn on.
  - A 1px white playhead carries a flag 'k = 40'. Only the first k splats render, in coarse-to-fine order, so the house collapses to 40 blobs, then 1.
  - On release, k animates back to live over 600ms ease-out.
  - Keys: ←/→ move 5% of the range; Home = 1; End = live.
- **Ellipse view.** Hold E, or long-press the stage for 400ms with movement under 6px (navigator.vibrate(10) where supported).
  - Fills fade to 15% over 180ms and every splat draws as a 1px ring at its 2σ ellipse, in its target colour.
  - On release, fills fade back over 180ms.
- **Where it looked.** Press D or use the panel toggle. Fills become a grey→white density map. Caption: 'Where the fitter looked: every splat it placed. OBSCURA printed this for people.'
- **Switching** (patch buttons or keys 1–6):
  1. Anticipation, 120ms: splats swell σ×1.06 and dim c×0.94.
  2. Migration, 900ms ease-out cubic: old splats are matched to the new seed by Hilbert index. Position, covariance, depth and colour all tween. Each splat starts after a 0–260ms delay set by its distance from centre, and lifts on the way (z += .15·sin πt, σ×(1+.2·sin πt)).
  3. The old loss curve stays as a 40% ghost while the new one spikes and falls.
- **Purr** (Memory Care capture only). Rub back and forth over the cat (≥3 horizontal reversals within 700ms) and its splats jitter 0.6px at 25Hz for about 1s. Panel hint: 'Rub the cat.'
- **Tour.** After 12s with no input, captures auto-advance every 9s. A chip reads 'TOUR · any key or tap stops'.
- **Print strip.** Press P, or use 'Print my strip' in the panel's More.
  - Composes a tall strip of every capture visited this session, each fit beside its density map.
  - Footer: 'HRIDAE WALIA · FITTED IN YOUR BROWSER · {date} · {total} SPLATS · hridaew.com'.
  - Opens in an overlay with Save (blob download) and the fallback line 'If saving is blocked, press and hold the image.'

**Signature moment:** press OBSCURA while the house is fully fitted. 16,000 splats swell, lift, drain to grey and settle into Wayne Wong's 1946 portrait while the loss spikes and dives. Then press and hold, and the photograph becomes thousands of hand-drawn rings.

## 5. Content map & copy
Each capture's panel has: title, role and years, two lines of copy, one number, one real colour reference (fit targets are artefacts, not shipped UI) and a link.

**DOMIS** (target: home-avatar-3d) → https://hridaew.com/domis
- Role: 'Founding Product Designer · Nov 2024–now'.
- Copy: 'Domis learns a house from the smallest action a person will actually take: an address, a photo of an appliance nameplate, an inspection report. Under the hood, three independent searches and a review agent agree on what's true.'
- Number: '+60% new-user engagement from my 3D home-avatar prototypes.'
- Reference: Domis app video.

**VIRDIO** (target: the red-lit room) → https://hridaew.com/virdio
- Role: 'Product Designer · 2021–2022'.
- Copy: 'Hardware-free AR fitness: machine vision reads your body through an ordinary camera, when home fitness meant a $1,500 bike or mirror. Shipped across iOS, Android, web, desktop, Apple Watch and smart TV with no prior design system.'
- Number: 'Design tokens cut asset and handoff time 50% across four platforms.'
- Reference: AR workout video.

**OBSCURA** (target: kimono portrait, monochrome) → https://hridaew.com/obscura
- Role: 'Interaction design, prototyping, Unity · MOHAI, Seattle · 13 Sep 2025, sold out'.
- Copy: 'MOHAI handed us a box of film: 300+ never-seen photographs by Wayne Wong, a Signal Corps soldier in 1946 Japan. In a VR booth, gaze tracking records what a visitor dwells on while an audience outside watches through their eyes.'
- Stage caption: 'Photograph: Wayne Wong, 1946.'
- Reference: headset + audience video.

**MEMORY CARE** (target: plush cat) → https://hridaew.com/memory-care
- Role: 'Interaction Designer with Maria Mortati Experience Design · 2020–2023'.
- Copy: 'A multi-sensory station for people living with mid-to-late stage dementia. I hacked three plush cats with pressure sensors and vibration motors: pet one and it purrs and plays that cat's video.'
- Number: '98% positive across 200+ sessions.'
- Recognition: 'Fast Company World Changing Ideas 2022 finalist · CABHI 2× award recipient · SCAN Foundation Innovation Award.'
- Reference: residents petting the cat.

**SAVOR** (target: the Mighty Hand) → https://hridaew.com/waffling/savor
- Copy: 'The engine of this page. Savor turns an ordinary phone video into a 3D Gaussian splat you can orbit, trained on-device in Metal. I built it to capture Rodin's Mighty Hand properly.'
- Then 'Smaller builds', each with a 24px live micro-fit thumbnail:
  - 'Saving Baby J: throw orca plushies to free a calf from a net' → https://hridaew.com/waffling/orca
  - 'Recorder-Proto: a voice recorder you scrub like a turntable' → https://hridaew.com/waffling/recorder
  - 'Butter Chicken: taste scales linearly with butter' → https://hridaew.com/butter-chicken

**ME** (target: my face)
- The full thesis line.
- 'M.HCI+D, University of Washington, 2024 · BFA Interaction Design, California College of the Arts, 2020'.
- 'Pronounced ri-they waliaa'.
- Toolkit: 'Pencil, Paper, Figma, Cursor, Claude Code, Xcode, Origami, ProtoPie'.
- 'I also have a cat.' with a photo of me holding my cat.
- LinkedIn, GitHub, CV.

**Email row on every capture:** selectable 'hridaew@gmail.com' + Copy. The click calls navigator.clipboard.writeText; on rejection, select the text. The button reads 'Copied' for 1.6s.

Every external link is absolute, target=_blank rel=noopener.

## 6. Plain path & accessibility
- The first tab stop is a visible-on-focus 'Skip to index'.
- 'Index' (top-right) opens a <dialog> listing the four case studies, the four smaller builds, the email + Copy, LinkedIn, GitHub and CV.
- The patches are labelled <button aria-pressed> (keys 1–6) and work without any orbiting or scrubbing.
- Structure:
  - <h1>, then the thesis <p>, then <nav aria-label=Captures>.
  - The panel is a <section aria-live=polite> with an <h2>.
  - The canvas is role=img; its aria-label updates on switch, e.g. 'Gaussian-splat fit of the Domis 3D home avatar'.
  - Readouts are aria-hidden.
- Tab order: skip → Index → Tour → stage → scrubber → patches → panel link → Copy → More.

## 7. Reduced motion & mobile
**Reduced motion:** no tour; no inertia or spring (orbit is direct and stays put); switching is a 200ms crossfade instead of migration; no purr jitter; readouts update at 2Hz. Fitting still runs, because it is the content.

**Mobile:** composed as in §2.
- touch-action:none on the stage canvas and the scrubber only.
- The collapsed sheet shows the title, one line, 'Case study ↗' and the email row. 'More' expands it to 80dvh with overflow:auto and overscroll-behavior:contain.
- Safe-area insets pad the header and the sheet.
- Budget: 5k splats, 128px fit grid, DPR ≤1.5. If frame time stays above 20ms for 30 frames, the budget drops to 3k.

## 8. Tech plan
No CDN libraries; vanilla JS in one file. Override the artifact host reset: set margin, background and font on html/body explicitly, and unset img max-width where needed.

**Model.** The fitter and the renderer share one model, so the image on screen is exactly what the loss measures:
- Image = Σ cᵢ·exp(−½dᵀΣᵢ⁻¹d), with signed premultiplied coefficients cᵢ ∈ ℝ⁴ (RGB + coverage).
- Accumulation is order-independent, as in GaussianImage, so no sorting is needed.
- Composite = rgb + cove·(1−a).

**Rendering.** WebGL2, instanced quads.
- Per-instance attributes: centre (vec3), (σ₁, σ₂, θ), coefficient (half4), display colour (unorm8×3). During migration, add 'to' attributes and a delay.
- The vertex shader builds a thin 3D covariance (σz = .25·min σ), applies the orbit rotation and the EWA projection Jacobian, adds a 0.3px² low-pass, and sizes the quad to 3σ.
- Accumulate with blendFunc(ONE, ONE) into an RGBA16F target (EXT_color_buffer_float or EXT_color_buffer_half_float). A resolve pass then draws the cove, the contact shadow and the capture.
- Rings: a second instanced pass with m = sqrt(dᵀΣ⁻¹d) and alpha = 1 − smoothstep(0, 1.5, |m−2|/fwidth(m)).
- Render only when something changes: training, orbit, migration or scrub.
- Fallbacks:
  - No float render target → RGBA8, with the fitter in non-negative mode.
  - WebGL1 → ANGLE_instanced_arrays + OES_standard_derivatives.
  - No WebGL at all → draw the seed with Canvas2D radial-gradient ellipses, without orbit.

**Fitter.** Runs on the main thread at ≤4ms per frame. It pauses on visibilitychange and when an IntersectionObserver reports the stage off-screen.
- Inputs: the target at 192px (128px on phone), premultiplied, plus a structure tensor (Sobel, blurred at σ1.5, eigenvectors give orientation and coherence).
- Residual E = T − I, initialised from the seed render.
- Each step is matching pursuit:
  1. Importance-sample a pixel from blurred |E|², using a 16×16 tile-sum table.
  2. Set the scale: σ(t) = σ₀(1−t/T)^1.6 + σmin, with σ₀ = 14px and σmin = .55px.
  3. Take orientation from the tensor; elongation = 1 + 2·coherence.
  4. Solve the coefficient per channel: cᵢ = ⟨E,g⟩/⟨g,g⟩.
  5. Subtract E −= cᵢg over a 3σ footprint and update loss = mean |E|².
  6. Append the splat with bufferSubData.
- Depth: a two-pass chamfer distance transform of alpha for objects (z = .18·√(d/dmax)); floor-plane y plus luminance for the Virdio room and the kimono photo.

**Shipped seeds.** A build-time Node script (not shipped) prepares them:
1. Read each target as raw RGBA via ImageMagick.
2. Run 1,536 matching-pursuit steps, then 300 Adam iterations on all parameters using analytic gradients.
3. Quantise each splat to 11 bytes and write it, with a 64-point loss history, as inline base64 (about 140KB total).

The readout 'SEED 1,536 SHIPPED · REFINING ON-DEVICE' keeps the on-device claim true.

**Migration.** Sort both the old splats and the new seed by Hilbert index of screen position. Old splat i maps to new splat ⌊i·Nnew/Nold⌋ and takes coefficient c_new/groupSize, so the sum tweens exactly into the new seed. Then swap buffers and resume fitting.

**Density map.** A CPU 192² map; each splat adds its normalised kernel. Tone-map with d/(d+k) and upload every 250 splats.

**Pixel sources.** All fit targets are inlined as data-URI webp, so canvas readback cannot be tainted in the artifact sandbox.

**Hardest part:** a crisp, beautiful fit within budget (anisotropy, the σ schedule, seed quality), and correct covariance projection under orbit.

**Performance budget:** ≤60KB JS plus about 140KB of seeds and about 300KB of inline targets; 60fps with 16k splats on desktop and 5k on phone.

## 9. Media
Paths are relative to public/assets.

**Fit targets (inline data URIs).** Only their pixels are read.
| Source | Processing | Output |
|---|---|---|
| domis/live/home-avatar-3d.png | 384px, keep alpha | fit-domis |
| virdio/in_context.png | crop 1500×1096+566+0, 384w | fit-virdio |
| obscura/wayne_girl_kimono.jpg | crop 1000×1400+380+760, greyscale, 384h | fit-obscura |
| grid/memorycare-cat-straight.png | 384px | fit-cat |
| savor/mighty-hand-1.jpg | crop 900×1500+520+800; alpha where luminance <45%, then -morphology close | fit-savor |
| home/hero-face-badge.png | 384h | fit-me |

**Panel references (in media/).** All are webp unless noted. Videos are muted (-an) and get first-frame webp posters.
| Source | Processing | Output |
|---|---|---|
| home/domis-card2-anim.mp4 | scale 240:-2, crf 30 | ref-domis.mp4 |
| home/virdio-hero-crop.mp4 | 480:-2, crf 31 | ref-virdio.mp4 |
| home/obscura-sbs-video.mp4 | 480:-2, crf 31 | ref-obscura.mp4 |
| memory-care/cathero.png | 640w | ref-memory |
| savor/hero-poster.jpg | 640w | ref-savor |
| about/cat.png | 480w | ref-me |
| orca/throw-test.jpg | 96px | micro-fit source |
| recorder/card.png | 96px | micro-fit source |
| butter-chicken/hero.jpg | 96px | micro-fit source |

Total media ≤3.5MB.

## 10. Acceptance checklist
- [ ] At 1440×900 and 390×844, with no input, the name, thesis, a recognisable Domis house, six patches, the panel link and the email are all visible within 1s.
- [ ] The splat count reaches the device budget in ≤10s, and LOSS never increases within a capture.
- [ ] Key 3 migrates house → kimono in ≤1.3s with no dropped frames on desktop Chrome.
- [ ] Dragging the loss band to its left edge shows one splat; releasing returns to live.
- [ ] Long-press or holding E shows rings; D shows density; P produces a strip image.
- [ ] Orbit clamps at ±38°/±16° and springs back; arrows orbit the focused stage.
- [ ] Case-study links are absolute with target=_blank rel=noopener; Copy works and falls back to selecting the text.
- [ ] With WebGL disabled, the seed renders in Canvas2D and every link works.
- [ ] Reduced motion: no tour, inertia or migration tween.
- [ ] rAF and the fitter stop when the tab is hidden; zero console errors.
- [ ] No horizontal scroll from 360 to 2560px; only Anybody and Fragment Mono load.