# ESPER Studio

Open **http://localhost:3000/lab/esper?studio** (dev server only). The DialKit panel sits top right; collapse it to see the whole frame.

## Everything is live
The room is described by one file: **`esper-unity/Live/scene.json`** (items, lights, camera views, stations, look). It is the source of truth.
- Studio edits autosave to it as you make them. There is no Save button.
- Any change to the file, whether from Studio, a text editor or Claude, appears in every open tab within a second. There is no reload or rebuild.
- Moves only shift the object. Screen, photo and tint changes re-dress it in place. A new model or a new `src` loads it on the fly from the Unity project.
- A Unity rebuild (`Tools/rebuild.sh --web`) bakes the same file into the shipped build and its lighting. Rebuild when you are happy with a layout; you don't need to while iterating.

## Arrange the room
- **Tool: Move.** Click an object to select it (cyan box). Drag to slide it across the floor. Hold `[` or `]` to rotate.
- **Selection** dials fine-tune X, Y, Z, rotation and scale. **Drop onto surface** sits it on whatever is below.

## Cameras
- **Fly camera: On.** Right-drag to look, WASD to move, Q/E down/up, Shift for speed. FOV dial in **Camera**.
- Pick a **view** (overview or a station), then **Save camera to view**.
- **Go to view** / **Back to the room** to check the result with the normal camera.

## Light and look
- **Look**: exposure, ambient, haze and haze glow (the light shafts), bloom, grain, vignette, contrast, saturation, ceiling lights.
- **Lights**: every practical by name (city key, desk lamp, the pools of light over each station).
- **Fidelity**: 0 clay (no materials, no shadows, flat light) for blocking out; 1 adds shadows; 2 materials; 3 the grade; 4 haze and rain.

## Point and prompt (live)
- **Tool: Prompt.** Click anywhere in the room, say what should change ("a plant here", "make this screen bigger"), press Enter.
- A Claude Code agent picks it up immediately. It gets the exact 3D point, the object, the camera and a screenshot, and edits `scene.json`; the change lands in the room as it saves. Progress shows beside the pin, then one line on what changed, with **Undo**.
- Prompts run one at a time, in order. They're logged in `esper-unity/Notes/notes.json`, with a pre-change snapshot of the scene for each in `Notes/history/`.
- The agent can only edit `scene.json`, and only with models and images already in the project. Its brief is `esper-unity/Live/AGENT.md`; other agents (Cursor, Codex) can use the same file.
- One-time setup: the CLI must be signed in. Run `claude` in a terminal and use `/login`.
