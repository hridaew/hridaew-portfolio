import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Studio layout overrides (dev only). Source of truth: esper-unity/Layout/overrides.json (baked by the
// scene builder). A copy is served at /esper/overrides.json so the live build applies edits immediately.
const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "esper-unity", "Layout", "overrides.json");
const SERVED = path.join(ROOT, "public", "esper", "overrides.json");
const EMPTY = { objects: [], views: [], lights: [], look: [] };

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  try {
    return NextResponse.json(JSON.parse(await fs.readFile(SOURCE, "utf8")));
  } catch {
    return NextResponse.json(EMPTY);
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await req.json();
  const json = JSON.stringify({ ...EMPTY, ...body }, null, 2);
  await fs.mkdir(path.dirname(SOURCE), { recursive: true });
  await fs.writeFile(SOURCE, json);
  await fs.mkdir(path.dirname(SERVED), { recursive: true });
  await fs.writeFile(SERVED, json);
  return NextResponse.json({ ok: true });
}
