import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Dev only: serve models and content straight from the Unity project so the live scene can load
// anything the spec names (e.g. a newly added Poly Haven model) without copying or rebuilding.
// This checkout often has the published copies and not the Unity ThirdParty library, so fall back there.
const ROOTS = [
  path.join(process.cwd(), "esper-unity", "Assets"),
  path.join(process.cwd(), "public", "esper", "assets"),
];
const TYPES: Record<string, string> = {
  ".gltf": "model/gltf+json",
  ".glb": "model/gltf-binary",
  ".bin": "application/octet-stream",
  ".splat": "application/octet-stream",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const rel = (await params).path.map(decodeURIComponent).join("/");
  const type = TYPES[path.extname(rel).toLowerCase()];
  if (!type) return new NextResponse(null, { status: 415 });
  for (const root of ROOTS) {
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep)) return new NextResponse(null, { status: 403 });
    try {
      const data = await fs.readFile(file);
      return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": type, "Cache-Control": "no-cache" } });
    } catch {
      // Try the published copy next.
    }
  }
  return new NextResponse(null, { status: 404 });
}
