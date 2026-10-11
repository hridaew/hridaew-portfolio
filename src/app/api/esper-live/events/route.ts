import { watch } from "fs";
import path from "path";

// Server-sent events (dev only): fires "change" whenever Live/scene.json is written — by Studio, by an
// editor, or by Claude — so every open page re-applies the room within a second.
const DIR = path.join(process.cwd(), "esper-unity", "Live");

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const encoder = new TextEncoder();
  let close = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data = "") => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      let timer: ReturnType<typeof setTimeout> | null = null;
      const watcher = watch(DIR, (_type, file) => {
        if (file !== "scene.json") return;
        // Editors write in bursts; settle before telling the page.
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => send("change", String(Date.now())), 120);
      });
      const ping = setInterval(() => send("ping"), 20000);
      send("hello");
      close = () => {
        watcher.close();
        clearInterval(ping);
        if (timer) clearTimeout(timer);
        try {
          controller.close();
        } catch {}
      };
      req.signal.addEventListener("abort", () => close());
    },
    cancel() {
      close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
