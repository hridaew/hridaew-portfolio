"use client";

import { DialRoot, useDialKit, useDialKitController } from "dialkit";
import "dialkit/styles.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Studio: internal tooling for arranging the room. Dev only (/lab/esper?studio).
 * - Move: click an object, drag it across the floor, fine-tune with the Selection dials, [ ] to rotate.
 * - Prompt: click any point in the room and say what should change; an agent edits the live scene right away
 *   (api/esper-prompt) and you watch it land. Each prompt can be undone.
 * - Camera: fly (right-drag look, WASD, Q/E, Shift) and save the view to any station.
 * - Look / Lights / Fidelity: tune the render, or strip it back to clay.
 * Every edit autosaves to esper-unity/Live/scene.json (the live spec); open pages re-apply it within a second
 * and the next Unity build bakes it.
 */

type Send = (method: string, value?: string) => void;
type ObjectOverride = { path: string; p: number[]; ry: number; s: number; rough?: number };
type ViewOverride = { id: string; pos: number[]; target: number[]; fov: number };
type KV = { key: string; value: number };
type Op = Record<string, unknown> & { op: string };

/** Coalesce edits (slider drags) into one write per pause. Keyed so later edits replace earlier ones. */
function usePatchQueue(onSaved: () => void) {
  const queue = useRef(new Map<string, Op>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (key: string, op: Op) => {
      queue.current.set(key, op);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const ops = [...queue.current.values()];
        queue.current.clear();
        await fetch("/api/esper-live", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ops) });
        onSaved();
      }, 220);
    },
    [onSaved],
  );
}
type SceneInfo = { objects: string[]; lights: KV[]; views: string[] };
type Point = { p: number[]; n: number[]; path: string; cam: number[]; sx: number; sy: number };
type Status = "queued" | "running" | "done" | "failed" | "undone";
type Note = { id: string; text: string; point: number[]; path?: string; image?: string; status?: Status; reply?: string };
type Job = { id: string; text: string; sx: number; sy: number; status: Status; step: string; reply: string };

const LOOK_KEYS: Record<string, string> = {
  exposure: "exposure",
  ambient: "ambient",
  haze: "vol._Density",
  hazeGlow: "vol._VolIntensity",
  bloom: "bloom",
  grain: "grain",
  vignette: "vignette",
  contrast: "contrast",
  saturation: "saturation",
  reflections: "reflections",
};
const LOOK_DEFAULTS: Record<string, number> = {
  exposure: 0.9,
  ambient: 1,
  "vol._Density": 0.06,
  "vol._VolIntensity": 1,
  bloom: 0.75,
  grain: 0.38,
  vignette: 0.34,
  contrast: 14,
  saturation: -6,
  reflections: 1,
};
// Render styles, in StylizeFeature.Styles order; each opens at a size that suits it.
const STYLES = ["None", "Pixel", "Voxel", "Obra Dinn", "Pixar", "Cyberspace", "Cel", "Noir"];
const STYLE_SIZE: Record<string, number> = { Pixel: 6, Voxel: 6, "Obra Dinn": 2, Pixar: 4, Cyberspace: 1, Cel: 2, Noir: 1, None: 4 };
const CAPS: Record<string, number> = { "720p": 720, "1080p": 1080, "1440p": 1440, Native: 0 };
const AA = ["Off", "FXAA", "SMAA", "TAA"];
const UPSCALE = ["Linear", "Point"];
const geist = "font-[family-name:var(--font-geist)]";

