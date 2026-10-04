"""A soft, rounded, Pixar-style house, modelled as a signed distance field and sampled into 3D gaussians.

Scene: y up, front faces +z. A chunky coral house with a puffy navy gable roof, a round attic window, an arched
door under a little awning, two windows with flower boxes, a chimney, on a rounded grass island with stepping
stones, two bushes and a lollipop tree. Every edge is rounded so the splats read as soft, solid surfaces.

Sampling: points on a fine narrow band are projected onto the surface, then thinned on a jittered grid so the
splats are evenly spaced (no grid stair-steps), and each becomes a flat gaussian sized to that spacing.
Lighting (wrapped key, sky fill, soft shadows, ambient occlusion) is baked into the colours.
"""
import numpy as np

MAT = {
    "wall": (0.93, 0.51, 0.42),
    "trim": (0.98, 0.94, 0.86),
    "roof": (0.29, 0.35, 0.55),
    "glass": (0.60, 0.78, 0.92),
    "door": (0.26, 0.32, 0.50),
    "knob": (0.96, 0.78, 0.36),
    "chimney": (0.70, 0.33, 0.28),
    "grass": (0.52, 0.77, 0.34),
    "leaf": (0.40, 0.69, 0.31),
    "trunk": (0.52, 0.35, 0.23),
    "stone": (0.90, 0.87, 0.80),
    "flower": (0.99, 0.62, 0.72),
    "box": (0.80, 0.56, 0.38),
}
NAMES = list(MAT)
SLOPE = 0.814  # roof pitch (rise over run)
FLOOR = -0.85  # top of the grass, where the walls and door start


# ── SDF primitives (p: (n,3)) ──
def length2(x, y):
    return np.sqrt(x * x + y * y)


def rbox(p, c, h, r):
    q = np.abs(p - np.array(c)) - (np.array(h) - r)
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(np.max(q, axis=-1), 0) - r


def sphere(p, c, r):
    return np.linalg.norm(p - np.array(c), axis=-1) - r


def capsule_y(p, c, h, r):
    q = p - np.array(c)
    y = q[:, 1] - np.clip(q[:, 1], -h, h)
    return np.sqrt(q[:, 0] ** 2 + y ** 2 + q[:, 2] ** 2) - r


def cyl(p, c, ra, hh, rb, axis=1):
    """Rounded cylinder of radius ra, half-height hh along `axis`, edge radius rb."""
    q = p - np.array(c)
    a = q[:, axis]
    o = [q[:, i] for i in range(3) if i != axis]
    dx = length2(o[0], o[1]) - ra + rb
    dy = np.abs(a) - hh + rb
    return np.minimum(np.maximum(dx, dy), 0) + length2(np.maximum(dx, 0), np.maximum(dy, 0)) - rb


def tri(x, y, tip, hw, hgt):
    """Exact 2D distance to an isosceles triangle: apex at (0, tip) pointing up, base half-width hw, height hgt."""
    px, py = np.abs(x), tip - y
    qx, qy = hw, hgt
    t = np.clip((px * qx + py * qy) / (qx * qx + qy * qy), 0, 1)
    ax, ay = px - qx * t, py - qy * t
    bx, by = px - qx * np.clip(px / qx, 0, 1), py - qy
    d = np.minimum(ax * ax + ay * ay, bx * bx + by * by)
    sg = np.minimum(-(px * qy - py * qx), -(py - qy))
    return -np.sqrt(d) * np.sign(sg)


def extrude(d2, z, hz):
    w = np.abs(z) - hz
    return np.minimum(np.maximum(d2, w), 0) + length2(np.maximum(d2, 0), np.maximum(w, 0))


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def ring(outer, inner):
    return np.maximum(outer, -inner)


