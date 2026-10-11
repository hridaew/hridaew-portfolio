import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Point-and-prompt notes from Studio (dev only): esper-unity/Notes/notes.json plus a screenshot per note.
const DIR = path.join(process.cwd(), "esper-unity", "Notes");
const FILE = path.join(DIR, "notes.json");

type Note = {
  id: string;
  text: string;
  point: number[];
  normal?: number[];
  path?: string;
  camera?: number[];
  screen?: [number, number];
  image?: string;
  created: string;
  done?: boolean;
};

export const dynamic = "force-dynamic";

async function readNotes(): Promise<Note[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  return NextResponse.json(await readNotes());
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = (await req.json()) as Omit<Note, "id" | "created" | "image"> & { imageData?: string };
  const notes = await readNotes();
  const id = `note-${Date.now().toString(36)}`;
  await fs.mkdir(DIR, { recursive: true });
  let image: string | undefined;
  if (body.imageData?.startsWith("data:image/png;base64,")) {
    image = `${id}.png`;
    await fs.writeFile(path.join(DIR, image), Buffer.from(body.imageData.split(",")[1], "base64"));
  }
  const note: Note = {
    id,
    text: body.text,
    point: body.point,
    normal: body.normal,
    path: body.path,
    camera: body.camera,
    screen: body.screen,
    image,
    created: new Date().toISOString(),
  };
  notes.push(note);
  await fs.writeFile(FILE, JSON.stringify(notes, null, 2));
  return NextResponse.json(note);
}

export async function DELETE(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const { id } = (await req.json()) as { id: string };
  const notes = (await readNotes()).filter((n) => n.id !== id);
  await fs.writeFile(FILE, JSON.stringify(notes, null, 2));
  return NextResponse.json({ ok: true });
}
