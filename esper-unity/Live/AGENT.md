# Editing the ESPER room

ESPER is the portfolio's 3D home at `/lab/esper`: a roofless model house seen from above, one room per project, rendered with three.js (`src/components/lab/esper/three/EsperEngine.ts`). The room is described by **`esper-unity/Live/scene.json`**, which the open dev page reloads within a second of every save.

**`scene.json` is generated.** `esper-unity/Tools/house_plan.py` writes its items, stations and views (it leaves `look` alone). Make changes in `house_plan.py` and run it from `esper-unity/`:

    python Tools/house_plan.py

Edits made straight to `scene.json` are overwritten on the next run. The only part of `scene.json` you edit directly is `look` (light and camera dials, which Studio also writes).

## The house
- Metres, Y up, floor y = 0. A 9 m square, x and z -4.5..4.5, seen isometrically from the south-west. North and east walls 2.5 m, the rest 1.0 m.
- Back row (west to east): Domis, Off hours (also About), Memory Care. Front row: Virdio, Wafflings (a small room behind the front door), Obscura (an L that takes the rest). One door per room.
- Each room is set up as its project really is (the case study photos are the reference). No unrequested props or decoration.
- Numbers are Unity-style (left-handed; the engine mirrors them). A model faces +Z at yaw 0 (yaw 180 faces south, 90 east, 270 west). `thing()` groups and screens face local -Z.

## Items (what house_plan.py emits)
- `kind`: box (`size`, `radius`, `corner`), wall (`path`, `h`, `t`), screen (`w`, `h`, `border`, `t`, `display`), lathe (`profile`), tube (`path`, `t`), torus, group (`children`), model (`src`, `height`, `on`, `nodes`), splat (`src`, `s`), person (`poses`, `flip`).
- Model sources: `ph:<id>` (Poly Haven, `Assets/ThirdParty/PolyHaven/Models`), `esper:<name>` (`Assets/Esper/Models`), `kenney:<name>` (`Assets/ThirdParty/Kenney`). Pictures and the splat are `Content/...` under `Assets/Esper/`.
- `height` fits a model to that height and centres it; `on` sets it down on another item (raycast after loading); `nodes` turns named parts (a fridge door open).
- `display`: `src` idle picture, `active` pictures while the room is in use (`seconds` apart), `lit` for prints, or `video` (a site path such as `/assets/obscura/spectator.mp4`), which loops muted and letterboxed on black.
- `station` + `when` ("active" / "idle"): shown only while that room is (or isn't) in use. People are "active": they fade in on hover or focus.
- Colour: everything is white clay. `tint` [r,g,b] fades in only while its room is focused. Room themes live in `TINTS` in house_plan.py (Domis #ff5a5b, Virdio purple, Memory Care orange, Obscura grey).
- `shake` (metres): rattles in bursts while its room is in use (the broken fridge).
- Materials: Clay, ClayMid, Fabric, Graphite, Satin, Floor, WallWhite.

## People
- Three Renderpeople bodies (`Assets/ThirdParty/Renderpeople/{Eric,Carla,Claudia}.glb`), picked per person by id, drawn as soft ghosts.
- Poses are joint positions (`Tools/esper_figures.py`: `pose`, `upright`, `legs`, `seated`, `arms`). Arms reach their wrists by IK; a subtle idle layer (breath, weight shift, head drift) runs under every pose.
- `hands` [left, right]: relaxed, rest, hold, grip. `grip` {kind: phone | wheel | viewer, object}: the hands go to that object and close on it (computed from the object as it sits in the scene). `look` (degrees): turns the upper body to look around. A child with `attach` rides on the chest (the Obscura viewer).

## Publishing (the live site)
Production does not read `esper-unity/`. After changing the scene, publish it:

    python esper-unity/Tools/publish_web.py

This copies `scene.json` to `public/esper/live/` and every asset it uses to `public/esper/assets/`, slimming Poly Haven textures (the clay only uses normal and AO maps). `esper-unity/` is excluded from deploys in `.vercelignore`.

## Taste
Airy, white and soft. The work imagery is the hero. No text, labels or signage unless asked. Fewer, better objects. Animations are slow and subtle. Round the edges, but only as much as the object really has.

## Finish
End with one short plain sentence saying what you changed.