# ── the model ──
def parts(p):
    """Every part of the house as (distance, material)."""
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    P = []
    # grass island and stepping stones
    P.append((cyl(p, (0, -0.99, 0.12), 1.16, 0.14, 0.1), "grass"))
    for sx, sz, r in ((0.0, 0.86, 0.095), (0.07, 1.03, 0.085), (-0.02, 1.18, 0.07)):
        P.append((cyl(p, (sx, FLOOR, sz), r, 0.018, 0.012), "stone"))
    # walls: a rounded block plus the gable triangle, softly blended
    body = rbox(p, (0, -0.33, 0), (0.6, 0.58, 0.5), 0.1)
    gable = extrude(tri(x, y, 0.745, 0.6, 0.6 * SLOPE), z, 0.47) - 0.03
    P.append((smin(body, gable, 0.06), "wall"))
    # roof: a thick, puffy chevron shell overhanging every side
    outer = tri(x, y, 0.93, 0.88, 0.88 * SLOPE)
    inner = tri(x, y, 0.93 - 0.17, 3.0, 3.0 * SLOPE)
    shell = np.maximum(np.maximum(outer, -inner), 0.24 - y)
    P.append((extrude(shell, z, 0.62) - 0.065, "roof"))
    # chimney with a cream cap
    P.append((rbox(p, (0.36, 0.6, -0.2), (0.1, 0.3, 0.1), 0.035), "chimney"))
    P.append((rbox(p, (0.36, 0.92, -0.2), (0.135, 0.04, 0.135), 0.03), "trim"))

    # arched front door in a cream frame, under a small awning, on a step
    def arch(top, half, zc, hz, r):
        lower = rbox(p, (0, (top + FLOOR) / 2, zc), (half, (top - FLOOR) / 2, hz), r)
        return np.minimum(lower, cyl(p, (0, top, zc), half, hz, r, axis=2))
    top = -0.36
    P.append((ring(arch(top, 0.2, 0.5, 0.05, 0.025), arch(top, 0.155, 0.5, 0.2, 0.02)), "trim"))
    P.append((arch(top, 0.16, 0.49, 0.03, 0.02), "door"))
    P.append((sphere(p, (0.09, -0.6, 0.535), 0.024), "knob"))
    q = p.copy(); q[:, 1] += (q[:, 2] - 0.56) * 0.35
    P.append((rbox(q, (0, -0.1, 0.6), (0.27, 0.028, 0.12), 0.026), "roof"))
    P.append((rbox(p, (0, FLOOR - 0.005, 0.64), (0.25, 0.04, 0.12), 0.035), "stone"))

    # windows: cream frame ring, recessed glass, mullion cross, sill or flower box
    def window(c, hw, hh, axis=2, flowers=False):
        cx, cy, cz = c

        def box(o, h, r):
            if axis == 2:
                return rbox(p, (cx + o[0], cy + o[1], cz + o[2]), h, r)
            s = np.sign(cx)
            return rbox(p, (cx + s * o[2], cy + o[1], cz + o[0]), (h[2], h[1], h[0]), r)
        P.append((ring(box((0, 0, 0), (hw + 0.04, hh + 0.04, 0.045), 0.03), box((0, 0, 0), (hw, hh, 0.2), 0.02)), "trim"))
        P.append((box((0, 0, -0.012), (hw + 0.01, hh + 0.01, 0.02), 0.01), "glass"))
        P.append((box((0, 0, 0.005), (0.013, hh, 0.02), 0.008), "trim"))
        P.append((box((0, 0, 0.005), (hw, 0.013, 0.02), 0.008), "trim"))
        if flowers:
            P.append((box((0, -hh - 0.09, 0.05), (hw + 0.05, 0.045, 0.05), 0.022), "box"))
            for i, fx in enumerate(np.linspace(-hw, hw, 5)):
                P.append((box((fx, -hh - 0.035, 0.05 + 0.012 * (i % 2)), (0.03, 0.03, 0.03), 0.03), "flower" if i % 2 == 0 else "leaf"))
        else:
            P.append((box((0, -hh - 0.055, 0.03), (hw + 0.06, 0.022, 0.05), 0.016), "trim"))
    for sx in (-1, 1):
        window((sx * 0.4, -0.38, 0.5), 0.09, 0.12, flowers=True)
        window((sx * 0.6, -0.38, 0.0), 0.11, 0.13, axis=0)
    # round attic window in the gable
    P.append((ring(cyl(p, (0, 0.4, 0.47), 0.13, 0.045, 0.02, axis=2), cyl(p, (0, 0.4, 0.47), 0.09, 0.2, 0.01, axis=2)), "trim"))
    P.append((cyl(p, (0, 0.4, 0.465), 0.1, 0.02, 0.008, axis=2), "glass"))
    P.append((rbox(p, (0, 0.4, 0.48), (0.012, 0.09, 0.015), 0.008), "trim"))
    P.append((rbox(p, (0, 0.4, 0.48), (0.09, 0.012, 0.015), 0.008), "trim"))

    # bushes and a lollipop tree
    def blob(spheres, k):
        d = sphere(p, *spheres[0])
        for c, r in spheres[1:]:
            d = smin(d, sphere(p, c, r), k)
        return d
    P.append((blob([((-0.64, -0.8, 0.6), 0.17), ((-0.44, -0.85, 0.7), 0.12), ((-0.78, -0.86, 0.45), 0.1)], 0.08), "leaf"))
    P.append((blob([((0.64, -0.8, 0.58), 0.16), ((0.8, -0.85, 0.42), 0.11), ((0.47, -0.86, 0.7), 0.09)], 0.08), "leaf"))
    P.append((capsule_y(p, (-0.95, -0.66, -0.36), 0.24, 0.045), "trunk"))
    P.append((blob([((-0.95, -0.2, -0.36), 0.25), ((-0.83, -0.33, -0.24), 0.17), ((-1.06, -0.31, -0.26), 0.16), ((-0.95, -0.05, -0.45), 0.15)], 0.1), "leaf"))
    return P


