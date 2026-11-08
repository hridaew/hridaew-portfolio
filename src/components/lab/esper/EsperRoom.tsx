"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAchievements } from "@/components/achievements/AchievementProvider";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { getUserId } from "@/lib/notes-client";
import { cn } from "@/lib/utils";
import { GuestbookComposer, type Draft, type GuestNote, type PaperStart } from "./Guestbook";
import { EsperInterface } from "./EsperInterface";
import { STATIONS } from "./stations";
import { HoverTag } from "./HoverTag";
import { EsperLogo } from "./EsperLogo";

/** The room (three/EsperEngine): commands in by name, events out on window "esper". */
type Room = { send: (method: string, value?: string) => void; dispose: () => void };

type EsperEvent = CustomEvent<{ event: string; payload: string }>;

export function EsperRoom() {
  const router = useRouter();
  const { openSheet, activeKey } = useSheetNav();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [hovering, setHovering] = useState<string>("");
  const [menuHovering, setMenuHovering] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  // Dark by default; ?theme=light for the light room.
  const [dark, setDark] = useState(true);
  // The guestbook: everyone's notes, the composer, and the note that just landed.
  const { unlock } = useAchievements();
  const [notes, setNotes] = useState<GuestNote[]>([]);
  const [composing, setComposing] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [overBoard, setOverBoard] = useState(false);
  // While a note is on its way in, the window waits: the moment belongs to the board.
  const [pinning, setPinning] = useState(false);
  const pop = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let liveEvents: EventSource | null = null;
    const darkMode = new URLSearchParams(window.location.search).get("theme") !== "light"; // dark unless asked for light
    setDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);

    import("./three/EsperEngine")
      .then(({ EsperEngine }) => {
        if (cancelled) return;
        const engine = new EsperEngine(canvas);
        roomRef.current = { send: (method, value) => engine.send(method, value ?? ""), dispose: () => engine.dispose() };
        setProgress(0.12);
        if (process.env.NODE_ENV !== "production") {
          const w = window as unknown as { esperLook?: (s: string) => void; esperSend?: (m: string, v?: string) => void };
          w.esperLook = (s: string) => engine.send("Look", s);
          w.esperSend = (m: string, v?: string) => engine.send(m, v ?? "");
        }
        // The scene itself: live from esper-unity/Live/scene.json in dev, the published copy otherwise.
        const source = process.env.NODE_ENV !== "production" ? "/api/esper-live" : "/esper/live/scene.json";
        fetch(source, { cache: "no-store" })
          .then((r) => r.text())
          .then((json) => {
            if (cancelled) return;
            if (darkMode) engine.send("SetTheme", "dark"); // before the scene builds, so its materials start dark
            engine.send("ApplyScene", json);
          })
          .catch(() => setFailed(true));
      })
      .catch(() => setFailed(true));

    const onEsper = (e: Event) => {
      const { event, payload } = (e as EsperEvent).detail;
      if (event === "ready") {
        setReady(true);
        const u = roomRef.current;
        // Live scene (dev): the room follows esper-unity/Live/scene.json as it changes — from Studio, an
        // editor, or Claude. Production runs the baked build, which already is that file.
        if (process.env.NODE_ENV !== "production") {
          const applyLive = () =>
            fetch("/api/esper-live", { cache: "no-store" })
              .then((r) => r.text())
              .then((json) => roomRef.current?.send("ApplyScene", json))
              .catch(() => {});
          liveEvents?.close();
          liveEvents = new EventSource("/api/esper-live/events");
          liveEvents.addEventListener("change", applyLive);
        }
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) u?.send("SetReducedMotion", "1");
        // Up close, subjects sit left of the dossier on wide screens.
        u?.send("SetFrameOffset", window.innerWidth >= 768 ? "7" : "0");
      } else if (event === "progress") {
        setProgress(0.12 + 0.88 * Number(payload));
      } else if (event === "focus") {
        setActive(payload);
      } else if (event === "overview") {
        setActive(null);
      } else if (event === "hover") {
        setHovering(payload);
      } else if (event === "guestbook-launch") {
        setLaunched(true);
      } else if (event === "guestbook-pop") {
        const a = pop.current;
        if (a) {
          a.currentTime = 0;
          a.play().catch(() => {});
        }
      } else if (event === "guestbook-pinned") {
        setHighlight(payload);
        setPinning(false);
      } else if (event === "board-hover") {
        setOverBoard(payload === "1");
      } else if (event === "enhance" && payload) {
        setLeaving(true);
        window.setTimeout(() => router.push(payload), 800);
      }
    };
    window.addEventListener("esper", onEsper);
    const onResize = () => {
      roomRef.current?.send("SetFrameOffset", window.innerWidth >= 768 ? "7" : "0");
    };
    window.addEventListener("resize", onResize);
    const onKey = (e: KeyboardEvent) => {
      // With a case study open, Escape belongs to the sheet (it closes it); the room stays where it is.
      if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) roomRef.current?.send("Back");
    };
    window.addEventListener("keydown", onKey);
    // The room reads the mouse for the whole page, so a click on the interface would also land on whatever sits
    // behind it. Tell it when the pointer is over anything but the canvas. Capture phase, so this arrives before
    // the room sees the press.
    let overUi = false;
    const gate = (e: PointerEvent) => {
      const over = e.target !== canvas;
      if (over === overUi) return;
      overUi = over;
      roomRef.current?.send("SetPointerOverUi", over ? "1" : "0");
    };
    window.addEventListener("pointermove", gate, true);
    window.addEventListener("pointerdown", gate, true);
    // Phones can take the 3D context back (low memory, a long time in the background). three.js rebuilds when it's
    // returned; if it isn't returned soon, show the plain list of work rather than a blank screen.
    let lostTimer = 0;
    const onLost = () => {
      window.clearTimeout(lostTimer);
      lostTimer = window.setTimeout(() => setFailed(true), 4000);
    };
    const onRestored = () => window.clearTimeout(lostTimer);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelled = true;
      liveEvents?.close();
      window.removeEventListener("esper", onEsper);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", gate, true);
      window.removeEventListener("pointerdown", gate, true);
      window.clearTimeout(lostTimer);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      roomRef.current?.dispose();
      roomRef.current = null;
    };
  }, [router]);

  // Things drawn at the page root (the case study sheet, the achievement toast) take the room's styling while it's open.
  useEffect(() => {
    document.documentElement.setAttribute("data-esper", "");
    return () => document.documentElement.removeAttribute("data-esper");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (dark) {
      document.documentElement.setAttribute("data-esper-dark", "");
    } else {
      document.documentElement.removeAttribute("data-esper-dark");
    }
    return () => document.documentElement.removeAttribute("data-esper-dark");
  }, [dark]);

  // The pin's pop: loaded now, so it can play the moment the note lands.
  useEffect(() => {
    const a = new Audio("/assets/home/hero-sketch-pop.mp3");
    a.preload = "auto";
    a.volume = 0.45;
    a.load();
    pop.current = a;
    return () => {
      pop.current = null;
    };
  }, []);

  // Everyone's notes, once the room is up.
  useEffect(() => {
    if (!ready) return;
    let gone = false;
    fetch(`/api/sticky-notes?page=room&scope=public&userId=${encodeURIComponent(getUserId())}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: GuestNote[]) => {
        if (gone || !Array.isArray(list)) return;
        setNotes(list);
        roomRef.current?.send("GuestbookNotes", JSON.stringify(list));
      })
      .catch(() => {});
    return () => {
      gone = true;
    };
  }, [ready]);

  const sendNote = useCallback(
    (draft: Draft, start: PaperStart) => {
      const userId = getUserId();
      const temp: GuestNote = {
        id: `pending-${Date.now().toString(36)}`,
        message: draft.message,
        ...(draft.name ? { name: draft.name } : {}),
        color: draft.color,
        rotation: Math.round((Math.random() - 0.5) * 10),
        createdAt: new Date().toISOString(),
        mine: true,
      };
      setLaunched(false);
      setPinning(true);
      setNotes((n) => [temp, ...n]);
      roomRef.current?.send("GuestbookPin", JSON.stringify({ note: temp, start }));
      fetch("/api/sticky-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft.message, name: draft.name || undefined, color: draft.color, rotation: temp.rotation, userId, page: "room" }),
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(r.status === 429 ? "Too many notes for now. Try again later." : "Your note didn’t save. Try again?");
          const saved = (await r.json()) as GuestNote;
          // The board keeps the pending id until the next full load; the list takes the real one (for deleting).
          setNotes((n) => n.map((x) => (x.id === temp.id ? { ...saved, mine: true } : x)));
          setHighlight((h) => (h === temp.id ? saved.id : h));
          unlock("sticky-note");
        })
        .catch((err: Error) => {
          setPinning(false);
          setNotes((n) => n.filter((x) => x.id !== temp.id));
          roomRef.current?.send("GuestbookUnpin", temp.id);
          toast.error(err.message);
        });
    },
    [unlock],
  );

  const deleteNote = useCallback((id: string) => {
    if (id.startsWith("pending-")) return;
    setNotes((all) => {
      const next = all.filter((n) => n.id !== id);
      roomRef.current?.send("GuestbookNotes", JSON.stringify(next));
      return next;
    });
    fetch(`/api/sticky-notes?id=${encodeURIComponent(id)}&userId=${encodeURIComponent(getUserId())}`, { method: "DELETE" }).catch(() => {});
  }, []);

  // The room rests while a case study sheet is over it.
  useEffect(() => {
    roomRef.current?.send("SetPaused", activeKey ? "1" : "0");
  }, [activeKey]);

  const send = useCallback((method: string, value?: string) => roomRef.current?.send(method, value), []);
  const goto = (id: string) => {
    setMenuHovering(false);
    setActive(id);
    send("Goto", id);
  };
  const back = () => {
    // From the guestbook, Back steps out to About (the room says so when it gets there).
    if (active !== "guestbook") setActive(null);
    send("Back");
  };
  const onMenuHover = useCallback(
    (id: string) => {
      setMenuHovering(!!id);
      send("Hover", id);
    },
    [send],
  );
  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      document.documentElement.toggleAttribute("data-esper-dark", next);
      roomRef.current?.send("SetTheme", next ? "dark" : "light");
      return next;
    });
  }, []);
  return (
    <main data-esper-theme={dark ? "dark" : "light"} className={cn("fixed inset-0 overflow-hidden transition-colors duration-500 ease-out", dark ? "bg-[#0e0e0f]" : "bg-[#ece9e4]")}>
      <canvas
        ref={canvasRef}
        id="esper-canvas"
        tabIndex={-1}
        aria-label="A roofless model house seen from above. Each room is a project."
        className="absolute inset-0 h-full w-full cursor-grab outline-none transition-opacity duration-[900ms] ease-out active:cursor-grabbing"
        style={{
          opacity: ready && !leaving && !failed ? 1 : 0,
          cursor: (hovering && !menuHovering) || overBoard ? "pointer" : undefined,
          touchAction: "none",
        }}
      />

      {/* Boot: the mark rises, fills as the room loads, and steps away as the house fades in. */}
      {!failed && (
        <div aria-hidden className={cn("pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity delay-[520ms] duration-200", dark ? "text-[#f2f2f0]" : "text-[#1d1d1f]", ready && "opacity-0")}>
          <EsperLogo progress={progress} done={ready} className="h-[52px] w-auto" />
        </div>
      )}

      {!leaving && !failed && <HoverTag id={active || menuHovering ? "" : hovering} />}
      {!leaving && !failed && (
        <EsperInterface
          ready={ready}
          active={pinning && active === "guestbook" ? null : active}
          hovered={hovering}
          dark={dark}
          onSelect={goto}
          onBack={back}
          onHover={onMenuHover}
          onToggleTheme={toggleTheme}
          guestbook={{ notes, highlight, onDelete: deleteNote, onCompose: () => setComposing(true) }}
          onOpen={(id) => {
            // The case study slides in over the room (the site's own sheet); narrow screens go to the page.
            const href = STATIONS.find((st) => st.id === id)?.href;
            if (href && !openSheet(href)) router.push(href);
          }}
        />
      )}

      {ready && !failed && !leaving && <GuestbookComposer open={composing} onOpenChange={setComposing} onSend={sendNote} launched={launched} />}

      {failed && (
        // No 3D (no WebGL, or the scene didn't load): the work is still one click away.
        <nav aria-label="Work" className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-[#1d1d1f]">
          {STATIONS.filter((st) => st.href).map((st) => (
            <Link key={st.id} href={st.href!} className="site-chapter-heading hover:opacity-60">
              {st.title}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
