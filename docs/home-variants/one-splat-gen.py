"""Build 3D gaussian splat sets for One Splat.

- side  : Rodin's Mighty Hand, a real 3DGS capture made with Savor (github.com/hridaew/savor samples/sample.ply)
- about/domis/virdio/mc : cutouts lifted into closed 3D volumes ("inflated" from the silhouette's distance field),
          front and back surfaces covered by surface-aligned anisotropic 3D gaussians
- obscura: a Wayne Wong photograph as a physical print: a thin, slightly curled card with a paper back

Output per set: media/<key>.bin
  uint32 count, then count * [pos f16x3][cov*1e4 f16x6 (xx xy xz yy yz zz)][rgba u8x4]
World: y up, x right, z toward the viewer. Each set fits ~2 units tall, centred.
Splats are ordered by a 3D Morton code so index i in one set sits near index i in another (they morph locally).
"""
import numpy as np, struct, sys, os
from PIL import Image
from scipy import ndimage

A = "/home/user/hridaew-portfolio/public/assets/"
OUT = sys.argv[1]  # e.g. public/variants/one-splat/media; the Mighty Hand reads SAVOR_PLY (github.com/hridaew/savor samples/sample.ply)
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(3)


def rot_cov(R, s):
    """R: (n,3,3) columns are axes; s: (n,3) std devs -> (n,6) covariance."""
    M = R * s[:, None, :]
    C = M @ np.transpose(M, (0, 2, 1))
    return np.stack([C[:, 0, 0], C[:, 0, 1], C[:, 0, 2], C[:, 1, 1], C[:, 1, 2], C[:, 2, 2]], 1)


def inflate(path, target=11000, thick=0.55, crop=None, back_dim=0.82):
    im = Image.open(A + path).convert("RGBA")
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int((crop[0] + crop[2]) * w), int((crop[1] + crop[3]) * h)))
    # pick a resolution that gives ~target pixels inside the mask
    a0 = np.asarray(im.resize((128, int(128 * im.size[1] / im.size[0]))))[..., 3] > 127
    fill = a0.mean()
    W = int(np.sqrt(target / (fill * im.size[1] / im.size[0])))
    H = int(W * im.size[1] / im.size[0])
    arr = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    alpha = arr[..., 3]
    mask = alpha > 0.5
    mask = ndimage.binary_fill_holes(ndimage.binary_opening(mask, iterations=1))
    dt = ndimage.distance_transform_edt(mask)
    dt = ndimage.gaussian_filter(dt, 1.0)
    r = dt.max()
    h = np.sqrt(np.clip(2 * r * dt - dt * dt, 0, None)) * thick
    h[~mask] = 0
    gy, gx = np.gradient(h)
    ys, xs = np.nonzero(mask)
    n = len(xs)
    hz, gxs, gys = h[ys, xs], gx[ys, xs], gy[ys, xs]
    rgb = arr[ys, xs, :3]
    # surface frame: t1 up the slope, t2 along the contour, nrm out of the surface (front side)
    g = np.sqrt(gxs ** 2 + gys ** 2) + 1e-6
    dx, dy = gxs / g, gys / g
    t1 = np.stack([dx, -dy, g], 1)  # image y is down; world y is up
    t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.stack([dy, dx, np.zeros(n)], 1)
    nrm = np.cross(t1, t2)
    nrm *= np.sign(nrm[:, 2:3] + 1e-9)
    s_t1 = np.minimum(0.62 * np.sqrt(1 + g * g), 2.0)
    s = np.stack([s_t1, np.full(n, 0.62), np.full(n, 0.16)], 1)
    pts, covs, cols = [], [], []
    for side in (1, -1):
        p = np.stack([xs - W / 2, -(ys - H / 2), side * hz], 1)
        T1 = t1.copy(); T1[:, 2] *= side
        N = nrm.copy(); N[:, 2] *= side
        R = np.stack([T1, t2, N], 2)
        pts.append(p); covs.append(rot_cov(R, s))
        c = rgb if side == 1 else rgb * back_dim
        cols.append(np.concatenate([c, np.full((n, 1), 0.96)], 1))
    # rim: the steep wall near the silhouette, filled with splats facing outward, stacked through the thickness
    rim = (dt[ys, xs] < 2.2)
    ex, ey, eh = xs[rim], ys[rim], hz[rim]
    ddy, ddx = np.gradient(dt)
    ox, oy = -ddx[ey, ex], ddy[ey, ex]  # outward, world y up
    on = np.sqrt(ox ** 2 + oy ** 2) + 1e-6; ox, oy = ox / on, oy / on
    ecol = rgb[rim]
    for f in np.linspace(-0.8, 0.8, 5):
        m = len(ex)
        p = np.stack([ex - W / 2, -(ey - H / 2), f * eh], 1)
        Nn = np.stack([ox, oy, np.zeros(m)], 1)
        Tz = np.tile([0, 0, 1.0], (m, 1))
        Tc = np.cross(Tz, Nn)
        R = np.stack([Tc, Tz, Nn], 2)
        sz = np.maximum(eh * 0.22, 0.4)
        pts.append(p); covs.append(rot_cov(R, np.stack([np.full(m, 0.62), sz, np.full(m, 0.16)], 1)))
        shade = 1 - (1 - back_dim) * (0.5 - f / 1.6)
        cols.append(np.concatenate([ecol * shade, np.full((m, 1), 0.96)], 1))
    return np.concatenate(pts), np.concatenate(covs), np.concatenate(cols)


