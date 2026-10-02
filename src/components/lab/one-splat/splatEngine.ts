/**
 * WebGL2 3D gaussian-splat renderer for the One Splat lab page.
 *
 * - Sets are standard 3DGS data (position, 3D covariance, colour, opacity) packed by
 *   `docs/home-variants/one-splat-gen.py` into base64 JSON: uint32 count, then
 *   count×[pos f16×3][cov×1e4 f16×6][rgba u8×4]. Every set is padded to NMAX with
 *   invisible clones so one set can morph into the next index-for-index.
 * - Rendering: per-splat 3D covariance projected to a 2D screen ellipse (EWA, as in
 *   the reference 3DGS viewers), drawn back-to-front with premultiplied alpha.
 *   Data lives in float textures; only a sorted index buffer is re-uploaded per sort.
 * - Interaction: drag to turn (inertia, then a soft spring back to the object's best
 *   angle), hover pushes splats aside, tap pops them toward you, flicks wobble the top.
 */

export type SplatKey = "about" | "domis" | "virdio" | "obscura" | "mc" | "side";

const NMAX = 30000;
const TW = 1024;
const TH = Math.ceil(NMAX / TW);
const TN = TW * TH;
const DIST = 6;

/** Each object's best-looking angle: [yaw, pitch]. */
const FRONTS: Record<SplatKey, [number, number]> = {
  about: [-0.3, 0.06],
  domis: [-0.42, 0.14],
  virdio: [-0.5, 0.22],
  obscura: [-0.28, 0.04],
  mc: [-0.3, 0.1],
  side: [-1.9, 0.05],
};

const VS = `#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D uPos, uCovA, uCovB, uCol, uDisp;
uniform mat4 uView; uniform vec2 uFocal, uViewport, uOffset; uniform float uWob;
in vec2 aQuad; in uint aIdx;
out vec4 vCol; out vec2 vPos;
ivec2 tc(uint i) { return ivec2(int(i & 1023u), int(i >> 10u)); }
void main() {
  ivec2 t = tc(aIdx);
  vec3 p = texelFetch(uPos, t, 0).xyz + texelFetch(uDisp, t, 0).xyz;
  float a = uWob * (p.y + 1.0) * 0.5, ca = cos(a), sa = sin(a);
  p = vec3(ca * p.x + sa * p.z, p.y, -sa * p.x + ca * p.z);
  vec4 cam = uView * vec4(p, 1.0);
  float z = -cam.z;
  vec4 col = texelFetch(uCol, t, 0);
  if (z < 0.2 || col.a < 0.004) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec4 A = texelFetch(uCovA, t, 0); vec2 B = texelFetch(uCovB, t, 0).xy;
  mat3 V = mat3(A.x, A.y, A.z,  A.y, A.w, B.x,  A.z, B.x, B.y);
  mat3 J = mat3(uFocal.x / z, 0.0, 0.0,  0.0, uFocal.y / z, 0.0,  uFocal.x * cam.x / (z * z), uFocal.y * cam.y / (z * z), 0.0);
  mat3 T = J * mat3(uView);
  mat3 C = T * V * transpose(T);
  float a11 = C[0][0] + 0.3, a12 = C[0][1], a22 = C[1][1] + 0.3;
  float mid = 0.5 * (a11 + a22), rad = length(vec2(0.5 * (a11 - a22), a12));
  float l1 = mid + rad, l2 = max(mid - rad, 0.1);
  vec2 d1 = abs(a12) > 1e-7 ? normalize(vec2(a12, l1 - a11)) : (a11 >= a22 ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  vec2 major = min(sqrt(2.0 * l1), 1024.0) * d1, minor = min(sqrt(2.0 * l2), 1024.0) * vec2(d1.y, -d1.x);
  vec2 c2 = vec2(uFocal.x * cam.x / z, uFocal.y * cam.y / z);
  vCol = col; vPos = aQuad;
  gl_Position = vec4((c2 + aQuad.x * major + aQuad.y * minor) / (0.5 * uViewport) + uOffset, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
in vec4 vCol; in vec2 vPos; out vec4 o;
void main() { float A = -dot(vPos, vPos); if (A < -4.0) discard; float B = exp(A) * vCol.a; o = vec4(vCol.rgb * B, B); }`;

