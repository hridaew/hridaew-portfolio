"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import {
    motion,
    AnimatePresence,
    LayoutGroup,
    useReducedMotion,
} from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const GLASS_SURFACE =
    "border border-white/12 bg-[rgba(29,29,29,0.72)] shadow-[0_12px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[54.45px]";

const BLOB_SPRING = {
    type: "spring" as const,
    stiffness: 320,
    damping: 24,
    mass: 0.85,
};

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
    const reduceMotion = useReducedMotion();
    const reactId = useId();
    const glassLayoutId = `sticky-notes-glass-${page}-${reactId}`;
    const layoutGroupId = `sticky-notes-group-${page}-${reactId}`;

    const morphTransition = reduceMotion ? { duration: 0 } : BLOB_SPRING;

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
                    <div className="pointer-events-none fixed left-1/2 top-6 -translate-x-1/2 rounded-full border border-white/10 bg-[rgba(29,29,29,0.72)] px-4 py-2 text-left text-white/90 shadow-lg shadow-black/40 backdrop-blur-[54.45px] type-body">
                        Click anywhere to place your note
                    </div>
                </div>
            )}

            {notes.map((note) => (
                <div
                    key={note.id}
                    className="group/note absolute z-[100] w-[140px] rounded p-3 text-left shadow-lg shadow-black/35 ring-1 ring-black/15 type-caption"
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
                        className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/15 text-black/50 opacity-0 transition-opacity hover:bg-black/25 hover:text-black/80 group-hover/note:opacity-100 type-caption leading-none"
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

            <div
                ref={triggerRef}
                className="fixed bottom-24 right-4 z-[110] md:right-8"
            >
                <LayoutGroup id={layoutGroupId}>
                    <div className="relative h-12 w-12">
                        {/* Decorative back sheets — only while collapsed */}
                        <AnimatePresence>
                            {!isOpen
                                ? [0, 1].map((i) => (
                                      <motion.div
                                          key={`sheet-${i}`}
                                          aria-hidden
                                          initial={false}
                                          exit={
                                              reduceMotion
                                                  ? { opacity: 0 }
                                                  : {
                                                        opacity: 0,
                                                        scale: 0.85,
                                                        rotate: (i - 0.5) * 14,
                                                    }
                                          }
                                          transition={{
                                              duration: 0.22,
                                              ease: [0.22, 1, 0.36, 1],
                                          }}
                                          className="absolute inset-0 rounded-[14px] border border-white/10 bg-[rgba(29,29,29,0.45)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-[40px] will-change-transform"
                                          style={{
                                              transform: isHoveringStack
                                                  ? `rotate(${(i - 0.5) * 8}deg) translateY(${-i * 3}px)`
                                                  : `rotate(${(i - 0.5) * 3}deg)`,
                                              zIndex: i,
                                          }}
                                      />
                                  ))
                                : null}
                        </AnimatePresence>

                        {!isOpen ? (
                            <motion.button
                                type="button"
                                layoutId={glassLayoutId}
                                transition={morphTransition}
                                onClick={() => setIsOpen(true)}
                                onMouseEnter={() => setIsHoveringStack(true)}
                                onMouseLeave={() => setIsHoveringStack(false)}
                                aria-label="Leave a sticky note"
                                aria-expanded={false}
                                className={cn(
                                    "absolute bottom-0 right-0 z-[2] flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden",
                                    GLASS_SURFACE
                                )}
                                style={{ borderRadius: 14 }}
                                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                            >
                                <span
                                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent"
                                    aria-hidden
                                />
                                <motion.span
                                    layoutId={`${glassLayoutId}-glyph`}
                                    transition={morphTransition}
                                    className="relative z-10 flex items-center justify-center font-semibold leading-none text-white/85 type-body-lg"
                                    aria-hidden
                                >
                                    +
                                </motion.span>
                            </motion.button>
                        ) : (
                            <motion.div
                                ref={formRef}
                                layoutId={glassLayoutId}
                                transition={morphTransition}
                                role="dialog"
                                aria-label="Compose sticky note"
                                className={cn(
                                    "absolute bottom-0 right-0 z-[2] w-[min(calc(100vw-2rem),20rem)] overflow-hidden",
                                    GLASS_SURFACE
                                )}
                                style={{ borderRadius: 20 }}
                            >
                                <span
                                    className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.12] to-transparent"
                                    aria-hidden
                                />
                                <div
                                    className="relative h-1.5 bg-gradient-to-r from-amber-500/45 via-rose-500/40 to-violet-500/45"
                                    aria-hidden
                                />
                                <motion.div
                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={
                                        reduceMotion
                                            ? { duration: 0 }
                                            : {
                                                  delay: 0.12,
                                                  duration: 0.28,
                                                  ease: [0.22, 1, 0.36, 1],
                                              }
                                    }
                                    className="relative space-y-4 p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="mb-1 text-left type-caption-medium uppercase tracking-wide text-white/45">
                                                Post-it
                                            </p>
                                            <p className="text-left leading-relaxed text-white/60 type-caption">
                                                Leave a note &mdash; only you and Hridae can see yours.
                                            </p>
                                        </div>
                                        <motion.button
                                            type="button"
                                            layoutId={`${glassLayoutId}-glyph`}
                                            transition={morphTransition}
                                            onClick={() => setIsOpen(false)}
                                            aria-label="Close sticky note form"
                                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-colors hover:bg-white/[0.08]"
                                        >
                                            <span
                                                className="rotate-45 font-semibold leading-none type-body-lg"
                                                aria-hidden
                                            >
                                                +
                                            </span>
                                        </motion.button>
                                    </div>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Write something…"
                                        autoFocus
                                        className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left text-white/90 placeholder:text-white/35 type-body transition-shadow focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/15"
                                        maxLength={200}
                                    />
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email (optional)"
                                        type="email"
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-left text-white/90 placeholder:text-white/35 type-body transition-shadow focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/15"
                                    />
                                    <input
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        name="website"
                                        autoComplete="off"
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                                        placeholder="Website"
                                    />
                                    <div>
                                        <p className="mb-2 text-left text-white/45 type-caption">
                                            Color
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {COLORS.map((color) => (
                                                <motion.button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    whileTap={{ scale: 0.92 }}
                                                    className={cn(
                                                        "h-8 w-8 rounded-full border-2 transition-shadow",
                                                        selectedColor === color
                                                            ? "border-white shadow-md ring-2 ring-white/30 ring-offset-2 ring-offset-[#1d1d1d]"
                                                            : "border-transparent hover:border-white/35"
                                                    )}
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
                                        whileHover={
                                            message.trim() ? { scale: 1.02 } : undefined
                                        }
                                        whileTap={
                                            message.trim() ? { scale: 0.98 } : undefined
                                        }
                                        className="type-caption-medium w-full rounded-xl bg-white py-3 text-center text-background shadow-sm transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Drop it on the page
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                </LayoutGroup>
            </div>
        </>
    );
}
