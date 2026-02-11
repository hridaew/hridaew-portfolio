import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const redis = Redis.fromEnv();

const VALID_PAGES = ["home", "virdio", "memory-care", "obscura", "domis"];
const VALID_COLORS = ["#FFF9C4", "#F8BBD0", "#C8E6C9", "#BBDEFB", "#E1BEE7"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RATE_LIMIT = 15;
const RATE_WINDOW = 3600; // 1 hour in seconds

type NoteData = {
  id: string;
  message: string;
  email?: string;
  userId: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  createdAt: string;
  page: string;
  [key: string]: unknown;
};

// --- Email notification (fire-and-forget) ---

async function sendNotificationEmail(note: NoteData) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const pageLabel =
    note.page === "home"
      ? "Home"
      : note.page
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

  await resend.emails.send({
    from: "Portfolio Notes <onboarding@resend.dev>",
    to: process.env.NOTIFICATION_EMAIL,
    subject: `New sticky note on ${pageLabel}`,
    html: `
      <h2>New Sticky Note</h2>
      <p><strong>Page:</strong> ${pageLabel}</p>
      <p><strong>Message:</strong> ${note.message}</p>
      ${note.email ? `<p><strong>From:</strong> ${note.email}</p>` : "<p><em>No email provided</em></p>"}
      <p><strong>Time:</strong> ${new Date(note.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</p>
      <p style="color:#999;font-size:12px">Color: ${note.color} | Position: (${Math.round(note.x)}, ${Math.round(note.y)})</p>
    `,
  });
}

// --- GET: Fetch notes for a user or admin ---

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const admin = searchParams.get("admin");

  try {
    let noteIds: string[];

    if (admin === "hridae") {
      noteIds = await redis.smembers("all_notes");
    } else if (userId) {
      noteIds = await redis.smembers(`user_notes:${userId}`);
    } else {
      return NextResponse.json([]);
    }

    if (!noteIds || noteIds.length === 0) {
      return NextResponse.json([]);
    }

    const notes = await Promise.all(
      noteIds.map((id) => redis.hgetall<NoteData>(`note:${id}`))
    );

    const validNotes = notes
      .filter((n): n is NoteData => n !== null)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json(validNotes);
  } catch (error) {
    console.error("GET /api/sticky-notes error:", error);
    return NextResponse.json([]);
  }
}

// --- POST: Create a new note ---

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check — silently discard bot submissions
    if (body.website) {
      return NextResponse.json({ id: "ok" });
    }

    // Validation
    const { message, email, userId, x, y, color, rotation, page } = body;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 200
    ) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
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
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateKey = `rate:${userId}`;
    const count = await redis.incr(rateKey);
    if (count === 1) {
      await redis.expire(rateKey, RATE_WINDOW);
    }
    if (count > RATE_LIMIT) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // Generate ID and build note
    const id =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const note: NoteData = {
      id,
      message: message.trim(),
      email: email?.trim() || undefined,
      userId,
      x,
      y,
      color,
      rotation,
      createdAt: new Date().toISOString(),
      page,
    };

    // Store in Redis
    await redis.hset(`note:${id}`, note);
    await redis.sadd(`user_notes:${userId}`, id);
    await redis.sadd("all_notes", id);

    // Send email notification after response (non-blocking)
    after(async () => {
      try {
        await sendNotificationEmail(note);
      } catch (err) {
        console.error("Email notification failed:", err);
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/sticky-notes error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// --- DELETE: Remove a note ---

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");
  const admin = searchParams.get("admin");

  if (!id) {
    return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
  }

  try {
    const note = await redis.hgetall<NoteData>(`note:${id}`);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Authorization: must be the note owner or admin
    if (admin !== "hridae" && note.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete note and remove from indexes
    await redis.del(`note:${id}`);
    await redis.srem(`user_notes:${note.userId}`, id);
    await redis.srem("all_notes", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sticky-notes error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
