
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get("file") as unknown as File;
        const folder = data.get("folder") as string || "virdio";

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const relativePath = `/assets/${folder}`;
        const uploadDir = join(process.cwd(), "public", relativePath);
        await mkdir(uploadDir, { recursive: true });

        const filePath = join(uploadDir, file.name);
        await writeFile(filePath, buffer);

        console.log(`Saved file to ${filePath}`);

        return NextResponse.json({
            success: true,
            path: `${relativePath}/${file.name}`
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}
