"use client";

import { DialRoot, useDialKit, useDialKitController } from "dialkit";
import "dialkit/styles.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Studio: internal tooling for arranging the room. Dev only (/lab/esper?studio).
 * - Move: click an object, drag it across the floor, fine-tune with the Selection dials, [ ] to rotate.
 * - Note: click any point in the room and write what you want there; saved with a screenshot for Claude.
 * - Camera: fly (right-drag look, WASD, Q/E, Shift) and save the view to any station.
 * - Look / Lights / Fidelity: tune the render, or strip it back to clay.
 * Save layout writes esper-unity/Layout/overrides.json (baked by the scene builder; applied live on load).
 */

type Send = (method: string, value?: string) => void;
type ObjectOverride = { path: string; p: number[]; ry: number; s: number };
type ViewOverride = { id: string; pos: number[]; target: number[]; fov: number };
type KV = { key: string; value: number };
type Overrides = { objects: ObjectOverride[]; views: ViewOverride[]; lights: KV[]; look: KV[] };
type SceneInfo = { objects: string[]; lights: KV[]; views: string[] };
type Point = { p: number[]; n: number[]; path: string; cam: number[]; sx: number; sy: number };
type Note = { id: string; text: string; point: number[]; path?: string; image?: string };

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
};
const geist = "font-[family-name:var(--font-geist)]";

