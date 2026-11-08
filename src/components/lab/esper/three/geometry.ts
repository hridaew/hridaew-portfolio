import * as THREE from "three";

/**
 * Soft geometry for the house, in the scene's own coordinates (scene.json is authored Unity-style: left-handed,
 * +Z north). The engine mirrors the whole world once at the root, so these stay numerically identical to the
 * Unity versions. Triangles face along their normals.
 */

type V3 = [number, number, number];

function finish(v: V3[], n: V3[], uv: [number, number][], t: number[]) {
  for (let f = 0; f < t.length; f += 3) {
    const a = v[t[f]], b = v[t[f + 1]], c = v[t[f + 2]];
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
    const na = n[t[f]], nb = n[t[f + 1]], nc = n[t[f + 2]];
    const avg = [na[0] + nb[0] + nc[0], na[1] + nb[1] + nc[1], na[2] + nb[2] + nc[2]];
    // three's front faces wind counter-clockwise: the cross product points out along the normal.
    if (cr[0] * avg[0] + cr[1] * avg[1] + cr[2] * avg[2] < 0) [t[f + 1], t[f + 2]] = [t[f + 2], t[f + 1]];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v.flat(), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(n.flat(), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv.flat(), 2));
  g.setIndex(t);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

const norm = (x: number, y: number, z: number): V3 => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
};

/** A box with every edge rounded by `edge`, and its corners seen from above by `corner` (at least edge). */
export function roundedBox(size: V3, corner: number, edge: number) {
  const h = size.map((s) => s / 2) as V3;
  const e = Math.max(0.001, Math.min(edge, h[0], h[1], h[2]));
  const c = Math.min(Math.max(corner, e), Math.min(h[0], h[2]));
  const cs = c > 0.25 ? 10 : c > 0.06 ? 6 : 3;
  const es = e > 0.25 ? 6 : e > 0.06 ? 4 : 3;
  const prof: [number, number, number, number][] = [];
  for (let i = 0; i <= es; i++) {
    const a = ((-90 + (90 * i) / es) * Math.PI) / 180;
    prof.push([e - e * Math.cos(a), -h[1] + e + e * Math.sin(a), Math.cos(a), Math.sin(a)]);
  }
  for (let i = 0; i <= es; i++) {
    const a = (((90 * i) / es) * Math.PI) / 180;
    prof.push([e - e * Math.cos(a), h[1] - e + e * Math.sin(a), Math.cos(a), Math.sin(a)]);
  }
  const v: V3[] = [], n: V3[] = [], uv: [number, number][] = [], t: number[] = [];
  const ringN = 4 * (cs + 1);
  const cx = h[0] - c, cz = h[2] - c;
  for (const [inset, y, no, nu] of prof) {
    const rc = c - inset;
    for (let k = 0; k < 4; k++) {
      const sx = k === 0 || k === 3 ? 1 : -1, sz = k < 2 ? 1 : -1;
      for (let i = 0; i <= cs; i++) {
        const th = ((k * 90 + (90 * i) / cs) * Math.PI) / 180;
        const ox = Math.cos(th), oz = Math.sin(th);
        const p: V3 = [sx * cx + ox * rc, y, sz * cz + oz * rc];
        v.push(p);
        n.push(norm(ox * no, nu, oz * no));
        uv.push([p[0] + p[2], p[1]]);
      }
    }
  }
  for (let r = 0; r + 1 < prof.length; r++)
    for (let i = 0; i < ringN; i++) {
      const a = r * ringN + i, b = r * ringN + ((i + 1) % ringN);
      t.push(a, a + ringN, b, b, a + ringN, b + ringN);
    }
  const bottom = v.length;
  v.push([0, -h[1], 0]); n.push([0, -1, 0]); uv.push([0, 0]);
  const top = v.length;
  v.push([0, h[1], 0]); n.push([0, 1, 0]); uv.push([0, 0]);
  const last = (prof.length - 1) * ringN;
  for (let i = 0; i < ringN; i++) {
    t.push(bottom, i, (i + 1) % ringN);
    t.push(top, last + i, last + ((i + 1) % ringN));
  }
  return finish(v, n, uv, t);
}

