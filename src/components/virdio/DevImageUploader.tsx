"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export function DevImageUploader({ onUpload, label = "Upload Image" }: { onUpload: (url: string) => void, label?: string }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        formData.append("folder", "virdio");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            if (data.path) {
                onUpload(data.path);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to upload image. Check console.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <label className="cursor-pointer group relative flex items-center justify-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full border border-white/10 transition-colors text-white/60 hover:text-white text-xs font-mono uppercase tracking-wider">
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Uploading..." : label}</span>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
            />
        </label>
    );
}
