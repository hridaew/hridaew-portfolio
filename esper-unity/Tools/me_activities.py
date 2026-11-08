"""The figure outside the house: me, cycling through things I do. Each activity is a few key poses that Unity
glides between (LiveFlip), plus whatever it needs (an easel, a ball). The group moves on to the next activity
every few seconds or when clicked (LiveCycle). Everything here is local to the spot the figure stands on.
"""
import math

from esper_figures import arms, ball, figure, legs, limb, pose, upright

ME = "Me"
RED, WHITE = [0.86, 0.04, 0.06], [0.96, 0.96, 0.95]
BLUE, GOLD = [0.08, 0.24, 0.56], [1.0, 0.76, 0.16]
WOOD, LIGHTWOOD, STEEL = [0.62, 0.45, 0.3], [0.86, 0.74, 0.58], [0.24, 0.25, 0.27]
FACE_CAMERA = 225


def lift(j, dy):
    return {k: [v[0], round(v[1] + dy, 3), v[2]] for k, v in j.items()}


def soft(id_, at, size, tint, r=None, rot=None, corner=None):
    item = {"id": id_, "kind": "box", "material": "Clay", "p": [round(v, 4) for v in at], "size": size,
            "radius": r if r is not None else round(min(size) / 2, 3), "tint": tint}
    if rot:
        item["r"] = rot
    if corner:
        item["corner"] = corner
    return item


def activity(name, fig, props=()):
    fig["id"] = "figure"
    fig.pop("group", None)
    return {"id": name, "kind": "group", "p": [0, 0, 0], "children": [fig, *props]}


def headphones(i, j):
    hb, ht = j["headBase"], j["headTop"]
    mid = [(hb[k] + ht[k]) / 2 for k in range(3)]
    sl, sr = j["shl"], j["shr"]
    side = [sr[k] - sl[k] for k in range(3)]
    n = math.sqrt(sum(v * v for v in side))
    side = [v / n for v in side]
    cup_l = [mid[k] - side[k] * 0.118 for k in range(3)]
    cup_r = [mid[k] + side[k] * 0.118 for k in range(3)]
    top = [ht[0], ht[1] + 0.035, ht[2]]
    return [
        ball("hp-l", cup_l, 0.085, "Clay", WHITE), ball("hp-r", cup_r, 0.085, "Clay", WHITE),
        limb("hp-band-l", cup_l, top, 0.022, "Clay", WHITE), limb("hp-band-r", top, cup_r, 0.022, "Clay", WHITE),
    ]


def music():
    P = pose(0, 0, FACE_CAMERA)
    frames = [
        {**upright(P, sway=-0.03, nod=0.04), **legs(P, 0.2), **arms(P, (-0.42, 1.6, 0), (-0.3, 1.93, 0.02), (0.34, 1.66, 0), (0.24, 1.96, 0.02))},
        {**upright(P, drop=0.08, sway=0.02, nod=-0.03), **legs(P, 0.24, 0.92, 0.08), **arms(P, (-0.34, 1.1, 0.1), (-0.12, 1.26, 0.3), (0.34, 1.1, 0.1), (0.12, 1.26, 0.3))},
        {**upright(P, sway=0.03, nod=0.04), **legs(P, 0.2), **arms(P, (-0.34, 1.66, 0), (-0.24, 1.96, 0.02), (0.42, 1.6, 0), (0.3, 1.93, 0.02))},
        {**upright(P, drop=0.08, sway=-0.02, nod=-0.03), **legs(P, 0.24, 0.92, 0.08), **arms(P, (-0.34, 1.1, 0.1), (-0.12, 1.26, 0.3), (0.34, 1.1, 0.1), (0.12, 1.26, 0.3))},
    ]
    return activity("music", figure("", "", "", frames=frames, flip=0.42, material=ME, extras=headphones))


