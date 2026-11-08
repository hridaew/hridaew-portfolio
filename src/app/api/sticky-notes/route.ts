import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { Resend } from "resend";
import { SITE_ORIGIN } from "@/lib/site-identity";
import { escapeHtml, isAdmin, notesStore, removeSignature, toPublic, type NoteData } from "@/lib/notes-store";

// Force dynamic — never cache GET responses on Vercel edge
export const dynamic = "force-dynamic";

const VALID_PAGES = ["home", "room", "virdio", "memory-care", "obscura", "domis"];
/** Pages whose notes everyone can read (the room's guestbook). The case studies' notes stay private. */
const PUBLIC_PAGES = ["room"];
const VALID_COLORS = ["#FFF9C4", "#F8BBD0", "#C8E6C9", "#BBDEFB", "#E1BEE7"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RATE_LIMIT = 15;
const PUBLIC_LIMIT = 500;
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const unavailable = () => NextResponse.json({ error: "Sticky notes storage is not configured." }, { status: 503 });

// --- Email notification (fire-and-forget) ---

async function sendNotificationEmail(note: NoteData) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const notifEmail = process.env.NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !notifEmail) return;

  const resend = new Resend(apiKey);
  const guestbook = note.page === "room";
  const pageLabel = guestbook
    ? "the Visitor Board"
    : note.page === "home"
      ? "Home"
      : note.page.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const sig = removeSignature(note.id);
  const removeUrl = sig ? `${SITE_ORIGIN}/api/sticky-notes/remove?id=${encodeURIComponent(note.id)}&sig=${sig}` : "";

  await resend.emails.send({
    from: "Portfolio Notes <onboarding@resend.dev>",
    to: notifEmail,
    subject: guestbook ? "New note on the Visitor Board" : `New sticky note on ${pageLabel}`,
    html: `
      <h2>New note on ${escapeHtml(pageLabel)}</h2>
      <p><strong>Message:</strong> ${escapeHtml(note.message)}</p>
      ${note.name ? `<p><strong>Signed:</strong> ${escapeHtml(note.name)}</p>` : ""}
      ${note.email ? `<p><strong>From:</strong> ${escapeHtml(note.email)}</p>` : ""}
      <p><strong>Time:</strong> ${new Date(note.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</p>
      ${guestbook && removeUrl ? `<p><a href="${removeUrl}">Remove from the Visitor Board</a></p>` : ""}
    `,
  });
}

// --- GET: a visitor's own notes, the owner's view of everything, or a public page's notes ---

export async function GET(request: NextRequest) {
  const store = notesStore();
  if (!store) return NextResponse.json([]);

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const page = searchParams.get("page");

  try {
    if (searchParams.get("scope") === "public") {
      if (!page || !PUBLIC_PAGES.includes(page)) return NextResponse.json({ error: "Invalid page" }, { status: 400 });
      const notes = (await store.byPage(page)).slice(0, PUBLIC_LIMIT);
      return NextResponse.json(notes.map((n) => toPublic(n, userId)), { headers: NO_STORE });
    }
    let notes: NoteData[];
    if (isAdmin(searchParams.get("admin"))) notes = await store.all();
    else if (userId) notes = await store.byUser(userId);
    else return NextResponse.json([]);
    return NextResponse.json(notes, { headers: NO_STORE });
  } catch (error) {
    console.error("GET /api/sticky-notes error:", error);
    return NextResponse.json([]);
  }
}

// --- POST: Create a new note ---

export async function POST(request: NextRequest) {
  const store = notesStore();
  if (!store) return unavailable();

  try {
    const body = await request.json();

    // Honeypot check — silently discard bot submissions
    if (body.website) {
      return NextResponse.json({ id: "ok" });
    }

    const { message, email, name, userId, color, rotation, page } = body;
    const guestbook = PUBLIC_PAGES.includes(page);
    // The guestbook pins notes to its board, so it has no screen position.
    const x = guestbook ? 0 : body.x;
    const y = guestbook ? 0 : body.y;

    if (typeof message !== "string" || !message.trim() || message.length > 200) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    if (name !== undefined && (typeof name !== "string" || name.trim().length > 40)) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (!VALID_PAGES.includes(page)) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }
    if (!VALID_COLORS.includes(color)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }
    if (typeof x !== "number" || typeof y !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    if ((await store.hit(userId)) > RATE_LIMIT) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const note: NoteData = {
      id,
      message: message.trim(),
      ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
      // The guestbook is public, so it never collects an email.
      ...(!guestbook && typeof email === "string" && email.trim() ? { email: email.trim() } : {}),
      userId,
      x,
      y,
      color,
      rotation: Math.max(-8, Math.min(8, Number(rotation) || 0)),
      createdAt: new Date().toISOString(),
      page,
    };

    await store.create(note);

    // Send email notification after response (non-blocking)
    after(async () => {
      try {
        await sendNotificationEmail(note);
      } catch (err) {
        console.error("Email notification failed:", err);
      }
    });

    return NextResponse.json(guestbook ? toPublic(note, userId) : note, { status: 201 });
  } catch (error) {
    console.error("POST /api/sticky-notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}

// --- DELETE: Remove a note ---

export async function DELETE(request: NextRequest) {
  const store = notesStore();
  if (!store) return unavailable();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");

  if (!id) {
    return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
  }

  try {
    const note = await store.get(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    // Authorization: must be the note owner or the site owner
    if (!isAdmin(searchParams.get("admin")) && note.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await store.remove(note);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sticky-notes error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
