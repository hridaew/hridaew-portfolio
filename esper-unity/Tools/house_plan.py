"""The house as a diorama: a 9 m square of six small rooms, each set up the way its project actually lives.
Back: Obscura (the booth and its projection), Off hours, Virdio (TV and phone, no equipment). Front: Memory Care
(wheelchair, wheel, footrest, plush cat), Wafflings (Savor filming The Mighty Hand, a small orca game; the front door),
Domis (a kitchen, scanning the fridge label). Me in Off hours. Rooms open in pairs: Obscura-MCES, Off hours-Virdio, Wafflings-Domis.
The far walls stand full height; the rest are cut low. Soft shapes, turned profiles and tubes in neutral clay, fabric, graphite and satin metal.

Writes the house, rooms, the figure outside, views and look into Live/scene.json, replacing them (back up first).
Run from esper-unity/: python Tools/house_plan.py
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from esper_figures import arms, figure, legs, pose, seated, upright
from me_activities import me

PATH = "Live/scene.json"
s = json.load(open(PATH, encoding="utf8"))

H = 4.5
T = 0.14
TALL, CUT = 2.5, 1.0
CORNER = 0.6
IN = H - T / 2   # inside face of the shell


def r3(v):
    return round(v, 3)


def norm(v):
    n = math.hypot(*v) or 1
    return (v[0] / n, v[1] / n)


def fillet(pts, r, seg=8):
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        a, b, c = pts[i - 1], pts[i], pts[i + 1]
        u1, u2 = norm((a[0] - b[0], a[1] - b[1])), norm((c[0] - b[0], c[1] - b[1]))
        th = math.acos(max(-1, min(1, u1[0] * u2[0] + u1[1] * u2[1])))
        d = r / math.tan(th / 2)
        p1 = (b[0] + u1[0] * d, b[1] + u1[1] * d)
        bis = norm((u1[0] + u2[0], u1[1] + u2[1]))
        cen = (b[0] + bis[0] * r / math.sin(th / 2), b[1] + bis[1] * r / math.sin(th / 2))
        p2 = (b[0] + u2[0] * d, b[1] + u2[1] * d)
        a0 = math.atan2(p1[1] - cen[1], p1[0] - cen[0])
        da = (math.atan2(p2[1] - cen[1], p2[0] - cen[0]) - a0 + math.pi) % (2 * math.pi) - math.pi
        out += [(cen[0] + r * math.cos(a0 + da * k / seg), cen[1] + r * math.sin(a0 + da * k / seg)) for k in range(seg + 1)]
    return out + [pts[-1]]


def wall(name, pts, h=CUT):
    return {"id": f"house/{name}", "group": "House", "kind": "wall", "material": "WallWhite", "p": [0, 0, 0],
            "path": [r3(c) for p in pts for c in p], "h": h, "t": T}


def doors(name, a, b, gaps):
    """A straight wall from a to b, with door gaps as (from, to) distances along it."""
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
    spans, at = [], 0.0
    for g0, g1 in sorted(gaps):
        spans.append((at, g0))
        at = g1
    spans.append((at, L))
    return [wall(f"{name}-{i}", [(a[0] + u[0] * d0, a[1] + u[1] * d0), (a[0] + u[0] * d1, a[1] + u[1] * d1)])
            for i, (d0, d1) in enumerate(spans) if d1 - d0 > 0.05]


def soft(id_, at, size, r=None, rot=None, corner=None, group=None, material="Clay", **extra):
    item = {"id": id_, "kind": "box", "material": material, "p": [r3(v) for v in at], "size": [r3(v) for v in size],
            "radius": r3(r if r is not None else min(size) / 2)}
    if group:
        item["group"] = group
    if rot:
        item["r"] = rot
    if corner:
        item["corner"] = r3(corner)
    item.update(extra)
    return item


def pill(id_, a, b, t, material="Clay"):
    d = [b[i] - a[i] for i in range(3)]
    n = math.sqrt(sum(v * v for v in d)) or 1e-4
    return {"id": id_, "kind": "box", "material": material, "p": [r3((a[i] + b[i]) / 2) for i in range(3)],
            "r": [r3(math.degrees(math.acos(max(-1, min(1, d[1] / n))))), r3(math.degrees(math.atan2(d[0], d[2]))), 0],
            "size": [t, r3(n + t), t], "radius": r3(t / 2)}


def disc(id_, at, dia, h, rot=None):
    return soft(id_, at, [dia, h, dia], r=min(h / 2, 0.02), corner=dia / 2, rot=rot)


def ring(id_, at, radius, t, rot=None):
    item = {"id": id_, "kind": "torus", "material": "Clay", "p": [r3(v) for v in at], "radius": radius, "t": t}
    if rot:
        item["r"] = rot
    return item


def thing(id_, group, at, yaw, children, **extra):
    """A piece of furniture or a device: parts in local space, its front facing local -Z."""
    item = {"id": id_, "group": group, "kind": "group", "p": [r3(v) for v in at], "r": [0, yaw, 0], "children": children}
    item.update(extra)
    return item


def screen(id_, group, at, yaw, w, h, display, border=0.018, depth=0.03, pitch=0, **extra):
    item = {"id": id_, "group": group, "kind": "screen", "w": w, "h": h, "border": border, "t": depth,
            "p": [r3(v) for v in at], "r": [pitch, yaw, 0], "display": display}
    item.update(extra)
    return item


FLAT = {"_Brightness": 1.1}
GLOW = {"_Brightness": 1.35}
FACE_WEST, FACE_SOUTH = 90, 0   # yaw for a front (local -Z) facing west / south

# ---------------- modelling helpers: turned profiles and tubes ----------------
def lathe(id_, at, profile, material="Clay", rot=None, group=None, scale=None):
    item = {"id": id_, "kind": "lathe", "material": material, "p": [r3(v) for v in at], "profile": [r3(v) for v in profile]}
    if rot:
        item["r"] = rot
    if group:
        item["group"] = group
    if scale:
        item["s"] = scale
    return item


def tube(id_, pts, d, material="Satin", group=None):
    item = {"id": id_, "kind": "tube", "material": material, "p": [0, 0, 0], "path": [r3(c) for p in pts for c in p], "t": d}
    if group:
        item["group"] = group
    return item


def spokes(prefix, centre, radius, n, d, plane="x", material="Satin", phase=0.0):
    """n tubes from a hub out to a rim, in the plane across `plane` (the axle)."""
    out = []
    for k in range(n):
        a = 2 * math.pi * k / n + phase
        c, s_ = math.cos(a) * radius, math.sin(a) * radius
        end = [centre[0], centre[1] + s_, centre[2] + c] if plane == "x" else [centre[0] + c, centre[1] + s_, centre[2]]
        out.append(tube(f"{prefix}-{k}", [centre, end], d, material))
    return out


def person_wear(top, bottom=None):
    w = {"torso": top, "sleeves": top}
    if bottom:
        w["shorts"] = bottom
    return w


# ---------------- shell ----------------
# Back row: Domis (west), Off hours, Memory Care (east). Front row: Virdio (west), Wafflings (a small room behind the
# front door, no other exit), Obscura (an L that takes the rest). Real models are glTF, facing +Z at yaw 0:
# yaw 180 faces south, 90 east, 270 west.
house = [soft("house/floor", [0, -0.062, 0], [2 * H + T, 0.12, 2 * H + T], r=0.04, corner=CORNER + T / 2, group="House", material="Floor")]
house.append(wall("far", fillet([(-H, H - 1.2), (-H, H), (H, H), (H, -H), (H - 1.2, -H)], CORNER), TALL))
front_door = (-0.55, 0.35)
house.append(wall("south-east", [(H - 1.2, -H), (front_door[1], -H)]))
house.append(wall("south-west", fillet([(front_door[0], -H), (-H, -H), (-H, H - 1.2)], CORNER)))

ZR = 0.4                    # the line between the rows
XD, XM = -0.7, 1.7          # back row: Domis | Off hours | MCES
XV, XW, ZW = -1.1, 0.8, -1.3  # front row: Virdio | Wafflings (to z = ZW) | Obscura
house += doors("row", (-H, ZR), (H, ZR), [(1.1, 2.0), (4.5, 5.4), (7.4, 8.3)])   # Domis-Virdio, Off hours-Obscura, MCES-Obscura
house.append(wall("domis-offhours", [(XD, ZR), (XD, H)]))
house.append(wall("offhours-mces", [(XM, ZR), (XM, H)]))
house.append(wall("virdio-east", [(XV, -H), (XV, ZR)]))
house.append(wall("wafflings-north", [(XV, ZW), (XW, ZW)]))
house.append(wall("wafflings-east", [(XW, -H), (XW, ZW)]))


def model(id_, group, src, at, yaw=0, height=None, **extra):
    item = {"id": id_, "group": group, "kind": "model", "src": src, "p": [r3(v) for v in at], "r": [0, yaw, 0]}
    if height:
        item["height"] = height
    item.update(extra)
    return item


photos = ["0dsc06003awaynemarketplace", "awaynemarket5x7", "dsc05265acjapanesefamily", "dsc05127asoldierportrait",
          "dsc05267awaynejapanesemotherdaughter", "dsc05232awayne2soldiers", "dsc05168awayneandbuddyjapanmapjapan", "dsc05112awaynewong"]
paths = [f"Content/Obscura/wayne_archive_{p}.jpg" for p in photos]


def drape(a, b, amp=0.035, wave=0.2):
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L)
    n = (-u[1], u[0])
    k = max(2, int(L / 0.03))
    return [(a[0] + u[0] * L * i / k + n[0] * amp * math.sin(2 * math.pi * L * i / k / wave),
             a[1] + u[1] * L * i / k + n[1] * amp * math.sin(2 * math.pi * L * i / k / wave)) for i in range(k + 1)]


def curtain(name, a, b):
    return {**wall(name, drape(a, b), 2.05), "id": f"obscura/{name}", "group": "Obscura", "t": 0.045, "material": "Fabric"}


def headset(id_, at, yaw, pitch=0):
    return {"id": id_, "kind": "group", "p": [r3(v) for v in at], "r": [pitch, yaw, 0], "children": [
        soft("shell", [0, 0, 0], [0.19, 0.105, 0.095], r=0.04),
        soft("foam", [0, -0.005, 0.055], [0.165, 0.08, 0.025], r=0.02, material="ClayMid"),
    ]}


def fridge_inside():
    face = IN - 0.4 - 0.33       # the body's front face, the inside back wall once the doors are open
    z = lambda d: face - d       # d metres out from the back wall
    g = dict(group="Domis")
    x0 = -3.75
    bottle = [0, 0, 0.032, 0, 0.032, 0.17, 0.014, 0.21, 0.014, 0.25, 0, 0.25]
    jar = [0, 0, 0.045, 0, 0.045, 0.1, 0.035, 0.11, 0.035, 0.125, 0, 0.125]
    return [
        soft("domis/fridge-liner", [x0, 0.98, z(0.006)], [0.96, 1.62, 0.012], r=0.004, material="ClayMid", **g),
        soft("domis/fridge-shelf-0", [x0, 0.55, z(0.07)], [0.94, 0.018, 0.14], r=0.004, **g),
        soft("domis/fridge-shelf-1", [x0, 0.95, z(0.07)], [0.94, 0.018, 0.14], r=0.004, **g),
        soft("domis/fridge-shelf-2", [x0, 1.33, z(0.07)], [0.94, 0.018, 0.14], r=0.004, **g),
        soft("domis/fridge-freezer", [x0, 1.55, z(0.075)], [0.96, 0.045, 0.15], r=0.006, **g),
        soft("domis/fridge-crisper", [x0, 0.3, z(0.08)], [0.88, 0.22, 0.16], r=0.012, material="ClayMid", **g),
        {**lathe("domis/fridge-bottle-0", [x0 - 0.34, 0.96, z(0.06)], bottle, group="Domis"), "tint": [0.35, 0.62, 0.4]},
        {**lathe("domis/fridge-bottle-1", [x0 - 0.26, 0.96, z(0.07)], bottle, group="Domis"), "tint": [0.85, 0.6, 0.25]},
        {**soft("domis/fridge-carton", [x0 + 0.25, 0.66, z(0.06)], [0.09, 0.2, 0.09], r=0.006, **g), "tint": [0.55, 0.7, 0.9]},
        {**lathe("domis/fridge-jar", [x0 + 0.05, 1.34, z(0.06)], jar, group="Domis"), "tint": [0.9, 0.42, 0.3]},
        {**soft("domis/fridge-tub", [x0 - 0.2, 1.39, z(0.065)], [0.22, 0.1, 0.12], r=0.012, **g), "tint": [0.95, 0.85, 0.6]},
        # broken: the fault light, and a leak
        soft("domis/fridge-panel", [x0, 1.72, z(0.012)], [0.34, 0.07, 0.02], r=0.006, material="ClayMid", **g),
        {**disc("domis/fridge-fault", [x0 + 0.11, 1.72, z(0.024)], 0.022, 0.006, rot=[90, 0, 0]), "group": "Domis", "tint": [0.95, 0.15, 0.12]},
        {**soft("domis/leak-0", [x0 + 0.08, 0.003, z(0.55)], [0.62, 0.005, 0.42], r=0.0025, corner=0.2, material="ClayMid", **g), "tint": [0.62, 0.78, 0.95]},
        {**soft("domis/leak-1", [x0 + 0.38, 0.0035, z(0.82)], [0.3, 0.005, 0.22], r=0.0025, corner=0.1, material="ClayMid", **g), "tint": [0.62, 0.78, 0.95]},
    ]


# ---------------- Domis (back west): a kitchen, someone scanning the fridge into their home ----------------
fx, fz = -3.75, IN - 0.4
dx, dz = -3.75, 3.0
P = pose(dx, dz, 0)
phone_at = P(-0.04, 1.47, 0.53)
domis = [
    model("domis/fridge", "Domis", "kenney:kitchenFridgeLarge", [fx, 0, fz], 180, 1.9, nodes={"doorLeft": [0, -105, 0], "doorRight": [0, 105, 0]}, shake=0.004),
    *fridge_inside(),
    model("domis/cabinet-0", "Domis", "kenney:kitchenCabinet", [-2.85, 0, IN - 0.33], 180, 0.92),
    model("domis/sink", "Domis", "kenney:kitchenSink", [-2.0, 0, IN - 0.33], 180, 0.92),
    model("domis/cabinet-1", "Domis", "kenney:kitchenCabinetDrawer", [-1.15, 0, IN - 0.33], 180, 0.92),
    screen("domis/phone-rest", "Domis", [-2.85, 0.95, IN - 0.45], 20, 0.075, 0.155,
           {"surface": "Screen", "src": "Content/Domis/phone_tasks.png", "floats": GLOW}, pitch=90, station="domis", when="idle", border=0.005, depth=0.009,
           on="domis/cabinet-0"),
    screen("domis/phone-held", "Domis", phone_at, 0, 0.09, 0.185,
           {"surface": "Screen", "src": "Content/Domis/phone_home.png", "floats": GLOW}, pitch=12, station="domis", when="active", border=0.005, depth=0.009),
    figure("domis/person", "Domis", "domis", joints={
        **upright(P, 0.05, nod=0.06), **legs(P, 0.15),
        **arms(P, (-0.2, 1.12, -0.02), (-0.23, 0.86, 0.05), (0.22, 1.14, 0.22), (0.01, 1.29, 0.46))}),
]

# ---------------- Off hours (back middle), which is also About: records and games on the wall, a plain sideboard with
# the record player and my PC, and me in the lounge chair in the middle of the room with headphones on ----------------
cx = (XD + XM) / 2
TOP = 0.6   # sideboard height


def ledge(id_, y, width):
    return soft(id_, [cx, y, IN - 0.05], [width, 0.03, 0.1], r=0.004, group="Taste", material="ClayMid")


albums = ["lgseo", "motm2", "reanimation"]
taste = [
    soft("taste/sideboard", [cx, TOP / 2, IN - 0.28], [1.6, TOP, 0.46], r=0.008, group="Taste"),
    # The record player: a square plinth, the platter and record, the tonearm. Barely rounded.
    thing("taste/record-player", "Taste", [cx - 0.42, TOP, IN - 0.28], FACE_SOUTH, [
        soft("plinth", [0, 0.04, 0], [0.45, 0.08, 0.35], r=0.004),
        disc("platter", [-0.04, 0.0875, 0], 0.29, 0.015),
        {**disc("record", [-0.04, 0.097, 0], 0.28, 0.004), "material": "ClayMid"},
        soft("pivot", [0.17, 0.095, 0.11], [0.04, 0.03, 0.04], r=0.004),
        tube("tonearm", [[0.17, 0.115, 0.11], [0.15, 0.115, -0.03], [0.08, 0.108, -0.09]], 0.008, "Satin"),
    ]),
    # The PC: monitor, keyboard and mouse.
    model("taste/monitor", "Taste", "kenney:computerScreen", [cx + 0.38, TOP, IN - 0.2], 180, 0.45, on="taste/sideboard"),
    model("taste/keyboard", "Taste", "kenney:computerKeyboard", [cx + 0.34, TOP, IN - 0.42], 180, 0.04, on="taste/sideboard"),
    model("taste/mouse", "Taste", "kenney:computerMouse", [cx + 0.62, TOP, IN - 0.42], 180, 0.035, on="taste/sideboard"),
    ledge("taste/ledge-records", 1.22, 1.25),
    ledge("taste/ledge-games", 1.68, 1.0),
]
for i, a in enumerate(albums):
    taste.append(screen(f"taste/album-{i}", "Taste", [cx + (i - 1) * 0.37, 1.39, IN - 0.07], FACE_SOUTH, 0.3, 0.3,
                        {"surface": "Screen", "src": f"Content/Albums/{a}_front.jpg", "lit": True}, border=0.008, depth=0.006, pitch=8, corner=0.01))
for i in range(3):
    taste.append(screen(f"taste/game-{i}", "Taste", [cx + (i - 1) * 0.2, 1.79, IN - 0.07], FACE_SOUTH, 0.13, 0.18,
                        {"surface": "Screen", "src": f"Content/Games/game_{i + 1}.jpg", "lit": True}, border=0.007, depth=0.014, pitch=6, corner=0.009))

# Me, off the clock: sunk into the lounge chair in the middle of the room, headphones on, turned toward the door.
ax, az, CY = cx, 2.3, 155
taste.append(thing("taste/lounge-chair", "Taste", [ax, 0, az], CY + 180, [
    disc("foot", [0, 0.015, 0], 0.56, 0.03),
    soft("column", [0, 0.17, 0.02], [0.06, 0.3, 0.06], r=0.03),
    soft("seat", [0, 0.37, -0.05], [0.72, 0.11, 0.62], r=0.045, rot=[7, 0, 0], material="Fabric"),
    soft("back", [0, 0.7, 0.33], [0.74, 0.86, 0.11], r=0.045, rot=[31, 0, 0], material="Fabric"),
    soft("arm-l", [-0.39, 0.6, -0.03], [0.08, 0.05, 0.52], r=0.02), soft("arm-r", [0.39, 0.6, -0.03], [0.08, 0.05, 0.52], r=0.02),
    soft("post-l", [-0.39, 0.49, 0.1], [0.05, 0.22, 0.05], r=0.02), soft("post-r", [0.39, 0.49, 0.1], [0.05, 0.22, 0.05], r=0.02),
]))
C = pose(ax, az, CY)   # the chair's own frame: (side, up, forward); its seat slopes back, its back reclines
sitting = {
    "pelvis": C(0, 0.45, -0.04), "neck": C(0, 0.89, -0.31), "headBase": C(0, 0.96, -0.33), "headTop": C(0, 1.15, -0.37),
    "shl": C(-0.19, 0.84, -0.27), "shr": C(0.19, 0.84, -0.27),
    "ell": C(-0.34, 0.7, -0.08), "wrl": C(-0.34, 0.73, 0.18), "elr": C(0.34, 0.7, -0.08), "wrr": C(0.34, 0.73, 0.18),
    "hipl": C(-0.1, 0.44, -0.02), "hipr": C(0.1, 0.44, -0.02),
    "knl": C(-0.12, 0.55, 0.38), "knr": C(0.13, 0.55, 0.38),
    "anl": C(-0.15, 0.09, 0.62), "anr": C(0.17, 0.09, 0.6),
}
hy, hz = 1.055, -0.35
me_item = figure("me/resting", "Taste", "taste", joints=sitting)   # like everyone, only while the room is in use
me_item["children"] = [
    soft("headphones-l", C(-0.11, hy, hz), [0.035, 0.085, 0.085], r=0.03, rot=[0, CY, 0]),
    soft("headphones-r", C(0.11, hy, hz), [0.035, 0.085, 0.085], r=0.03, rot=[0, CY, 0]),
    tube("headphones-band", [C(-0.11, hy + 0.03, hz), C(0, hy + 0.13, hz - 0.01), C(0.11, hy + 0.03, hz)], 0.018, "ClayMid"),
]
me_item["group"] = "Taste"

# ---------------- Memory Care (back east): the framed station against the tall wall, a resident at the wheel in
# their wheelchair, feet on the rumbling footrest; the plush cats beside ----------------
alx, alz = IN - 0.4, 2.55
mx, mz = alx - 0.3 - 0.64, alz   # close enough to hold the wheel
P = pose(mx, mz, 90)
mces = [
    thing("memorycare/alcove", "MemoryCare", [alx, 0, alz], FACE_WEST, [
        soft("side-l", [-0.97, 1.02, 0], [0.1, 2.04, 0.84], r=0.008), soft("side-r", [0.97, 1.02, 0], [0.1, 2.04, 0.84], r=0.008),
        soft("top", [0, 2.0, 0], [2.04, 0.1, 0.84], r=0.008), soft("back", [0, 1.02, 0.39], [2.0, 2.04, 0.08], r=0.006),
        soft("counter", [0, 0.74, 0.0], [1.88, 0.06, 0.72], r=0.006),
    ]),
    model("memorycare/steering-wheel", "MemoryCare", "esper:steering_wheel", [alx - 0.3, 0.765, alz], 270, s=[0.85]),
    screen("memorycare/tv", "MemoryCare", [alx + 0.33, 1.38, alz], FACE_WEST, 1.5, 0.85,
           {"surface": "Screen", "src": "Content/MemoryCare/station.jpg", "floats": {"_Brightness": 0.9},
            "active": ["Content/MemoryCare/resident_wheel.jpg", "Content/MemoryCare/kitten.jpg"], "seconds": 3.5, "activeBrightness": 1.35},
           border=0.02, depth=0.035, station="memory-care"),
    soft("memorycare/footrest", P(0, 0.045, 0.5), [0.48, 0.09, 0.34], r=0.03, rot=[0, 90, 0], group="MemoryCare", material="ClayMid"),
    model("memorycare/stool", "MemoryCare", "ph:folding_wooden_stool", [2.35, 0, 1.3], 30, 0.46),
    model("memorycare/cat-0", "MemoryCare", "ph:concrete_cat_statue", [2.3, 0.46, 1.27], 120, 0.2, on="memorycare/stool"),
    model("memorycare/cat-1", "MemoryCare", "ph:concrete_cat_statue", [2.12, 0.0, 0.85], 200, 0.22),
    model("memorycare/wheelchair", "MemoryCare", "ph:wheelchair_01", [mx - 0.05, 0, mz], 90, 0.95, station="memory-care", when="active"),
    figure("memorycare/resident", "MemoryCare", "memory-care", joints={
        **seated(P), **arms(P, (-0.2, 0.74, 0.34), (-0.14, 0.9, 0.62), (0.2, 0.74, 0.34), (0.14, 0.9, 0.62))}),
]

# ---------------- Virdio (front west): the class on the TV, the phone flat on the table with its classes, room to move ----------------
vx, vz = -2.75, -2.0
P = pose(vx, vz, 90)
virdio = [
    soft("virdio/console", [XV - T / 2 - 0.26, 0.275, vz], [0.44, 0.55, 1.5], r=0.008, group="Virdio"),
    screen("virdio/tv", "Virdio", [XV - T / 2 - 0.3, 0.55 + 0.46, vz], FACE_WEST, 1.3, 0.73,
           {"surface": "Screen", "src": "Content/Virdio/tv_idle.png", "floats": FLAT, "active": ["Content/Virdio/tv_class.jpg"], "activeBrightness": 1.3},
           border=0.014, depth=0.03, station="virdio"),
    soft("virdio/tv-foot", [XV - T / 2 - 0.3, 0.565, vz], [0.24, 0.02, 0.16], r=0.008, group="Virdio"),
    thing("virdio/sofa", "Virdio", [-H + T / 2 + 0.47, 0, vz], 270, [
        soft("base", [0, 0.2, 0.02], [1.58, 0.3, 0.82], r=0.04, material="Fabric"),
        soft("cushion-l", [-0.395, 0.405, -0.06], [0.78, 0.12, 0.64], r=0.05, material="Fabric"),
        soft("cushion-r", [0.395, 0.405, -0.06], [0.78, 0.12, 0.64], r=0.05, material="Fabric"),
        soft("back", [0, 0.6, 0.31], [1.6, 0.44, 0.2], r=0.06, material="Fabric"),
        soft("arm-l", [-0.87, 0.335, 0.02], [0.16, 0.57, 0.84], r=0.05, material="Fabric"),
        soft("arm-r", [0.87, 0.335, 0.02], [0.16, 0.57, 0.84], r=0.05, material="Fabric"),
    ]),
    model("virdio/coffee-table", "Virdio", "ph:modern_coffee_table_01", [-3.4, 0, -0.6], 0, 0.4),
    screen("virdio/phone", "Virdio", [XV - T / 2 - 0.42, 0.6, vz + 0.55], 250, 0.075, 0.155,
           {"surface": "Screen", "src": "Content/Virdio/phone.jpg", "floats": GLOW}, border=0.005, depth=0.009, pitch=90, on="virdio/console"),
    figure("virdio/person", "Virdio", "virdio", flip=1.8, frames=[
        {**upright(P), **legs(P, 0.2), **arms(P, (-0.3, 1.16, 0.06), (-0.2, 1.22, 0.3), (0.3, 1.16, 0.06), (0.2, 1.22, 0.3))},
        {**upright(P, drop=0.32, lean=0.16), **legs(P, 0.24, 0.92, 0.32, 0.2), **arms(P, (-0.26, 0.92, 0.3), (-0.12, 0.94, 0.55), (0.26, 0.92, 0.3), (0.12, 0.94, 0.55))},
    ]),
]

# ---------------- Wafflings (front middle, behind the front door): Savor, someone filming a sculpture on a plinth;
# a small whale for Saving Baby J ----------------
hx, hz = -0.2, -2.0
fx2, fz2 = 0.3, -3.0
FY = math.degrees(math.atan2(hx - fx2, hz - fz2))
Q = pose(fx2, fz2, FY)
wafflings = [
    soft("wafflings/plinth", [hx, 0.5, hz], [0.38, 1.0, 0.38], r=0.03, group="Wafflings"),
    {"id": "wafflings/mighty-hand", "group": "Wafflings", "kind": "splat", "src": "Content/Savor/mighty_hand.splat",
     "p": [hx, 1.0, hz], "r": [0, 160, 0], "s": [0.62]},
    screen("wafflings/savor-phone", "Wafflings", Q(-0.05, 1.36, 0.3), FY, 0.075, 0.155,
           {"surface": "Screen", "src": "Content/Billboards/savor.jpg", "floats": GLOW}, border=0.005, depth=0.009, pitch=4,
           station="wafflings", when="active"),
    figure("wafflings/filmer", "Wafflings", "wafflings", joints={
        **upright(Q, 0.03), **legs(Q, 0.13), **arms(Q, (-0.2, 1.12, -0.02), (-0.23, 0.86, 0.05), (0.22, 1.16, 0.14), (0.0, 1.34, 0.28))}),
    model("wafflings/stool", "Wafflings", "ph:folding_wooden_stool", [-0.7, 0, -4.0], 15, 0.46),
    model("wafflings/whale", "Wafflings", "ph:bronze_whale_statue", [-0.7, 0.46, -4.0], 120, 0.18, on="wafflings/stool"),
]

# ---------------- Obscura (front east): the curtained booth in the corner, a visitor inside with the viewer to their
# eyes; the audience on chairs watching the projection of what their gaze chooses ----------------
B0, B1 = (3.0, -4.35), (4.35, -2.95)     # booth corners (sw, ne)
vwx, vwz = 3.75, -3.65
P = pose(vwx, vwz, 90)
scx, scz, SCY = 2.15, -0.35, 215        # projection screen, facing the audience to the south-west
sdir = (math.sin(math.radians(SCY)), math.cos(math.radians(SCY)))
obscura = [
    curtain("curtain-s", (B0[0], B0[1]), (B1[0], B0[1])),
    curtain("curtain-e", (B1[0], B0[1]), (B1[0], B1[1])),
    curtain("curtain-n", (B1[0], B1[1]), (B0[0], B1[1])),
    tube("obscura/rail", [[B0[0], 2.1, B0[1]], [B1[0], 2.1, B0[1]], [B1[0], 2.1, B1[1]], [B0[0], 2.1, B1[1]]], 0.025, group="Obscura"),
    {**figure("obscura/visitor", "Obscura", "obscura", joints={
        **upright(P, 0.02), **legs(P, 0.12), **arms(P, (-0.24, 1.33, 0.12), (-0.11, 1.55, 0.12), (0.24, 1.33, 0.12), (0.11, 1.55, 0.12))}),
     "look": 38, "children": [{**headset("headset", P(0, 1.58, 0.11), 270, 4), "attach": "chest"}]},
    # Poly Haven's screen, unscaled: its canvas is 1.02 m square, 0.73-1.74 m up, its face 0.07 m in front of the stand.
    model("obscura/screen", "Obscura", "ph:projector_screen", [scx, 0, scz], SCY),
    screen("obscura/projection", "Obscura", [scx + sdir[0] * 0.074, 1.235, scz + sdir[1] * 0.074], SCY + 180, 1.02, 1.01,
           {"surface": "Screen", "video": "/assets/obscura/spectator.mp4"}, border=0.0, depth=0.002, corner=0.001, station="obscura"),
]
seats = [(1.15, -1.85), (1.85, -2.2)]
for k, (sx_, sz_) in enumerate(seats):
    yaw = math.degrees(math.atan2(scx - sx_, scz - sz_))
    obscura.append(model(f"obscura/chair-{k}", "Obscura", "ph:plastic_monobloc_chair_01", [sx_, 0, sz_], yaw, 0.8))
    Qs = pose(sx_, sz_, yaw)
    obscura.append(figure(f"obscura/spectator-{k}", "Obscura", "obscura", joints={
        **seated(Qs), **arms(Qs, (-0.22, 0.72, 0.12), (-0.16, 0.6, 0.32), (0.22, 0.72, 0.12), (0.16, 0.6, 0.32))}))

s["items"] = house + domis + taste + mces + virdio + wafflings + obscura + [me_item]

# ---------------- stations, views ----------------
ROOMS = {   # click areas: centre x, z, size x, z
    "domis": ((-H + XD) / 2, (ZR + H) / 2, XD + H, H - ZR), "taste": ((XD + XM) / 2, (ZR + H) / 2, XM - XD, H - ZR),
    "memory-care": ((XM + H) / 2, (ZR + H) / 2, H - XM, H - ZR), "virdio": ((-H + XV) / 2, (-H + ZR) / 2, XV + H, ZR + H),
    "wafflings": ((XV + XW) / 2, (-H + ZW) / 2, XW - XV, ZW + H), "obscura": ((XW + H) / 2, (-H + ZR) / 2, H - XW, ZR + H),
}
groups = {"obscura": "Obscura", "taste": "Taste", "virdio": "Virdio", "memory-care": "MemoryCare", "wafflings": "Wafflings", "domis": "Domis"}
stations = {st["id"]: st for st in s["stations"]}
for sid, (cx_, cz_, sx, sz) in ROOMS.items():
    st = stations[sid]
    st["items"] = [i["id"] for i in s["items"] if i.get("group") == groups[sid]]
    st["bounds"] = [r3(cx_), 0.7, r3(cz_), r3(sx - 0.1), 1.4, r3(sz - 0.1)]
    for k in ("accent", "screen", "enter"):
        st.pop(k, None)
stations["obscura"].update(screen="obscura/projection", enter=[r3(scx + sdir[0] * 0.9), 1.3, r3(scz + sdir[1] * 0.9)])
stations["memory-care"].update(screen="memorycare/tv", enter=pose(mx, mz, 90)(0, 1.12, 0.45))
stations["virdio"].update(screen="virdio/tv", enter=pose(vx, vz, 90)(0, 1.45, 0.45))
stations["domis"].update(screen="domis/phone-held", enter=pose(dx, dz, 0)(-0.05, 1.42, 0.12))

YAW, PITCH, LENS = 45.0, math.degrees(math.atan(1 / math.sqrt(2))), 6.0


def iso(target, frame):
    d = frame / (2 * math.tan(math.radians(LENS / 2)))
    cp, sp = math.cos(math.radians(PITCH)), math.sin(math.radians(PITCH))
    back = [-cp * math.sin(math.radians(YAW)), sp, -cp * math.cos(math.radians(YAW))]
    return {"p": [r3(target[k] + back[k] * d) for k in range(3)], "target": [r3(v) for v in target], "fov": LENS}


def shoulder(x, z, yaw, look, back=1.7, side=-0.5, height=2.0, fov=46, lead=0.0):
    """Over someone's left shoulder (side < 0), looking at what they're using. `lead` aims that far to the right of
    it, so the subject sits left of centre, clear of the card."""
    fwd = (math.sin(math.radians(yaw)), math.cos(math.radians(yaw)))
    right = (fwd[1], -fwd[0])
    p = [x - fwd[0] * back + right[0] * side, height, z - fwd[1] * back + right[1] * side]
    d = (look[0] - p[0], look[2] - p[2])
    n = math.hypot(*d) or 1
    cam_right = (d[1] / n, -d[0] / n)
    t = [look[0] + cam_right[0] * lead, look[1], look[2] + cam_right[1] * lead]
    return {"p": [r3(v) for v in p], "target": [r3(v) for v in t], "fov": fov}


views = {v["id"]: v for v in s["views"]}
views["overview"].update(iso([0.0, 0.0, 0.0], 17.5))
views["domis"].update(shoulder(dx, dz, 0, [phone_at[0], 1.25, phone_at[2] + 0.3], back=1.35, side=-1.15, height=2.2, fov=58, lead=0.3))
views["taste"].update({"p": [1.95, 2.75, -1.0], "target": [1.05, 0.7, 2.6], "fov": 58})
views["memory-care"].update(shoulder(mx, mz, 90, [alx + 0.2, 1.15, alz], back=1.75, side=-0.6, height=2.3, fov=60, lead=0.7))
views["virdio"].update(shoulder(vx, vz, 90, [XV - 0.3, 0.8, vz + 0.15], back=2.0, side=-0.6, height=2.3, fov=60, lead=0.8))
views["wafflings"].update(shoulder(fx2, fz2, FY, [hx, 1.2, hz], back=1.7, side=-0.55, height=2.25, fov=58, lead=0.4))
views["obscura"].update({"p": [0.0, 3.1, -5.6], "target": [3.4, 0.9, -3.5], "fov": 64})

GRIPS = {
    "domis/person": {"kind": "phone", "object": "domis/phone-held"},
    "wafflings/filmer": {"kind": "phone", "object": "wafflings/savor-phone"},
    "memorycare/resident": {"kind": "wheel", "object": "memorycare/steering-wheel"},
    "obscura/visitor": {"kind": "viewer"},
}
for it in s["items"]:
    if it.get("id") in GRIPS:
        it["grip"] = GRIPS[it["id"]]

HANDS = {
    "domis/person": ["relaxed", "hold"], "memorycare/resident": ["grip", "grip"], "virdio/person": ["relaxed", "relaxed"],
    "wafflings/filmer": ["relaxed", "hold"], "obscura/visitor": ["grip", "grip"],
    "obscura/spectator-0": ["rest", "rest"], "obscura/spectator-1": ["rest", "relaxed"], "me/resting": ["rest", "relaxed"],
}
for it in s["items"]:
    if it.get("id") in HANDS:
        it["hands"] = HANDS[it["id"]]

# Each room's colour comes from its project (the site's own card colours): Domis #ff5a5b, Virdio purple,
# Memory Care orange, Obscura grey. Shown only while that room is in front.
DOMIS, DOMIS_DEEP, DOMIS_PALE = [1.0, 0.353, 0.357], [0.78, 0.2, 0.22], [1.0, 0.8, 0.8]
VIRDIO, VIRDIO_PALE = [0.55, 0.45, 0.95], [0.8, 0.73, 1.0]
MCES, MCES_DEEP, MCES_PALE = [1.0, 0.624, 0.451], [1.0, 0.506, 0.227], [1.0, 0.82, 0.7]
OBSCURA, OBSCURA_DEEP = [0.46, 0.46, 0.46], [0.2, 0.2, 0.21]
TINTS = {
    "domis/fridge-bottle-0": DOMIS_DEEP, "domis/fridge-bottle-1": DOMIS_PALE, "domis/fridge-carton": DOMIS_PALE,
    "domis/fridge-jar": DOMIS, "domis/fridge-tub": DOMIS_PALE, "domis/fridge-fault": DOMIS,
    "domis/leak-0": DOMIS_PALE, "domis/leak-1": DOMIS_PALE,
    "virdio/sofa": VIRDIO_PALE, "virdio/coffee-table": VIRDIO,
    "memorycare/cat-0": MCES_DEEP, "memorycare/cat-1": MCES, "memorycare/footrest": MCES_PALE, "memorycare/stool": MCES_PALE,
    "obscura/curtain-s": OBSCURA_DEEP, "obscura/curtain-e": OBSCURA_DEEP, "obscura/curtain-n": OBSCURA_DEEP,
    "obscura/chair-0": OBSCURA, "obscura/chair-1": OBSCURA,
    "wafflings/whale": [0.22, 0.24, 0.28], "wafflings/stool": [0.78, 0.6, 0.42],
    "taste/lounge-chair": [0.45, 0.29, 0.19], "taste/record-player": [0.3, 0.3, 0.32],
}
for it in s["items"]:
    if it.get("id") in TINTS:
        it["tint"] = TINTS[it["id"]]

tmp = PATH + ".tmp"
json.dump(s, open(tmp, "w", encoding="utf8"), indent=2)
os.replace(tmp, PATH)
print(len(s["items"]), "items")
