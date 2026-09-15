"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";
type CamState = "off" | "starting" | "live" | "denied" | "unsupported";

const MAX_EDGE = 1600; // plenty to look at, and keeps big phone photos fast

// Confirm these before the exhibition — this is the one part of the page
// that is about other people.
const CREDITS: Array<[string, string]> = [
  ["Hridae Walia", "Lead interaction design, development"],
  ["Asa Symons", "Design, music"],
  ["Caiya Wiltshire", "Design, research"],
  ["Nick Hallin", "Design, writing"],
  ["Bibi", "Voice of the narrator"],
  ["The Wong family", "With thanks"],
];

function getUserId(): string {
  // Per-browser id so rate limiting has something stable to key on. Not an
  // account and not tracking — it never leaves this device except as an opaque
  // string attached to submissions from it.
  try {
    const existing = localStorage.getItem("obscura.uid");
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem("obscura.uid", fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export default function ObscuraThoughtsPage() {
  const [cam, setCam] = useState<CamState>("off");
  const [frozen, setFrozen] = useState(false);
  const [developed, setDeveloped] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) setCam("unsupported");
  }, []);

  // Release the camera when the page goes away. Leaving it held keeps the
  // indicator light on, which is alarming, and drains the visitor's battery.
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const startCamera = useCallback(async () => {
    setCam("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setDeveloped(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCam("live");
    } catch {
      setCam("denied");
    }
  }, []);

  function toggleFreeze() {
    const v = videoRef.current;
    if (!v) return;
    if (frozen) { void v.play(); setFrozen(false); }
    else { v.pause(); setFrozen(true); }
  }

  /** Inverts a chosen photo on-device and shows it as a saveable image. */
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setWorking(true);
    setError("");

    try {
      let w: number, h: number;
      let source: CanvasImageSource;

      if (typeof createImageBitmap === "function") {
        // from-image honours EXIF rotation, which phone photos almost always carry
        const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
        source = bmp; w = bmp.width; h = bmp.height;
      } else {
        const url = URL.createObjectURL(file);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new window.Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = url;
        });
        URL.revokeObjectURL(url);
        source = img; w = img.naturalWidth; h = img.naturalHeight;
      }

      const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement("canvas");
      canvas.width = cw; canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.drawImage(source, 0, 0, cw, ch);

      const data = ctx.getImageData(0, 0, cw, ch);
      const px = data.data;
      for (let i = 0; i < px.length; i += 4) {
        px[i] = 255 - px[i];
        px[i + 1] = 255 - px[i + 1];
        px[i + 2] = 255 - px[i + 2];
      }
      ctx.putImageData(data, 0, 0);

      // Rendered as a plain <img>, so a long press offers Save to Photos on iOS.
      setDeveloped(canvas.toDataURL("image/jpeg", 0.92));
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setCam("off");
    } catch {
      setError("Couldn't read that image. Try another one.");
    } finally {
      setWorking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || status === "sending") return;

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/obscura-thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          kind: "thoughts",
          name: name || undefined,
          email: email || undefined,
          userId: getUserId(),
          website: honeypot.current?.value || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save that. Please try again.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const field =
    "font-[family-name:var(--font-geist)] text-base rounded-xl px-3.5 py-3 bg-transparent border border-[var(--border,rgba(43,42,39,0.25))] focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <main className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-lg mx-auto px-6">

        {/* ---- identity ---- */}
        <header className="pt-12 pb-8 text-center">
          <Image
            src="/assets/obscura/wordmark.png"
            alt="Obscura"
            width={1000}
            height={195}
            priority
            className="w-56 h-auto mx-auto"
          />
          <p className="font-[family-name:var(--font-geist)] text-base opacity-70 mt-4">
            Thank you for experiencing the obscura.
          </p>
        </header>

        {/* ---- the developer ---- */}
        <section>
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-[var(--ink)]">
            {developed ? (
              // Deliberately a plain <img>: a client-side data URL that
              // next/image cannot optimise, and a real <img> is what lets iOS
              // offer "Save to Photos" on a long press.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={developed}
                alt="Your photographs, developed"
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                // The whole trick: invert the feed, so a paper negative reads positive.
                style={{ filter: "invert(1)", display: cam === "live" ? "block" : "none" }}
              />
            )}

            {!developed && cam !== "live" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-4 text-[var(--paper)]">
                <button
                  onClick={startCamera}
                  disabled={cam === "starting" || cam === "unsupported"}
                  className="font-[family-name:var(--font-geist)] text-base rounded-full px-7 py-3.5 bg-[var(--paper)] text-[var(--ink)] disabled:opacity-40"
                >
                  {cam === "starting" ? "Opening…" : cam === "denied" ? "Try camera again" : "Start camera"}
                </button>
                {(cam === "denied" || cam === "unsupported") && (
                  <p className="font-[family-name:var(--font-geist)] text-sm opacity-70 max-w-[24ch]">
                    No camera here — upload a photo of your strip instead.
                  </p>
                )}
              </div>
            )}

            {!developed && cam === "live" && (
              <button
                onClick={toggleFreeze}
                aria-pressed={frozen}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 font-[family-name:var(--font-geist)] text-sm rounded-full px-5 py-2.5 bg-[var(--paper)]/90 text-[var(--ink)] backdrop-blur"
              >
                {frozen ? "Resume" : "Hold still"}
              </button>
            )}
          </div>

          <p className="font-[family-name:var(--font-geist)] text-sm text-center mt-3 opacity-70">
            ↑ Develop your photos
          </p>

          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={working}
              className="font-[family-name:var(--font-geist)] text-sm underline underline-offset-4 opacity-60 disabled:opacity-40"
            >
              {working ? "Developing…" : developed ? "Try another photo" : "or upload a photo instead"}
            </button>
            {developed && (
              <button
                onClick={() => { setDeveloped(null); void startCamera(); }}
                className="font-[family-name:var(--font-geist)] text-sm underline underline-offset-4 opacity-60"
              >
                back to camera
              </button>
            )}
          </div>

          {developed && (
            <p className="font-[family-name:var(--font-geist)] text-xs opacity-50 text-center mt-2">
              Press and hold the image to save it.
            </p>
          )}

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </section>

        {/* ---- the ask ---- */}
        <section className="pt-12">
          {status === "sent" ? (
            <div className="text-center py-6">
              <h2 className="font-[family-name:var(--font-display)] font-bold text-2xl mb-2">
                Thank you
              </h2>
              <p className="font-[family-name:var(--font-geist)] text-base opacity-70">
                That means a great deal.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <label
                htmlFor="obscura-thoughts"
                className="font-[family-name:var(--font-geist)] text-base"
              >
                I would love to hear your thoughts:
              </label>

              <div className="relative">
                <textarea
                  id="obscura-thoughts"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  required
                  className={field + " w-full resize-y pb-14"}
                />
                <button
                  type="submit"
                  aria-label="Send your thoughts"
                  disabled={!message.trim() || status === "sending"}
                  className="absolute right-3 bottom-3 h-11 w-16 rounded-full bg-[var(--ink)] text-[var(--paper)] disabled:opacity-30 transition-opacity grid place-items-center"
                >
                  {status === "sending" ? (
                    <span className="text-xs font-[family-name:var(--font-geist)]">…</span>
                  ) : (
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true">
                      <path d="M1 7h19M15 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  maxLength={100} placeholder="Name (optional)" autoComplete="name"
                  aria-label="Your name, optional" className={field}
                />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  maxLength={200} placeholder="Email (optional)" autoComplete="email"
                  aria-label="Your email, optional" className={field}
                />
              </div>

              {/* Honeypot: hidden from people, irresistible to bots. */}
              <input ref={honeypot} type="text" name="website" tabIndex={-1}
                     autoComplete="off" aria-hidden="true"
                     className="absolute left-[-9999px] w-px h-px opacity-0" />

              {error && (
                <p role="alert" className="font-[family-name:var(--font-geist)] text-sm text-[var(--destructive,#b00020)]">
                  {error}
                </p>
              )}
            </form>
          )}
        </section>

        {/* ---- credits ---- */}
        <section className="pt-14">
          <h2 className="font-[family-name:var(--font-geist)] text-xs tracking-[0.18em] uppercase opacity-50">
            Credits
          </h2>
          <dl className="mt-4 flex flex-col gap-2.5">
            {CREDITS.map(([who, what]) => (
              <div key={who} className="flex gap-3 items-baseline">
                <dt className="font-[family-name:var(--font-geist)] text-sm font-medium min-w-[9.5rem] shrink-0">
                  {who}
                </dt>
                <dd className="font-[family-name:var(--font-geist)] text-sm opacity-60">
                  {what}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---- the door out ---- */}
        <section className="pt-10">
          <a
            href="/obscura"
            className="font-[family-name:var(--font-geist)] text-base underline underline-offset-4 decoration-[var(--ink)]/30 hover:decoration-[var(--ink)]"
          >
            Learn about the project →
          </a>
        </section>

        <footer className="pt-10 pb-14">
          <p className="font-[family-name:var(--font-geist)] text-xs opacity-40 leading-relaxed">
            Photographs are developed on your device. Nothing from the camera or
            from an image you choose is recorded, uploaded or stored.
          </p>
        </footer>
      </div>
    </main>
  );
}
