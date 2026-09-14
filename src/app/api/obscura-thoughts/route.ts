import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

// Never cache: the admin view must see new submissions immediately.
export const dynamic = "force-dynamic";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const VALID_KINDS = ["thoughts", "feedback", "review", "other"] as const;
type Kind = (typeof VALID_KINDS)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE = 2000;
const RATE_LIMIT = 10;
const RATE_WINDOW = 3600;

const MAX_NAME = 100;

type ThoughtData = {
  id: string;
  message: string;
  kind: Kind;
  name?: string;
  email?: string;
  userId: string;
  createdAt: string;
  [key: string]: unknown;
};

async function sendNotificationEmail(t: ThoughtData) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const notifEmail = process.env.NOTIFICATION_EMAIL?.trim();
  if (!apiKey || !notifEmail) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "Obscura <onboarding@resend.dev>",
    to: notifEmail,
    subject: `Obscura — new ${t.kind}`,
    html: `
      <h2>New Obscura submission</h2>
      <p><strong>Kind:</strong> ${t.kind}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap">${t.message.replace(/</g, "&lt;")}</p>
      ${t.name ? `<p><strong>Name:</strong> ${String(t.name).replace(/</g, "&lt;")}</p>` : ""}
      ${t.email ? `<p><strong>From:</strong> ${String(t.email).replace(/</g, "&lt;")}</p>` : "<p><em>No email provided</em></p>"}
      <p><strong>Time:</strong> ${new Date(t.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</p>
    `,
  });
}

export async function GET(request: NextRequest) {
  const redis = getRedis();
  if (!redis) return NextResponse.json([]);

  const { searchParams } = new URL(request.url);
  if (searchParams.get("admin") !== "hridae") return NextResponse.json([]);

  try {
    const ids = await redis.smembers("all_thoughts");
    if (!ids || ids.length === 0) return NextResponse.json([]);

    const rows = await Promise.all(ids.map((id) => redis.hgetall<ThoughtData>(`thought:${id}`)));
    const valid = rows
      .filter((r): r is ThoughtData => r !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(valid, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("GET /api/obscura-thoughts error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();

    // Honeypot: bots fill hidden fields. Return success so they do not retry.
    if (body.website) return NextResponse.json({ id: "ok" });

    const { message, kind, name, email, userId } = body;

    if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    if (!VALID_KINDS.includes(kind)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (email && (typeof email !== "string" || email.length > 200)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (name && (typeof name !== "string" || name.length > MAX_NAME)) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const rateKey = `rate:thoughts:${userId}`;
    const count = await redis.incr(rateKey);
    if (count === 1) await redis.expire(rateKey, RATE_WINDOW);
    if (count > RATE_LIMIT) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const thought: ThoughtData = {
      id,
      message: message.trim(),
      kind,
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(email?.trim() ? { email: email.trim() } : {}),
      userId,
      createdAt: new Date().toISOString(),
    };

    await redis.hset(`thought:${id}`, thought);
    await redis.sadd("all_thoughts", id);

    after(async () => {
      try { await sendNotificationEmail(thought); }
      catch (err) { console.error("Obscura notification failed:", err); }
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/obscura-thoughts error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
