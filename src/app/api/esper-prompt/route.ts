import { execFile, spawn } from "child_process";
import { existsSync, promises as fs, readdirSync } from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";

// Live point-and-prompt (dev only). Studio posts a click in the room plus a request; a CLI agent (Claude Code or
// Cursor, picked in Studio) edits esper-unity/Live/scene.json right away, and every save streams into the open
// page through the live scene.
// Progress comes back as NDJSON. Each prompt snapshots the scene first so it can be undone.
const ROOT = process.cwd();
const SCENE = path.join(ROOT, "esper-unity", "Live", "scene.json");
const SERVED = path.join(ROOT, "public", "esper", "live", "scene.json");
const NOTES_DIR = path.join(ROOT, "esper-unity", "Notes");
const NOTES = path.join(NOTES_DIR, "notes.json");
const HISTORY = path.join(NOTES_DIR, "history");

export type Prompt = {
  id: string;
  text: string;
  point: number[];
  normal?: number[];
  path?: string;
  camera?: number[];
  screen?: [number, number];
  image?: string;
  created: string;
  status: "queued" | "running" | "done" | "failed" | "undone";
  reply?: string;
  done?: boolean;
};

type Event = { type: "status"; status: Prompt["status"] } | { type: "step"; label: string } | { type: "reply"; text: string };

export const dynamic = "force-dynamic";

// One agent at a time: prompts run in the order they were made, each against the previous result.
const g = globalThis as unknown as { esperQueue?: Promise<unknown> };

async function readNotes(): Promise<Prompt[]> {
  try {
    return JSON.parse(await fs.readFile(NOTES, "utf8"));
  } catch {
    return [];
  }
}

async function updateNote(id: string, patch: Partial<Prompt>) {
  const notes = await readNotes();
  const n = notes.find((x) => x.id === id);
  if (n) Object.assign(n, patch);
  await fs.writeFile(NOTES, JSON.stringify(notes, null, 2));
}

export type AgentKind = "claude" | "cursor";
type Outcome = { reply: string; failed: boolean };
type Step = (label: string) => void;

const LIVE = path.join(ROOT, "esper-unity", "Live");

function claudeBin() {
  if (process.env.ESPER_AGENT_BIN) return process.env.ESPER_AGENT_BIN;
  const local = path.join(os.homedir(), ".local", "bin", process.platform === "win32" ? "claude.exe" : "claude");
  return existsSync(local) ? local : "claude";
}

/** Cursor's CLI ships as node.exe + index.js behind .cmd/.ps1 shims; call node directly (no shell quoting). */
function cursorCommand(): [string, string[]] {
  const base = path.join(process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"), "cursor-agent", "versions");
  try {
    const latest = readdirSync(base).sort().reverse()[0];
    if (latest) return [path.join(base, latest, "node.exe"), [path.join(base, latest, "index.js")]];
  } catch {}
  return ["agent", []];
}

/** Spawn a CLI agent, stream its NDJSON, and map events through `onLine`. */
function stream(cmd: string, args: string[], opts: { cwd: string; env: NodeJS.ProcessEnv; stdin?: string }, onLine: (m: Record<string, any>) => void, out: Outcome) {
  return new Promise<void>((resolve) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, env: opts.env, windowsHide: true });
    child.stdin.end(opts.stdin ?? "");
    let buf = "";
    child.stdout.on("data", (d: Buffer) => {
      buf += d.toString();
      let i: number;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        try {
          onLine(JSON.parse(line));
        } catch {}
      }
    });
    let err = "";
    child.stderr.on("data", (d: Buffer) => (err += d.toString()));
    child.on("error", (e) => {
      out.failed = true;
      out.reply = `Couldn't start the agent: ${e.message}`;
      resolve();
    });
    child.on("close", (code) => {
      if (code && !out.reply) {
        out.failed = true;
        out.reply = err.trim().split("\n").slice(-1)[0] || `Agent exited with ${code}`;
      }
      resolve();
    });
  });
}