def card(path, target=12000, crop=None, border=0.05, curl=0.18):
    im = Image.open(A + path).convert("RGB")
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int((crop[0] + crop[2]) * w), int((crop[1] + crop[3]) * h)))
    aspect = im.size[1] / im.size[0]
    W = int(np.sqrt(target / aspect)); H = int(W * aspect)
    bw = int(W * border)
    Wt, Ht = W + 2 * bw, H + 2 * bw
    paper = np.array([0.95, 0.94, 0.90])
    img = np.ones((Ht, Wt, 3)) * paper
    img[bw:bw + H, bw:bw + W] = np.asarray(im.resize((W, H), Image.LANCZOS)) / 255
    ys, xs = np.mgrid[0:Ht, 0:Wt]
    xs, ys = xs.ravel(), ys.ravel()
    n = len(xs)
    u = (xs - Wt / 2) / (Wt / 2)
    z = curl * Wt / 2 * (u * u - 0.33)  # the print bows gently toward the viewer at its edges
    dzdx = curl * 2 * u
    t1 = np.stack([np.ones(n), np.zeros(n), dzdx], 1); t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.tile([0, 1.0, 0], (n, 1))
    nrm = np.cross(t1, t2)
    s = np.stack([np.full(n, 0.62), np.full(n, 0.62), np.full(n, 0.1)], 1)
    rgb = img[ys, xs]
    pts, covs, cols = [], [], []
    for side in (1, -1):
        p = np.stack([xs - Wt / 2, -(ys - Ht / 2), z - side * 0.0 + (0 if side == 1 else -0.9)], 1)
        R = np.stack([t1, t2, nrm * side], 2)
        pts.append(p); covs.append(rot_cov(R, s))
        c = rgb if side == 1 else np.clip(paper * 0.93 + rng.normal(0, 0.012, (n, 3)), 0, 1)
        cols.append(np.concatenate([c, np.full((n, 1), 0.97)], 1))
    return np.concatenate(pts), np.concatenate(covs), np.concatenate(cols)


def ply(path, keep=30000):
    b = open(path, "rb").read()
    hdr = b.index(b"end_header\n") + 11
    n = int([l for l in b[:hdr].decode().split("\n") if l.startswith("element vertex")][0].split()[-1])
    a = np.frombuffer(b[hdr:hdr + n * 56], dtype="<f4").reshape(n, 14).astype(np.float64)
    xyz, dc, op, sc, q = a[:, :3], a[:, 3:6], 1 / (1 + np.exp(-a[:, 6])), np.exp(a[:, 7:10]), a[:, 10:14]
    c = np.median(xyz, 0)
    d = np.linalg.norm(xyz - c, axis=1)
    ok = (op > 0.06) & (d < np.percentile(d, 99.3))
    xyz, dc, op, sc, q = xyz[ok], dc[ok], op[ok], sc[ok], q[ok]
    if len(xyz) > keep:
        idx = np.argsort(-op * np.cbrt(sc.prod(1)))[:keep]
        xyz, dc, op, sc, q = xyz[idx], dc[idx], op[idx], sc[idx], q[idx]
    q /= np.linalg.norm(q, axis=1, keepdims=True)
    w, x, y, z = q.T
    R = np.stack([
        np.stack([1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], 1),
        np.stack([2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], 1),
        np.stack([2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)], 1),
    ], 1)
    F = np.diag([1.0, -1.0, -1.0])  # capture is y-down / z-forward; flip to y-up / z-toward-viewer
    R = F @ R
    p = xyz @ F.T
    cov = rot_cov(R, sc)
    rgb = np.clip(0.5 + 0.28209479 * dc, 0, 1)
    return p, cov, np.concatenate([rgb, op[:, None]], 1)


