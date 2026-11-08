"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NOTE_COLORS } from "@/lib/notes-client";
import { focusRing, glass, press } from "./chrome";

/** A Visitor Board note as anyone can read it (see /api/sticky-notes, scope=public). */
export type GuestNote = { id: string; message: string; name?: string; color: string; rotation: number; createdAt: string; mine: boolean };
export type Draft = { message: string; name: string; color: string };
/** Where the folded paper sits on screen, for the room to pick it up from. */
export type PaperStart = { ndcX: number; ndcY: number; px: number };

const MAX_MESSAGE = 200;
const MAX_NAME = 40;
/** The note's size on the glass when the room takes it (px): the size of the paper about to fly. */
const FOLDED = 72;
const EASE = [0.22, 1, 0.36, 1] as const;
const INK = "#2b2a28";
const INK_SOFT = "rgba(43,42,40,0.62)";

export const GUESTBOOK_CTA = "Leave a note on the Visitor Board!";

/** The paper itself: square, near-sharp corners, lifted a little off the glass, shaded toward its bottom edge. */
const POSTIT =
  "relative aspect-square rounded-[2px] shadow-[0_1px_1px_rgba(0,0,0,0.08),0_10px_22px_-10px_rgba(0,0,0,0.45)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(to_bottom,transparent_55%,rgba(0,0,0,0.06))]";
/** Written like the notes on the board: in marker, dark ink, the name signed bottom right. */
const NOTE_TEXT = "font-[family-name:var(--font-marker)] text-[21px] font-normal leading-[1.25]";
const SIGN_TEXT = "font-[family-name:var(--font-marker)] text-[16px] font-normal";

type Folding = { draft: Draft; rect: { left: number; top: number; size: number } };

/**
 * The composer. On a wide screen it docks bottom right as a glass capsule that opens into a card; below that it opens
 * from the board's window. You write on a post-it. Pinning shrinks that same post-it, words and all, to the size of
 * the note the room will pick up; it waits there while the camera turns, then the room takes it from that spot.
 */