async function runClaude(brief: string, step: Step): Promise<Outcome> {
  const out: Outcome = { reply: "", failed: false };
  const env = { ...process.env };
  // If the dev server was started from inside a Claude session, drop that session's plumbing so the agent
  // runs as a normal CLI with its own login.
  for (const k of Object.keys(env)) if (k.startsWith("CLAUDE") || k === "ANTHROPIC_BASE_URL") delete env[k];
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--model", process.env.ESPER_CLAUDE_MODEL ?? "sonnet", "--allowedTools", "Read,Glob,Grep,Edit(esper-unity/Live/scene.json)"];
  await stream(claudeBin(), args, { cwd: ROOT, env, stdin: brief }, (m) => {
    if (m.type === "assistant") for (const c of m.message?.content ?? []) if (c.type === "tool_use") step(stepLabel(c.name, c.input ?? {}));
    if (m.type === "result") {
      out.reply = String(m.result ?? "").trim();
      out.failed = !!m.is_error;
    }
  }, out);
  if (out.failed && /not logged in|\/login/i.test(out.reply)) out.reply = "Claude isn't signed in. Run `claude` in a terminal once and use /login.";
  return out;
}

async function runCursor(brief: string, step: Step): Promise<Outcome> {
  const out: Outcome = { reply: "", failed: false };
  const [cmd, pre] = cursorCommand();
  // Workspace is esper-unity/Live (whose .cursor/cli.json allows writing scene.json only and denies shell);
  // the Unity assets and the notes are added read roots so it can check models and see the screenshot.
  const args = [
    ...pre,
    "-p",
    "--output-format",
    "stream-json",
    "--force",
    "--trust",
    "--workspace",
    LIVE,
    "--add-dir",
    path.join(ROOT, "esper-unity", "Assets"),
    "--add-dir",
    NOTES_DIR,
    ...(process.env.ESPER_CURSOR_MODEL ? ["--model", process.env.ESPER_CURSOR_MODEL] : []),
    brief,
  ];
  await stream(cmd, args, { cwd: LIVE, env: { ...process.env, CURSOR_INVOKED_AS: "agent" } }, (m) => {
    if (m.type === "tool_call" && m.subtype === "started") {
      const [kind, call] = Object.entries(m.tool_call ?? {})[0] ?? [];
      const name = kind === "function" ? String((call as any)?.name ?? "") : String(kind ?? "").replace(/ToolCall$/, "");
      const file = String((call as any)?.args?.path ?? "");
      step(stepLabel(name.charAt(0).toUpperCase() + name.slice(1), { path: file }));
    }
    if (m.type === "result") {
      out.reply = String(m.result ?? "").trim();
      out.failed = !!m.is_error;
    }
  }, out);
  if (out.failed && /not (logged|signed) in|authenticat|login/i.test(out.reply)) out.reply = "Cursor isn't signed in. Run `agent login` in a terminal once.";
  return out;
}

const f = (a?: number[]) => (a ? `[${a.map((v) => Math.round(v * 1000) / 1000).join(", ")}]` : "n/a");

function brief(n: Prompt) {
  const cam = n.camera ?? [];
  return [
    `Repository root: ${ROOT}. Paths below are relative to it.`,
    `Read esper-unity/Live/AGENT.md, then make this change to esper-unity/Live/scene.json. Do not touch any other file or run commands.`,
    ``,
    `Request: ${JSON.stringify(n.text)}`,
    `Clicked point: ${f(n.point)} with surface normal ${f(n.normal)}, on ${n.path ? `"${n.path}"` : "nothing"} (an item id from scene.json, or a shell surface such as Floor / Wall_L / Wall_B_L).`,
    `Camera: position ${f(cam.slice(0, 3))}, looking ${f(cam.slice(3, 6))}, fov ${cam[6] ?? "n/a"}.`,
    n.image
      ? `Screenshot of what the designer saw: esper-unity/Notes/${n.image}. The click is ${Math.round((n.screen?.[0] ?? 0.5) * 100)}% from the left and ${Math.round((n.screen?.[1] ?? 0.5) * 100)}% from the top.`
      : ``,
    ``,
    `"Here" and "this" refer to the clicked point/object. The designer is watching the room live, so be quick and precise.`,
  ].join("\n");
}

/** A short human label for an agent tool call. */
function stepLabel(name: string, input: Record<string, unknown>) {
  const file = String(input.file_path ?? input.path ?? input.pattern ?? "");
  if (/^(Edit|Write|MultiEdit|StrReplace|SearchReplace)/i.test(name)) return "Editing the room";
  if (/^Read/i.test(name) && /\.png$/i.test(file)) return "Looking at the view";
  if (/^Read/i.test(name) && /scene\.json$/.test(file)) return "Reading the room";
  if (/^Read/i.test(name)) return "Reading";
  if (/^(Glob|Grep|Ls|List|Search|Find)/i.test(name)) return "Looking for assets";
  return "Thinking";
}