def arsenal():
    P = pose(0, 0, FACE_CAMERA)
    jump = lambda j: lift(j, 0.14)
    frames = [
        jump({**upright(P), **legs(P, 0.16), **arms(P, (-0.32, 1.64, 0.04), (-0.44, 1.94, 0.08), (0.32, 1.64, 0.04), (0.44, 1.94, 0.08))}),
        {**upright(P, drop=0.1, lean=0.04), **legs(P, 0.2, 0.92, 0.1), **arms(P, (-0.32, 1.12, 0.14), (-0.2, 1.36, 0.26), (0.32, 1.12, 0.14), (0.2, 1.36, 0.26))},
        jump({**upright(P), **legs(P, 0.16), **arms(P, (-0.3, 1.16, 0.12), (-0.18, 1.38, 0.24), (0.3, 1.66, 0.04), (0.36, 1.98, 0.06))}),
        {**upright(P, drop=0.1, lean=0.04), **legs(P, 0.2, 0.92, 0.1), **arms(P, (-0.32, 1.12, 0.14), (-0.2, 1.36, 0.26), (0.32, 1.12, 0.14), (0.2, 1.36, 0.26))},
    ]
    return activity("arsenal", figure("", "", "", frames=frames, flip=0.34, material=ME, wear={"torso": RED, "sleeves": WHITE, "shorts": WHITE}))


def warriors():
    P = pose(0, 0, FACE_CAMERA)
    base = lambda: {**upright(P, drop=0.1, lean=0.08), **legs(P, 0.22, 0.92, 0.1)}
    left_out = ((-0.34, 1.12, 0.12), (-0.4, 0.92, 0.3))
    frames = [
        {**base(), **arms(P, *left_out, (0.3, 1.0, 0.16), (0.32, 0.62, 0.26))},
        {**base(), **arms(P, *left_out, (0.3, 1.08, 0.14), (0.32, 0.86, 0.24))},
    ]
    at = [P(0.32, 0.13, 0.3), P(0.32, 0.72, 0.26)]
    carry = lambda i, j: [ball("ball", at[i], 0.24, "Clay", [0.92, 0.45, 0.16])]
    return activity("warriors", figure("", "", "", frames=frames, flip=0.28, material=ME, wear={"torso": BLUE, "shorts": GOLD}, extras=carry))


def painting():
    yaw = 90
    P = pose(0, 0, yaw)
    tilt = 10
    up = lambda u: (u * math.cos(math.radians(tilt)), u * math.sin(math.radians(tilt)))
    cx, cy, cf = 0.0, 1.25, 0.8   # canvas centre: side, height, forward
    def on_canvas(side, u):
        dy, df = up(u)
        return P(cx + side, cy + dy, cf + df - 0.03)
    easel = [
        limb("leg-l", P(-0.3, 0.0, 0.74), P(0, 1.66, 0.86), 0.035, "Clay", LIGHTWOOD),
        limb("leg-r", P(0.3, 0.0, 0.74), P(0, 1.66, 0.86), 0.035, "Clay", LIGHTWOOD),
        limb("leg-back", P(0, 0.0, 1.2), P(0, 1.6, 0.88), 0.03, "Clay", LIGHTWOOD),
        limb("tray", P(-0.34, 0.97, 0.76), P(0.34, 0.97, 0.76), 0.035, "Clay", LIGHTWOOD),
        soft("canvas", P(cx, cy, cf), [0.66, 0.52, 0.035], [0.98, 0.97, 0.95], r=0.012, rot=[tilt, yaw, 0]),
        soft("stroke-1", on_canvas(-0.12, 0.1), [0.26, 0.09, 0.012], [0.98, 0.55, 0.45], r=0.006, rot=[tilt, yaw, 8]),
        soft("stroke-2", on_canvas(0.12, -0.04), [0.18, 0.16, 0.012], [0.33, 0.62, 0.74], r=0.006, rot=[tilt, yaw, -12]),
        soft("stroke-3", on_canvas(-0.02, -0.15), [0.3, 0.06, 0.012], [0.98, 0.8, 0.35], r=0.006, rot=[tilt, yaw, 3]),
        soft("stroke-4", on_canvas(0.17, 0.15), [0.08, 0.08, 0.012], [0.4, 0.66, 0.46], r=0.006, rot=[tilt, yaw, 0]),
    ]
    brush_at = [(0.1, 1.34, 0.6), (-0.02, 1.16, 0.62), (0.16, 1.22, 0.61)]
    frames = []
    for b in brush_at:
        frames.append({**upright(P, lean=0.06, nod=0.03), **legs(P, 0.14),
                       **arms(P, (-0.3, 1.12, 0.1), (-0.26, 1.0, 0.3), (0.3, 1.18, 0.26), b)})
    def carry(i, j):
        w = j["wrr"]
        tip = P(brush_at[i][0] - 0.02, brush_at[i][1] + 0.04, brush_at[i][2] + 0.16)
        wl = j["wrl"]
        return [
            limb("brush", w, tip, 0.018, "Clay", WOOD),
            soft("palette", [wl[0], wl[1] + 0.01, wl[2]], [0.26, 0.016, 0.2], LIGHTWOOD, r=0.008, rot=[0, yaw, 0], corner=0.09),
        ]
    return activity("painting", figure("", "", "", frames=frames, flip=0.55, material=ME, extras=carry), easel)


