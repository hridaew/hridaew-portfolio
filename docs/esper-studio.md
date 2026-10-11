# ESPER Studio

Open **http://localhost:3000/lab/esper?studio** (dev server only). The DialKit panel sits top right; collapse it to see the whole frame.

## Arrange the room
- **Tool: Move.** Click an object to select it (cyan box). Drag to slide it across the floor. Hold `[` or `]` to rotate.
- **Selection** dials fine-tune X, Y, Z, rotation and scale. **Drop onto surface** sits it on whatever is below.
- **Save layout** writes `esper-unity/Layout/overrides.json`. The live page applies it on load; the next Unity rebuild bakes it in.

## Cameras
- **Fly camera: On.** Right-drag to look, WASD to move, Q/E down/up, Shift for speed. FOV dial in **Camera**.
- Pick a **view** (overview or a station) and **Save camera to view**, then **Save layout**.
- **Go to view** / **Back to the room** to check the result with the normal camera.

## Light and look
- **Look**: exposure, ambient, haze and haze glow (the light shafts), bloom, grain, vignette, contrast, saturation, ceiling lights.
- **Lights**: every practical by name (city key, desk lamp, the pools of light over each station).
- **Fidelity**: 0 clay (no materials, no shadows, flat light) for blocking out; 1 adds shadows; 2 materials; 3 the grade; 4 haze and rain.

## Point and prompt
- **Tool: Note.** Click anywhere in the room, write what you want there, Ctrl+Enter to save.
- Notes land in `esper-unity/Notes/notes.json` with the exact 3D point, the surface, the camera and a screenshot. Ask Claude to "work through the Studio notes".