/** Files other than the scene and notes that changed while the agent ran. */
function strayChanges(before: string, after: string) {
  const seen = new Set(before.split("\n"));
  return after
    .split("\n")
    .filter((l) => l && !seen.has(l))
    .map((l) => l.slice(3))
    .filter((f) => !/^(esper-unity\/(Live\/scene\.json|Notes\/)|public\/esper\/live\/)/.test(f));
}
const gitStatus = () =>
  new Promise<string>((resolve) => execFile("git", ["status", "--porcelain", "-uall"], { cwd: ROOT, maxBuffer: 1 << 24 }, (_e, out) => resolve(String(out ?? ""))));

async function run(n: Prompt, agent: AgentKind, emit: (e: Event) => void) {
  await updateNote(n.id, { status: "running" });
  emit({ type: "status", status: "running" });
  await fs.mkdir(HISTORY, { recursive: true });
  const before = await fs.readFile(SCENE, "utf8");
  await fs.writeFile(path.join(HISTORY, `${n.id}.json`), before);
  const tree = await gitStatus();

  const step: Step = (label) => emit({ type: "step", label });
  const outcome = agent === "cursor" ? await runCursor(brief(n), step) : await runClaude(brief(n), step);
  let { reply, failed } = outcome;

  const stray = strayChanges(tree, await gitStatus());
  if (stray.length) reply = `${reply}\nAlso changed: ${stray.join(", ")}`.trim();

  // Never leave the room broken: an invalid spec rolls back to the snapshot.
  const after = await fs.readFile(SCENE, "utf8");
  try {
    JSON.parse(after);
  } catch {
    await fs.writeFile(SCENE, before);
    failed = true;
    reply = "The edit broke the scene file, so it was rolled back.";
  }
  await fs.mkdir(path.dirname(SERVED), { recursive: true });
  await fs.writeFile(SERVED, failed ? before : after);

  // The agent's last paragraph is the summary; keep it short for the pin.
  const summary = reply.split(/\n\s*\n/).filter(Boolean).slice(-1)[0] ?? "";
  const status = failed ? "failed" : "done";
  await updateNote(n.id, { status, reply: summary, done: !failed });
  emit({ type: "reply", text: summary });
  emit({ type: "status", status });
}

export async function GET() {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  return NextResponse.json(await readNotes());
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = (await req.json()) as Partial<Prompt> & { imageData?: string; undo?: string; agent?: AgentKind };

  // Undo: restore the scene as it was before that prompt (and everything after it).
  if (body.undo) {
    const snap = path.join(HISTORY, `${path.basename(body.undo)}.json`);
    if (!existsSync(snap)) return NextResponse.json({ ok: false }, { status: 404 });
    const json = await fs.readFile(snap, "utf8");
    await fs.writeFile(SCENE, json);
    await fs.writeFile(SERVED, json);
    await updateNote(body.undo, { status: "undone", done: false });
    return NextResponse.json({ ok: true });
  }

  const id = `note-${Date.now().toString(36)}`;
  await fs.mkdir(NOTES_DIR, { recursive: true });
  let image: string | undefined;
  if (body.imageData?.startsWith("data:image/png;base64,")) {
    image = `${id}.png`;
    await fs.writeFile(path.join(NOTES_DIR, image), Buffer.from(body.imageData.split(",")[1], "base64"));
  }
  const note: Prompt = {
    id,
    text: String(body.text ?? "").slice(0, 2000),
    point: body.point ?? [0, 0, 0],
    normal: body.normal,
    path: body.path,
    camera: body.camera,
    screen: body.screen,
    image,
    created: new Date().toISOString(),
    status: "queued",
  };
  const notes = await readNotes();
  notes.push(note);
  await fs.writeFile(NOTES, JSON.stringify(notes, null, 2));

  // The job keeps running if the page goes away; the stream just reports on it.
  const encoder = new TextEncoder();
  let push: (e: Event) => void = () => {};
  let end = () => {};
  const stream = new ReadableStream({
    start(controller) {
      end = () => {
        try {
          controller.close();
        } catch {}
      };
      push = (e) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {}
      };
      push({ type: "status", status: "queued" });
    },
  });
  const agent: AgentKind = body.agent === "cursor" || (!body.agent && process.env.ESPER_AGENT === "cursor") ? "cursor" : "claude";
  const job = (g.esperQueue ?? Promise.resolve()).then(() => run(note, agent, (e) => push(e)));
  g.esperQueue = job.catch(() => {});
  job
    .catch(async (e) => {
      await updateNote(id, { status: "failed", reply: String(e?.message ?? e) });
      push({ type: "status", status: "failed" });
    })
    .finally(() => {
      end();
      push = () => {};
    });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache", "X-Prompt-Id": id } });
}