export function GuestbookComposer({
  open,
  onOpenChange,
  onSend,
  launched,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once the paper has shrunk, with where it sits. */
  onSend: (draft: Draft, start: PaperStart) => void;
  /** The room has taken the paper (it is in the air now): the one on the glass goes. */
  launched: boolean;
}) {
  const reduce = useReducedMotion();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(NOTE_COLORS[0]);
  const [honeypot, setHoneypot] = useState("");
  const [folding, setFolding] = useState<Folding | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const postitRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  // Each paper is handed to the room once (its exit animation also reports "complete").
  const handed = useRef<Folding | null>(null);

  // The paper stays on the glass until the room takes it.
  const [seenLaunch, setSeenLaunch] = useState(launched);
  if (launched !== seenLaunch) {
    setSeenLaunch(launched);
    if (launched) setFolding(null);
  }
  // If the room never takes it (no board), do not leave it on the glass.
  useEffect(() => {
    if (!folding) return;
    const t = window.setTimeout(() => setFolding(null), 5000);
    return () => window.clearTimeout(t);
  }, [folding]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => fieldRef.current?.focus(), 120);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChange(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open, onOpenChange]);

  const send = () => {
    const text = message.trim();
    const el = postitRef.current;
    if (!text || honeypot || !el) return;
    // The post-it lifts off the card exactly where it is; the card goes quietly from under it.
    const r = el.getBoundingClientRect();
    setFolding({ draft: { message: text, name: name.trim(), color }, rect: { left: r.left, top: r.top, size: r.width } });
    onOpenChange(false);
    setMessage("");
  };

  // Once the paper has shrunk (its own animation ends), hand it to the room from where it sits.
  const handOff = () => {
    const el = paperRef.current;
    if (!el || !folding || handed.current === folding) return;
    handed.current = folding;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    onSend(folding.draft, { ndcX: (cx / window.innerWidth) * 2 - 1, ndcY: -(cy / window.innerHeight) * 2 + 1, px: r.width });
  };

  return (
    <>
      {/* The capsule, where there is room beside the bar (1024px and up). */}
      <motion.div
        initial={false}
        animate={open || folding ? { opacity: 0, scale: 0.94 } : { opacity: 1, scale: 1 }}
        transition={{ duration: open ? 0.12 : 0.2, ease: EASE }}
        className={cn("esper-pill pointer-events-auto fixed bottom-7 right-8 z-[110] hidden origin-bottom-right rounded-full p-1.5 lg:block", glass)}
        style={{ pointerEvents: open || folding ? "none" : "auto" }}
      >
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-expanded={open}
          className={cn("type-body-medium flex items-center gap-2 rounded-full px-4 py-2 text-black/75 hover:bg-black/[0.1] hover:text-[#1d1d1f]", press, focusRing)}
        >
          {GUESTBOOK_CTA}
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
            <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="composer"
            ref={cardRef}
            role="dialog"
            aria-label="Leave a note on the Visitor Board"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
            transition={{ duration: 0.28, ease: EASE }}
            className={cn(
              "esper-pill pointer-events-auto fixed z-[120] flex flex-col gap-4 rounded-[28px] p-5 font-[family-name:var(--font-geist)] text-[#1d1d1f]",
              "inset-x-3 bottom-[max(96px,calc(env(safe-area-inset-bottom)+96px))] mx-auto max-w-[20.5rem] origin-bottom lg:bottom-7 lg:left-auto lg:right-8 lg:mx-0 lg:w-[20.5rem] lg:origin-bottom-right",
              glass,
            )}
          >
            {/* The post-it. Hidden the moment it is pinned: its twin takes over in the same spot. */}
            <div ref={postitRef} className={cn(POSTIT, "w-full", folding && "invisible")} style={{ backgroundColor: color }}>
              <label className="sr-only" htmlFor="guestbook-message">Your note</label>
              <textarea
                id="guestbook-message"
                ref={fieldRef}
                value={message}
                maxLength={MAX_MESSAGE}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                }}
                placeholder="Write something for the board…"
                className={cn(NOTE_TEXT, "absolute inset-x-0 bottom-12 top-0 resize-none bg-transparent px-[8.5%] pt-[13%] placeholder:text-[rgba(43,42,40,0.42)] focus:outline-none")}
                style={{ color: INK }}
              />
              <div className="absolute inset-x-[8.5%] bottom-[7%] flex items-baseline justify-end gap-1" style={{ color: INK_SOFT }}>
                <label className="sr-only" htmlFor="guestbook-name">Your name (optional)</label>
                <input
                  id="guestbook-name"
                  value={name}
                  maxLength={MAX_NAME}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  size={Math.max(9, name.length + 1)}
                  className={cn(SIGN_TEXT, "min-w-0 max-w-full bg-transparent text-right placeholder:text-[rgba(43,42,40,0.42)] focus:outline-none")}
                  style={{ color: "inherit" }}
                />
              </div>
            </div>
            {/* Bots fill every field; people never see this one. */}
            <input tabIndex={-1} autoComplete="off" aria-hidden value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2" role="radiogroup" aria-label="Paper colour">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={c === color}
                    aria-label={`Paper colour ${c}`}
                    onClick={() => setColor(c)}
                    className={cn("size-6 rounded-full ring-1 ring-black/10 transition-transform duration-150 ease-out active:scale-90", c === color && "ring-2 ring-black/60", focusRing)}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={send}
                disabled={!message.trim()}
                className={cn("type-body-medium rounded-full bg-[#1d1d1f] px-4 py-2 font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-35", press, focusRing)}
              >
                Pin it
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The same post-it, lifted off the card: a breath in, then it shrinks in place to the room's note size and
          waits for the room. When the room takes it, it crossfades into the paper in the air. */}
      <AnimatePresence>
        {folding && (
          <motion.div
            key="paper"
            ref={paperRef}
            aria-hidden
            className={cn(POSTIT, "pointer-events-none fixed z-[121] origin-center")}
            style={{ left: folding.rect.left, top: folding.rect.top, width: folding.rect.size, height: folding.rect.size, backgroundColor: folding.draft.color }}
            initial={{ scale: 1, opacity: 1 }}
            animate={reduce ? { opacity: 1 } : { scale: [1, 1.03, FOLDED / folding.rect.size], opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.14, ease: "easeOut" } }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE, times: reduce ? undefined : [0, 0.16, 1] }}
            onAnimationComplete={handOff}
          >
            <p className={cn(NOTE_TEXT, "absolute inset-x-0 bottom-12 top-0 overflow-hidden break-words px-[8.5%] pt-[13%]")} style={{ color: INK }}>
              {folding.draft.message}
            </p>
            {folding.draft.name && (
              <p className={cn(SIGN_TEXT, "absolute inset-x-[8.5%] bottom-[7%] truncate text-right")} style={{ color: INK_SOFT }}>
                {folding.draft.name}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dateFormatYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
function when(iso: string) {
  const d = new Date(iso);
  return (d.getFullYear() === new Date().getFullYear() ? dateFormat : dateFormatYear).format(d);
}

/** Everyone's notes, newest first: the window that opens over the board. */
export function GuestbookList({
  notes,
  highlight,
  onDelete,
  onCompose,
}: {
  notes: GuestNote[];
  highlight: string | null;
  onDelete: (id: string) => void;
  onCompose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div>
      <p className="type-caption mt-1 text-black/60">{notes.length === 1 ? "1 note" : `${notes.length} notes`}</p>
      {/* Below 1024px there is no dock: the note starts here. */}
      <button
        type="button"
        onClick={onCompose}
        className={cn("type-body-medium mt-4 inline-flex items-center rounded-full bg-[#1d1d1f] px-5 py-2.5 font-semibold text-white hover:bg-black/80 lg:hidden", press, focusRing)}
      >
        {GUESTBOOK_CTA}
      </button>
      <ul className="-mx-3 mt-4 flex flex-col">
        {notes.map((n) => (
          <motion.li
            key={n.id}
            initial={false}
            animate={n.id === highlight && !reduce ? { backgroundColor: ["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"] } : undefined}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="flex gap-3 rounded-2xl px-3 py-3"
          >
            <span aria-hidden className="mt-[7px] size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: n.color }} />
            <div className="min-w-0 flex-1">
              <p className="site-body break-words text-black/90">{n.message}</p>
              <p className="type-caption mt-1 text-black/60">
                {n.name ? `— ${n.name} · ` : ""}
                {when(n.createdAt)}
                {n.mine && (
                  <>
                    {" · "}
                    <button type="button" onClick={() => onDelete(n.id)} className={cn("underline-offset-2 hover:text-black/90 hover:underline", focusRing)}>
                      Delete
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