def evaluate(p, chunk=200000):
    """Union distance and the material of the nearest part."""
    D = np.empty(len(p)); M = np.empty(len(p), dtype=np.int16)
    for s in range(0, len(p), chunk):
        q = p[s:s + chunk]
        best = np.full(len(q), 1e9); mat = np.zeros(len(q), dtype=np.int16)
        for d, m in parts(q):
            upd = d < best
            best = np.where(upd, d, best)
            mat = np.where(upd, NAMES.index(m), mat)
        D[s:s + chunk], M[s:s + chunk] = best, mat
    return D, M


def sdf(p):
    return evaluate(p)[0]


def grad(p, e=0.003):
    g = np.zeros_like(p)
    for i in range(3):
        o = np.zeros(3); o[i] = e
        g[:, i] = sdf(p + o) - sdf(p - o)
    n = np.linalg.norm(g, axis=1, keepdims=True)
    return np.where(n > 1e-12, g / np.maximum(n, 1e-12), np.array([[0, 1.0, 0]]))


def thin(p, budget, rng):
    """Keep about `budget` points, one per cell of a randomly offset grid: even spacing without grid lines."""
    lo, hi = 0.002, 0.2
    off = rng.random(3)
    for _ in range(24):
        c = (lo + hi) / 2
        k = np.unique(np.floor(p / c + off).astype(np.int64), axis=0).shape[0]
        lo, hi = (c, hi) if k > budget else (lo, c)
    keys = np.floor(p / hi + off).astype(np.int64)
    order = rng.permutation(len(p))
    _, first = np.unique(keys[order], axis=0, return_index=True)
    return np.sort(order[first])