type SplatSet = { pos: Float32Array; ca: Float32Array; cb: Float32Array; col: Float32Array; n: number };
type Buffers = { pos: Float32Array; ca: Float32Array; cb: Float32Array; col: Float32Array };
type Tex = { t: WebGLTexture; unit: number };

const f16 = (h: number) => {
  const s = h & 0x8000 ? -1 : 1;
  const e = (h >> 10) & 31;
  const m = h & 1023;
  if (e === 0) return s * m * 5.960464477539063e-8;
  if (e === 31) return 0;
  return s * (1 + m / 1024) * 2 ** (e - 15);
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const buffers = (): Buffers => ({
  pos: new Float32Array(TN * 4),
  ca: new Float32Array(TN * 4),
  cb: new Float32Array(TN * 4),
  col: new Float32Array(TN * 4),
});

export type SplatEngineOptions = {
  baseUrl: string;
  reducedMotion: boolean;
  /** Called every frame with how far the object is turned from its front (radians). */
  onTurn?: (yawFromFront: number, pitchFromFront: number) => void;
};

export class SplatEngine {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private U: (n: string) => WebGLUniformLocation | null;
  private tex: Record<"pos" | "ca" | "cb" | "col" | "disp", Tex>;
  private ib: WebGLBuffer;
  private sets: Partial<Record<SplatKey, SplatSet>> = {};
  private loading: Partial<Record<SplatKey, Promise<SplatSet>>> = {};
  private st = buffers();
  private from = buffers();
  private D = new Float32Array(TN * 4);
  private DV = new Float32Array(NMAX * 3);
  private HSH = new Float32Array(NMAX);
  private SP = new Float32Array(NMAX * 2);
  private depth = new Float32Array(NMAX);
  private keys = new Uint32Array(NMAX);
  private counts = new Uint32Array(65536);
  private order = new Uint32Array(NMAX);
  private M = new Float32Array(16);

  private W = 0;
  private H = 0;
  private focal = 1;
  private offset = [0, 0];
  private offsetTarget = [0, 0];
  private objPx = 400;
  private objPxTarget = 400;

  private rot = { yaw: -0.3, pitch: 0.1, vy: 0, vp: 0, dragging: false, last: 0, wob: 0, wv: 0, home: true };
  private current: SplatKey = "about";
  private target: SplatSet | null = null;
  private hasShown = false;
  private t0 = 0;
  private dur = 1700;
  private morphing = false;
  private jiggling = false;
  private dirty = true;
  private lastSort = { yaw: 1e9, pitch: 1e9 };
  private mouse = { x: -1e4, y: -1e4, in: false };
  private down: { x: number; y: number } | null = null;
  private moved = 0;
  private raf = 0;
  private alive = true;
  private cleanup: (() => void)[] = [];

  static supported(): boolean {
    try {
      return !!document.createElement("canvas").getContext("webgl2");
    } catch {
      return false;
    }
  }

  constructor(private canvas: HTMLCanvasElement, private opts: SplatEngineOptions) {
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, alpha: true });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    const sh = (t: number, s: string) => {
      const o = gl.createShader(t)!;
      gl.shaderSource(o, s);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o));
      return o;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    this.prog = prog;
    this.U = (n) => gl.getUniformLocation(prog, n);

    const mk = (unit: number, name: string): Tex => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TW, TH, 0, gl.RGBA, gl.FLOAT, null);
      gl.uniform1i(this.U(name), unit);
      return { t, unit };
    };
    this.tex = { pos: mk(0, "uPos"), ca: mk(1, "uCovA"), cb: mk(2, "uCovB"), col: mk(3, "uCol"), disp: mk(4, "uDisp") };

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-2, -2, 2, -2, -2, 2, 2, 2]), gl.STATIC_DRAW);
    const aQ = gl.getAttribLocation(prog, "aQuad");
    gl.enableVertexAttribArray(aQ);
    gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);
    this.ib = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ib);
    gl.bufferData(gl.ARRAY_BUFFER, NMAX * 4, gl.DYNAMIC_DRAW);
    const aI = gl.getAttribLocation(prog, "aIdx");
    gl.enableVertexAttribArray(aI);
    gl.vertexAttribIPointer(aI, 1, gl.UNSIGNED_INT, 0, 0);
    gl.vertexAttribDivisor(aI, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    for (let i = 0; i < NMAX; i++) this.HSH[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    // opening state: a loose, invisible cloud the first object condenses out of
    for (let i = 0; i < NMAX; i++) {
      const o = i * 4;
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = 0.25 + Math.random() * 0.9;
      const q = Math.sqrt(1 - u * u);
      this.st.pos[o] = Math.cos(a) * q * r;
      this.st.pos[o + 1] = u * r;
      this.st.pos[o + 2] = Math.sin(a) * q * r;
      this.st.ca[o] = this.st.ca[o + 3] = 1e-5;
      this.st.cb[o + 1] = 1e-5;
    }
    this.upload(this.tex.disp, this.D);
    this.bindInput();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Where the object sits in the canvas (CSS px) and how tall it should be. */
  setFrame(cx: number, cy: number, objPx: number, instant = false) {
    this.W = this.canvas.clientWidth;
    this.H = this.canvas.clientHeight;
    const dpr = Math.min(1.75, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.offsetTarget = [(cx - this.W / 2) / (this.W / 2), -(cy - this.H / 2) / (this.H / 2)];
    this.objPxTarget = objPx;
    if (instant || this.opts.reducedMotion) {
      this.offset = [...this.offsetTarget];
      this.objPx = objPx;
    }
    this.dirty = true;
  }

  select(key: SplatKey) {
    this.current = key;
    this.rot.home = true;
    return this.load(key).then((s) => {
      if (this.current !== key || this.target === s) return;
      this.from.pos.set(this.st.pos);
      this.from.ca.set(this.st.ca);
      this.from.cb.set(this.st.cb);
      this.from.col.set(this.st.col);
      this.target = s;
      this.t0 = performance.now();
      this.dur = this.hasShown ? 1700 : 2200;
      this.hasShown = true;
      this.morphing = true;
      if (this.opts.reducedMotion) {
        this.st.pos.set(s.pos);
        this.st.ca.set(s.ca);
        this.st.cb.set(s.cb);
        this.st.col.set(s.col);
        this.morphing = false;
        this.uploadAll();
      }
    });
  }

  preload(keys: SplatKey[]) {
    keys.forEach((k) => void this.load(k));
  }

  destroy() {
    this.alive = false;
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((f) => f());
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  /* ── data ── */
  private load(k: SplatKey): Promise<SplatSet> {
    if (this.sets[k]) return Promise.resolve(this.sets[k]!);
    if (this.loading[k]) return this.loading[k]!;
    const p = fetch(`${this.opts.baseUrl}/${k}.json`)
      .then((r) => r.json())
      .then(({ splats }: { splats: string }) => {
        const bin = Uint8Array.from(atob(splats), (c) => c.charCodeAt(0));
        const buf = bin.buffer;
        const n = new DataView(buf).getUint32(0, true);
        const h16 = new Uint16Array(buf, 4, n * 9);
        const rgba = new Uint8Array(buf, 4 + n * 18, n * 4);
        const out = buffers();
        let seed = 11;
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const clone = new Uint8Array(n);
        let extra = Math.max(0, NMAX - n);
        while (extra > 0) {
          const i = (rnd() * n) | 0;
          if (!clone[i]) {
            clone[i] = 1;
            extra--;
          }
        }
        let j = 0;
        for (let i = 0; i < n && j < NMAX; i++) {
          for (let r = 0; r < (clone[i] ? 2 : 1) && j < NMAX; r++, j++) {
            const o = j * 4;
            out.pos[o] = f16(h16[i * 3]);
            out.pos[o + 1] = f16(h16[i * 3 + 1]);
            out.pos[o + 2] = f16(h16[i * 3 + 2]);
            const c = n * 3 + i * 6;
            out.ca[o] = f16(h16[c]) * 1e-4;
            out.ca[o + 1] = f16(h16[c + 1]) * 1e-4;
            out.ca[o + 2] = f16(h16[c + 2]) * 1e-4;
            out.ca[o + 3] = f16(h16[c + 3]) * 1e-4;
            out.cb[o] = f16(h16[c + 4]) * 1e-4;
            out.cb[o + 1] = f16(h16[c + 5]) * 1e-4;
            out.col[o] = rgba[i * 4] / 255;
            out.col[o + 1] = rgba[i * 4 + 1] / 255;
            out.col[o + 2] = rgba[i * 4 + 2] / 255;
            out.col[o + 3] = r ? 0 : rgba[i * 4 + 3] / 255;
          }
        }
        const set = { ...out, n };
        this.sets[k] = set;
        return set;
      });
    this.loading[k] = p;
    return p;
  }

  private upload(tex: Tex, data: Float32Array) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + tex.unit);
    gl.bindTexture(gl.TEXTURE_2D, tex.t);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TW, TH, gl.RGBA, gl.FLOAT, data);
  }

  private uploadAll() {
    this.upload(this.tex.pos, this.st.pos);
    this.upload(this.tex.ca, this.st.ca);
    this.upload(this.tex.cb, this.st.cb);
    this.upload(this.tex.col, this.st.col);
    this.dirty = true;
  }

  /* ── view ── */
  private viewMatrix() {
    const { yaw, pitch } = this.rot;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    this.M = new Float32Array([cy, sp * sy, -cp * sy, 0, 0, cp, sp, 0, sy, -sp * cy, cp * cy, 0, 0, 0, -DIST, 1]);
    const gl = this.gl;
    gl.uniformMatrix4fv(this.U("uView"), false, this.M);
    this.focal = (this.objPx / 2) * DIST;
    gl.uniform2f(this.U("uViewport"), this.W, this.H);
    gl.uniform2f(this.U("uFocal"), this.focal, this.focal);
    gl.uniform2f(this.U("uOffset"), this.offset[0], this.offset[1]);
  }

  private stepMorph(now: number) {
    const T = this.target!;
    const { st, from, HSH } = this;
    const mt = (now - this.t0) / this.dur;
    if (mt >= 1.45) {
      this.morphing = false;
      st.pos.set(T.pos);
      st.ca.set(T.ca);
      st.cb.set(T.cb);
      st.col.set(T.col);
      this.uploadAll();
      return;
    }
    for (let i = 0; i < NMAX; i++) {
      const k = ease(Math.min(1, Math.max(0, mt * 1.45 - (i / NMAX) * 0.45)));
      const lift = Math.sin(k * Math.PI);
      const o = i * 4;
      const fx = from.pos[o], fy = from.pos[o + 1], fz = from.pos[o + 2];
      const tx = T.pos[o], ty = T.pos[o + 1], tz = T.pos[o + 2];
      // travel on a swirl around the vertical axis, shrinking to fine dust mid-flight
      const sw = lift * (1.1 + HSH[i]) * 0.9, c = Math.cos(sw), s = Math.sin(sw);
      const x = fx + (tx - fx) * k, z = fz + (tz - fz) * k;
      st.pos[o] = x * c - z * s;
      st.pos[o + 2] = x * s + z * c;
      st.pos[o + 1] = fy + (ty - fy) * k + lift * 0.12 * HSH[i];
      const shrink = (1 - lift * 0.75) ** 2;
      for (let f = 0; f < 4; f++) {
        st.ca[o + f] = (from.ca[o + f] + (T.ca[o + f] - from.ca[o + f]) * k) * shrink;
        st.col[o + f] = from.col[o + f] + (T.col[o + f] - from.col[o + f]) * k;
      }
      st.cb[o] = (from.cb[o] + (T.cb[o] - from.cb[o]) * k) * shrink;
      st.cb[o + 1] = (from.cb[o + 1] + (T.cb[o + 1] - from.cb[o + 1]) * k) * shrink;
    }
    this.uploadAll();
  }

  /** 16-bit counting sort, far to near. */
  private sort() {
    const { M, st, D, depth, keys, counts, order } = this;
    const r0 = M[2], r1 = M[6], r2 = M[10];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < NMAX; i++) {
      const o = i * 4;
      const d = r0 * (st.pos[o] + D[o]) + r1 * (st.pos[o + 1] + D[o + 1]) + r2 * (st.pos[o + 2] + D[o + 2]);
      depth[i] = d;
      if (d < lo) lo = d;
      if (d > hi) hi = d;
    }
    const sc = 65535 / (hi - lo || 1);
    counts.fill(0);
    for (let i = 0; i < NMAX; i++) {
      const k = ((depth[i] - lo) * sc) | 0;
      keys[i] = k;
      counts[k]++;
    }
    for (let i = 1; i < 65536; i++) counts[i] += counts[i - 1];
    for (let i = NMAX - 1; i >= 0; i--) order[--counts[keys[i]]] = i;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ib);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, order);
  }

  /* ── interaction ── */
  private project() {
    const { M, st, D, SP, W, H, offset, focal } = this;
    for (let i = 0; i < NMAX; i++) {
      const o = i * 4;
      const x = st.pos[o] + D[o], y = st.pos[o + 1] + D[o + 1], z = st.pos[o + 2] + D[o + 2];
      const cx = M[0] * x + M[4] * y + M[8] * z;
      const cy = M[1] * x + M[5] * y + M[9] * z;
      const cz = M[2] * x + M[6] * y + M[10] * z + M[14];
      SP[i * 2] = W / 2 + (offset[0] * W) / 2 + (focal * cx) / -cz;
      SP[i * 2 + 1] = H / 2 - (offset[1] * H) / 2 - (focal * cy) / -cz;
    }
  }

  private toWorld(sx: number, sy: number, sz: number): [number, number, number] {
    const M = this.M;
    return [M[0] * sx + M[1] * sy + M[2] * sz, M[4] * sx + M[5] * sy + M[6] * sz, M[8] * sx + M[9] * sy + M[10] * sz];
  }

  private poke(px: number, py: number) {
    if (this.opts.reducedMotion) return;
    this.project();
    const R = Math.min(this.W, this.H) * 0.14, wpp = DIST / this.focal;
    for (let i = 0; i < NMAX; i++) {
      const dx = this.SP[i * 2] - px, dy = this.SP[i * 2 + 1] - py, d = Math.hypot(dx, dy);
      if (d > R) continue;
      const f = (1 - d / R) ** 2 * 12 * wpp, n = d || 1;
      const [wx, wy, wz] = this.toWorld((dx / n) * f * 0.5, (-dy / n) * f * 0.5, f * 1.4);
      this.DV[i * 3] += wx;
      this.DV[i * 3 + 1] += wy;
      this.DV[i * 3 + 2] += wz;
    }
    this.rot.wv += (Math.random() - 0.5) * 0.08;
    this.jiggling = true;
  }

  private stepJiggle() {
    const hover = this.mouse.in && !this.rot.dragging && !this.opts.reducedMotion;
    if (!hover && !this.jiggling) return;
    if (hover) this.project();
    const { D, DV, SP, mouse } = this;
    const R = 70, wpp = DIST / this.focal;
    let energy = 0;
    for (let i = 0; i < NMAX; i++) {
      const o = i * 4, v = i * 3;
      let fx = 0, fy = 0, fz = 0;
      if (hover) {
        const dx = SP[i * 2] - mouse.x, dy = SP[i * 2 + 1] - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 1.6 * wpp;
          // mostly a bulge toward the viewer, a little sideways: the surface swells instead of tearing open
          [fx, fy, fz] = this.toWorld((dx / d) * f * 0.3, (-dy / d) * f * 0.3, f * 1.1);
        }
      }
      // underdamped spring: overshoot, then settle
      DV[v] = (DV[v] - D[o] * 0.14 + fx) * 0.86;
      DV[v + 1] = (DV[v + 1] - D[o + 1] * 0.14 + fy) * 0.86;
      DV[v + 2] = (DV[v + 2] - D[o + 2] * 0.14 + fz) * 0.86;
      D[o] += DV[v];
      D[o + 1] += DV[v + 1];
      D[o + 2] += DV[v + 2];
      energy += Math.abs(D[o]) + Math.abs(D[o + 1]) + Math.abs(D[o + 2]);
    }
    this.jiggling = energy > 1e-3;
    if (!this.jiggling && !hover) D.fill(0);
    this.upload(this.tex.disp, D);
    this.dirty = true;
  }

  private bindInput() {
    const cv = this.canvas;
    const on = <K extends keyof HTMLElementEventMap>(k: K, f: (e: HTMLElementEventMap[K]) => void) => {
      cv.addEventListener(k, f as EventListener);
      this.cleanup.push(() => cv.removeEventListener(k, f as EventListener));
    };
    on("pointerdown", (e) => {
      this.down = { x: e.clientX, y: e.clientY };
      this.moved = 0;
      this.rot.dragging = true;
      this.rot.vy = this.rot.vp = 0;
      this.rot.home = false;
      cv.dataset.dragging = "true";
    });
    on("pointermove", (e) => {
      const r = cv.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
      this.mouse.in = true;
      if (!this.down) return;
      const dx = e.clientX - this.down.x, dy = e.clientY - this.down.y;
      this.moved += Math.abs(dx) + Math.abs(dy);
      this.down = { x: e.clientX, y: e.clientY };
      const k = 0.0085;
      this.rot.yaw += dx * k;
      this.rot.pitch = Math.max(-0.9, Math.min(0.9, this.rot.pitch + dy * k));
      this.rot.vy = this.rot.vy * 0.5 + dx * k * 0.5;
      this.rot.vp = this.rot.vp * 0.5 + dy * k * 0.5;
      this.rot.wv -= dx * 0.0016; // the top lags behind the hand turning it
      this.rot.last = performance.now();
    });
    const up = () => {
      if (!this.down) return;
      if (this.moved < 6) this.poke(this.mouse.x, this.mouse.y);
      this.down = null;
      this.rot.dragging = false;
      delete cv.dataset.dragging;
    };
    on("pointerup", up);
    on("pointercancel", up);
    on("pointerleave", () => {
      up();
      this.mouse.in = false;
      this.mouse.x = this.mouse.y = -1e4;
    });
    const vis = () => {
      if (!document.hidden && this.alive) {
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(this.frame);
      }
    };
    document.addEventListener("visibilitychange", vis);
    this.cleanup.push(() => document.removeEventListener("visibilitychange", vis));
  }

  /* ── loop ── */
  private frame = (now: number) => {
    if (!this.alive) return;
    const { rot, opts } = this;
    const reduce = opts.reducedMotion;
    const [fy, fp] = FRONTS[this.current];
    if (!rot.dragging) {
      rot.yaw += rot.vy;
      rot.pitch = Math.max(-0.9, Math.min(0.9, rot.pitch + rot.vp));
      rot.vy *= rot.home ? 0.9 : 0.95;
      rot.vp *= 0.9;
      if (!rot.home && now - rot.last > 1800 && Math.abs(rot.vy) < 0.003) rot.home = true;
      if (rot.home) {
        // a soft spring to the nearest front-facing angle, plus a slow idle sway
        const ty = fy + Math.round((rot.yaw - fy) / (Math.PI * 2)) * Math.PI * 2 + (reduce ? 0 : 0.22 * Math.sin(now / 2600));
        rot.vy += (ty - rot.yaw) * 0.0035;
        rot.vp += (fp - rot.pitch) * 0.004;
      }
    }
    rot.wv = (rot.wv - rot.wob * 0.09) * 0.9;
    rot.wob += rot.wv;
    if (Math.abs(rot.wob) < 1e-4 && Math.abs(rot.wv) < 1e-4) rot.wob = rot.wv = 0;

    // glide the object to its framing (it shifts aside when a project screen appears)
    const g = reduce ? 1 : 0.08;
    this.offset[0] += (this.offsetTarget[0] - this.offset[0]) * g;
    this.offset[1] += (this.offsetTarget[1] - this.offset[1]) * g;
    this.objPx += (this.objPxTarget - this.objPx) * g;

    const gl = this.gl;
    gl.uniform1f(this.U("uWob"), reduce ? 0 : rot.wob);
    this.viewMatrix();
    if (this.morphing) this.stepMorph(now);
    this.stepJiggle();
    if (this.morphing || this.jiggling || this.dirty || Math.abs(rot.yaw - this.lastSort.yaw) + Math.abs(rot.pitch - this.lastSort.pitch) > 0.02) {
      this.sort();
      this.lastSort = { yaw: rot.yaw, pitch: rot.pitch };
      this.dirty = false;
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (this.target) gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, NMAX);
    const turn = rot.yaw - (fy + Math.round((rot.yaw - fy) / (Math.PI * 2)) * Math.PI * 2);
    opts.onTurn?.(turn, rot.pitch - fp);
    if (!document.hidden) this.raf = requestAnimationFrame(this.frame);
  };
}
