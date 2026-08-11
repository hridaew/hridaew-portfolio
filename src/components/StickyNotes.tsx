"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import {
    motion,
    AnimatePresence,
    LayoutGroup,
    useReducedMotion,
    useMotionValue,
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

const NOTE_W = 168;
const NOTE_H = 168;

const GLASS_SURFACE =
    "border border-ink/[0.08] bg-paper-raised/[0.72] shadow-e3 backdrop-blur-[54.45px]";

type PanelPhase = "closed" | "opening" | "open" | "closing" | "collapsing";

/**
 * Panel choreography (wall-clock):
 *
 * OPEN
 *   0–90ms      CTA label + back-sheets fade out
 *   90ms        shell expand starts
 *   90–370ms    shell expands (280ms)
 *   290ms       content starts (80ms before shell ends): fade + rise
 *   290–510ms   content eases in (220ms), finishes after shell
 *
 * CLOSE (snappy)
 *   0–70ms      content fades out
 *   70ms        → shell collapse starts (CTA still hidden)
 *   70–200ms    shell collapses (130ms)
 *   200ms       → CTA label fade starts
 *   200–280ms   CTA label fades in (80ms)
 */
const SHELL_MS = 280;
const CLOSE_SHELL_MS = 130;
/** CTA / sheets fade out before expand begins. */
const CTA_OUT_MS = 90;
/** Start content this many ms before the shell expand ends. */
const CONTENT_LEAD_MS = 80;
const CONTENT_IN_MS = 220;
const CONTENT_OUT_MS = 70;
const CONTENT_FROM_Y = 14;
const CTA_FADE_MS = 80;

const SHELL_EASE = [0.22, 1, 0.36, 1] as const;
const CLOSE_EASE = [0.4, 0, 1, 1] as const;

const SHELL_TRANSITION = {
    duration: SHELL_MS / 1000,
    ease: SHELL_EASE,
};

const CLOSE_SHELL_TRANSITION = {
    duration: CLOSE_SHELL_MS / 1000,
    ease: CLOSE_EASE,
};

const CONTENT_IN = {
    duration: CONTENT_IN_MS / 1000,
    ease: SHELL_EASE,
};

const CONTENT_OUT = {
    duration: CONTENT_OUT_MS / 1000,
    ease: CLOSE_EASE,
};

const CTA_FADE = {
    duration: CTA_FADE_MS / 1000,
    ease: SHELL_EASE,
};

const QUICK_OUT = {
    duration: CTA_OUT_MS / 1000,
    ease: "easeOut" as const,
};

const TAP = { scale: 0.97, transition: { duration: 0.08 } };

