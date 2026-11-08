// Server only: the route handlers under src/app/api/sticky-notes.
import { createHmac, timingSafeEqual } from "crypto";
import { Redis } from "@upstash/redis";

/** A note as stored. `name` is public (signed on the guestbook); `email` and `userId` never leave the server. */
export type NoteData = {
  id: string;
  message: string;
  name?: string;
  email?: string;
  userId: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  createdAt: string;
  page: string;
};

/** What anyone may read about a guestbook note. */
export type PublicNote = Pick<NoteData, "id" | "message" | "name" | "color" | "rotation" | "createdAt"> & { mine: boolean };

export const toPublic = (n: NoteData, userId?: string | null): PublicNote => ({
  id: n.id,
  message: n.message,
  ...(n.name ? { name: n.name } : {}),
  color: n.color,
  rotation: Number(n.rotation) || 0,
  createdAt: n.createdAt,
  mine: !!userId && n.userId === userId,
});

export interface NotesStore {
  create(note: NoteData): Promise<void>;
  get(id: string): Promise<NoteData | null>;
  remove(note: NoteData): Promise<void>;
  byUser(userId: string): Promise<NoteData[]>;
  all(): Promise<NoteData[]>;
  byPage(page: string): Promise<NoteData[]>;
  /** Counts a request against the user's hourly allowance; returns the count so far. */
  hit(userId: string): Promise<number>;
}

const newestFirst = (a: NoteData, b: NoteData) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

function redisStore(redis: Redis): NotesStore {
  const load = async (ids: string[]) => {
    if (!ids.length) return [];
    const p = redis.pipeline();
    for (const id of ids) p.hgetall(`note:${id}`);
    const rows = (await p.exec()) as (NoteData | null)[];
    return rows.filter((n): n is NoteData => !!n).sort(newestFirst);
  };
  return {
    async create(note) {
      await redis.hset(`note:${note.id}`, note);
      await Promise.all([
        redis.sadd(`user_notes:${note.userId}`, note.id),
        redis.sadd("all_notes", note.id),
        redis.sadd(`page_notes:${note.page}`, note.id),
      ]);
    },
    get: (id) => redis.hgetall<NoteData>(`note:${id}`),
    async remove(note) {
      await Promise.all([
        redis.del(`note:${note.id}`),
        redis.srem(`user_notes:${note.userId}`, note.id),
        redis.srem("all_notes", note.id),
        redis.srem(`page_notes:${note.page}`, note.id),
      ]);
    },
    byUser: async (userId) => load(await redis.smembers(`user_notes:${userId}`)),
    all: async () => load(await redis.smembers("all_notes")),
    async byPage(page) {
      // The per-page index arrived after the first notes; build it once from everything if it isn't there yet.
      const key = `page_notes:${page}`;
      if (!(await redis.exists(key))) {
        const every = await load(await redis.smembers("all_notes"));
        const ids = every.filter((n) => n.page === page).map((n) => n.id);
        if (ids.length) await redis.sadd(key, ids[0], ...ids.slice(1));
        return every.filter((n) => n.page === page);
      }
      return load(await redis.smembers(key));
    },
    async hit(userId) {
      const key = `rate:${userId}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, 3600);
      return count;
    },
  };
}

/** Development without Redis: an in-memory board, seeded so the guestbook can be seen full. Never used in production. */
function memoryStore(): NotesStore {
  const g = globalThis as unknown as { __devNotes?: Map<string, NoteData> };
  if (!g.__devNotes) {
    g.__devNotes = new Map();
    const colors = ["#FFF9C4", "#F8BBD0", "#C8E6C9", "#BBDEFB", "#E1BEE7"];
    const lines = [
      ["Love the little house. The fridge light got me.", "Sam"],
      ["How long did the room take to build?", ""],
      ["OBSCURA was beautiful in person.", "Mina"],
      ["Arsenal till I die", "Kofi"],
      ["Clean work. The camera moves feel great.", "Priya"],
      ["hi from Seattle!", ""],
      ["The butter chicken recipe is legit.", "Dev"],
      ["Spatial portfolio done right.", "Alex"],
      ["Can I hire you?", "Jordan"],
      ["The cat petting station made me cry a little.", ""],
      ["Ghost people are a nice touch.", "Lee"],
      ["Found the record player.", "Ana"],
    ];
    const start = Date.now() - 30 * 86400000;
    for (let i = 0; i < 30; i++) {
      const [message, name] = lines[i % lines.length];
      const id = `dev${i.toString().padStart(2, "0")}`;
      g.__devNotes.set(id, {
        id, message, ...(name ? { name } : {}), userId: "00000000-0000-4000-8000-000000000000", x: 0, y: 0,
        color: colors[i % colors.length], rotation: ((i * 37) % 9) - 4, createdAt: new Date(start + i * 86400000).toISOString(), page: "room",
      });
    }
  }
  const notes = g.__devNotes;
  const list = (f: (n: NoteData) => boolean) => [...notes.values()].filter(f).sort(newestFirst);
  return {
    create: async (note) => void notes.set(note.id, note),
    get: async (id) => notes.get(id) ?? null,
    remove: async (note) => void notes.delete(note.id),
    byUser: async (userId) => list((n) => n.userId === userId),
    all: async () => list(() => true),
    byPage: async (page) => list((n) => n.page === page),
    hit: async () => 1,
  };
}

/** Redis when it's configured; in development without it, the in-memory board; otherwise nothing. */
export function notesStore(): NotesStore | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) return redisStore(new Redis({ url, token }));
  return process.env.NODE_ENV === "production" ? null : memoryStore();
}

// ---- admin ----

const adminToken = () => process.env.NOTES_ADMIN_TOKEN?.trim() || "";

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** True only for the owner's secret. With no secret configured there is no admin at all. */
export function isAdmin(token: string | null | undefined) {
  const t = adminToken();
  return !!t && !!token && same(token, t);
}

/** Signs a note id for the one-click remove link in the notification email. */
export function removeSignature(id: string) {
  const t = adminToken();
  return t ? createHmac("sha256", t).update(`remove:${id}`).digest("hex") : "";
}

export function validRemoveSignature(id: string, sig: string | null) {
  const want = removeSignature(id);
  return !!want && !!sig && same(sig, want);
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
