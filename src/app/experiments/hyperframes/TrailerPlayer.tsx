"use client";

import { useEffect, useState } from "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- JSX intrinsic element augmentation for the @hyperframes/player web component
  namespace JSX {
    interface IntrinsicElements {
      "hyperframes-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          width?: number;
          height?: number;
          poster?: string;
          controls?: boolean | "";
          muted?: boolean | "";
          autoplay?: boolean | "";
          loop?: boolean | "";
          playsinline?: boolean | "";
          "playback-rate"?: number;
        },
        HTMLElement
      >;
    }
  }
}

type LoadState = "loading" | "ready" | "failed";

const COMPOSITION_SRC = "/experiments/hyperframes-trailer/index.html";

export function TrailerPlayer() {
  const [state, setState] = useState<LoadState>("loading");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    import("@hyperframes/player")
      .then(() => {
        if (!cancelled) setState("ready");
      })
      .catch((err) => {
        console.warn("Failed to load @hyperframes/player", err);
        if (!cancelled) setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
      {state === "loading" && (
        <div className="type-caption-medium absolute inset-0 grid place-items-center uppercase tracking-widest text-white/35">
          Loading player
        </div>
      )}

      {state === "failed" && (
        <div className="type-body absolute inset-0 grid place-items-center p-8 text-center text-white/50">
          The HyperFrames player couldn&rsquo;t load. The composition source is
          still viewable at{" "}
          <a
            href={COMPOSITION_SRC}
            className="underline decoration-white/40 underline-offset-4 hover:text-white"
          >
            {COMPOSITION_SRC}
          </a>
          .
        </div>
      )}

      {state === "ready" && (
        <hyperframes-player
          src={COMPOSITION_SRC}
          width={1920}
          height={1080}
          muted
          playsinline
          loop
          controls
          {...(reducedMotion ? {} : { autoplay: true })}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      )}

      <noscript>
        <div className="type-body absolute inset-0 grid place-items-center p-8 text-center text-white/55">
          This experiment needs JavaScript to play. The raw composition lives at{" "}
          <a href={COMPOSITION_SRC} className="underline underline-offset-4">
            {COMPOSITION_SRC}
          </a>
          .
        </div>
      </noscript>
    </div>
  );
}
