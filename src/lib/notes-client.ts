/** Paper colours a note can be (the API accepts only these). */
export const NOTE_COLORS = ["#FFF9C4", "#F8BBD0", "#C8E6C9", "#BBDEFB", "#E1BEE7"] as const;

/** UUID for anonymous user id. `randomUUID` is omitted on non-secure origins (e.g. http:// LAN). */
export function newAnonymousId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  // Always a v4 UUID: the API rejects anything else.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** This browser's anonymous id: who may delete which notes. */
export function getUserId(): string {
  const key = "portfolio-user-id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = newAnonymousId();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return newAnonymousId();
  }
}