export function EsperStudio({ send, canvas }: { send: Send; canvas: HTMLCanvasElement | null }) {
  const [scene, setScene] = useState<SceneInfo | null>(null);
  const [selection, setSelection] = useState<ObjectOverride | null>(null);
  const [point, setPoint] = useState<Point | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState("");
  const [active, setActive] = useState<Job | null>(null);

  const onSaved = useCallback(() => setStatus("Saved"), []);
  const patch = usePatchQueue(onSaved);

  useEffect(() => {
    fetch("/api/esper-prompt")
      .then((r) => r.json())
      .then(setNotes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const open = notes.filter((n) => n.status === "queued" || n.status === "running" || !n.status);
    send("SetPins", JSON.stringify({ pins: open.map((n) => ({ p: n.point })) }));
  }, [notes, send]);

  // Unity -> Studio events.
  useEffect(() => {
    const on = (e: Event) => {
      const { event, payload } = (e as CustomEvent<{ event: string; payload: string }>).detail;
      if (event === "studio-scene") setScene(JSON.parse(payload));
      else if (event === "studio-select") setSelection(payload ? JSON.parse(payload) : null);
      else if (event === "studio-moved") {
        const o = JSON.parse(payload) as ObjectOverride;
        setSelection((cur) => ({ ...o, rough: cur?.path === o.path ? cur.rough : o.rough }));
        patch(`item:${o.path}`, { op: "item", id: o.path, p: o.p, ry: o.ry, s: o.s });
      } else if (event === "studio-view") {
        const v = JSON.parse(payload) as ViewOverride;
        patch(`view:${v.id}`, { op: "view", id: v.id, p: v.pos, target: v.target, fov: v.fov });
        setStatus(`Camera saved to ${v.id}`);
      } else if (event === "studio-point") setPoint(JSON.parse(payload));
    };
    window.addEventListener("esper", on);
    return () => window.removeEventListener("esper", on);
  }, [patch]);

  // ---- Point and prompt: an agent edits the live scene while you watch ----
  const agentRef = useRef<"claude" | "cursor">("claude");
  const runPrompt = useCallback(
    async (text: string, at: Point) => {
      setPoint(null);
      const imageData = canvas ? canvas.toDataURL("image/png") : undefined;
      const res = await fetch("/api/esper-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, point: at.p, normal: at.n, path: at.path, camera: at.cam, screen: [at.sx, at.sy], imageData, agent: agentRef.current }),
      });
      const id = res.headers.get("X-Prompt-Id") ?? `local-${Date.now()}`;
      setActive({ id, text, sx: at.sx, sy: at.sy, status: "queued", step: "Thinking", reply: "" });
      setNotes((all) => [...all, { id, text, point: at.p, path: at.path, status: "queued" }]);
      const set = (patch: Partial<Job>) => {
        setActive((a) => (a && a.id === id ? { ...a, ...patch } : a));
        if (patch.status || patch.reply)
          setNotes((all) => all.map((n) => (n.id === id ? { ...n, ...(patch.status && { status: patch.status }), ...(patch.reply && { reply: patch.reply }) } : n)));
      };
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (!line.trim()) continue;
          const e = JSON.parse(line) as { type: string; status?: Status; label?: string; text?: string };
          if (e.type === "status" && e.status) set({ status: e.status });
          if (e.type === "step" && e.label) set({ step: e.label });
          if (e.type === "reply") set({ reply: e.text ?? "" });
        }
      }
    },
    [canvas],
  );
  const undo = useCallback(async (id: string) => {
    await fetch("/api/esper-prompt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ undo: id }) });
    setActive((a) => (a && a.id === id ? { ...a, status: "undone", reply: "Undone" } : a));
    setNotes((all) => all.map((n) => (n.id === id ? { ...n, status: "undone" } : n)));
  }, []);

  // ---- Studio panel ----
  const studio = useDialKit(
    "Studio",
    {
      tool: { type: "select", options: ["Move", "Prompt"], default: "Move" },
      agent: { type: "select", options: ["Claude", "Cursor"], default: "Claude" },
      fidelity: [4, 0, 4, 1],
      flyCamera: false,
    },
  );
  agentRef.current = studio.agent === "Cursor" ? "cursor" : "claude";
  useEffect(() => send("SetTool", studio.tool === "Prompt" ? "note" : "select"), [studio.tool, send]);
  useEffect(() => send("Fidelity", String(studio.fidelity)), [studio.fidelity, send]);
  useEffect(() => send("SetFly", studio.flyCamera ? "1" : "0"), [studio.flyCamera, send]);

  // ---- Look, style and render panels start from what's saved in the scene ----
  const [savedLook, setSavedLook] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    fetch("/api/esper-live", { cache: "no-store" })
      .then((r) => r.json())
      .then((sc: { look?: Record<string, number> }) => setSavedLook(sc.look ?? {}))
      .catch(() => setSavedLook({}));
  }, []);

  // ---- Camera panel ----
  const camera = useDialKit(
    "Camera",
    {
      view: { type: "select", options: scene?.views ?? ["overview"], default: "overview" },
      fov: [46, 20, 90, 1],
      goTo: { type: "action", label: "Go to view" },
      saveView: { type: "action", label: "Save camera to view" },
      room: { type: "action", label: "Back to the room" },
    },
    {
      onAction: (a) => {
        const v = cameraRef.current.view;
        if (a === "goTo") v === "overview" ? send("Back") : send("Goto", v);
        if (a === "saveView") send("SaveView", v);
        if (a === "room") send("Back");
      },
    },
  );
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  useEffect(() => {
    if (studio.flyCamera) send("SetFov", String(camera.fov));
  }, [camera.fov, studio.flyCamera, send]);

  return (
    <>
      <DialRoot position="top-right" theme="dark" />
      {savedLook && <LookPanels saved={savedLook} send={send} patch={patch} />}
      {scene && <LightsPanel key={scene.lights.map((l) => l.key).join()} lights={scene.lights} send={send} patch={patch} />}
      {selection && (
        <SelectionPanel selection={selection} send={send} onChange={(o) => patch(`item:${o.path}`, { op: "item", id: o.path, p: o.p, ry: o.ry, s: o.s, rough: o.rough })} />
      )}

      {point && <PromptComposer point={point} onCancel={() => setPoint(null)} onSubmit={(text) => runPrompt(text, point)} />}
      {active && <PromptStatus job={active} onUndo={() => undo(active.id)} onClose={() => setActive(null)} />}

      <div className={cn("pointer-events-auto fixed bottom-5 left-5 z-20 w-[300px] text-white", geist)}>
        {notes.length > 0 && (
          <div className="mb-2 max-h-[40vh] overflow-y-auto rounded-2xl bg-black/60 p-2 backdrop-blur-xl scrollbar-hide">
            {notes.map((n) => (
              <div key={n.id} className="group flex items-start justify-between gap-2 rounded-xl px-2 py-1.5 text-[12.5px] hover:bg-white/[0.06]">
                <span className={cn("text-white/85", n.status === "undone" && "text-white/35 line-through")}>
                  {n.text}
                  {n.reply && n.status !== "undone" && <span className="mt-0.5 block text-white/45">{n.reply}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2 pt-1">
                  {(n.status === "queued" || n.status === "running") && <Pulse />}
                  {n.status === "failed" && <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b5e]" aria-label="Failed" />}
                  <button
                    type="button"
                    aria-label="Remove"
                    className="-mt-1 text-white/30 opacity-0 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={async () => {
                      await fetch("/api/esper-notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
                      setNotes((all) => all.filter((x) => x.id !== n.id));
                    }}
                  >
                    ×
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="rounded-full bg-black/60 px-3 py-1.5 text-[12px] text-white/70 backdrop-blur-xl">
          Studio{status ? ` — ${status}` : ""}
        </p>
      </div>
    </>
  );
}

function LightsPanel({ lights, send, patch }: { lights: KV[]; send: Send; patch: (key: string, op: Op) => void }) {
  // Screen glows and ceiling tubes are driven by their own components; leave them out.
  const editable = useMemo(() => lights.filter((l) => !/Glow$|TubeLight/.test(l.key)), [lights]);
  const config = useMemo(
    () => Object.fromEntries(editable.map((l) => [l.key, [round(l.value), 0, Math.max(4, round(l.value * 4)), 0.05]])) as Record<string, [number, number, number, number]>,
    [editable],
  );
  const values = useDialKit("Lights", config, { defaultCollapsed: true });
  const last = useRef<Record<string, number>>({});
  useEffect(() => {
    const parts: string[] = [];
    for (const l of editable) {
      const v = (values as Record<string, number>)[l.key];
      if (v === undefined || last.current[l.key] === v) continue;
      if (last.current[l.key] !== undefined) {
        parts.push(`light.${l.key}=${v}`);
        patch(`light:${l.key}`, { op: "light", id: l.key, intensity: v });
      }
      last.current[l.key] = v;
    }
    if (parts.length) send("Look", parts.join(";"));
  });
  return null;
}

function SelectionPanel({ selection, send, onChange }: { selection: ObjectOverride; send: Send; onChange: (o: ObjectOverride) => void }) {
  const dial = useDialKitController(
    "Selection",
    {
      x: [0, -5, 5, 0.01],
      y: [0, 0, 3.3, 0.01],
      z: [0, -3.75, 3.75, 0.01],
      rotation: [0, 0, 360, 1],
      scale: [1, 0.2, 3, 0.01],
      roughness: [1, 0.5, 4, 0.05],
      drop: { type: "action", label: "Drop onto surface" },
    },
    { onAction: (a) => a === "drop" && send("DropSelected", "") },
  );
  const echo = useRef("");
  // Selection changed in the room: load it into the dials without echoing back.
  useEffect(() => {
    const v = { x: r2(selection.p[0]), y: r2(selection.p[1]), z: r2(selection.p[2]), rotation: Math.round(selection.ry), scale: r2(selection.s), roughness: r2(selection.rough ?? 1) };
    echo.current = JSON.stringify(v);
    dial.setValues(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.path, selection.p[0], selection.p[1], selection.p[2], selection.ry, selection.s, selection.rough]);
  const { x, y, z, rotation, scale, roughness } = dial.values;
  useEffect(() => {
    const v = JSON.stringify({ x, y, z, rotation, scale, roughness });
    if (v === echo.current) return;
    echo.current = v;
    const o = { path: selection.path, p: [x, y, z], ry: rotation, s: scale, rough: roughness };
    send("SetSelected", JSON.stringify(o));
    onChange(o);
  }, [x, y, z, rotation, scale, roughness, selection.path, send, onChange]);
  return null;
}

function PromptComposer({ point, onSubmit, onCancel }: { point: Point; onSubmit: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState("");
  const target = point.path.split("/").slice(-1)[0].replace(/#\d+$/, "");
  return (
    <div className={cn(glass, "w-[320px] p-3")} style={anchor(point.sx, point.sy)}>
      <p className="px-1 pb-2 text-[12px] text-white/55">{target}</p>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && text.trim()) {
            e.preventDefault();
            onSubmit(text.trim());
          }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="What should change here?"
        rows={2}
        className="w-full resize-none rounded-xl bg-white/[0.08] px-3 py-2 text-[14px] leading-snug outline-none placeholder:text-white/40 focus:bg-white/[0.12]"
      />
    </div>
  );
}

function PromptStatus({ job, onUndo, onClose }: { job: Job; onUndo: () => void; onClose: () => void }) {
  const working = job.status === "queued" || job.status === "running";
  return (
    <div className={cn(glass, "w-[320px] px-4 py-3")} style={anchor(job.sx, job.sy)} role="status" aria-live="polite">
      <p className="text-[13px] text-white/50">{job.text}</p>
      <div className="mt-1.5 flex items-start gap-2.5 text-[14px] leading-snug">
        {working && <Pulse className="mt-[7px]" />}
        <span className={cn("text-white/90", job.status === "failed" && "text-[#ffb4ac]")}>
          {working ? (job.status === "queued" ? "Waiting for the previous change" : job.step) : job.reply || (job.status === "undone" ? "Undone" : "Done")}
        </span>
      </div>
      {!working && (
        <div className="mt-2.5 flex justify-end gap-1">
          {job.status === "done" && (
            <button type="button" onClick={onUndo} className="rounded-full px-3 py-1 text-[13px] text-white/75 hover:bg-white/[0.08]">
              Undo
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-full bg-white/[0.12] px-3 py-1 text-[13px] font-medium text-white hover:bg-white/[0.18]">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function Pulse({ className }: { className?: string }) {
  return <span className={cn("block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#7fe3ff]", className)} />;
}

const glass = "pointer-events-auto fixed z-[2147483000] rounded-[22px] bg-[rgba(30,30,34,0.72)] text-white shadow-2xl backdrop-blur-2xl font-[family-name:var(--font-geist)]";
// Beside the clicked point, kept clear of the screen edges and the DialKit panel.
const anchor = (sx: number, sy: number) => ({
  left: `clamp(16px, calc(${sx * 100}% + 14px), calc(100% - 660px))`,
  top: `clamp(16px, calc(${sy * 100}% - 20px), calc(100% - 200px))`,
});

function LookPanels({ saved, send, patch }: { saved: Record<string, number>; send: Send; patch: (key: string, op: Op) => void }) {
  const v = (key: string) => saved[key] ?? LOOK_DEFAULTS[key];
  const look = useDialKit("Look", {
    exposure: [v("exposure"), -1, 3, 0.05],
    ambient: [v("ambient"), 0, 4, 0.05],
    reflections: [v("reflections"), 0, 2, 0.05],
    haze: [v("vol._Density"), 0, 0.3, 0.005],
    hazeGlow: [v("vol._VolIntensity"), 0, 3, 0.05],
    bloom: [v("bloom"), 0, 3, 0.05],
    grain: [v("grain"), 0, 1, 0.01],
    vignette: [v("vignette"), 0, 1, 0.01],
    contrast: [v("contrast"), -50, 50, 1],
    saturation: [v("saturation"), -100, 50, 1],
    lightsOn: false,
  });
  const styleDial = useDialKitController("Style", {
    style: { type: "select", options: STYLES, default: STYLES[saved.style ?? 0] ?? "None" },
    size: [saved["style.size"] ?? 4, 1, 24, 0.5],
  });
  const style = styleDial.values as { style: string; size: number };
  const render = useDialKit(
    "Render",
    {
      resolution: { type: "select", options: Object.keys(CAPS), default: Object.keys(CAPS).find((k) => CAPS[k] === (saved["pipe.cap"] ?? 1080)) ?? "1080p" },
      antialiasing: { type: "select", options: AA, default: AA[saved["pipe.aa"] ?? 2] ?? "SMAA" },
      upscaling: { type: "select", options: UPSCALE, default: UPSCALE[saved["pipe.upscale"] ?? 0] ?? "Linear" },
    },
    { defaultCollapsed: true },
  );

  // Every dial maps to one look key; push changes to the room and autosave them to the scene.
  const values: Record<string, number> = {
    ...Object.fromEntries(Object.entries(LOOK_KEYS).map(([k, key]) => [key, look[k as keyof typeof look] as number])),
    style: Math.max(0, STYLES.indexOf(style.style)),
    "style.size": style.size,
    "pipe.cap": CAPS[render.resolution] ?? 1080,
    "pipe.aa": Math.max(0, AA.indexOf(render.antialiasing)),
    "pipe.upscale": Math.max(0, UPSCALE.indexOf(render.upscaling)),
  };
  const last = useRef<Record<string, number> | null>(null);
  const key = JSON.stringify(values);
  useEffect(() => {
    const prev = last.current;
    last.current = values;
    const changed = Object.fromEntries(Object.entries(values).filter(([k, val]) => !prev || prev[k] !== val));
    if (!Object.keys(changed).length) return;
    send("Look", Object.entries(changed).map(([k, val]) => `${k}=${val}`).join(";"));
    // The first pass only syncs the room to the saved values; persist real edits after that.
    if (prev) patch("look", { op: "look", values });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, send, patch]);

  // A new style opens at the size that suits it.
  const lastStyle = useRef(style.style);
  useEffect(() => {
    if (lastStyle.current === style.style) return;
    lastStyle.current = style.style;
    styleDial.setValues({ size: STYLE_SIZE[style.style] ?? 4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style.style]);

  useEffect(() => send("SetLights", look.lightsOn ? "1" : "0"), [look.lightsOn, send]);
  return null;
}

const round = (v: number) => Math.round(v * 100) / 100;
const r2 = round;