def cone():
    """Virdio's AR cone as a true solid of revolution: stripes sampled from the cone render, glossy shading baked
    from a fixed key light, on a rounded square base. Fully 3D from every angle."""
    im = np.asarray(Image.open(A + "virdio/cone.png").convert("RGBA").resize((200, 216))).astype(np.float32) / 255
    m = im[..., 3] > 0.5
    rows = [y for y in range(6, 150) if m[y].any()]
    lum = []
    for y in rows:
        xs = np.nonzero(m[y])[0]; cx = int((xs.min() + xs.max()) / 2)
        c = im[y, cx - 3:cx + 4, :3].mean(0); lum.append(c[1])   # green channel separates white stripes from purple
    lum = np.array(lum)
    white = lum > 0.6
    def stripe(t):  # t: 0 top .. 1 bottom
        return white[np.clip((t * (len(rows) - 1)).astype(int), 0, len(rows) - 1)]
    PURPLE, WHITE, DEEP = np.array([0.66, 0.34, 0.98]), np.array([0.93, 0.90, 1.0]), np.array([0.42, 0.16, 0.78])
    L = np.array([-0.45, 0.6, 0.66]); L /= np.linalg.norm(L)
    V = np.array([0, 0.15, 1.0]); V /= np.linalg.norm(V)
    def shade(base, nrm, gloss=0.55):
        d = np.clip(nrm @ L, 0, 1)[:, None]
        Hh = (L + V) / np.linalg.norm(L + V)
        sp = np.clip(nrm @ Hh, 0, 1)[:, None] ** 40 * gloss
        return np.clip(base * (0.55 + 0.5 * d) + sp, 0, 1)
    pts, covs, cols = [], [], []
    def add(p, nrm, t1, s1, s2, col, a=0.97):
        t2 = np.cross(nrm, t1)
        R = np.stack([t1, t2, nrm], 2)
        n = len(p)
        pts.append(p); covs.append(rot_cov(R, np.stack([np.full(n, s1), np.full(n, s2), np.full(n, min(s1, s2) * 0.25)], 1)))
        cols.append(np.concatenate([col, np.full((n, 1), a)], 1))
    H, rt, rb, y0 = 1.62, 0.085, 0.40, 0.62   # body height, top & bottom radius, top y
    ds = 0.016
    ny = int(H / ds)
    for j in range(ny):
        t = (j + 0.5) / ny
        r = rt + (rb - rt) * t
        y = y0 - H * t
        na = max(12, int(2 * np.pi * r / ds))
        th = (np.arange(na) + (j % 2) * 0.5) / na * 2 * np.pi
        slope = (rb - rt) / H
        nrm = np.stack([np.cos(th), np.full(na, slope), np.sin(th)], 1); nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
        tang = np.stack([-np.sin(th), np.zeros(na), np.cos(th)], 1)
        base = np.where(stripe(np.full(na, t))[:, None], WHITE, PURPLE)
        add(np.stack([r * np.cos(th), np.full(na, y), r * np.sin(th)], 1), nrm, tang, ds * 0.75, ds * 0.75, shade(base, nrm))
    # the open top: a dark ring inside the tip
    for rr in np.linspace(0.02, rt, 4):
        na = max(8, int(2 * np.pi * rr / ds)); th = np.arange(na) / na * 2 * np.pi
        add(np.stack([rr * np.cos(th), np.full(na, y0 - 0.005), rr * np.sin(th)], 1), np.tile([0, 1.0, 0], (na, 1)), np.stack([-np.sin(th), np.zeros(na), np.cos(th)], 1), ds * 0.8, ds * 0.8, np.tile(DEEP * 0.7, (na, 1)))
    # a moulded lip where the cone meets its base
    yb = y0 - H
    for k, a2 in enumerate(np.linspace(0, np.pi, 6)):
        rr = rb + 0.03 * np.sin(a2) + 0.03; yy = yb + 0.03 * np.cos(a2) * 0.6
        na = int(2 * np.pi * rr / ds); th = np.arange(na) / na * 2 * np.pi
        nrm = np.stack([np.cos(th) * np.sin(a2), np.full(na, np.cos(a2)), np.sin(th) * np.sin(a2)], 1)
        add(np.stack([rr * np.cos(th), np.full(na, yy), rr * np.sin(th)], 1), nrm, np.stack([-np.sin(th), np.zeros(na), np.cos(th)], 1), ds * 0.8, ds * 0.8, shade(np.tile(DEEP, (na, 1)), nrm, 0.4))
    # rounded square base slab
    S, cr, th_ = 0.62, 0.12, 0.07
    g = np.arange(-S, S + 1e-9, ds)
    gx, gz = np.meshgrid(g, g); gx, gz = gx.ravel(), gz.ravel()
    q = np.maximum(np.abs(np.stack([gx, gz], 1)) - (S - cr), 0)
    inside = np.linalg.norm(q, axis=1) <= cr
    gx, gz = gx[inside], gz[inside]
    n = len(gx)
    for yy, ny_ in ((yb, 1.0), (yb - th_, -1.0)):
        nrm = np.tile([0, ny_, 0], (n, 1))
        add(np.stack([gx, np.full(n, yy), gz], 1), nrm, np.tile([1.0, 0, 0], (n, 1)), ds * 0.75, ds * 0.75, shade(np.tile(PURPLE * 0.92, (n, 1)), nrm, 0.25))
    # slab walls along the rounded-rect perimeter
    per = []
    for sx_, sz_ in ((1, 1), (-1, 1), (-1, -1), (1, -1)):
        for a2 in np.linspace(0, np.pi / 2, 10):
            per.append(((S - cr) * sx_ + cr * np.cos(a2) * sx_, (S - cr) * sz_ + cr * np.sin(a2) * sz_))
    per = np.array(per)
    # resample perimeter evenly
    seg = np.r_[per, per[:1]]; d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(seg, axis=0), axis=1))]
    u = np.arange(0, d[-1], ds)
    px, pz = np.interp(u, d, seg[:, 0]), np.interp(u, d, seg[:, 1])
    ox, oz = px.copy(), pz.copy()
    ox -= np.clip(ox, -(S - cr), S - cr); oz -= np.clip(oz, -(S - cr), S - cr)
    on = np.sqrt(ox ** 2 + oz ** 2) + 1e-9; ox /= on; oz /= on
    for yy in np.arange(yb - th_ + ds / 2, yb, ds * 0.8):
        m_ = len(px)
        nrm = np.stack([ox, np.zeros(m_), oz], 1)
        add(np.stack([px, np.full(m_, yy), pz], 1), nrm, np.tile([0, 1.0, 0], (m_, 1)), ds * 0.75, ds * 0.75, shade(np.tile(DEEP * 1.1, (m_, 1)), nrm, 0.3))
    return np.concatenate(pts), np.concatenate(covs), np.concatenate(cols)


