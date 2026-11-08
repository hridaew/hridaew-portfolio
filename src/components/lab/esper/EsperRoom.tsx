"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { cn } from "@/lib/utils";
import { EsperInterface } from "./EsperInterface";
import { STATIONS } from "./stations";
import { HoverTag } from "./HoverTag";
import { EsperLogo } from "./EsperLogo";
import dynamic from "next/dynamic";

// The guestbook from the old home: desktop only (it hides itself on phones), its own board for the room.
const StickyNotes = dynamic(() => import("@/components/StickyNotes").then((m) => m.StickyNotes), { ssr: false });

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
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  // Dark by default; ?theme=light for the light room.
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let liveEvents: EventSource | null = null;
    const darkMode = new URLSearchParams(window.location.search).get("theme") !== "light"; // dark unless asked for light
    setDark(darkMode);

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
      } else if (event === "enhance" && payload) {
        setLeaving(true);
        window.setTimeout(() => router.push(payload), 800);
      }
    };
    window.addEventListener("esper", onEsper);
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
    if (!dark) return;
    document.documentElement.setAttribute("data-esper-dark", "");
    return () => document.documentElement.removeAttribute("data-esper-dark");
  }, [dark]);

  // The room rests while a case study sheet is over it.
  useEffect(() => {
    roomRef.current?.send("SetPaused", activeKey ? "1" : "0");
  }, [activeKey]);

  const send = useCallback((method: string, value?: string) => roomRef.current?.send(method, value), []);
  const goto = (id: string) => {
    setActive(id);
    send("Goto", id);
  };
  const back = () => {
    setActive(null);
    send("Back");
  };
  return (
    <main data-esper-theme={dark ? "dark" : "light"} className={cn("fixed inset-0 overflow-hidden", dark ? "bg-[#0e0e0f]" : "bg-[#ece9e4]")}>
      <canvas
        ref={canvasRef}
        id="esper-canvas"
        tabIndex={-1}
        aria-label="A roofless model house seen from above. Each room is a project."
        className="absolute inset-0 h-full w-full cursor-grab outline-none transition-opacity duration-[900ms] ease-out active:cursor-grabbing"
        style={{
          opacity: ready && !leaving && !failed ? 1 : 0,
          cursor: hovering ? "pointer" : undefined,
          touchAction: "none",
        }}
      />

      {/* Boot: the mark rises, fills as the room loads, and steps away as the house fades in. */}
      {!failed && (
        <div aria-hidden className={cn("pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity delay-[520ms] duration-200", dark ? "text-[#f2f2f0]" : "text-[#1d1d1f]", ready && "opacity-0")}>
          <EsperLogo progress={progress} done={ready} className="h-[52px] w-auto" />
        </div>
      )}

      {!leaving && !failed && <HoverTag id={active ? "" : hovering} />}
      {!leaving && !failed && (
        <EsperInterface
          ready={ready}
          active={active}
          hovered={hovering}
          onSelect={goto}
          onBack={back}
          onOpen={(id) => {
            // The case study slides in over the room (the site's own sheet); narrow screens go to the page.
            const href = STATIONS.find((st) => st.id === id)?.href;
            if (href && !openSheet(href)) router.push(href);
          }}
        />
      )}

      {ready && !failed && !leaving && <StickyNotes page="room" glass dockClassName="fixed bottom-7 right-8 z-[110]" />}

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
