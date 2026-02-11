"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropImageProps {
    initialSrc?: string;
    alt: string;
    className?: string;
    onImageClick?: (src: string) => void;
}

export function DragDropImage({ initialSrc, alt, className, onImageClick }: DragDropImageProps) {
    const [src, setSrc] = useState(initialSrc);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "virdio");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            if (data.path) {
                setSrc(data.path);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div
            className={cn(
                "relative group overflow-hidden transition-all duration-300",
                isDragging ? "ring-4 ring-[#E4DAFF] scale-[1.02]" : "",
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                    onClick={() => onImageClick?.(src)}
                />
            ) : (
                <div className="w-full h-full min-h-[300px] bg-neutral-100 flex items-center justify-center border-2 border-dashed border-neutral-300 text-neutral-400">
                    <span className="text-sm font-mono uppercase tracking-widest">Drop Image Here</span>
                </div>
            )}

            {/* Overlay for Drag State */}
            {isDragging && (
                <div className="absolute inset-0 bg-[#E4DAFF]/50 backdrop-blur-sm flex items-center justify-center z-20 pointer-events-none">
                    <Upload className="w-12 h-12 text-white animate-bounce" />
                </div>
            )}

            {/* Hover Upload Hint */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur text-white flex gap-2 items-center px-3 py-1.5 rounded-full text-xs font-mono pointer-events-none z-10">
                <Upload className="w-3 h-3" />
                <span>Drag & Drop to Replace</span>
            </div>

            {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
