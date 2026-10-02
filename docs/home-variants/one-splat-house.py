"""A Pixar-style rounded 3D model of the Domis home avatar, built as an SDF scene and sampled into 3D gaussians.

Scene: y up, front of the house faces +z. Two-storey red-sided house: a front gable wing on the left, a hip-roofed
block on the right with a dormer, cream trim, blue-grey windows (left upper one with shutters), a porch with a
slate roof and cream columns, a navy door, bushes, a round tree, on a rounded grass base with a cream path.
"""
import numpy as np

# ── materials ──
MAT = {
    "siding": (0.71, 0.27, 0.23),
    "trim": (0.95, 0.90, 0.80),
    "roof": (0.26, 0.29, 0.42),
    "pane": (0.46, 0.56, 0.71),
    "shutter": (0.25, 0.25, 0.33),
    "door": (0.22, 0.27, 0.40),
    "grass": (0.45, 0.68, 0.26),
    "bush": (0.42, 0.64, 0.24),
    "trunk": (0.43, 0.29, 0.18),
    "path": (0.92, 0.87, 0.75),
    "brick": (0.62, 0.23, 0.20),
}
NAMES = list(MAT)


def rbox(p, c, h, r):
    q = np.abs(p - np.array(c)) - (np.array(h) - r)
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(np.max(q, axis=-1), 0) - r


def sphere(p, c, r):
    return np.linalg.norm(p - np.array(c), axis=-1) - r


def capsule_y(p, c, h, r):
    q = p - np.array(c)
    q[..., 1] -= np.clip(q[..., 1], -h, h)
    return np.linalg.norm(q, axis=-1) - r


def gable(p, cx, z0, z1, yb, yt, halfw, r):
    """Roof prism with its ridge along z (a front-facing gable), rounded by r."""
    k = (yt - yb) / halfw
    x, y, z = p[..., 0] - cx, p[..., 1], p[..., 2]
    slope = (y - yt + np.abs(x) * k) / np.sqrt(1 + k * k)
    d = np.maximum.reduce([yb - y, slope, np.abs(z - (z0 + z1) / 2) - (z1 - z0) / 2])
    return d - r


def hip(p, cx, cz, hx, hz, yb, yt, ridge, r):
    """Hip roof: ridge along x of half-length `ridge`, eaves rectangle hx × hz at yb, peak yt."""
    kz = (yt - yb) / hz
    kx = (yt - yb) / (hx - ridge)
    x, y, z = np.abs(p[..., 0] - cx), p[..., 1], np.abs(p[..., 2] - cz)
    sz = (y - yt + z * kz) / np.sqrt(1 + kz * kz)
    sx = (y - yt + (x - ridge) * kx) / np.sqrt(1 + kx * kx)
    d = np.maximum.reduce([yb - y, sz, sx])
    return d - r


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


class Scene:
    def __init__(self):
        self.items = []   # (sdf(p) -> d, material name)
        self.bushes = []  # sdfs blended softly together

    def box(self, c, h, r, m):
        self.items.append((lambda p, c=c, h=h, r=r: rbox(p, c, h, r), m))

    def add(self, fn, m):
        self.items.append((fn, m))


def window(S, cx, cy, z, w, h, shutters=False, axis="z"):
    """A cream-framed window with a cross mullion, sill and head, on the wall plane z (or x for side walls)."""
    def put(c, hs):
        if axis == "z":
            return (cx + c[0], cy + c[1], z + c[2]), hs
        return (z + c[2], cy + c[1], cx + c[0]), (hs[2], hs[1], hs[0])
    t = 0.022
    for c, hs, m in [
        ((0, 0, 0.0), (w / 2 + t, h / 2 + t, 0.035), "trim"),
        ((0, 0, 0.02), (w / 2 - 0.006, h / 2 - 0.006, 0.03), "pane"),
        ((0, 0, 0.032), (0.011, h / 2, 0.02), "trim"),
        ((0, 0, 0.032), (w / 2, 0.011, 0.02), "trim"),
        ((0, -h / 2 - t - 0.012, 0.02), (w / 2 + t + 0.03, 0.022, 0.06), "trim"),
        ((0, h / 2 + t + 0.01, 0.015), (w / 2 + t + 0.015, 0.02, 0.05), "trim"),
    ]:
        cc, hh = put(c, hs)
        S.box(cc, hh, 0.012, m)
    if shutters:
        for sx in (-1, 1):
            cc, hh = put((sx * (w / 2 + t + 0.075), 0, 0.01), (0.06, h / 2 + 0.02, 0.025))
            S.box(cc, hh, 0.012, "shutter")