/** A wall along a centre line of x,z pairs: straight sides, a round top, round free ends. */
export function softWall(path: number[], height: number, thick: number) {
  const count = path.length / 2;
  const pts: V3[] = [];
  for (let i = 0; i < count; i++) pts.push([path[2 * i], 0, path[2 * i + 1]]);
  const r = thick / 2;
  const hs = Math.max(0, height - r);
  const ts = 6, cap = 10;
  const prof: [number, number, number, number][] = [[-r, 0, -1, 0], [-r, hs, -1, 0]];
  for (let i = 1; i < 2 * ts; i++) {
    const a = ((180 - (180 * i) / (2 * ts)) * Math.PI) / 180;
    prof.push([r * Math.cos(a), hs + r * Math.sin(a), Math.cos(a), Math.sin(a)]);
  }
  prof.push([r, hs, 1, 0], [r, 0, 1, 0]);

  const v: V3[] = [], n: V3[] = [], uv: [number, number][] = [], t: number[] = [];
  const side: V3[] = [], miter: number[] = [], along: number[] = [];
  for (let i = 0; i < count; i++) {
    const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(count - 1, i + 1)];
    const tan = norm(next[0] - prev[0], 0, next[2] - prev[2]);
    side.push([-tan[2], 0, tan[0]]);
    const a = i + 1 < count ? pts[i] : pts[i - 1], b = i + 1 < count ? pts[i + 1] : pts[i];
    const seg = norm(b[0] - a[0], 0, b[2] - a[2]);
    const dot = side[i][0] * -seg[2] + side[i][2] * seg[0];
    miter.push(Math.min(2, Math.max(1, 1 / Math.max(0.2, dot))));
    along.push(i === 0 ? 0 : along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
  }
  const ringN = prof.length;
  for (let i = 0; i < count; i++)
    for (const [off, y, ns, nu] of prof) {
      v.push([pts[i][0] + side[i][0] * off * miter[i], y, pts[i][2] + side[i][2] * off * miter[i]]);
      n.push(norm(side[i][0] * ns, nu, side[i][2] * ns));
      uv.push([along[i], y]);
    }
  for (let i = 0; i + 1 < count; i++)
    for (let k = 0; k + 1 < ringN; k++) {
      const a = i * ringN + k;
      t.push(a, a + ringN, a + 1, a + 1, a + ringN, a + 1 + ringN);
    }
  const half: [number, number, number, number][] = [[r, 0, 1, 0], [r, hs, 1, 0]];
  for (let i = 1; i <= ts; i++) {
    const a = (((90 * i) / ts) * Math.PI) / 180;
    half.push([r * Math.cos(a), hs + r * Math.sin(a), Math.cos(a), Math.sin(a)]);
  }
  const end = (at: V3, sd: V3, out: V3) => {
    const start = v.length;
    for (let j = 0; j <= cap; j++) {
      const phi = (Math.PI * j) / cap;
      const d: V3 = [sd[0] * Math.cos(phi) + out[0] * Math.sin(phi), 0, sd[2] * Math.cos(phi) + out[2] * Math.sin(phi)];
      for (const [rr, y, nr, ny] of half) {
        v.push([at[0] + d[0] * rr, y, at[2] + d[2] * rr]);
        n.push(norm(d[0] * nr, ny, d[2] * nr));
        uv.push([phi * r, y]);
      }
    }
    const m = half.length;
    for (let j = 0; j < cap; j++)
      for (let k = 0; k + 1 < m; k++) {
        const a = start + j * m + k;
        t.push(a, a + m, a + 1, a + 1, a + m, a + 1 + m);
      }
  };
  const closed = count > 2 && Math.hypot(pts[0][0] - pts[count - 1][0], pts[0][2] - pts[count - 1][2]) < 1e-3;
  if (!closed && count >= 2) {
    end(pts[0], side[0], norm(pts[0][0] - pts[1][0], 0, pts[0][2] - pts[1][2]));
    end(pts[count - 1], side[count - 1], norm(pts[count - 1][0] - pts[count - 2][0], 0, pts[count - 1][2] - pts[count - 2][2]));
  }
  return finish(v, n, uv, t);
}

/** A w x h panel with rounded corners, facing -Z, UVs 0..1 across it (upright from the front). */
export function roundedPanel(w: number, h: number, r: number) {
  r = Math.max(0.0005, Math.min(r, w / 2, h / 2));
  const seg = 8;
  const outline: [number, number][] = [];
  const corners: [number, number, number][] = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
  for (const [cx, cy, a0] of corners)
    for (let i = 0; i <= seg; i++) {
      const a = ((a0 + (90 * i) / seg) * Math.PI) / 180;
      outline.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  const v: V3[] = [[0, 0, 0]], n: V3[] = [[0, 0, -1]], uv: [number, number][] = [[0.5, 0.5]], t: number[] = [];
  for (const [x, y] of outline) {
    v.push([x, y, 0]);
    n.push([0, 0, -1]);
    uv.push([x / w + 0.5, y / h + 0.5]);
  }
  for (let i = 1; i <= outline.length; i++) t.push(0, i, (i % outline.length) + 1);
  return finish(v, n, uv, t);
}

/** A flat panel facing -Z (like Unity's quad), UVs upright when seen from the front. */
export function panel() {
  const v: V3[] = [[-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0]];
  const n: V3[] = v.map(() => [0, 0, -1]);
  const uv: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  return finish(v, n, uv, [0, 1, 2, 0, 2, 3]);
}
