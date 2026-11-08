import * as THREE from "three";

/**
 * The guestbook: paper notes pinned to the corkboard in the About room.
 *
 * Built in the board's own space (scene.json's left-handed numbers, like everything under the engine's root): +x
 * along the board, +y up, -z out of the board toward the room. Notes face -z.
 *
 * Twenty-four slots. A note's slot is its place in the order notes were left (oldest first) modulo 24, so the newest
 * note always takes the oldest pinned one's place and nothing about placement has to be stored.
 */

export type BoardNote = { id: string; message: string; name?: string; color: string; rotation: number; createdAt: string };

const SLOTS = 24;
const COLS = 4;
const ROWS = 6;
const NOTE = 0.1; // m, a square of paper
const CORK = { w: 0.49, h: 0.93, front: -0.018 }; // the cork panel, relative to the board's centre
const TEX = 256;
const PIN_COLORS = ["#d8452f", "#2f6fb0", "#e9b53b", "#f1f0ec", "#2b2b2e"];

/**
 * A push pin turned on a lathe, in metres, base on the paper and cap toward the room: a wide flange, a narrow grip,
 * a domed cap. About 12 mm tall and 10 mm across, like the real thing.
 */
function pushPinGeometry() {
  const profile: [number, number][] = [
    [0, 0], [0.0052, 0], [0.0054, 0.0004], [0.0052, 0.0011], [0.0033, 0.0016], [0.0026, 0.0026], [0.0024, 0.0062],
    [0.0028, 0.0072], [0.0044, 0.0082], [0.0048, 0.0092], [0.0046, 0.0104], [0.0038, 0.0113], [0.0022, 0.0119], [0, 0.0121],
  ];
  const g = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), 28);
  g.rotateX(-Math.PI / 2); // its axis from +y to -z: out of the board, toward the room
  return g;
}

/** A soft round shadow, drawn once: under each pin, where the sun is too broad to cast one this small. */
function contactShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(0.45, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// Timing (s). Staging: the camera arrives, then the note flies, lands, is pinned, and the moment holds.
const T = { fly: 0.72, pinDelay: 0.12, pinDrop: 0.12, hold: 0.75, evictLead: 0.3, fall: 1.1, fade: 0.25 };

/** Seeded 0..1 from a string (stable per note). */
function seed(s: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** A CSS-style cubic-bezier timing curve (x1, y1, x2, y2), solved for x by Newton's method. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const x = (u: number) => ((ax * u + bx) * u + cx) * u;
  const y = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (t: number) => {
    let u = t;
    for (let i = 0; i < 8; i++) {
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= (x(u) - t) / d;
    }
    return y(Math.max(0, Math.min(1, u)));
  };
}
/** The iOS sheet curve: leaves briskly, glides in to rest with no overshoot. */
const iosEase = cubicBezier(0.32, 0.72, 0, 1);
const easeIn = (t: number) => t * t * t;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** A critically-ish damped spring on one number (stiffness 200–400, damping 20–30 per the site's motion rules). */
class Spring {
  x = 0;
  v = 0;
  constructor(public k = 320, public c = 22) {}
  kick(v: number) {
    this.v += v;
  }
  step(dt: number) {
    // Small fixed steps keep a stiff spring stable on a slow frame.
    for (let left = dt; left > 0; left -= 1 / 240) {
      const h = Math.min(left, 1 / 240);
      this.v += (-this.k * this.x - this.c * this.v) * h;
      this.x += this.v * h;
    }
  }
  get still() {
    return Math.abs(this.x) < 1e-4 && Math.abs(this.v) < 1e-3;
  }
  settle() {
    this.x = 0;
    this.v = 0;
  }
}

/** Paper with a faint curl: the bottom corners lift off the cork. Faces -z, UVs upright from the front. */
function paperGeometry() {
  const n = 6;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = j / n;
      const x = u - 0.5, y = v - 0.5;
      const lift = Math.pow(Math.max(0, 0.5 - v), 2) * (0.25 + 0.75 * Math.abs(x) * 2) * 0.09;
      pos.push(x, y, -lift);
      uv.push(u, v);
    }
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const a = j * (n + 1) + i, b = a + 1, c = a + n + 2, d = a + n + 1;
      idx.push(a, b, c, a, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

let fontFamily = "";
/** The marker hand (Permanent Marker, from the root layout), as the canvas needs it. */
function markerFamily() {
  if (!fontFamily && typeof document !== "undefined") {
    fontFamily = getComputedStyle(document.body).getPropertyValue("--font-marker").trim() || "cursive";
  }
  return fontFamily || "cursive";
}

/** Lines that fit `width`, breaking long words. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  for (const para of text.split(/\n+/)) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const tryLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(tryLine).width <= width) {
        line = tryLine;
        continue;
      }
      if (line) lines.push(line);
      line = word;
      while (ctx.measureText(line).width > width) {
        let cut = line.length - 1;
        while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > width) cut--;
        lines.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** The note's face: its paper colour, the message in marker as large as fits, the name signed bottom right. */
function drawNote(canvas: HTMLCanvasElement, note: BoardNote) {
  const ctx = canvas.getContext("2d")!;
  const S = TEX, pad = 22;
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = note.color;
  ctx.fillRect(0, 0, S, S);
  // A whisper of shading toward the lifted bottom edge.
  const g = ctx.createLinearGradient(0, S * 0.55, 0, S);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  const family = markerFamily();
  const nameH = note.name ? 30 : 0;
  // The pin sits in the top margin, so the writing starts a little lower.
  const top = pad + 12;
  const boxW = S - pad * 2, boxH = S - top - pad - nameH - 6;
  let size = 34, lines: string[] = [];
  for (; size >= 15; size -= 1) {
    ctx.font = `400 ${size}px ${family}`;
    lines = wrap(ctx, note.message, boxW);
    if (lines.length * size * 1.22 <= boxH) break;
  }
  const lh = size * 1.22;
  const maxLines = Math.max(1, Math.floor(boxH / lh));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > boxW) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  ctx.fillStyle = "#2b2a28";
  ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, pad, top + i * lh));
  if (note.name) {
    ctx.font = `400 22px ${family}`;
    ctx.fillStyle = "rgba(43,42,40,0.62)";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    let sig = note.name;
    while (sig.length > 3 && ctx.measureText(sig).width > boxW) sig = sig.slice(0, -2) + "…";
    ctx.fillText(sig, S - pad, S - pad + 2);
    ctx.textAlign = "left";
  }
}