def scene():
    S = Scene()
    # ground and path
    S.box((0.05, -1.0, 0.1), (1.32, 0.075, 1.08), 0.07, "grass")
    S.box((0.33, -0.92, 0.82), (0.17, 0.012, 0.36), 0.01, "path")
    # walls: front gable wing on the left, hip-roofed block on the right
    S.box((-0.42, -0.24, -0.02), (0.5, 0.67, 0.6), 0.035, "siding")
    S.box((0.5, -0.27, -0.08), (0.45, 0.64, 0.52), 0.035, "siding")
    for x, z in [(-0.92, 0.58), (0.08, 0.58), (-0.92, -0.62)]:
        S.box((x, -0.24, z), (0.035, 0.67, 0.035), 0.012, "trim")
    for x, z in [(0.95, 0.44), (0.95, -0.6)]:
        S.box((x, -0.27, z), (0.035, 0.64, 0.035), 0.012, "trim")
    S.box((0.5, 0.35, 0.45), (0.47, 0.03, 0.02), 0.01, "trim")
    S.box((0.97, 0.35, -0.08), (0.02, 0.03, 0.54), 0.01, "trim")
    S.box((0.47, -0.86, 0.72), (0.43, 0.06, 0.22), 0.02, "brick")
    # roofs: front gable (with cream bargeboards on its face), hip roof, dormer
    S.add(lambda p: gable(p, -0.42, -0.72, 0.7, 0.4, 0.98, 0.62, 0.025), "roof")
    S.add(lambda p: np.maximum(gable(p, -0.42, 0.62, 0.74, 0.36, 1.0, 0.64, 0.02),
                               -gable(p, -0.42, 0.55, 0.8, 0.28, 0.86, 0.5, 0.0)), "trim")
    S.add(lambda p: hip(p, 0.5, -0.08, 0.56, 0.62, 0.38, 0.8, 0.12, 0.03), "roof")
    S.box((0.5, 0.56, 0.28), (0.21, 0.15, 0.2), 0.02, "trim")
    S.box((0.5, 0.74, 0.27), (0.25, 0.04, 0.23), 0.02, "roof")
    window(S, 0.5, 0.55, 0.48, 0.24, 0.17)
    # windows
    window(S, -0.47, 0.06, 0.58, 0.22, 0.3, shutters=True)
    window(S, -0.47, -0.55, 0.58, 0.26, 0.28)
    window(S, 0.48, 0.06, 0.44, 0.24, 0.24)
    window(S, -0.2, -0.45, 0.95, 0.12, 0.26, axis="x")
    window(S, -0.2, 0.06, 0.95, 0.16, 0.24, axis="x")
    # porch: sloped slate roof, beam, columns + plinths, door, step, railing
    def porch_roof(p):
        q = p.copy(); q[..., 1] = q[..., 1] + (q[..., 2] - 0.66) * 0.22
        return rbox(q, (0.47, -0.02, 0.66), (0.47, 0.025, 0.27), 0.02)
    S.add(porch_roof, "roof")
    S.box((0.47, -0.1, 0.9), (0.44, 0.035, 0.03), 0.012, "trim")
    for x in (0.1, 0.84):
        S.box((x, -0.47, 0.9), (0.035, 0.38, 0.035), 0.014, "trim")
        S.box((x, -0.8, 0.9), (0.055, 0.04, 0.055), 0.012, "trim")
    S.box((0.43, -0.48, 0.45), (0.13, 0.27, 0.02), 0.012, "trim")
    S.box((0.43, -0.49, 0.46), (0.1, 0.25, 0.02), 0.012, "door")
    S.add(lambda p: sphere(p, (0.5, -0.5, 0.49), 0.014), "trim")
    S.box((0.43, -0.79, 0.6), (0.17, 0.035, 0.12), 0.012, "roof")
    S.box((0.72, -0.6, 0.9), (0.11, 0.015, 0.02), 0.006, "trim")
    for x in np.linspace(0.63, 0.8, 4):
        S.box((x, -0.7, 0.9), (0.012, 0.09, 0.012), 0.005, "trim")
    # greenery: a round tree and soft bushes
    S.add(lambda p: capsule_y(p, (-0.98, -0.6, 0.6), 0.34, 0.035), "trunk")
    for c, r in [((-0.98, 0.02, 0.58), 0.21), ((-1.12, -0.16, 0.6), 0.17), ((-0.84, -0.16, 0.66), 0.17),
                 ((-0.95, -0.82, 0.78), 0.13), ((-0.68, -0.83, 0.82), 0.15), ((-0.38, -0.84, 0.8), 0.13),
                 ((1.0, -0.82, 0.76), 0.15), ((1.18, -0.84, 0.58), 0.11), ((0.78, -0.88, 0.98), 0.07)]:
        S.bushes.append(lambda p, c=c, r=r: sphere(p, c, r))
    return S


def evaluate(p, S):
    """Union SDF and the material of the nearest primitive (bushes blend softly into each other)."""
    best = np.full(p.shape[:-1], 1e9)
    mat = np.zeros(p.shape[:-1], dtype=np.int16)
    def take(d, m):
        nonlocal best, mat
        upd = d < best
        best = np.where(upd, d, best)
        mat = np.where(upd, NAMES.index(m), mat)
    for fn, m in S.items:
        take(fn(p), m)
    if S.bushes:
        b = S.bushes[0](p)
        for fn in S.bushes[1:]:
            b = smin(b, fn(p), 0.06)
        take(b, "bush")
    return best, mat


