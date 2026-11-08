import { NextRequest } from "next/server";
import { notesStore, validRemoveSignature } from "@/lib/notes-store";

export const dynamic = "force-dynamic";

const page = (title: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
      `<body style="font:16px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:90vh;margin:0;color:#1d1d1f"><p>${title}</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );

/** The one-click remove link in the Visitor Board notification email. Signed per note with NOTES_ADMIN_TOKEN. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  if (!id || !validRemoveSignature(id, searchParams.get("sig"))) return page("That link isn’t valid.", 403);
  const store = notesStore();
  if (!store) return page("Notes storage isn’t configured.", 503);
  const note = await store.get(id);
  if (!note) return page("Already removed.");
  await store.remove(note);
  return page("Removed from the Visitor Board.");
}