def building():
    yaw = 135
    P = pose(0, 0, yaw)
    top_y = 0.78
    bench = [soft("bench-top", P(0, top_y - 0.035, 0.66), [1.0, 0.07, 0.5], LIGHTWOOD, r=0.02, rot=[0, yaw, 0])]
    for i, (sx, sf) in enumerate([(-0.44, 0.46), (0.44, 0.46), (-0.44, 0.86), (0.44, 0.86)]):
        bench.append(limb(f"bench-leg-{i}", P(sx, 0.0, sf), P(sx, top_y - 0.06, sf), 0.05, "Clay", LIGHTWOOD))
    bench += [
        soft("plank", P(0.05, top_y + 0.02, 0.62), [0.56, 0.04, 0.15], WOOD, r=0.012, rot=[0, yaw + 8, 0]),
        soft("birdhouse", P(-0.3, top_y + 0.13, 0.72), [0.24, 0.26, 0.22], [0.82, 0.64, 0.48], r=0.03, rot=[0, yaw - 10, 0]),
        soft("birdhouse-roof", P(-0.3, top_y + 0.28, 0.72), [0.3, 0.05, 0.28], [0.36, 0.5, 0.62], r=0.02, rot=[0, yaw - 10, 0]),
    ]
    head_at = [P(0.22, 1.86, 0.1), P(0.12, top_y + 0.08, 0.62)]
    frames = [
        {**upright(P, lean=0.04), **legs(P, 0.15), **arms(P, (-0.26, 1.08, 0.24), (-0.14, 0.86, 0.52), (0.3, 1.5, 0.12), (0.24, 1.66, 0.22))},
        {**upright(P, lean=0.12, nod=0.04), **legs(P, 0.15, 0.92, 0.03), **arms(P, (-0.26, 1.08, 0.24), (-0.14, 0.86, 0.52), (0.26, 1.18, 0.3), (0.16, 1.0, 0.46))},
    ]
    def carry(i, j):
        h = head_at[i]
        a = P(0, 0, 0)
        # The head sits across the handle, along the figure's sideways axis.
        side = [round(P(1, 0, 0)[k] - a[k], 3) for k in range(3)]
        return [
            limb("hammer-handle", j["wrr"], h, 0.03, "Clay", WOOD),
            limb("hammer-head", [h[k] - side[k] * 0.06 for k in range(3)], [h[k] + side[k] * 0.06 for k in range(3)], 0.05, "Clay", STEEL),
        ]
    return activity("building", figure("", "", "", frames=frames, flip=0.32, material=ME, extras=carry), bench)


def me(at, seconds=6.5):
    return {"id": "me/figure", "group": "Me", "kind": "group", "p": at, "cycle": seconds,
            "children": [arsenal(), warriors(), painting(), building()]}
