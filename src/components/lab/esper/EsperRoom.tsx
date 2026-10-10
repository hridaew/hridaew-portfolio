"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EsperSidebar } from "./EsperSidebar";

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
  const [hovering, setHovering] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [lightsOn, setLightsOn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

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
          },
          (p) => !cancelled && setProgress(p),
        )
        .then((instance) => {
          if (cancelled) {
            instance.Quit();
            return;
          }
          unityRef.current = instance;
        })
        .catch(() => setFailed(true));
    };
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);

    const onEsper = (e: Event) => {
      const { event, payload } = (e as EsperEvent).detail;
      if (event === "ready") {
        setReady(true);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          unityRef.current?.SendMessage("ESPER", "SetReducedMotion", "1");
        }
      } else if (event === "focus") {
        setActive(payload);
      } else if (event === "overview") {
        setActive(null);
      } else if (event === "hover") {
        setHovering(payload !== "");
      } else if (event === "enhance" && payload) {
        setLeaving(true);
        window.setTimeout(() => router.push(payload), 260);
      }
    };
    window.addEventListener("esper", onEsper);

    return () => {
      cancelled = true;
      window.removeEventListener("esper", onEsper);
      unityRef.current?.Quit().catch(() => {});
      unityRef.current = null;
      script.remove();
    };
  }, [router]);

  const send = (method: string, value?: string) => unityRef.current?.SendMessage("ESPER", method, value);
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

      {ready && !leaving && (
        <EsperSidebar active={active} lightsOn={lightsOn} onSelect={goto} onBack={back} onLights={lights} />
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
