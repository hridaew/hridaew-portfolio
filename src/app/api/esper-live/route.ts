import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// The live scene spec (dev only). Source of truth: esper-unity/Live/scene.json, edited by Studio (PATCH)
// or directly. Every write is mirrored to public/esper/live/scene.json for the deployed build.
const SOURCE = path.join(process.cwd(), "esper-unity", "Live", "scene.json");
const SERVED = path.join(process.cwd(), "public", "esper", "live", "scene.json");

type Item = { id: string; p?: number[]; r?: number[]; s?: number[]; [k: string]: unknown };
type Light = { id: string; intensity?: number; [k: string]: unknown };
type View = { id: string; p?: number[]; target?: number[]; fov?: number };
type Scene = { items: Item[]; lights: Light[]; views: View[]; stations: unknown[]; look?: Record<string, number> };

type Op =
  | { op: "item"; id: string; p?: number[]; ry?: number; s?: number }
  | { op: "light"; id: string; intensity: number }
  | { op: "view"; id: string; p: number[]; target: number[]; fov: number }
  | { op: "look"; values: Record<string, number> };

export const dynamic = "force-dynamic";

const r4 = (v: number) => Math.round(v * 10000) / 10000;

export async function GET() {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  return new NextResponse(await fs.readFile(SOURCE, "utf8"), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } });
}

export async function PATCH(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const ops = (await req.json()) as Op[];
  const scene = JSON.parse(await fs.readFile(SOURCE, "utf8")) as Scene;
  for (const o of ops) {
    if (o.op === "item") {
      const item = scene.items.find((i) => i.id === o.id);
      if (!item) continue;
      if (o.p) item.p = o.p.map(r4);
      if (o.ry !== undefined) {
        const r = item.r ?? [0, 0, 0];
        item.r = [r[0], r4(o.ry), r[2]];
      }
      if (o.s !== undefined) item.s = Math.abs(o.s - 1) < 1e-4 ? undefined : [r4(o.s)];
    } else if (o.op === "light") {
      const light = scene.lights.find((l) => l.id === o.id);
      if (light) light.intensity = r4(o.intensity);
    } else if (o.op === "view") {
      const view = scene.views.find((v) => v.id === o.id) ?? (scene.views.push({ id: o.id }), scene.views[scene.views.length - 1]);
      view.p = o.p.map(r4);
      view.target = o.target.map(r4);
      view.fov = r4(o.fov);
    } else if (o.op === "look") {
      scene.look = { ...(scene.look ?? {}), ...Object.fromEntries(Object.entries(o.values).map(([k, v]) => [k, r4(v)])) };
    }
  }
  const json = JSON.stringify(scene, null, 2);
  await fs.writeFile(SOURCE, json);
  await fs.mkdir(path.dirname(SERVED), { recursive: true });
  await fs.writeFile(SERVED, json);
  return NextResponse.json({ ok: true });
}