def build(budget=50000, h=0.009):
    rng = np.random.default_rng(7)
    lo, hi = np.array([-1.32, -1.16, -1.1]), np.array([1.32, 1.02, 1.36])
    # coarse band, then a fine band inside it
    hc = h * 4
    g = [np.arange(lo[i], hi[i], hc) for i in range(3)]
    G = np.stack(np.meshgrid(*g, indexing="ij"), -1).reshape(-1, 3)
    G = G[np.abs(sdf(G)) < hc * 0.9]
    sub = (np.stack(np.meshgrid(*[np.arange(4)] * 3, indexing="ij"), -1).reshape(-1, 3) - 1.5) * h
    F = (G[:, None, :] + sub[None]).reshape(-1, 3)
    F = F[np.abs(sdf(F)) < h * 0.6]
    area = len(F) * h * h / 1.2
    F += (rng.random(F.shape) - 0.5) * h
    for _ in range(3):
        F -= grad(F) * sdf(F)[:, None]
    # nobody sees the underside of the island
    F = F[F[:, 1] > -1.1]
    print("surface samples", len(F), f"area {area:.2f}")
    p = F[thin(F, budget, rng)]
    n = grad(p)
    _, m = evaluate(p)
    spacing = np.sqrt(area / len(p))

    # albedo with soft painted detail
    alb = np.array([MAT[k] for k in NAMES])[m].astype(np.float64)
    hsh = np.mod(np.sin(p @ np.array([12.9898, 78.233, 37.719])) * 43758.5453, 1.0)
    is_ = lambda k: m == NAMES.index(k)
    wall = is_("wall")
    board = np.mod(p[:, 1] + 2.0, 0.095) / 0.095
    alb[wall] *= (0.93 + 0.07 * np.clip(board[wall] * 6, 0, 1))[:, None]  # siding: a soft shadow line under each board
    roof = is_("roof") & (np.abs(n[:, 1]) > 0.3)
    along = (0.93 - p[:, 1]) / 0.11  # shingle rows down the slope, staggered tiles along z
    row = np.floor(along)
    col = np.mod(p[:, 2] / 0.13 + 0.5 * row, 1.0)
    edge = np.clip(np.mod(along, 1.0) * 4, 0, 1) * (0.88 + 0.12 * np.clip(np.minimum(col, 1 - col) * 12, 0, 1))
    alb[roof] *= (0.85 + 0.15 * edge[roof])[:, None]
    for k, v in (("grass", 0.08), ("leaf", 0.12), ("stone", 0.06)):
        s = is_(k)
        alb[s] *= (1 - v / 2 + v * hsh[s])[:, None]
    alb[is_("grass") & (n[:, 1] < 0.5)] *= 0.85
    glass = is_("glass")
    alb[glass] = alb[glass] * 0.88 + 0.12  # a little lift so the panes read as glass

    # baked light: wrapped warm key with soft shadows, cool sky fill, ambient occlusion
    L = np.array([-0.5, 0.82, 0.62]); L /= np.linalg.norm(L)
    wrap = np.clip((n @ L + 0.3) / 1.3, 0, 1)
    sh = np.ones(len(p)); t = np.full(len(p), 0.03)
    for _ in range(40):
        d = sdf(p + n * 0.004 + L[None] * t[:, None])
        sh = np.minimum(sh, np.clip(10 * d / t, 0, 1))
        t += np.clip(d, 0.01, 0.12)
    sh = sh * sh * (3 - 2 * sh)
    ao = np.ones(len(p))
    for i, st in enumerate((0.02, 0.05, 0.1, 0.18, 0.28)):
        ao -= np.clip(st - sdf(p + n * st), 0, None) * (1.4 / (i + 1))
    ao = np.clip(ao, 0.45, 1) ** 0.8
    sky = 0.5 + 0.5 * n[:, 1]
    key = np.array([1.0, 0.95, 0.86])
    fill = np.array([0.80, 0.86, 1.0])
    light = key * (0.72 * wrap * sh)[:, None] + fill * ((0.34 + 0.16 * sky) * ao)[:, None]
    col = np.clip(alb * light ** 0.9 * 1.04, 0, 1)

    # flat gaussians in the tangent plane, sized to the sample spacing so neighbours just overlap
    up = np.where(np.abs(n[:, 1:2]) < 0.9, np.array([[0, 1.0, 0]]), np.array([[1.0, 0, 0]]))
    t1 = np.cross(up, n); t1 /= np.linalg.norm(t1, axis=1, keepdims=True) + 1e-12
    t2 = np.cross(n, t1)
    R = np.stack([t1, t2, n], 2)
    s = np.stack([np.full(len(p), spacing * 0.6), np.full(len(p), spacing * 0.6), np.full(len(p), spacing * 0.14)], 1)
    Mx = R * s[:, None, :]
    C = Mx @ np.transpose(Mx, (0, 2, 1))
    cov = np.stack([C[:, 0, 0], C[:, 0, 1], C[:, 0, 2], C[:, 1, 1], C[:, 1, 2], C[:, 2, 2]], 1)
    rgba = np.concatenate([col, np.ones((len(p), 1))], 1)
    print(f"splats {len(p)}, spacing {spacing:.4f}")
    return p, cov, rgba
