"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
    page: string;
}

const COLORS = [
    "#FFF9C4",
    "#F8BBD0",
    "#C8E6C9",
    "#BBDEFB",
    "#E1BEE7",
];

/** UUID for anonymous user id. `randomUUID` is omitted on non-secure origins (e.g. http:// LAN). */
function newAnonymousId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const h = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
        return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
    return `u_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function getUserId(): string {
    const key = "portfolio-user-id";
    let id = localStorage.getItem(key);
    if (!id) {
        id = newAnonymousId();
        localStorage.setItem(key, id);
    }
    return id;
}

interface StickyNotesProps {
    page?: string;
}

export function StickyNotes({ page = "home" }: StickyNotesProps) {
    const [notes, setNotes] = useState<StickyNote[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [placingNote, setPlacingNote] = useState<Omit<StickyNote, "x" | "y" | "id" | "createdAt"> | null>(null);
    const [isHoveringStack, setIsHoveringStack] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const userIdRef = useRef<string>("");
    const isAdminRef = useRef(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        userIdRef.current = getUserId();
        isAdminRef.current = new URLSearchParams(window.location.search).get("admin") === "hridae";

        const params = new URLSearchParams({ userId: userIdRef.current });
        if (isAdminRef.current) params.set("admin", "hridae");

        fetch(`/api/sticky-notes?${params.toString()}`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setNotes(data.filter((n: StickyNote) => n.page === page));
                }
            })
            .catch(() => {});
    }, [page]);

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            const t = e.target as Node;
            if (formRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
            setIsOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown, { passive: true });
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
        };
    }, [isOpen]);

    const handleSubmit = useCallback(() => {
        if (!message.trim()) return;
        const rotation = (Math.random() - 0.5) * 8;
        setPlacingNote({ message: message.trim(), email: email.trim() || undefined, userId: userIdRef.current, color: selectedColor, rotation, page });
        setIsOpen(false);
        setMessage("");
        setEmail("");
        setHoneypot("");
    }, [message, email, selectedColor, page]);

    const handlePlacement = useCallback(
        async (e: React.MouseEvent) => {
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

            try {
                const res = await fetch("/api/sticky-notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...note, website: honeypot }),
                });

                if (res.status === 429) {
                    setNotes((prev) => prev.filter((n) => n.id !== note.id));
                    toast.error("Too many notes! Try again later.");
                } else if (res.ok) {
                    const saved = await res.json();
                    setNotes((prev) => prev.map((n) => (n.id === note.id ? saved : n)));
                }
            } catch {
                /* keep optimistic note */
            }
        },
        [placingNote, honeypot]
    );

    const handleDelete = useCallback((noteId: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));

        const params = new URLSearchParams({ id: noteId, userId: userIdRef.current });
        if (isAdminRef.current) params.set("admin", "hridae");

        fetch(`/api/sticky-notes?${params.toString()}`, {
            method: "DELETE",
        }).catch(() => {});
    }, []);

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
            {placingNote && (
                <div className="fixed inset-0 z-[150]" onClick={handlePlacement}>
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full type-body pointer-events-none text-left">
                        Click anywhere to place your note
                    </div>
                </div>
            )}

            {notes.map((note) => (
                <div
                    key={note.id}
                    className="absolute z-[100] w-[140px] p-3 rounded shadow-md type-caption group/note text-left"
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
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/10 text-black/40 hover:bg-black/20 hover:text-black/70 opacity-0 group-hover/note:opacity-100 transition-opacity cursor-pointer type-caption leading-none"
                        aria-label="Delete note"
                    >
                        &times;
                    </button>
                    <p className="break-words">{note.message}</p>
                    {note.email && (
                        <p className="mt-1 type-caption opacity-60 truncate text-left">from: {note.email}</p>
                    )}
                </div>
            ))}

            <div ref={triggerRef} className="fixed bottom-24 right-4 md:right-8 z-[110]">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={() => setIsHoveringStack(true)}
                    onMouseLeave={() => setIsHoveringStack(false)}
                    className="relative w-12 h-12 cursor-pointer mx-auto block"
                    aria-label="Leave a sticky note"
                    aria-expanded={isOpen}
                >
                    {COLORS.slice(0, 4).map((color, i) => (
                        <div
                            key={color}
                            className="absolute inset-0 rounded shadow-sm transition-transform duration-300 ease-out will-change-transform"
                            style={{
                                backgroundColor: color,
                                transform: isHoveringStack
                                    ? `rotate(${(i - 1.5) * 6}deg) translateY(${-i * 2}px)`
                                    : `rotate(${(i - 1.5) * 2}deg)`,
                                zIndex: i,
                            }}
                        />
                    ))}
                    <span className="absolute inset-0 flex items-center justify-center z-10 text-neutral-500 type-body-lg font-semibold leading-none">
                        +
                    </span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={formRef}
                            initial={{ opacity: 0, y: 16, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.7 }}
                            className="absolute bottom-16 right-0 w-[min(calc(100vw-2rem),20rem)] origin-bottom-right overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 shadow-[0_24px_80px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] backdrop-blur-xl"
                        >
                            <div className="h-1.5 bg-gradient-to-r from-amber-200/90 via-rose-200/80 to-violet-200/90" aria-hidden />
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="type-caption-medium uppercase text-neutral-400 tracking-wide text-left mb-1">
                                        Post-it
                                    </p>
                                    <p className="type-caption text-neutral-500 text-left leading-relaxed">
                                        Leave a note &mdash; only you and Hridae can see yours.
                                    </p>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write something…"
                                    className="w-full h-24 resize-none rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 py-3 type-body text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 text-left transition-shadow"
                                    maxLength={200}
                                />
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email (optional)"
                                    type="email"
                                    className="w-full rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-3.5 py-2.5 type-body text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 text-left transition-shadow"
                                />
                                <input
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    name="website"
                                    autoComplete="off"
                                    tabIndex={-1}
                                    aria-hidden="true"
                                    className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none"
                                    placeholder="Website"
                                />
                                <div>
                                    <p className="type-caption text-neutral-400 mb-2 text-left">Color</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {COLORS.map((color) => (
                                            <motion.button
                                                key={color}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                whileTap={{ scale: 0.92 }}
                                                className={`w-8 h-8 rounded-full border-2 transition-shadow ${selectedColor === color ? "border-neutral-700 shadow-md ring-2 ring-neutral-900/10 ring-offset-2" : "border-transparent hover:border-neutral-300"}`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <motion.button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!message.trim()}
                                    whileHover={message.trim() ? { scale: 1.02 } : undefined}
                                    whileTap={message.trim() ? { scale: 0.98 } : undefined}
                                    className="w-full py-3 rounded-xl bg-neutral-900 text-white type-caption-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-center shadow-sm"
                                >
                                    Drop it on the page
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