export function EsperStudio({ send, canvas }: { send: Send; canvas: HTMLCanvasElement | null }) {
  const overrides = useRef<Overrides>({ objects: [], views: [], lights: [], look: [] });
  const [scene, setScene] = useState<SceneInfo | null>(null);
  const [selection, setSelection] = useState<ObjectOverride | null>(null);
  const [point, setPoint] = useState<Point | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState("");

  const upsert = <T extends { key?: string; id?: string; path?: string }>(list: T[], item: T, by: keyof T) => {
    const i = list.findIndex((x) => x[by] === item[by]);
    if (i >= 0) list[i] = item;
    else list.push(item);
  };

  // Load saved overrides once.
  useEffect(() => {
    fetch("/api/esper-studio")
      .then((r) => r.json())
      .then((o: Overrides) => {
        overrides.current = { objects: o.objects ?? [], views: o.views ?? [], lights: o.lights ?? [], look: o.look ?? [] };
      })
      .catch(() => {});
    fetch("/api/esper-notes")
      .then((r) => r.json())
      .then(setNotes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    send("SetPins", JSON.stringify({ pins: notes.map((n) => ({ p: n.point })) }));
  }, [notes, send]);

  // Unity -> Studio events.
  useEffect(() => {
    const on = (e: Event) => {
      const { event, payload } = (e as CustomEvent<{ event: string; payload: string }>).detail;
      if (event === "studio-scene") setScene(JSON.parse(payload));
      else if (event === "studio-select") setSelection(payload ? JSON.parse(payload) : null);
      else if (event === "studio-moved") {
        const o = JSON.parse(payload) as ObjectOverride;
        setSelection(o);
        upsert(overrides.current.objects, o, "path");
      } else if (event === "studio-view") {
        const v = JSON.parse(payload) as ViewOverride;
        upsert(overrides.current.views, v, "id");
        setStatus(`Saved the camera to ${v.id}`);
      } else if (event === "studio-point") setPoint(JSON.parse(payload));
    };
    window.addEventListener("esper", on);
    return () => window.removeEventListener("esper", on);
  }, []);

  const save = useCallback(async () => {
    await fetch("/api/esper-studio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(overrides.current) });
    setStatus("Layout saved");
  }, []);

  // ---- Studio panel ----
  const studio = useDialKit(
    "Studio",
    {
      tool: { type: "select", options: ["Move", "Note"], default: "Move" },
      fidelity: [4, 0, 4, 1],
      flyCamera: false,
      save: { type: "action", label: "Save layout" },
    },
    { onAction: (a) => a === "save" && save() },
  );
  useEffect(() => send("SetTool", studio.tool === "Note" ? "note" : "select"), [studio.tool, send]);
  useEffect(() => send("Fidelity", String(studio.fidelity)), [studio.fidelity, send]);
  useEffect(() => send("SetFly", studio.flyCamera ? "1" : "0"), [studio.flyCamera, send]);

  // ---- Look panel ----
  const look = useDialKit("Look", {
    exposure: [0.9, -1, 3, 0.05],
    ambient: [1, 0, 4, 0.05],
    haze: [0.06, 0, 0.3, 0.005],
    hazeGlow: [1, 0, 3, 0.05],
    bloom: [0.75, 0, 3, 0.05],
    grain: [0.38, 0, 1, 0.01],
    vignette: [0.34, 0, 1, 0.01],
    contrast: [14, -50, 50, 1],
    saturation: [-6, -100, 50, 1],
    lightsOn: false,
  });
  const lastLook = useRef<Record<string, number>>({});
  useEffect(() => {
    const parts: string[] = [];
    for (const [k, key] of Object.entries(LOOK_KEYS)) {
      const v = look[k as keyof typeof look] as number;
      if (lastLook.current[k] === v) continue;
      lastLook.current[k] = v;
      parts.push(`${key}=${v}`);
      upsert(overrides.current.look, { key, value: v }, "key");
    }
    if (parts.length) send("Look", parts.join(";"));
  }, [look, send]);
  useEffect(() => send("SetLights", look.lightsOn ? "1" : "0"), [look.lightsOn, send]);

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
      {scene && <LightsPanel key={scene.lights.map((l) => l.key).join()} lights={scene.lights} send={send} overrides={overrides} />}
      {selection && <SelectionPanel selection={selection} send={send} onChange={(o) => upsert(overrides.current.objects, o, "path")} />}

      {point && (
        <NoteComposer
          point={point}
          onCancel={() => setPoint(null)}
          onSave={async (text) => {
            const imageData = canvas ? canvas.toDataURL("image/png") : undefined;
            const res = await fetch("/api/esper-notes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, point: point.p, normal: point.n, path: point.path, camera: point.cam, screen: [point.sx, point.sy], imageData }),
            });
            const note = (await res.json()) as Note;
            setNotes((n) => [...n, note]);
            setPoint(null);
            setStatus("Note saved for Claude");
          }}
        />
      )}

      <div className={cn("pointer-events-auto fixed bottom-5 left-5 z-20 w-[300px] text-white", geist)}>
        {notes.length > 0 && (
          <div className="mb-2 max-h-[40vh] overflow-y-auto rounded-2xl bg-black/60 p-2 backdrop-blur-xl scrollbar-hide">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-2 rounded-xl px-2 py-1.5 text-[12.5px] hover:bg-white/[0.06]">
                <span className="text-white/85">{n.text}</span>
                <button
                  type="button"
                  aria-label="Delete note"
                  className="shrink-0 text-white/40 hover:text-white"
                  onClick={async () => {
                    await fetch("/api/esper-notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
                    setNotes((all) => all.filter((x) => x.id !== n.id));
                  }}
                >
                  ×
                </button>
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

function LightsPanel({ lights, send, overrides }: { lights: KV[]; send: Send; overrides: React.RefObject<Overrides> }) {
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
        const list = overrides.current.lights;
        const i = list.findIndex((x) => x.key === l.key);
        if (i >= 0) list[i] = { key: l.key, value: v };
        else list.push({ key: l.key, value: v });
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
      drop: { type: "action", label: "Drop onto surface" },
    },
    { onAction: (a) => a === "drop" && send("DropSelected", "") },
  );
  const echo = useRef("");
  // Selection changed in the room: load it into the dials without echoing back.
  useEffect(() => {
    const v = { x: r2(selection.p[0]), y: r2(selection.p[1]), z: r2(selection.p[2]), rotation: Math.round(selection.ry), scale: r2(selection.s) };
    echo.current = JSON.stringify(v);
    dial.setValues(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.path, selection.p[0], selection.p[1], selection.p[2], selection.ry, selection.s]);
  const { x, y, z, rotation, scale } = dial.values;
  useEffect(() => {
    const v = JSON.stringify({ x, y, z, rotation, scale });
    if (v === echo.current) return;
    echo.current = v;
    const o = { path: selection.path, p: [x, y, z], ry: rotation, s: scale };
    send("SetSelected", JSON.stringify(o));
    onChange(o);
  }, [x, y, z, rotation, scale, selection.path, send, onChange]);
  return null;
}

function NoteComposer({ point, onSave, onCancel }: { point: Point; onSave: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState("");
  const left = `clamp(16px, calc(${point.sx * 100}% + 14px), calc(100% - 660px))`;
  const top = `clamp(16px, calc(${point.sy * 100}% - 20px), calc(100% - 200px))`;
  return (
    <div className={cn("pointer-events-auto fixed z-[2147483000] w-[320px] rounded-[22px] bg-[rgba(30,30,34,0.72)] p-3 text-white shadow-2xl backdrop-blur-2xl", geist)} style={{ left, top }}>
      <p className="px-1 pb-2 text-[12px] text-white/55">{point.path.split("/").slice(-1)[0].replace(/#\d+$/, "")}</p>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) onSave(text.trim());
          if (e.key === "Escape") onCancel();
        }}
        placeholder="What should be here?"
        rows={3}
        className="w-full resize-none rounded-xl bg-white/[0.08] px-3 py-2 text-[14px] leading-snug outline-none placeholder:text-white/40 focus:bg-white/[0.12]"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-full px-3 py-1.5 text-[13px] text-white/70 hover:bg-white/[0.08]">
          Cancel
        </button>
        <button
          type="button"
          disabled={!text.trim()}
          onClick={() => onSave(text.trim())}
          className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-black disabled:opacity-40"
        >
          Save note
        </button>
      </div>
    </div>
  );
}

const round = (v: number) => Math.round(v * 100) / 100;
const r2 = round;
