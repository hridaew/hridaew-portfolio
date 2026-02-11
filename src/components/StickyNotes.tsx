"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface StickyNote {
    id: string;
    message: string;
    email?: string;
    userId?: string;
    x: number;
    y: number;
    color: string;
    rotation: number;
    createdAt: string;
}

const COLORS = [
    "#FFF9C4", // yellow
    "#F8BBD0", // pink
    "#C8E6C9", // green
    "#BBDEFB", // blue
    "#E1BEE7", // purple
];

function getUserId(): string {
    const key = "portfolio-user-id";
    let id = localStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
    }
    return id;
}

export function StickyNotes() {
    const [notes, setNotes] = useState<StickyNote[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [placingNote, setPlacingNote] = useState<Omit<StickyNote, "x" | "y" | "id" | "createdAt"> | null>(null);
    const [isHoveringStack, setIsHoveringStack] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);
    const userIdRef = useRef<string>("");

    // Hide on mobile
    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    // Load notes on mount, filtered by userId (admin sees all)
    useEffect(() => {
        userIdRef.current = getUserId();
        const isAdmin = new URLSearchParams(window.location.search).get("admin") === "hridae";
        fetch("/api/sticky-notes")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setNotes(isAdmin ? data : data.filter((n: StickyNote) => n.userId === userIdRef.current));
                }
            })
            .catch(() => {});
    }, []);

    const handleSubmit = useCallback(() => {
        if (!message.trim()) return;
        const rotation = (Math.random() - 0.5) * 8;
        setPlacingNote({ message: message.trim(), email: email.trim() || undefined, userId: userIdRef.current, color: selectedColor, rotation });
        setIsOpen(false);
        setMessage("");
        setEmail("");
    }, [message, email, selectedColor]);

    const handlePlacement = useCallback(
        (e: React.MouseEvent) => {
            if (!placingNote) return;
            const note: StickyNote = {
                id: Date.now().toString(36),
                ...placingNote,
                x: e.clientX - 60,
                y: e.clientY + window.scrollY - 40,
                createdAt: new Date().toISOString(),
            };

            setNotes((prev) => [...prev, note]);
            setPlacingNote(null);

            // Persist
            fetch("/api/sticky-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(note),
            }).catch(() => {});
        },
        [placingNote]
    );

    const handleDelete = useCallback((noteId: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        fetch(`/api/sticky-notes?id=${encodeURIComponent(noteId)}`, {
            method: "DELETE",
        }).catch(() => {});
    }, []);

    // Cursor style when placing
    useEffect(() => {
        if (placingNote) {
            document.body.style.cursor = "copy";
            return () => {
                document.body.style.cursor = "";
            };
        }
    }, [placingNote]);

    if (isMobile) return null;

    return (
        <>
            {/* Click anywhere to place note */}
            {placingNote && (
                <div className="fixed inset-0 z-[150]" onClick={handlePlacement}>
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full font-[family-name:var(--font-dm-sans)] text-sm pointer-events-none">
                        Click anywhere to place your note
                    </div>
                </div>
            )}

            {/* Existing notes */}
            {notes.map((note) => (
                <div
                    key={note.id}
                    className="absolute z-[100] w-[140px] p-3 rounded shadow-md font-[family-name:var(--font-dm-sans)] text-xs leading-relaxed group/note"
                    style={{
                        left: note.x,
                        top: note.y,
                        backgroundColor: note.color,
                        transform: `rotate(${note.rotation}deg)`,
                        color: "#333",
                    }}
                >
                    <button
                        onClick={() => handleDelete(note.id)}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/10 text-black/40 hover:bg-black/20 hover:text-black/70 opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer text-[10px] leading-none"
                        aria-label="Delete note"
                    >
                        &times;
                    </button>
                    <p className="break-words">{note.message}</p>
                    {note.email && (
                        <p className="mt-1 text-[10px] opacity-60 truncate">from: {note.email}</p>
                    )}
                </div>
            ))}

            {/* Sticky note stack trigger — fixed bottom right */}
            <div
                className="fixed bottom-24 right-4 md:right-8 z-[110]"
                onMouseEnter={() => setIsHoveringStack(true)}
                onMouseLeave={() => setIsHoveringStack(false)}
            >
                {/* Helper text */}
                <p className="font-[family-name:var(--font-dm-sans)] text-[10px] text-neutral-400 text-center mb-1.5 max-w-[100px] leading-tight">
                    Leave a post-it &mdash; only you and Hridae can see yours
                </p>

                {/* Fan of colored post-its */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative w-12 h-12 cursor-pointer mx-auto block"
                    aria-label="Leave a sticky note"
                >
                    {COLORS.slice(0, 4).map((color, i) => (
                        <div
                            key={color}
                            className="absolute inset-0 rounded shadow-sm transition-transform duration-200"
                            style={{
                                backgroundColor: color,
                                transform: isHoveringStack
                                    ? `rotate(${(i - 1.5) * 12}deg) translateY(${-i * 3}px)`
                                    : `rotate(${(i - 1.5) * 3}deg)`,
                                zIndex: i,
                            }}
                        />
                    ))}
                    <span className="absolute inset-0 flex items-center justify-center z-10 text-neutral-500 text-lg font-bold">
                        +
                    </span>
                </button>

                {/* Popover form */}
                {isOpen && (
                    <div
                        ref={formRef}
                        className="absolute bottom-16 right-0 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 space-y-3"
                    >
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Leave a note..."
                            className="w-full h-20 resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm font-[family-name:var(--font-dm-sans)] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
                            maxLength={200}
                        />
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email (optional)"
                            type="email"
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-[family-name:var(--font-dm-sans)] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
                        />
                        <div className="flex items-center gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedColor === color ? "border-neutral-600 scale-110" : "border-transparent"}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!message.trim()}
                            className="w-full py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium font-[family-name:var(--font-dm-sans)] hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Drop it!
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
