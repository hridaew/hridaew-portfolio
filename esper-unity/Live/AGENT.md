# Editing the ESPER room

ESPER is a Unity WebGL room: an apartment above a rain-soaked city where objects are portfolio case studies. The whole room is described by **`esper-unity/Live/scene.json`**. Every save to that file appears in the open browser within a second, so you edit it directly and the designer watches the change land. It is the only file you change.

## The room
- Metres, Y up. Floor y = 0, ceiling y = 3.3. Walls: x = -5 (Wall_L), x = +5 (Wall_R), z = -3.75 (Wall_F, behind the opening camera), z = +3.75 (window wall: glass from x -3.6..3.6, y 0.75..2.95).
- Rotations are Euler degrees. A model's front usually faces its local +Z; `r: [0, 180, 0]` turns it to face -Z.
- Stations (case studies) are item groups: `ESPER_Desk`, `ESPER_Bank`, `Domis`, `Virdio`, `MemoryCare`, `Wafflings`, `Taste`, plus `Room` for general furniture.

## scene.json
- `items[]`
  - `id`: unique, `"<group lower>/<name>"`.
  - `group`, `kind` (model | box | quad | print | group).
  - `src`:
    - `ph:<id>`: a Poly Haven model folder in `esper-unity/Assets/ThirdParty/PolyHaven/Models/`. The id is case-sensitive.
    - `esper:<name>`: a GLB in `esper-unity/Assets/Esper/Models/`.
    - `Content/...`: an image for a quad/print, under `esper-unity/Assets/Esper/Content/`.
  - `p` (world position), `r`, `s` (one number = uniform scale, or three).
  - `size` (box), `material` (box/quad; a name from `esper-unity/Assets/Esper/Generated/Materials`, without .mat).
  - `w`, `h`, `curl` (print).
  - `hidden`, `noShadows`.
  - `tint` [r,g,b].
  - `display` (a glowing screen: `surface` or `crt`, `src` image, `glow`, `glowColor`).
  - `photo` {surface, src}.
  - `spin` {child, dps}.
  - `children` (local space).
- `lights[]`
  - `id`, `type` (point | spot | directional), `p`, `dir`.
  - `color` [r,g,b] 0..1, `intensity`, `range`, `angle`.
  - `shadows`, `flicker`.
- `views[]`: `id`, `p`, `target`, `fov`. These are the camera for `overview` and for each station.
- `stations[]`: hotspots linking items to a case study. Change them only when asked.
- `look`
  - exposure, ambient, bloom, grain, vignette, contrast, saturation.
  - `vol._Density` (haze).
  - `vol._VolIntensity` (light shafts).

Look at nearby items before adding one, and copy their conventions (scale, rotation, how screens are set up).

## How to work
- Make the smallest edit that does what was asked. Use targeted edits, not a rewrite of the file, and keep the JSON valid.
- Put objects on surfaces: find the top of the desk/table/shelf from its item and the clicked point. Nothing floats or intersects.
- Only reference models and images that exist. If the request needs something the format can't express (new geometry, shaders, a model that isn't in the project), don't fake it. Say so in one sentence and suggest the nearest thing that does exist.

## Taste
Restrained, considered, like a designer's apartment at 3am. The work imagery is the hero. Neon is rare and soft. Add no text, labels or signage unless asked. Fewer, better objects. Light is warm practicals against a cool city.

## Finish
End with one short plain sentence saying what you changed. The designer sees it next to the pin.