type Slot = { x: number; y: number; jitterRot: number };

type Pinned = {
  note: BoardNote;
  slot: number;
  group: THREE.Group; // positioned at the slot; children animate within
  paper: THREE.Mesh;
  pin: THREE.Group;
  shadow: THREE.Mesh; // the pin's contact shadow on the paper
  canvas: HTMLCanvasElement;
  tex: THREE.CanvasTexture;
  mat: THREE.MeshStandardMaterial;
  rest: THREE.Euler; // its tilt on the board
  depth: number;
  jostle: Spring; // z-rotation wobble
  squash: Spring; // landing squash and stretch
  pinPop: Spring; // the pin's scale pop
};

type Flight = {
  p: Pinned;
  t: number; // seconds since the note appeared
  from: THREE.Vector3; // board space
  ctrl: THREE.Vector3;
  landed: boolean;
  pinned: boolean;
};

type Fall = { p: Pinned; t: number; vx: number; spin: number };
type Fleck = { mesh: THREE.Mesh; v: THREE.Vector3; t: number };

export type PinStart = { ndcX: number; ndcY: number; px: number };

export class GuestbookBoard {
  readonly group: THREE.Object3D;
  private baseTilt = 0;
  private slots: Slot[] = [];
  private pinned = new Map<number, Pinned>(); // by slot
  private notes: BoardNote[] = [];
  private geo = paperGeometry();
  private pinGeo = {
    body: pushPinGeometry(),
    needle: new THREE.CylinderGeometry(0.0007, 0.0004, 0.009, 8).rotateX(Math.PI / 2).translate(0, 0, 0.0045),
    shadow: new THREE.PlaneGeometry(1, 1),
  };
  private needleMat = new THREE.MeshStandardMaterial({ color: 0xc4c6c9, metalness: 0.85, roughness: 0.28 });
  private pinMats = new Map<string, THREE.MeshPhysicalMaterial>();
  private shadowTex: THREE.Texture | null = null;
  private fleckGeo = new THREE.PlaneGeometry(1, 1);
  private bump = new Spring(260, 20);
  private flight: Flight | null = null;
  private falls: Fall[] = [];
  private flecks: Fleck[] = [];
  private fadeIns: { p: Pinned; t: number }[] = [];
  private wait: { t: number; then: () => void }[] = [];
  private onPinned: (() => void) | null = null;
  private seq: { t: number; start: PinStart; note: BoardNote; reduced: boolean; lead: number } | null = null;