/** Soft spring only for the post-it shared-element stick gesture. */
const POSTIT_SPRING = {
    type: "spring" as const,
    stiffness: 380,
    damping: 36,
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

function newNoteId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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

type DraftNote = Omit<StickyNote, "x" | "y" | "createdAt">;

interface StickyNotesProps {
    page?: string;
}

export function StickyNotes({ page = "home" }: StickyNotesProps) {
    const [notes, setNotes] = useState<StickyNote[]>([]);
    const [phase, setPhase] = useState<PanelPhase>("closed");
    const [revealContent, setRevealContent] = useState(false);
    const [revealCta, setRevealCta] = useState(true);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [honeypot, setHoneypot] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [placingNote, setPlacingNote] = useState<DraftNote | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [flyingLayoutId, setFlyingLayoutId] = useState<string | null>(null);
    const [isHoveringStack, setIsHoveringStack] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    const formRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const closeFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const openContentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const phaseRef = useRef<PanelPhase>("closed");
    const userIdRef = useRef<string>("");
    const isAdminRef = useRef(false);
    const followX = useMotionValue(0);
    const followY = useMotionValue(0);
    const reduceMotion = useReducedMotion();
    const reactId = useId();
    const layoutGroupId = `sticky-notes-group-${page}-${reactId}`;

    const panelExpanded =
        phase === "opening" || phase === "open" || phase === "closing";
    const morphTransition = reduceMotion ? { duration: 0 } : POSTIT_SPRING;
    const shellTransition = reduceMotion
        ? { duration: 0 }
        : phase === "collapsing"
          ? CLOSE_SHELL_TRANSITION
          : SHELL_TRANSITION;
    const contentIn = reduceMotion ? { duration: 0 } : CONTENT_IN;
    const contentOut = reduceMotion ? { duration: 0 } : CONTENT_OUT;
    const ctaFade = reduceMotion ? { duration: 0 } : CTA_FADE;
    const quickOut = reduceMotion ? { duration: 0 } : QUICK_OUT;
    const postItLayoutId = draftId ? `sticky-postit-${draftId}` : undefined;

    const clearPanelTimers = useCallback(() => {
        if (closeFadeTimer.current) clearTimeout(closeFadeTimer.current);
        if (openContentTimer.current) clearTimeout(openContentTimer.current);
        closeFadeTimer.current = null;
        openContentTimer.current = null;
    }, []);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        return () => clearPanelTimers();
    }, [clearPanelTimers]);

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

    const closeComposer = useCallback(() => {
        const current = phaseRef.current;
        if (current === "closed" || current === "closing" || current === "collapsing") {
            return;
        }

        clearPanelTimers();

        if (reduceMotion) {
            setRevealContent(false);
            setRevealCta(true);
            setPhase("closed");
            setDraftId(null);
            return;
        }

        // 1) Fade content out while shell stays expanded
        setPhase("closing");
        setRevealContent(false);
        setRevealCta(false);

        closeFadeTimer.current = setTimeout(() => {
            // 2) After content fade, collapse shell (CTA still hidden)
            setPhase("collapsing");
            setDraftId(null);
        }, CONTENT_OUT_MS);
    }, [reduceMotion, clearPanelTimers]);

    useEffect(() => {
        if (!panelExpanded) return;
        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            const t = e.target as Node;
            if (formRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
            closeComposer();
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("touchstart", onPointerDown, { passive: true });
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("touchstart", onPointerDown);
        };
    }, [panelExpanded, closeComposer]);

    useEffect(() => {
        if (!placingNote) {
            setIsFollowing(false);
            return;
        }
        const onMove = (e: PointerEvent) => {
            followX.set(e.clientX - NOTE_W / 2);
            followY.set(e.clientY - NOTE_H / 2);
            setIsFollowing(true);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setPlacingNote(null);
                setFlyingLayoutId(null);
                setDraftId(null);
                setIsFollowing(false);
            }
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("keydown", onKey);
        };
    }, [placingNote, followX, followY]);

    const openComposer = useCallback(() => {
        if (phaseRef.current !== "closed") return;

        clearPanelTimers();
        setDraftId(newNoteId());
        setRevealContent(false);
        setRevealCta(false); // fade CTA label + allow sheets to exit next

        if (reduceMotion) {
            setPhase("open");
            setRevealContent(true);
            return;
        }

        // 1) Quick fade of closed-state chrome, then expand
        openContentTimer.current = setTimeout(() => {
            setPhase("opening");
            // 2) Content lead-in before shell finishes
            openContentTimer.current = setTimeout(() => {
                setRevealContent(true);
                setPhase("open");
            }, Math.max(0, SHELL_MS - CONTENT_LEAD_MS));
        }, CTA_OUT_MS);
    }, [reduceMotion, clearPanelTimers]);

    const onShellLayoutComplete = useCallback(() => {
        const current = phaseRef.current;
        if (current === "collapsing") {
            // Collapse finished → CTA label fade begins
            setRevealCta(true);
            setPhase("closed");
        }
    }, []);

    const handleSubmit = useCallback(() => {
        if (!message.trim() || !draftId) return;

        const paper = formRef.current?.querySelector<HTMLElement>("[data-postit-paper]");
        const rect = paper?.getBoundingClientRect();
        const startX = rect
            ? rect.left + rect.width / 2 - NOTE_W / 2
            : window.innerWidth - 140 - NOTE_W / 2;
        const startY = rect
            ? rect.top + rect.height / 2 - NOTE_H / 2
            : window.innerHeight - 220 - NOTE_H / 2;
        followX.set(startX);
        followY.set(startY);
        setIsFollowing(true);

        const rotation = (Math.random() - 0.5) * 8;
        const draft: DraftNote = {
            id: draftId,
            message: message.trim(),
            email: email.trim() || undefined,
            userId: userIdRef.current,
            color: selectedColor,
            rotation,
            page,
        };
        setFlyingLayoutId(draftId);
        setPlacingNote(draft);
        clearPanelTimers();
        setRevealContent(false);
        setRevealCta(true);
        setPhase("closed");
        setMessage("");
        setEmail("");
        setHoneypot("");
    }, [message, email, selectedColor, page, draftId, followX, followY, clearPanelTimers]);

    const handlePlacement = useCallback(
        async (e: React.MouseEvent) => {
            if (!placingNote) return;
            const note: StickyNote = {
                ...placingNote,
                x: e.clientX - NOTE_W / 2,
                y: e.clientY + window.scrollY - NOTE_H / 2,
                createdAt: new Date().toISOString(),
            };

            setNotes((prev) => [...prev, note]);
            setPlacingNote(null);
            setIsFollowing(false);

            // Keep layoutId on the landed note briefly so the shared element settles, then clear.
            window.setTimeout(() => {
                setFlyingLayoutId(null);
                setDraftId(null);
            }, reduceMotion ? 0 : 480);

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
        [placingNote, honeypot, reduceMotion]
    );

    const handleDelete = useCallback((noteId: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));

        const params = new URLSearchParams({ id: noteId, userId: userIdRef.current });
        if (isAdminRef.current) params.set("admin", "hridae");

        fetch(`/api/sticky-notes?${params.toString()}`, {
            method: "DELETE",
        }).catch(() => {});
    }, []);

    if (isMobile) return null;

    return (
        <LayoutGroup id={layoutGroupId}>
            {placingNote && (
                <div
                    className="fixed inset-0 z-[150] cursor-none"
                    onClick={handlePlacement}
                >
                    <div className="pointer-events-none fixed left-1/2 top-6 z-[151] -translate-x-1/2 rounded-full border border-ink/[0.08] bg-paper-raised/[0.85] px-4 py-2 text-left text-ink shadow-e3 backdrop-blur-[54.45px] type-body">
                        Click to stick · Esc to cancel
                    </div>

                    {isFollowing ? (
                        <motion.div
                            layoutId={postItLayoutId}
                            transition={morphTransition}
                            className="pointer-events-none fixed z-[152] flex flex-col overflow-hidden p-3 text-left shadow-[0_14px_36px_rgba(0,0,0,0.28),0_2px_0_rgba(255,255,255,0.35)_inset] ring-1 ring-black/10"
                            style={{
                                left: followX,
                                top: followY,
                                width: NOTE_W,
                                height: NOTE_H,
                                backgroundColor: placingNote.color,
                                borderRadius: 2,
                                color: "#333",
                                rotate: placingNote.rotation,
                            }}
                        >
                            <p className="line-clamp-5 flex-1 break-words type-caption leading-snug">
                                {placingNote.message}
                            </p>
                            {placingNote.email ? (
                                <p className="mt-auto truncate type-caption opacity-55">
                                    {placingNote.email}
                                </p>
                            ) : null}
                        </motion.div>
                    ) : null}
                </div>
            )}

            {notes.map((note) => {
                const isFlying = flyingLayoutId === note.id;
                return (
                    <motion.div
                        key={note.id}
                        layoutId={isFlying ? `sticky-postit-${note.id}` : undefined}
                        transition={morphTransition}
                        className="group/note absolute z-[100] flex flex-col overflow-hidden p-3 text-left shadow-[0_10px_28px_rgba(0,0,0,0.22),0_1px_0_rgba(255,255,255,0.35)_inset] ring-1 ring-black/10 type-caption"
                        style={{
                            left: note.x,
                            top: note.y,
                            width: NOTE_W,
                            height: NOTE_H,
                            backgroundColor: note.color,
                            borderRadius: 2,
                            rotate: note.rotation,
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
                        <p className="line-clamp-5 flex-1 break-words leading-snug">{note.message}</p>
                        {note.email ? (
                            <p className="mt-auto truncate opacity-55">from: {note.email}</p>
                        ) : null}
                    </motion.div>
                );
            })}

            <div
                ref={triggerRef}
                className="fixed bottom-24 right-4 z-[110] md:right-8"
            >
                {!placingNote ? (
                    <div className="relative">
                        <AnimatePresence>
                            {!panelExpanded && revealCta
                                ? [0, 1].map((i) => (
                                      <motion.div
                                          key={`sheet-${i}`}
                                          aria-hidden
                                          initial={false}
                                          exit={{ opacity: 0 }}
                                          transition={quickOut}
                                          className="absolute inset-0 rounded-[14px] border border-ink/[0.08] bg-paper-raised/[0.5] shadow-e2 backdrop-blur-[40px] will-change-transform"
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

                        <motion.div
                            ref={formRef}
                            layout
                            transition={{ layout: shellTransition }}
                            onLayoutAnimationComplete={onShellLayoutComplete}
                            role={panelExpanded ? "dialog" : undefined}
                            aria-label={
                                panelExpanded ? "Compose sticky note" : undefined
                            }
                            aria-expanded={panelExpanded}
                            onMouseEnter={() =>
                                !panelExpanded && setIsHoveringStack(true)
                            }
                            onMouseLeave={() => setIsHoveringStack(false)}
                            className={cn(
                                "relative z-[2] overflow-hidden",
                                GLASS_SURFACE,
                                panelExpanded
                                    ? "w-[min(calc(100vw-2rem),20rem)]"
                                    : "w-max"
                            )}
                            style={{ borderRadius: panelExpanded ? 20 : 14 }}
                        >
                            <span
                                className={cn(
                                    "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white/[0.14] to-transparent",
                                    panelExpanded ? "h-16" : "h-1/2"
                                )}
                                aria-hidden
                            />

                            {!panelExpanded ? (
                                <motion.button
                                    type="button"
                                    initial={false}
                                    animate={{ opacity: revealCta ? 1 : 0 }}
                                    transition={
                                        revealCta ? ctaFade : quickOut
                                    }
                                    whileTap={reduceMotion ? undefined : TAP}
                                    onClick={openComposer}
                                    aria-label="Leave a sticky note"
                                    className="relative z-10 flex h-12 cursor-pointer items-center gap-2.5 pl-4 pr-3.5 origin-center"
                                    style={{
                                        pointerEvents: revealCta
                                            ? "auto"
                                            : "none",
                                    }}
                                >
                                    <span className="whitespace-nowrap font-[family-name:var(--font-geist-mono)] text-xs leading-none text-ink-secondary">
                                        Leave me a note!
                                    </span>
                                    <span
                                        className="flex items-center justify-center font-semibold leading-none text-ink type-body-lg"
                                        aria-hidden
                                    >
                                        +
                                    </span>
                                </motion.button>
                            ) : (
                                <motion.div
                                    initial={false}
                                    animate={{
                                        opacity: revealContent ? 1 : 0,
                                        y: revealContent ? 0 : CONTENT_FROM_Y,
                                    }}
                                    transition={
                                        revealContent ? contentIn : contentOut
                                    }
                                    className="relative z-10 flex flex-col gap-4 p-5"
                                    style={{
                                        pointerEvents: revealContent
                                            ? "auto"
                                            : "none",
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-left leading-relaxed text-ink-muted type-caption">
                                            Leave a note. Only you and Hridae can see
                                            yours.
                                        </p>
                                        <motion.button
                                            type="button"
                                            whileTap={
                                                reduceMotion ? undefined : TAP
                                            }
                                            onClick={closeComposer}
                                            aria-label="Close sticky note form"
                                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/[0.08] bg-ink/[0.02] text-ink-secondary transition-colors hover:bg-ink/[0.04]"
                                        >
                                            <span
                                                className="rotate-45 font-semibold leading-none type-body-lg"
                                                aria-hidden
                                            >
                                                +
                                            </span>
                                        </motion.button>
                                    </div>

                                    <motion.div
                                        layoutId={postItLayoutId}
                                        transition={morphTransition}
                                        data-postit-paper
                                        className="relative flex aspect-square w-full flex-col overflow-hidden p-4 text-left shadow-[0_12px_28px_rgba(0,0,0,0.22),0_2px_0_rgba(255,255,255,0.4)_inset] ring-1 ring-black/10"
                                        style={{
                                            backgroundColor: selectedColor,
                                            borderRadius: 2,
                                            color: "#2a2a2a",
                                            rotate: -1.5,
                                        }}
                                    >
                                        <textarea
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(e.target.value)
                                            }
                                            placeholder="Write something…"
                                            autoFocus={revealContent}
                                            className="min-h-0 w-full flex-1 resize-none border-0 bg-transparent p-0 text-left text-[15px] leading-snug text-[#2a2a2a] placeholder:text-black/35 focus:outline-none focus:ring-0"
                                            maxLength={200}
                                        />

                                        <div className="mt-2 border-t border-black/10 pt-2">
                                            <input
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="Email (optional)"
                                                type="email"
                                                className="w-full border-0 bg-transparent p-0 text-left text-[12px] text-[#2a2a2a]/80 placeholder:text-black/30 focus:outline-none focus:ring-0"
                                            />
                                        </div>

                                        <input
                                            value={honeypot}
                                            onChange={(e) =>
                                                setHoneypot(e.target.value)
                                            }
                                            name="website"
                                            autoComplete="off"
                                            tabIndex={-1}
                                            aria-hidden="true"
                                            className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
                                            placeholder="Website"
                                        />
                                    </motion.div>

                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5">
                                            {COLORS.map((color) => (
                                                <motion.button
                                                    key={color}
                                                    type="button"
                                                    whileTap={
                                                        reduceMotion
                                                            ? undefined
                                                            : {
                                                                  scale: 0.9,
                                                                  transition: {
                                                                      duration: 0.08,
                                                                  },
                                                              }
                                                    }
                                                    onClick={() =>
                                                        setSelectedColor(color)
                                                    }
                                                    className={cn(
                                                        "size-6 rounded-full border transition-transform",
                                                        selectedColor === color
                                                            ? "scale-110 border-ink shadow-md ring-2 ring-ink/[0.32] ring-offset-1 ring-offset-[#1d1d1d]"
                                                            : "border-ink/[0.12] hover:scale-105"
                                                    )}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                    aria-label={`Select color ${color}`}
                                                />
                                            ))}
                                        </div>
                                        <motion.button
                                            type="button"
                                            whileTap={
                                                reduceMotion || !message.trim()
                                                    ? undefined
                                                    : TAP
                                            }
                                            onClick={handleSubmit}
                                            disabled={!message.trim()}
                                            className="rounded-full border border-ink/[0.12] bg-white/90 px-3.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-wide text-[#141416] transition-opacity hover:bg-paper-raised disabled:cursor-not-allowed disabled:opacity-35"
                                        >
                                            Stick it
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                ) : null}
            </div>
        </LayoutGroup>
    );
}
