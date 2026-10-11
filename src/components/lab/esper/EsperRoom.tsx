"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EsperInterface } from "./EsperInterface";
import { EsperStudio } from "./EsperStudio";

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

const BUILD = "/esper/Build";
export function EsperRoom() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unityRef = useRef<UnityInstance | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [hovering, setHovering] = useState<string>("");
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [lightsOn, setLightsOn] = useState(false);
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

    const script = document.createElement("script");
    script.src = `${BUILD}/esper.loader.js`;
    script.async = true;
    script.onload = () => {
      if (cancelled || !window.createUnityInstance) return;
      window
        .createUnityInstance(
          canvas,
          {
            dataUrl: `${BUILD}/esper.data.unityweb`,
            frameworkUrl: `${BUILD}/esper.framework.js.unityweb`,
            codeUrl: `${BUILD}/esper.wasm.unityweb`,
            companyName: "Hridae Walia",
            productName: "ESPER",
            productVersion: "0.1",
            devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
            matchWebGLToCanvasSize: true,
            // Studio notes capture a screenshot of the canvas.
            webglContextAttributes: { preserveDrawingBuffer: studioMode },
          },
          (p) => !cancelled && setProgress(p),
        )
        .then((instance) => {
          if (cancelled) {
            instance.Quit();
            return;
          }
          unityRef.current = instance;
          // Look development hook (dev only): esperLook("exposure=0.8;vol._Density=0.2")
          if (process.env.NODE_ENV !== "production") {
            const w = window as unknown as { esperLook?: (s: string) => void; esperSend?: (m: string, v?: string) => void };
            w.esperLook = (s: string) => instance.SendMessage("ESPER", "Look", s);
            w.esperSend = (m: string, v?: string) => instance.SendMessage("ESPER", m, v);
          }
        })
        .catch(() => setFailed(true));
    };
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);

    const onEsper = (e: Event) => {
      const { event, payload } = (e as EsperEvent).detail;
      if (event === "ready") {
        setReady(true);
        const u = unityRef.current;
        // Live scene (dev): the room follows esper-unity/Live/scene.json as it changes — from Studio, an
        // editor, or Claude. Production runs the baked build, which already is that file.
        if (process.env.NODE_ENV !== "production") {
          // Absolute: glTFast treats relative URLs as local file paths.
          u?.SendMessage("ESPER", "SetAssetBase", `${window.location.origin}/api/esper-asset/`);
          const applyLive = () =>
            fetch("/api/esper-live", { cache: "no-store" })
              .then((r) => r.text())
              .then((json) => unityRef.current?.SendMessage("ESPER", "ApplyScene", json))
              .catch(() => {});
          applyLive().then(() => studioMode && unityRef.current?.SendMessage("ESPER", "Enable", "1"));
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
      } else if (event === "focus") {
        setActive(payload);
      } else if (event === "overview") {
        setActive(null);
      } else if (event === "hover") {
        setHovering(payload);
      } else if (event === "enhance" && payload) {
        setLeaving(true);
        window.setTimeout(() => router.push(payload), 260);
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

    return () => {
      cancelled = true;
      liveEvents?.close();
      window.removeEventListener("esper", onEsper);
      window.removeEventListener("pointerdown", dismissTitle);
      window.removeEventListener("keydown", onKey);
      unityRef.current?.Quit().catch(() => {});
      unityRef.current = null;
      script.remove();
    };
  }, [router]);

  const send = useCallback((method: string, value?: string) => unityRef.current?.SendMessage("ESPER", method, value), []);
  const goto = (id: string) => {
    setActive(id);
    send("Goto", id);
  };
  const back = () => {
    setActive(null);
    send("Back");
  };
  const lights = (on: boolean) => {
    setLightsOn(on);
    send("SetLights", on ? "1" : "0");
  };

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#040506]">
      <canvas
        ref={canvasRef}
        id="esper-canvas"
        tabIndex={-1}
        aria-label="An apartment above the city at night. Each object in the room is a piece of work."
        className="absolute inset-0 h-full w-full outline-none transition-opacity duration-[900ms] ease-out"
        style={{
          opacity: ready && !leaving ? 1 : 0,
          cursor: hovering ? "pointer" : "default",
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
          className="h-full origin-left bg-[#cfe8ff] shadow-[0_0_12px_2px_rgba(160,210,255,0.55)] transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
        />
      </div>

      {studio && ready && <EsperStudio send={send} canvas={canvasRef.current} />}
      {!leaving && !studio && (
        <EsperInterface
          ready={ready}
          active={active}
          lightsOn={lightsOn}
          showTitle={showTitle}
          hovered={hovering}
          onSelect={goto}
          onBack={back}
          onLights={lights}
        />
      )}

      {failed && (
        <nav className="absolute inset-0 flex items-center justify-center gap-8 font-[family-name:var(--font-display)] text-2xl font-bold text-[#e8eef5]">
          <Link href="/">Home</Link>
          <Link href="/obscura">OBSCURA</Link>
        </nav>
      )}
    </main>
  );
}