  constructor(
    group: THREE.Object3D,
    private opts: { dark: boolean; anisotropy: number; onLand?: () => void; onLaunch?: () => void; onPop?: () => void },
  ) {
    this.group = group;
    this.baseTilt = group.rotation.x;
    const cellW = (CORK.w - 0.05) / COLS, cellH = (CORK.h - 0.05) / ROWS;
    // Slots in a jittered grid, then shuffled so consecutive notes spread over the board instead of filling a row.
    const order = Array.from({ length: SLOTS }, (_, i) => i).sort((a, b) => seed(`slot${a}`) - seed(`slot${b}`));
    for (const i of order) {
      const c = i % COLS, r = Math.floor(i / COLS);
      this.slots.push({
        x: -CORK.w / 2 + 0.025 + cellW * (c + 0.5) + (seed(`x${i}`) - 0.5) * 0.014,
        y: CORK.h / 2 - 0.025 - cellH * (r + 0.5) + (seed(`y${i}`) - 0.5) * 0.02,
        jitterRot: (seed(`r${i}`) - 0.5) * 7,
      });
    }
    this.hangLight();
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.load(`400 30px ${markerFamily()}`).then(() => this.redrawAll()).catch(() => {});
    }
  }

  /**
   * A brass picture light over the frame: a short arm out from the wall, a slim shade, and a warm spot washing down
   * over the notes. No shadows from it (the pins have their own), so it costs one light.
   */
  private hangLight() {
    const brass = new THREE.MeshStandardMaterial({ color: 0xb48c55, metalness: 0.85, roughness: 0.32 });
    const glow = new THREE.MeshStandardMaterial({ color: 0xfff1d6, emissive: 0xffe2b0, emissiveIntensity: this.opts.dark ? 2.2 : 1.2 });
    const fixture = new THREE.Group();
    fixture.position.set(0, CORK.h / 2 + 0.07, 0);
    // Wall plate, then the arm reaching out and over.
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 24).rotateX(Math.PI / 2), brass);
    plate.position.set(0, 0, 0.012);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.12, 12).rotateX(Math.PI / 2), brass);
    arm.position.set(0, 0.012, -0.05);
    arm.rotation.x = -0.2;
    // The shade: a slim tube along the board, open underneath where it glows.
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 32, 1, false, Math.PI * 0.15, Math.PI * 1.7).rotateZ(Math.PI / 2), brass);
    shade.position.set(0, 0.024, -0.115);
    shade.rotation.x = Math.PI * 0.35;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.003, 0.014), glow);
    strip.position.set(0, 0.008, -0.112);
    for (const cap of [-0.15, 0.15]) {
      const end = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 32).rotateZ(Math.PI / 2), brass);
      end.position.set(cap, 0.024, -0.115);
      fixture.add(end);
    }
    fixture.add(plate, arm, shade, strip);
    fixture.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    this.group.add(fixture);

    const spot = new THREE.SpotLight(0xffdcae, this.opts.dark ? 1.9 : 1.1, 2.2, 0.85, 0.85, 2);
    spot.position.set(0, CORK.h / 2 + 0.07, -0.12);
    spot.target.position.set(0, -0.08, 0);
    this.group.add(spot, spot.target);
    this.lamp = { fixture, spot, mats: [brass, glow] };
  }

  private lamp: { fixture: THREE.Object3D; spot: THREE.SpotLight; mats: THREE.Material[] } | null = null;

  get busy() {
    return !!this.seq || !!this.flight || this.falls.length > 0;
  }

  /** Everyone's notes, any order. Rebuilds the board (nothing animates). */
  setNotes(notes: BoardNote[]) {
    this.finish();
    this.notes = [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const p of this.pinned.values()) this.dispose(p);
    this.pinned.clear();
    const start = Math.max(0, this.notes.length - SLOTS);
    for (let i = start; i < this.notes.length; i++) {
      const p = this.make(this.notes[i], i % SLOTS);
      this.place(p);
    }
  }

  /** Is the board (or a note on it) under this ray? */
  hit(ray: THREE.Raycaster) {
    return ray.intersectObject(this.group, true).length > 0;
  }

  /**
   * A new note arrives. `start` is where the composer's folded square sat on screen (NDC) and its size in pixels, so
   * the paper in the room picks up exactly where the one on the glass left off.
   */
  /** `lead`: how long the paper waits on the glass first (while the camera settles on the board). */
  pin(note: BoardNote, start: PinStart, reduced: boolean, lead: number, onPinned: () => void) {
    this.finish();
    this.onPinned = onPinned;
    this.seq = { t: 0, start, note, reduced, lead };
  }

  /** Takes a note back off the board (its save failed). */
  unpin(id: string) {
    this.finish();
    this.notes = this.notes.filter((n) => n.id !== id);
    this.setNotes(this.notes);
  }

  /** Skip to the end of whatever is moving. */
  finish() {
    if (this.seq) this.launch(this.seq.note, this.seq.start, true);
    this.seq = null;
    if (this.flight) {
      const f = this.flight;
      this.flight = null;
      this.place(f.p);
      f.p.pin.visible = true;
      f.p.mat.emissiveIntensity = 0;
    }
    // Anything still waiting (an eviction, the hold) happens now.
    const waiting = this.wait;
    this.wait = [];
    for (const w of waiting) w.then();
    for (const fall of this.falls) this.dispose(fall.p);
    this.falls = [];
    for (const f of this.flecks) {
      this.group.remove(f.mesh);
      (f.mesh.material as THREE.Material).dispose();
    }
    this.flecks = [];
    for (const { p } of this.fadeIns) {
      p.mat.opacity = 1;
      p.mat.transparent = false;
    }
    this.fadeIns = [];
    for (const p of this.pinned.values()) {
      p.jostle.settle();
      p.squash.settle();
      p.pinPop.settle();
      this.pose(p);
    }
    this.bump.settle();
    this.group.rotation.x = this.baseTilt;
    const done = this.onPinned;
    this.onPinned = null;
    done?.();
  }

  /** Each frame. The camera is where a new note's flight starts from. */
  update(dt: number, camera: THREE.PerspectiveCamera) {
    if (this.seq) {
      this.seq.t += dt;
      const lead = this.seq.reduced ? 0 : this.seq.lead;
      if (this.seq.t >= lead) {
        const { note, start, reduced } = this.seq;
        this.seq = null;
        this.launch(note, start, reduced, camera);
      }
    }
    for (let i = this.wait.length - 1; i >= 0; i--) {
      const w = this.wait[i];
      w.t -= dt;
      if (w.t <= 0) {
        this.wait.splice(i, 1);
        w.then();
      }
    }
    if (this.flight) this.fly(dt);
    for (let i = this.falls.length - 1; i >= 0; i--) if (this.fall(this.falls[i], dt)) this.falls.splice(i, 1);
    for (let i = this.flecks.length - 1; i >= 0; i--) {
      const f = this.flecks[i];
      f.t += dt;
      f.v.y -= 2.2 * dt;
      f.mesh.position.addScaledVector(f.v, dt);
      f.mesh.rotation.z += dt * 9;
      const m = f.mesh.material as THREE.MeshBasicMaterial;
      m.opacity = 1 - clamp01((f.t - 0.15) / 0.35);
      if (f.t > 0.5) {
        this.group.remove(f.mesh);
        m.dispose();
        this.flecks.splice(i, 1);
      }
    }
    for (let i = this.fadeIns.length - 1; i >= 0; i--) {
      const fi = this.fadeIns[i];
      fi.t += dt;
      fi.p.mat.opacity = clamp01(fi.t / T.fade);
      if (fi.t >= T.fade) {
        fi.p.mat.transparent = false;
        this.fadeIns.splice(i, 1);
      }
    }
    this.bump.step(dt);
    this.group.rotation.x = this.baseTilt + this.bump.x;
    for (const p of this.pinned.values()) {
      if (p.jostle.still && p.squash.still && p.pinPop.still) continue;
      p.jostle.step(dt);
      p.squash.step(dt);
      p.pinPop.step(dt);
      this.pose(p);
    }
  }

  dispose(p?: Pinned) {
    if (p) {
      p.group.parent?.remove(p.group);
      p.tex.dispose();
      p.mat.dispose();
      (p.shadow.material as THREE.Material).dispose();
      return;
    }
    for (const q of this.pinned.values()) this.dispose(q);
    this.pinned.clear();
    this.geo.dispose();
    Object.values(this.pinGeo).forEach((g) => g.dispose());
    if (this.lamp) {
      this.group.remove(this.lamp.fixture, this.lamp.spot, this.lamp.spot.target);
      this.lamp.fixture.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      this.lamp.mats.forEach((m) => m.dispose());
      this.lamp.spot.dispose();
      this.lamp = null;
    }
    this.shadowTex?.dispose();
    this.fleckGeo.dispose();
  }

  // ---------------- building ----------------

  private pinMat(color: string) {
    let m = this.pinMats.get(color);
    if (!m) {
      // Glossy moulded plastic: a clear coat catches the light on the cap.
      m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.18 });
      this.pinMats.set(color, m);
    }
    return m;
  }

  private make(note: BoardNote, slot: number): Pinned {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = TEX;
    drawNote(canvas, note);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.opts.anisotropy;
    // In the dark room the paper sits a little lower so it glows less than the screens.
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0, color: this.opts.dark ? 0xb8b8b8 : 0xffffff, side: THREE.DoubleSide });
    const paper = new THREE.Mesh(this.geo, mat);
    paper.scale.setScalar(NOTE);
    paper.castShadow = true;
    paper.receiveShadow = true;

    const pin = new THREE.Group();
    const color = PIN_COLORS[Math.floor(seed(note.id, 7) * PIN_COLORS.length)];
    const body = new THREE.Mesh(this.pinGeo.body, this.pinMat(color));
    body.castShadow = true;
    const needle = new THREE.Mesh(this.pinGeo.needle, this.needleMat);
    pin.add(body, needle);
    // In the paper's own units (it is scaled to NOTE): near the top, a little off centre.
    pin.position.set((seed(note.id, 3) - 0.5) * 0.2, 0.41, 0);
    paper.add(pin);
    pin.scale.setScalar(1 / NOTE); // the pin keeps its real size inside the scaled paper

    // Its shadow lies on the paper, a little down and to the side of the pin, away from the light.
    this.shadowTex ??= contactShadowTexture();
    const shadow = new THREE.Mesh(
      this.pinGeo.shadow,
      new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false, opacity: 0, color: 0x000000, side: THREE.DoubleSide }),
    );
    shadow.renderOrder = 1;
    shadow.position.set(pin.position.x + 0.03, pin.position.y - 0.045, -0.004);
    paper.add(shadow);

    const group = new THREE.Group();
    group.add(paper);
    group.userData.guestbook = note.id;
    this.group.add(group);
    const s = this.slots[slot];
    const tilt = Math.max(-8, Math.min(8, note.rotation)) * 0.6 + s.jitterRot;
    const p: Pinned = {
      note, slot, group, paper, pin, shadow, canvas, tex, mat,
      rest: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(tilt)),
      depth: 0,
      jostle: new Spring(300, 20),
      squash: new Spring(340, 22),
      pinPop: new Spring(380, 24),
    };
    return p;
  }

  /** Puts a note in its slot, at rest, in front of the notes before it. */
  private place(p: Pinned) {
    const s = this.slots[p.slot];
    const old = this.pinned.get(p.slot);
    if (old && old !== p) this.dispose(old);
    this.pinned.set(p.slot, p);
    // Newer notes sit a hair in front, so overlaps never flicker.
    const rank = this.notes.findIndex((n) => n.id === p.note.id) - Math.max(0, this.notes.length - SLOTS);
    p.depth = CORK.front - 0.0012 - Math.max(0, rank) * 0.00025;
    p.group.position.set(s.x, s.y, p.depth);
    p.group.rotation.set(0, 0, 0);
    p.group.scale.setScalar(1);
    this.pose(p);
  }

  /** Applies the springs on top of the note's rest pose. */
  private pose(p: Pinned) {
    p.paper.rotation.set(p.rest.x, p.rest.y, p.rest.z + p.jostle.x);
    const sq = p.squash.x;
    p.paper.scale.set(NOTE * (1 + sq), NOTE * (1 - sq), NOTE);
    p.pin.scale.setScalar((1 + p.pinPop.x) / NOTE);
    this.shade(p);
  }

  /** The pin's shadow: tight and dark when it's in, softer, wider and fainter the further out it is. */
  private shade(p: Pinned) {
    const m = p.shadow.material as THREE.MeshBasicMaterial;
    if (!p.pin.visible) {
      m.opacity = 0;
      return;
    }
    const lift = Math.max(0, -p.pin.position.z * NOTE); // metres off the paper
    const k = 1 - clamp01(lift / 0.05);
    const out = Math.min(1, p.pin.scale.x * NOTE); // the pin shrinking away as it leaves
    m.opacity = (this.opts.dark ? 0.55 : 0.4) * k * out;
    const size = (0.014 + lift * 0.4) / NOTE;
    p.shadow.scale.set(size, size, 1);
  }

  private redrawAll() {
    for (const p of this.pinned.values()) {
      drawNote(p.canvas, p.note);
      p.tex.needsUpdate = true;
    }
  }

  // ---------------- the arrival ----------------

  private launch(note: BoardNote, start: PinStart, reduced: boolean, camera?: THREE.PerspectiveCamera) {
    this.opts.onLaunch?.();
    this.notes = [...this.notes.filter((n) => n.id !== note.id), note];
    const slot = (this.notes.length - 1) % SLOTS;
    const old = this.pinned.get(slot);
    const p = this.make(note, slot);
    const s = this.slots[slot];

    if (reduced || !camera) {
      if (old) {
        this.pinned.delete(slot);
        this.dispose(old);
      }
      this.place(p);
      if (reduced) {
        p.mat.transparent = true;
        p.mat.opacity = 0;
        this.fadeIns.push({ p, t: 0 });
        this.wait.push({ t: T.fade + 0.15, then: () => this.done() });
      }
      return;
    }

    // Where the folded square was: a point along that screen ray, as far out as makes the paper the same size.
    const h = camera.getEffectiveFOV ? camera.getEffectiveFOV() : camera.fov;
    const viewH = Math.max(1, (this.lastViewport || 900));
    const dist = (NOTE * viewH) / (2 * Math.tan(THREE.MathUtils.degToRad(h) / 2) * Math.max(24, start.px));
    const world = new THREE.Vector3(start.ndcX, start.ndcY, 0.5).unproject(camera);
    const dir = world.sub(camera.position).normalize();
    const fromWorld = camera.position.clone().addScaledVector(dir, Math.max(0.12, dist));
    const from = this.group.worldToLocal(fromWorld);
    const to = new THREE.Vector3(s.x, s.y, CORK.front - 0.002);
    // One clean arc: a gentle rise over the straight line, bowing a touch toward the room.
    const ctrl = from.clone().lerp(to, 0.5);
    ctrl.y += 0.06 + from.distanceTo(to) * 0.08;
    ctrl.z = Math.min(from.z, to.z) - 0.05;

    p.group.position.copy(from);
    p.pin.visible = false;
    this.shade(p);
    // It leaves the glass as bright as the post-it was there, and takes on the room's light as it travels.
    p.mat.emissive.set(0xffffff);
    p.mat.emissiveMap = p.tex;
    p.mat.emissiveIntensity = this.opts.dark ? 0.75 : 0.25;
    p.mat.needsUpdate = true;
    this.flight = { p, t: 0, from, ctrl, landed: false, pinned: false };
    // The old note leaves its slot just before the new one arrives.
    if (old) {
      this.pinned.delete(slot);
      this.wait.push({ t: Math.max(0, T.fly - T.evictLead), then: () => this.evict(old) });
    }
  }

  /** Viewport height in CSS pixels, so the flight starts at the composer's size. Set by the engine on resize. */
  lastViewport = 900;

  private fly(dt: number) {
    const f = this.flight!;
    f.t += dt;
    const p = f.p;
    const s = this.slots[p.slot];
    if (!f.landed) {
      const k = clamp01(f.t / T.fly);
      const e = iosEase(k);
      const to = new THREE.Vector3(s.x, s.y, CORK.front - 0.002);
      // Quadratic bezier.
      const a = f.from.clone().lerp(f.ctrl, e), b = f.ctrl.clone().lerp(to, e);
      p.group.position.copy(a.lerp(b, e));
      // A full turn on the way in, a flutter about its vertical axis that dies as it arrives.
      // No spin: it settles from square into its tilt on the board as it arrives.
      p.group.rotation.set(0, 0, 0);
      p.paper.rotation.set(0, 0, p.rest.z * e);
      p.mat.emissiveIntensity = (this.opts.dark ? 0.75 : 0.25) * (1 - e);
      if (k >= 1) {
        f.landed = true;
        p.mat.emissiveIntensity = 0;
        this.place(p);
        // Anticipation spent, now the follow-through: it squashes into the cork, the board takes the hit, the
        // neighbours shuffle.
        p.squash.x = 0.1;
        p.squash.kick(-1.2);
        this.bump.kick(0.35);
        this.opts.onLand?.();
        for (const q of this.pinned.values()) {
          if (q === p) continue;
          const d = Math.hypot(q.group.position.x - s.x, q.group.position.y - s.y);
          if (d > 0.3) continue;
          const side = q.group.position.x >= s.x ? 1 : -1;
          q.jostle.kick(side * 1.4 * (1 - d / 0.3));
        }
        f.t = 0;
      }
      return;
    }
    // Pin: drops in from in front, then pops.
    if (!f.pinned) {
      if (f.t < T.pinDelay) return;
      p.pin.visible = true;
      const k = clamp01((f.t - T.pinDelay) / T.pinDrop);
      p.pin.position.z = (-0.05 / NOTE) * (1 - easeIn(k));
      this.shade(p);
      if (k >= 1) {
        f.pinned = true;
        p.pin.position.z = 0;
        p.pinPop.x = 0.35;
        this.burst(p);
        this.wait.push({ t: T.hold, then: () => this.done() });
        this.flight = null;
      }
    }
  }

  private done() {
    const cb = this.onPinned;
    this.onPinned = null;
    cb?.();
  }

  /** A few flecks of paper in the note's colour, out from under the pin. */
  private burst(p: Pinned) {
    const at = p.group.position.clone().add(new THREE.Vector3(p.pin.position.x * NOTE, p.pin.position.y * NOTE, -0.012));
    for (let i = 0; i < 7; i++) {
      const m = new THREE.MeshBasicMaterial({ color: p.note.color, transparent: true, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(this.fleckGeo, m);
      const size = 0.006 + seed(p.note.id, 20 + i) * 0.006;
      mesh.scale.set(size, size, size);
      mesh.position.copy(at);
      const a = (i / 7) * Math.PI * 2 + seed(p.note.id, 30 + i);
      const sp = 0.35 + seed(p.note.id, 40 + i) * 0.3;
      this.group.add(mesh);
      this.flecks.push({ mesh, v: new THREE.Vector3(Math.cos(a) * sp, Math.sin(a) * sp + 0.2, -0.25 - seed(p.note.id, 50 + i) * 0.2), t: 0 });
    }
    // Squash and stretch on the pin's push as well.
    p.squash.kick(0.6);
    this.opts.onPop?.();
  }

  /** The oldest note's pin pops out and the paper flutters down behind the desk. */
  private evict(p: Pinned) {
    this.falls.push({ p, t: 0, vx: (seed(p.note.id, 60) - 0.5) * 0.25, spin: seed(p.note.id, 61) > 0.5 ? 1 : -1 });
    p.mat.transparent = true;
  }

  private fall(f: Fall, dt: number) {
    f.t += dt;
    const p = f.p;
    // The pin leaves first, toward the room, shrinking away.
    const pk = clamp01(f.t / 0.16);
    p.pin.position.z = (-0.06 / NOTE) * easeOut(pk);
    p.pin.scale.setScalar(((1 - pk) * 1) / NOTE);
    this.shade(p);
    if (f.t < 0.08) return false;
    const t = f.t - 0.08;
    p.group.position.y -= (0.15 + 2.4 * t) * dt;
    p.group.position.x += (f.vx + Math.sin(t * 7) * 0.12) * dt;
    p.group.position.z -= 0.06 * dt;
    p.paper.rotation.z += f.spin * dt * (1.5 + Math.sin(t * 5));
    p.paper.rotation.x = Math.sin(t * 6) * 0.35;
    p.mat.opacity = 1 - clamp01((t - 0.5) / 0.45);
    if (f.t >= T.fall) {
      this.dispose(p);
      return true;
    }
    return false;
  }
}
