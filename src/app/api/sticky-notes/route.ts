import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const FILE_PATH = join(DATA_DIR, "sticky-notes.json");

async function ensureFile() {
    try {
        await mkdir(DATA_DIR, { recursive: true });
        await readFile(FILE_PATH, "utf-8");
    } catch {
        await writeFile(FILE_PATH, "[]", "utf-8");
    }
}

async function getNotes() {
    await ensureFile();
    const raw = await readFile(FILE_PATH, "utf-8");
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export async function GET() {
    const notes = await getNotes();
    return NextResponse.json(notes);
}

export async function POST(request: Request) {
    const note = await request.json();

    if (!note.message || typeof note.message !== "string") {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const notes = await getNotes();
    notes.push({
        id: note.id || Date.now().toString(36),
        message: note.message.slice(0, 200),
        email: note.email?.slice(0, 100),
        userId: note.userId || undefined,
        x: Number(note.x) || 0,
        y: Number(note.y) || 0,
        color: note.color || "#FFF9C4",
        rotation: Number(note.rotation) || 0,
        createdAt: note.createdAt || new Date().toISOString(),
    });

    await writeFile(FILE_PATH, JSON.stringify(notes, null, 2), "utf-8");
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const notes = await getNotes();
    const filtered = notes.filter((n: { id: string }) => n.id !== id);
    await writeFile(FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    return NextResponse.json({ success: true });
}
