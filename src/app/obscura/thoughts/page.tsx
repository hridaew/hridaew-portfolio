"use client";

import { useEffect, useRef, useState } from "react";

const KINDS = [
  { id: "thoughts", label: "A thought" },
  { id: "feedback", label: "Feedback" },
  { id: "review",   label: "A review" },
  { id: "other",    label: "Something else" },
] as const;

type Status = "idle" | "sending" | "sent" | "error";

function getUserId(): string {
  // Per-browser id so rate limiting has something stable to key on. Not an
  // account and not tracking - it never leaves this device except as an opaque
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
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("thoughts");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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
          kind,
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

  if (status === "sent") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl mb-3">
          Thank you
        </h1>
        <p className="font-[family-name:var(--font-geist)] text-base opacity-70 max-w-sm">
          Your thoughts have been recorded. They mean a great deal.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-10 flex flex-col max-w-lg mx-auto">
      <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl leading-tight">
        Obscura
      </h1>
      <p className="font-[family-name:var(--font-geist)] text-base opacity-70 mt-2 mb-7">
        You just looked through Wayne Wong&apos;s 1946 photographs. I&apos;d love to
        hear what stayed with you.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              aria-pressed={kind === k.id}
              className={[
                "font-[family-name:var(--font-geist)] text-sm rounded-full px-4 py-2 border transition-colors",
                kind === k.id
                  ? "bg-[var(--ink)] text-[var(--paper)] border-transparent"
                  : "border-[var(--border,rgba(128,128,128,0.4))] opacity-70",
              ].join(" ")}
            >
              {k.label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Your thoughts</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            rows={8}
            required
            autoFocus
            placeholder="What did you notice? What did you find yourself looking at?"
            className="font-[family-name:var(--font-geist)] text-base rounded-2xl p-4 bg-transparent border border-[var(--border,rgba(128,128,128,0.4))] resize-y focus-visible:outline-2 focus-visible:outline-offset-2"
          />
          <span className="text-xs opacity-50 self-end tabular-nums">
            {message.length} / 2000
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-[family-name:var(--font-geist)] text-sm opacity-70">
            Email — only if you&apos;d like a reply
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-[family-name:var(--font-geist)] text-base rounded-xl p-3 bg-transparent border border-[var(--border,rgba(128,128,128,0.4))] focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </label>

        {/* Honeypot: hidden from people, irresistible to bots. */}
        <input
          ref={honeypot}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] w-px h-px opacity-0"
        />

        {error && (
          <p role="alert" className="font-[family-name:var(--font-geist)] text-sm text-[var(--destructive)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!message.trim() || status === "sending"}
          className="font-[family-name:var(--font-geist)] text-base rounded-full px-6 py-3.5 bg-[var(--ink)] text-[var(--paper)] disabled:opacity-40 transition-opacity"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </form>
    </main>
  );
}
