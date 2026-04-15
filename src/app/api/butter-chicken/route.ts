import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { parseButterChicken } from "@/lib/butter-chicken-recipe";

export async function GET() {
    try {
        const recipePath = path.join(process.cwd(), "butter chicken.txt");
        const raw = await fs.readFile(recipePath, "utf8");
        const parsed = parseButterChicken(raw);
        return NextResponse.json(parsed);
    } catch {
        return NextResponse.json({ error: "Recipe unavailable" }, { status: 500 });
    }
}