def morton(p):
    q = ((p - p.min(0)) / (np.ptp(p, 0).max() + 1e-9) * 1023).astype(np.uint64)
    def spread(v):
        v = (v | (v << 16)) & 0x030000FF
        v = (v | (v << 8)) & 0x0300F00F
        v = (v | (v << 4)) & 0x030C30C3
        v = (v | (v << 2)) & 0x09249249
        return v
    return spread(q[:, 0]) | (spread(q[:, 1]) << 1) | (spread(q[:, 2]) << 2)


def save(key, p, cov, rgba, height=2.0):
    lo, hi = p.min(0), p.max(0)
    c = (lo + hi) / 2
    k = height / max(hi[1] - lo[1], (hi[0] - lo[0]) * 0.85)
    p = (p - c) * k
    cov = cov * k * k
    o = np.argsort(morton(p), kind="stable")
    p, cov, rgba = p[o], cov[o], rgba[o]
    raw = struct.pack("<I", len(p)) + p.astype("<f2").tobytes() + (cov * 1e4).astype("<f2").tobytes() + (np.clip(rgba, 0, 1) * 255).round().astype(np.uint8).tobytes()
    import base64, json
    json.dump({"splats": base64.b64encode(raw).decode()}, open(f"{OUT}/{key}.json", "w"))
    print(key, len(p), f"{os.path.getsize(f'{OUT}/{key}.json') / 1024:.0f}KB")


ONLY = sys.argv[2:]
_save = save
save = lambda k, *a: (not ONLY or k in ONLY) and _save(k, *a)
save("about", *inflate("home/hero-face-badge.png", 10000, thick=0.34))
import importlib.util as _u
_spec = _u.spec_from_file_location("house", os.path.join(os.path.dirname(os.path.abspath(__file__)), "one-splat-house.py"))
house = _u.module_from_spec(_spec); _spec.loader.exec_module(house)  # Pixar-style SDF model of the Domis home avatar
save("domis", *house.build(h=0.024, budget=50000))
save("virdio", *cone())
save("obscura", *card("obscura/wayne_girl_kimono.jpg", 11000, crop=(0.08, 0.06, 0.84, 0.8)))
save("mc", *inflate("grid/memorycare-cat-straight.png", 11000, thick=0.44))
save("side", *ply(os.environ.get("SAVOR_PLY", "savor/samples/sample.ply")))