def sdf(p, S):
    return evaluate(p, S)[0]


def build(h=0.021, budget=40000):
    """Sample the surface into oriented gaussians with baked soft lighting + ambient occlusion."""
    S = scene()
    lo, hi = np.array([-1.45, -1.1, -0.95]), np.array([1.45, 1.05, 1.25])
    gs = [np.arange(lo[i], hi[i], h) for i in range(3)]
    pts = []
    # evaluate slab by slab to bound memory
    for x in gs[0]:
        Y, Z = np.meshgrid(gs[1], gs[2], indexing="ij")
        p = np.stack([np.full(Y.shape, x), Y, Z], -1).reshape(-1, 3)
        d = sdf(p, S)
        near = np.abs(d) < h * 0.5
        pts.append(p[near])
    p = np.concatenate(pts)
    p += (np.random.default_rng(1).random(p.shape) - 0.5) * h * 0.15
    # project onto the surface with the SDF gradient (two Newton steps)
    e = h * 0.25
    def grad(p):
        g = np.zeros_like(p)
        for i in range(3):
            o = np.zeros(3); o[i] = e
            g[:, i] = sdf(p + o, S) - sdf(p - o, S)
        n = np.linalg.norm(g, axis=1, keepdims=True)
        g = np.where(n > 1e-9, g / np.maximum(n, 1e-9), np.array([[0, 1.0, 0]]))
        return g
    for _ in range(2):
        d = sdf(p, S)
        p = p - grad(p) * d[:, None]
    n = grad(p)
    _, m = evaluate(p, S)
    # drop the hidden underside of the grass base
    keep = ~((n[:, 1] < -0.7) & (p[:, 1] < -1.0))
    p, n, m = p[keep], n[keep], m[keep]
    print("surface samples", len(p))
    if len(p) > budget:
        idx = np.random.default_rng(2).choice(len(p), budget, replace=False)
        p, n, m = p[idx], n[idx], m[idx]
    # the gable ends (front and back faces of the gable prism) are siding, as in the icon
    gable_end = (m == NAMES.index("roof")) & (np.abs(n[:, 2]) > 0.8) & (p[:, 0] < 0.08) & (p[:, 1] > 0.38)
    m = np.where(gable_end, NAMES.index("siding"), m)
    # albedo, with painted siding boards and roof seams
    alb = np.array([MAT[k] for k in NAMES])[m]
    siding = m == NAMES.index("siding")
    board = (np.mod(p[:, 1] + 1.0, 0.105) < 0.012)
    alb[siding & board] *= 0.84
    roof = m == NAMES.index("roof")
    seam = np.mod(p[:, 0] + 2.0, 0.12) < 0.012
    alb[roof & seam & (n[:, 1] > 0.3)] *= 0.88
    grass = m == NAMES.index("grass")
    alb[grass & (n[:, 1] < 0.5)] *= 0.8
    # soft lighting: key from front-left-top, cool fill, SDF ambient occlusion
    L = np.array([-0.45, 0.75, 0.55]); L /= np.linalg.norm(L)
    F = np.array([0.6, 0.2, 0.75]); F /= np.linalg.norm(F)
    dif = np.clip(n @ L, 0, 1)
    fill = np.clip(n @ F, 0, 1)
    ao = np.ones(len(p))
    for i, step in enumerate((0.03, 0.06, 0.11, 0.18)):
        ao -= (step - sdf(p + n * step, S)).clip(0) * (1.6 / (i + 1))
    ao = ao.clip(0.35, 1)
    sky = 0.5 + 0.5 * n[:, 1]
    light = (0.42 + 0.62 * dif + 0.14 * fill + 0.1 * sky) * ao
    col = np.clip(alb * light[:, None], 0, 1)
    # oriented flat gaussians: tangent disk of ~h, thin along the normal
    up = np.where(np.abs(n[:, 1:2]) < 0.9, np.array([[0, 1.0, 0]]), np.array([[1.0, 0, 0]]))
    t1 = np.cross(up, n); t1 /= np.linalg.norm(t1, axis=1, keepdims=True) + 1e-9
    t2 = np.cross(n, t1)
    R = np.stack([t1, t2, n], 2)
    # curvature: how much the normal turns over a short step; shrink splats at sharp edges
    curv = np.zeros(len(p))
    for i in range(3):
        o = np.zeros(3); o[i] = h * 0.5
        curv += np.linalg.norm(grad(p + o) - n, axis=1)
    k = np.clip(1.0 - curv * 0.35, 0.55, 1.0)
    s = np.stack([h * 0.66 * k, h * 0.66 * k, np.full(len(p), h * 0.1)], 1)
    M = R * s[:, None, :]
    C = M @ np.transpose(M, (0, 2, 1))
    cov = np.stack([C[:, 0, 0], C[:, 0, 1], C[:, 0, 2], C[:, 1, 1], C[:, 1, 2], C[:, 2, 2]], 1)
    rgba = np.concatenate([col, np.full((len(p), 1), 0.98)], 1)
    return p, cov, rgba
