"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { EsperInterface } from "./EsperInterface";
import { STATIONS } from "./stations";
import { EsperDials, EsperStudio } from "./EsperStudio";
import { HoverTag } from "./HoverTag";

type UnityInstance = {
  SendMessage: (object: string, method: string, value?: string | number) => void;
  Quit: () => Promise<void>;
};

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress?: (progress: number) => void,
    ) => Promise<UnityInstance>;
  }
}

type EsperEvent = CustomEvent<{ event: string; payload: string }>;

export function EsperRoom() {
  const router = useRouter();
  const { openSheet } = useSheetNav();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unityRef = useRef<UnityInstance | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [hovering, setHovering] = useState<string>("");
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [studio, setStudio] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let liveEvents: EventSource | null = null;
    // Studio: internal tooling, dev only (/lab/esper?studio).
    const studioMode = process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("studio");
    setStudio(studioMode);

    // The room is three.js now (EsperEngine). It answers the messages the Unity player did, so everything
    // below talks to it the same way.
    import("./three/EsperEngine")
      .then(({ EsperEngine }) => {
        if (cancelled) return;
        const engine = new EsperEngine(canvas, { preserveDrawingBuffer: studioMode });
        unityRef.current = {
          SendMessage: (_o: string, method: string, value?: string | number) => engine.send(method, value === undefined ? "" : String(value)),
          Quit: async () => engine.dispose(),
        };
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
          .then((json) => !cancelled && engine.send("ApplyScene", json))
          .catch(() => setFailed(true));
      })
      .catch(() => setFailed(true));

    const onEsper = (e: Event) => {
      const { event, payload } = (e as EsperEvent).detail;
      if (event === "ready") {
        setReady(true);
        const u = unityRef.current;
        // Live scene (dev): the room follows esper-unity/Live/scene.json as it changes — from Studio, an
        // editor, or Claude. Production runs the baked build, which already is that file.
        if (process.env.NODE_ENV !== "production") {
          const applyLive = () =>
            fetch("/api/esper-live", { cache: "no-store" })
              .then((r) => r.text())
              .then((json) => unityRef.current?.SendMessage("ESPER", "ApplyScene", json))
              .catch(() => {});
          liveEvents?.close();
          liveEvents = new EventSource("/api/esper-live/events");
          liveEvents.addEventListener("change", applyLive);
        }
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) u?.SendMessage("ESPER", "SetReducedMotion", "1");
        // Up close, subjects sit left of the dossier on wide screens.
        u?.SendMessage("ESPER", "SetFrameOffset", window.innerWidth >= 768 ? "7" : "0");
        // The opening: once per visit, the title holds while the camera eases in from the doorway.
        let seen = false;
        try {
          seen = sessionStorage.getItem("esper-intro") === "1";
          sessionStorage.setItem("esper-intro", "1");
        } catch {}
        if (!seen && !studioMode) {
          setShowTitle(true);
          u?.SendMessage("ESPER", "PlayIntro", "4.2");
          window.setTimeout(() => setShowTitle(false), 4500);
        }
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
    const dismissTitle = () => setShowTitle(false);
    const onKey = (e: KeyboardEvent) => {
      dismissTitle();
      if (e.key === "Escape") unityRef.current?.SendMessage("ESPER", "Back");
    };
    window.addEventListener("pointerdown", dismissTitle);
    window.addEventListener("keydown", onKey);
    // Unity reads the mouse for the whole page, so a click on the interface would also land on whatever sits
    // behind it in the room. Tell it when the pointer is over anything but the canvas. Capture phase, so this
    // arrives before Unity's next frame sees the press.
    let overUi = false;
    const gate = (e: PointerEvent) => {
      const over = e.target !== canvas;
      if (over === overUi) return;
      overUi = over;
      unityRef.current?.SendMessage("ESPER", "SetPointerOverUi", over ? "1" : "0");
    };
    window.addEventListener("pointermove", gate, true);
    window.addEventListener("pointerdown", gate, true);

    return () => {
      cancelled = true;
      liveEvents?.close();
      window.removeEventListener("esper", onEsper);
      window.removeEventListener("pointerdown", dismissTitle);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", gate, true);
      window.removeEventListener("pointerdown", gate, true);
      unityRef.current?.Quit().catch(() => {});
      unityRef.current = null;
    };
  }, [router]);

  const send = useCallback((method: string, value?: string) => unityRef.current?.SendMessage("ESPER", method, value), []);
  // Studio: Play is the experience as visitors get it; Edit hands the room to the tools.
  const [editing, setEditingState] = useState(false);
  const setEditing = (on: boolean) => {
    setEditingState(on);
    setActive(null);
    send("Back");
    send("Enable", on ? "1" : "0");
  };
  const goto = (id: string) => {
    setActive(id);
    send("Goto", id);
  };
  const back = () => {
    setActive(null);
    send("Back");
  };
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#ece9e4]">
      <canvas
        ref={canvasRef}
        id="esper-canvas"
        tabIndex={-1}
        aria-label="A roofless model house seen from above. Each room is a project."
        className="absolute inset-0 h-full w-full cursor-grab outline-none transition-opacity duration-[900ms] ease-out active:cursor-grabbing"
        style={{
          opacity: ready && !leaving ? 1 : 0,
          cursor: hovering ? "pointer" : undefined,
          touchAction: "none",
        }}
      />

      {/* Boot: a single phosphor line drawing across the dark. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        style={{ width: "min(36vw, 420px)", opacity: ready || failed ? 0 : 1 }}
      >
        <div
          className="h-full origin-left bg-[#1d1d1f] transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
        />
      </div>

      {studio && ready && <EsperDials send={send} />}
      {editing && ready && <EsperStudio send={send} canvas={canvasRef.current} />}
      {studio && ready && (
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="fixed left-5 top-16 z-[2147483001] rounded-full bg-[rgba(30,30,34,0.72)] px-4 py-2 font-[family-name:var(--font-geist)] text-[13px] font-medium text-white shadow-lg backdrop-blur-2xl transition-colors duration-200 hover:bg-[rgba(50,50,56,0.8)]"
        >
          {editing ? "Play" : "Edit"}
        </button>
      )}
      {!leaving && !editing && <HoverTag id={active ? "" : hovering} />}
      {!leaving && !editing && (
        <EsperInterface
          ready={ready}
          active={active}
          showTitle={showTitle}
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

      {failed && (
        // No 3D (no WebGL, or the scene didn't load): the work is still one click away.
        <nav aria-label="Work" className="absolute inset-0 flex flex-col items-center justify-center gap-5 font-[family-name:var(--font-display)] text-2xl font-bold text-[#1d1d1f]">
          {STATIONS.filter((st) => st.href).map((st) => (
            <Link key={st.id} href={st.href!} className="hover:opacity-60">
              {st.title}
            </Link>
          ))}
          <Link href="/" className="mt-4 text-base font-medium text-black/60 hover:text-black">
            Home
          </Link>
        </nav>
      )}
    </main>
  );
}
