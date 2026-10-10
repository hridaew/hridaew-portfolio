# ESPER — immersive home page

## Intent
Replace the home page with a single, deeply detailed 3D room: an apartment high above a rain-soaked megacity at 3 a.m. Every object is either Hridae's work or Hridae's taste. It must work as a portfolio first — the work is found and opened in seconds — and as a piece of art direction second. Built with real tools (Unity 6 URP, Blender), served at `/lab/esper` until it replaces `/`.

Decisions from the brainstorm:
- Direction B (still room, moving camera) over a moving-train ride — a moving world is hard to navigate.
- Performance budget unlocked for now; tune later.
- Scope is the home page only. Case studies stay as the existing pages; the room navigates to them.
- Tasteful, quiet. No captions, hint text, eyebrows, or micro-labels. Text appears only where the interface fails without it.
- Evoke references, never copy: no game/film/club logos or characters.

## Art bible
- **Light is the design.** Warm sodium-amber practicals inside; cold teal/magenta city light outside, cut by venetian blinds into slatted shafts through drifting dust.
- **Palette.** Amber, teal, deep blue-black. One red, reserved for Arsenal (scarf, one neon sign in the city). Red = Hridae.
- **Materials.** Lived-in: scuffed wood, stained plaster, Space Age fixtures, heavy CRT plastic, wet glass. Beksinski's dusty ochres, not chrome. Nothing new.
- **Motion.** Near-still at rest: rain on glass, CRT flicker, steam, an occasional spinner past the window. The room answers interaction (lamp warms, screen powers on with CRT bloom).
- **Camera.** 35mm-feeling lens, slight lens imperfection, film grain, ACES, vignette. Establishing shot composed like a film frame.

## Room → content
| Object | Content |
|---|---|
| ESPER terminal desk (hero) + darkroom photos on a line | OBSCURA |
| Drafting table, Domis house model under a lamp, docked phone | Domis |
| CRT TV + mat + kettlebell, laptop and phone beside | Virdio |
| Armchair corner: steering wheel, round display, framed (blurred) photo | Memory Care |
| Curio shelf: orca plush, recorder, plaster Rodin hand, butter chicken | Wafflings |
| Window + mirror (contact on a note) | About |
| Taste layer | Arsenal scarf, record crate (Clipse, Reanimation, Cudi — existing site cover assets), red crowbar by the door, toy robot, Beksinski-esque print, the city itself |

## Interaction
- States: **overview → focus(object) → enhance → navigate**. Hover: the object's practical light warms and the cursor changes; no labels in the scene. Click: eased camera move (~1.2s) to the object's composed shot. Enhance: ESPER zoom + scanline into the object's screen, then route to the case study. Escape/back returns to overview.
- An HTML index of objects (visually minimal, keyboard-first) is always reachable for access and SEO. Keys 1–6 focus objects. The ESPER terminal accepts typed commands as an easter egg.
- Unity ⇄ page bridge (`.jslib` + `SendMessage`): Unity emits `focus`, `enhance`, `ready`; page sends `goto`, `back`.

## Pipeline
- Unity 6000.5 URP project at `esper-unity/` (Library/Temp ignored). Scene assembled by editor scripts so it is reproducible; lighting baked (lightmaps + probes), a few realtime lights for flicker. Volumetric shafts and dust via authored meshes/particles. Post: bloom, grain, vignette, slight chromatic aberration.
- Blender: asset cleanup/kitbash, procedural city backdrop (geometry nodes: towers, lit windows, ad screens, spires) rendered/exported for the window.
- Assets: Poly Haven (CC0) models, textures, HDRIs; Fab where licensing permits web. Every asset logged with its licence in `esper-unity/ASSETS.md`.
- Web: WebGL build into `public/esper/`, wrapped by `src/app/lab/esper/page.tsx` (loader styled as CRT boot). Correct headers for compressed Unity files in `next.config.ts`.
- Fallback (later): Unity photo-mode stills + loop for mobile/no-WebGL, same layout as image-based page.

## Build order
1. **Vertical slice** — ESPER desk corner + window + rain + blinds light at final quality, overview/focus/enhance working through the bridge on `/lab/esper`. Review with Hridae before breadth.
2. Remaining room objects, one by one.
3. City backdrop + atmosphere.
4. Real content on every screen.
5. Fallback, performance, accessibility.

## Verification
Unity batch renders of each composed shot reviewed for art direction; WebGL build loads and navigates locally; `npx tsc --noEmit` clean.
