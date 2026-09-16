"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";
type CamState = "off" | "starting" | "live" | "denied" | "unsupported";

const MAX_EDGE = 1600; // plenty to look at, and keeps big phone photos fast

// Confirm these before the exhibition — this is the one part of the page
// that is about other people.
const CREDITS: Array<[string, string]> = [
  ["Hridae Walia", "Lead design and development"],
  ["Asa Symons", "Design, music"],
  ["Caiya Wiltshire", "Design, research"],
  ["Nick Hallin", "Design, writing"],
  ["Bibiana Bauer", "Narrator"],
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

/** Inverts pixels in place. The whole trick, in four lines. */
function invert(data: ImageData) {
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    px[i] = 255 - px[i];
    px[i + 1] = 255 - px[i + 1];
    px[i + 2] = 255 - px[i + 2];
  }
}

export default function ObscuraThoughtsPage() {
  const [cam, setCam] = useState<CamState>("off");
  const [shot, setShot] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [saved, setSaved] = useState(false);

  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const blobRef = useRef<Blob | null>(null);
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

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCam("starting");
    setShot(null);
    setSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCam("live");
    } catch {
      setCam("denied");
    }
  }, []);

  /** Freezes the current frame, inverted, as a keepable image. */
  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;

    const scale = Math.min(1, MAX_EDGE / Math.max(v.videoWidth, v.videoHeight));
    const cw = Math.round(v.videoWidth * scale);
    const ch = Math.round(v.videoHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch);
    invert(data);
    ctx.putImageData(data, 0, 0);

    canvas.toBlob((b) => { blobRef.current = b; }, "image/jpeg", 0.92);
    setShot(canvas.toDataURL("image/jpeg", 0.92));
    setSaved(false);
    stopCamera();
    setCam("off");
  }

  /** Same result, from a photo they already took. */
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
      invert(data);
      ctx.putImageData(data, 0, 0);

      canvas.toBlob((b) => { blobRef.current = b; }, "image/jpeg", 0.92);
      setShot(canvas.toDataURL("image/jpeg", 0.92));
      setSaved(false);
      stopCamera();
      setCam("off");
    } catch {
      setError("Couldn't read that image. Try another one.");
    } finally {
      setWorking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /** Share sheet where it exists — that is where iOS puts "Save Image". */
  async function save() {
    const blob = blobRef.current;
    if (!blob) return;

    const file = new File([blob], "obscura.jpg", { type: "image/jpeg" });
    const nav = navigator as Navigator & {
      canShare?: (d: ShareData) => boolean;
      share?: (d: ShareData) => Promise<void>;
    };

    if (nav.canShare?.({ files: [file] }) && nav.share) {
      try { await nav.share({ files: [file] }); setSaved(true); return; }
      catch { /* dismissed — fall through to download */ }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "obscura.jpg";
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
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

  // The page runs inverted — ink as ground, paper as type — to match the
  // negative strip the visitor is holding.
  const field =
    "font-[family-name:var(--font-geist)] text-base rounded-xl px-3.5 py-3 bg-transparent " +
    "border border-[rgba(244,244,243,0.28)] text-[var(--paper)] " +
    "placeholder:text-[rgba(244,244,243,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[var(--paper)]";
  const pill =
    "font-[family-name:var(--font-geist)] text-base rounded-full px-7 py-3.5 disabled:opacity-40 transition-opacity";

  return (
    <main className="min-h-dvh bg-black text-[var(--paper)]">
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
            Thank you for experiencing the Obscura.
          </p>
        </header>

        {/* ---- the developer ---- */}
        <section>
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-black border border-[rgba(244,244,243,0.18)]">
            {shot ? (
              // Deliberately a plain <img>: a client-side data URL that
              // next/image cannot optimise, and a real <img> is what lets iOS
              // offer "Save to Photos" on a long press as well.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shot}
                alt="Your photographs, developed"
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                // Invert the feed, so a paper negative reads as a positive.
                style={{ filter: "invert(1)", display: cam === "live" ? "block" : "none" }}
              />
            )}

            {!shot && cam !== "live" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-4 text-[var(--paper)]">
                <button
                  onClick={startCamera}
                  disabled={cam === "starting" || cam === "unsupported"}
                  className={pill + " bg-[var(--paper)] text-[var(--ink)]"}
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

            {!shot && cam === "live" && (
              <button
                onClick={capture}
                aria-label="Capture this image"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-[var(--paper)] ring-4 ring-[var(--paper)]/40 active:scale-95 transition-transform"
              />
            )}
          </div>

          <p className="font-[family-name:var(--font-geist)] text-sm text-center mt-3 opacity-70">
            ↑ Develop your photos
          </p>

          {/* capture → save / retake */}
          {shot ? (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={save} className={pill + " bg-[var(--paper)] text-[var(--ink)]"}>
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={startCamera}
                className={pill + " border border-[rgba(244,244,243,0.3)] text-[var(--paper)]"}
              >
                Retake
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center mt-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={working}
                className="font-[family-name:var(--font-geist)] text-sm underline underline-offset-4 opacity-60 disabled:opacity-40"
              >
                {working ? "Developing…" : "or upload a photo instead"}
              </button>
            </div>
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
                className="font-[family-name:var(--font-geist)] text-base leading-relaxed"
              >
                What did you think of the experience? What did it make you
                think about? Anything at all!
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
                  className="absolute right-3 bottom-3 h-11 w-16 rounded-full bg-[var(--paper)] text-[var(--ink)] disabled:opacity-30 transition-opacity grid place-items-center"
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
            className="font-[family-name:var(--font-geist)] text-base underline underline-offset-4 decoration-[rgba(244,244,243,0.35)] hover:decoration-[var(--paper)]"
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
