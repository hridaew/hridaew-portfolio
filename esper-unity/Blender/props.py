"""ESPER props authored in Blender. Units are metres, Z up, the front of each object faces -Y."""
import math

import bpy

from common import assign, bevel, box, cyl, export, mat, reset, smooth, sphere, torus, tube

PI = math.pi


def drafting_table():
    """A steel-framed drafting table: tilted board with a pencil ledge, parallel rule, A-frame trestles."""
    reset()
    steel = mat("Steel", (0.08, 0.085, 0.09), rough=0.45, metal=0.9)
    board = mat("BoardVinyl", (0.42, 0.47, 0.42), rough=0.7)
    edge = mat("BoardEdge", (0.36, 0.26, 0.17), rough=0.55)
    rule = mat("Rule", (0.75, 0.74, 0.7), rough=0.3, metal=0.6)
    rubber = mat("Rubber", (0.03, 0.03, 0.03), rough=0.9)

    w, d, t = 1.0, 0.7, 0.028
    tilt = math.radians(18)
    pivot_h = 0.86
    # Board: rotated about X so the front edge (-Y) is low.
    cy = 0.0
    cz = pivot_h + math.sin(tilt) * 0.0
    top = box("Board", (w, d, t), (0, cy, cz), board, rot=(tilt, 0, 0), bev=0.004)
    side = box("BoardCore", (w + 0.01, d + 0.01, t * 0.7), (0, cy, cz - 0.004), edge, rot=(tilt, 0, 0), bev=0.006)
    # Pencil ledge along the front edge.
    fy = cy - math.cos(tilt) * d / 2
    fz = cz - math.sin(tilt) * d / 2
    box("Ledge", (w, 0.03, 0.022), (0, fy - 0.01, fz + 0.012), edge, rot=(tilt, 0, 0), bev=0.003)
    # Parallel rule: a bar riding on cables, a third of the way up the board.
    ry = cy - math.cos(tilt) * d * 0.15
    rz = cz - math.sin(tilt) * d * 0.15 + 0.02
    box("Rule", (w * 0.98, 0.05, 0.012), (0, ry, rz), rule, rot=(tilt, 0, 0), bev=0.002)
    for sx in (-1, 1):
        cyl(f"RuleEnd{sx}", 0.012, 0.03, (sx * w * 0.49, ry, rz), steel, rot=(0, PI / 2, 0))

    # Trestles: two A-frames under the board, joined by a stretcher.
    for sx in (-1, 1):
        x = sx * (w / 2 - 0.08)
        tube(f"LegF{sx}", [(x, -0.28, 0.0), (x, -0.02, pivot_h - 0.06)], 0.014, steel)
        tube(f"LegB{sx}", [(x, 0.3, 0.0), (x, 0.02, pivot_h - 0.06)], 0.014, steel)
        tube(f"Foot{sx}", [(x, -0.32, 0.012), (x, 0.34, 0.012)], 0.016, steel)
        cyl(f"Hinge{sx}", 0.022, 0.04, (x, 0.0, pivot_h - 0.05), steel, rot=(0, PI / 2, 0))
        for fyy in (-0.32, 0.34):
            cyl(f"Pad{sx}{fyy}", 0.02, 0.012, (x, fyy, 0.006), rubber)
    tube("Stretcher", [(-(w / 2 - 0.08), 0.0, 0.32), ((w / 2 - 0.08), 0.0, 0.32)], 0.012, steel)
    # Tilt quadrant with a knob, the detail you would reach for.
    torus("Quadrant", 0.09, 0.006, (w / 2 - 0.05, 0.0, pivot_h - 0.06), steel, rot=(0, PI / 2, 0))
    sphere("Knob", 0.018, (w / 2 - 0.02, -0.06, pivot_h - 0.1), rubber)
    export("drafting_table")


def domis_house():
    """The Domis house as a painted miniature: coral walls, puffy navy roof, warm lit windows, on a turned base."""
    reset()
    wall = mat("Wall", (0.86, 0.42, 0.33), rough=0.75)
    trim = mat("Trim", (0.95, 0.9, 0.8), rough=0.6)
    roof = mat("Roof", (0.17, 0.21, 0.36), rough=0.65)
    door = mat("Door", (0.18, 0.23, 0.38), rough=0.5)
    glow = mat("WindowGlow", (1.0, 0.75, 0.4), rough=0.3, emission=(1.0, 0.66, 0.32), strength=6.0)
    knob = mat("Brass", (0.9, 0.68, 0.3), rough=0.3, metal=1.0)
    grass = mat("Grass", (0.3, 0.46, 0.2), rough=0.9)
    leaf = mat("Leaf", (0.22, 0.38, 0.18), rough=0.85)
    trunk = mat("Trunk", (0.36, 0.23, 0.14), rough=0.8)
    base = mat("Plinth", (0.14, 0.09, 0.06), rough=0.45)
    stone = mat("Stone", (0.82, 0.78, 0.7), rough=0.85)
    chim = mat("Chimney", (0.55, 0.26, 0.21), rough=0.8)

    s = 1.0
    # Turned walnut plinth with a grass top.
    cyl("Plinth", 0.19, 0.03, (0, 0, 0.015), base, verts=64, bev=0.006)
    cyl("Lawn", 0.175, 0.012, (0, 0, 0.034), grass, verts=64, bev=0.005)
    floor = 0.04

    W, D, H = 0.17, 0.13, 0.1
    body = box("Body", (W, D, H), (0, 0.01, floor + H / 2), wall, bev=0.008)
    # Gable roof facing the front: two puffy slabs meeting at a ridge that runs front to back.
    rise = 0.08
    over = 0.016
    half = W / 2 + over
    run = W / 2
    ang = math.atan2(rise, run)
    slab = (half / math.cos(ang)) + 0.008
    ridge_z = floor + H + rise
    for sx in (-1, 1):
        cx = sx * half / 2
        cz = ridge_z - math.tan(ang) * half / 2 + 0.006
        box(f"Roof{sx}", (slab, D + 0.04, 0.016), (cx, 0.01, cz), roof, rot=(0, sx * ang, 0), bev=0.007)
    import bmesh as _bm
    me = bpy.data.meshes.new("Gable")
    bm = _bm.new()
    pts = [(-W / 2 + 0.002, floor + H - 0.002), (W / 2 - 0.002, floor + H - 0.002), (0, ridge_z - 0.006)]
    for sy in (-1, 1):
        vs = [bm.verts.new((x, 0.01 + sy * (D / 2 - 0.003), z)) for x, z in pts]
        bm.faces.new(vs if sy < 0 else list(reversed(vs)))
    _bm.ops.bridge_loops(bm, edges=bm.edges[:])
    _bm.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    g = bpy.data.objects.new("Gable", me)
    bpy.context.collection.objects.link(g)
    assign(g, wall)
    # Chimney.
    box("Chimney", (0.026, 0.026, 0.09), (0.05, 0.04, floor + H + 0.05), chim, bev=0.003)
    box("ChimneyCap", (0.032, 0.032, 0.008), (0.05, 0.04, floor + H + 0.097), stone, bev=0.002)

    front = 0.01 - D / 2 - 0.001
    # Arched door under an awning.
    box("Door", (0.034, 0.006, 0.058), (0, front, floor + 0.029), door, bev=0.004)
    sphere("Knob", 0.0035, (0.011, front - 0.004, floor + 0.028), knob)
    box("DoorTrim", (0.044, 0.004, 0.064), (0, front + 0.002, floor + 0.032), trim, bev=0.002)
    box("Awning", (0.06, 0.026, 0.006), (0, front - 0.012, floor + 0.068), roof, rot=(math.radians(-14), 0, 0), bev=0.002)
    # Windows: lit from inside, with trim and flower boxes.
    for sx in (-1, 1):
        x = sx * 0.055
        box(f"Win{sx}", (0.03, 0.004, 0.032), (x, front, floor + 0.055), glow, bev=0.0)
        box(f"WinTrim{sx}", (0.038, 0.004, 0.04), (x, front + 0.002, floor + 0.055), trim, bev=0.0015)
        box(f"WinBar{sx}", (0.002, 0.005, 0.032), (x, front - 0.001, floor + 0.055), trim, bev=0.0)
        box(f"FlowerBox{sx}", (0.036, 0.01, 0.008), (x, front - 0.006, floor + 0.034), chim, bev=0.0015)
        for k in range(4):
            sphere(f"Flower{sx}{k}", 0.004, (x - 0.012 + k * 0.008, front - 0.007, floor + 0.04), mat("Flower", (0.95, 0.55, 0.62), 0.7))
        # Side windows.
        box(f"SideWin{sx}", (0.004, 0.028, 0.03), (sx * (W / 2 + 0.001), 0.01, floor + 0.055), glow, bev=0.0)
    # Round attic window in the gable.
    cyl("Attic", 0.012, 0.004, (0, front + 0.001, floor + H + 0.026), glow, rot=(PI / 2, 0, 0), bev=0.0)
    torus("AtticTrim", 0.013, 0.0025, (0, front - 0.001, floor + H + 0.026), trim, rot=(PI / 2, 0, 0))
    # Stepping stones, a lollipop tree and two bushes.
    for i, (x, y) in enumerate([(0, -0.085), (0.008, -0.11), (-0.004, -0.135)]):
        cyl(f"Step{i}", 0.011, 0.004, (x, y, floor + 0.001), stone, verts=20, bev=0.0015)
    cyl("Trunk", 0.005, 0.07, (-0.12, -0.05, floor + 0.035), trunk, verts=12, bev=0.0)
    sphere("Canopy", 0.038, (-0.12, -0.05, floor + 0.09), leaf)
    sphere("Bush1", 0.022, (0.1, -0.075, floor + 0.012), leaf, scale=(1.2, 1, 0.8))
    sphere("Bush2", 0.018, (-0.07, -0.085, floor + 0.01), leaf, scale=(1.1, 1, 0.8))
    export("domis_house")


def kettlebells():
    """Two cast-iron kettlebells, side by side (12 and 16 kg)."""
    reset()
    iron = mat("Iron", (0.05, 0.05, 0.055), rough=0.55, metal=0.85)
    for i, (x, r) in enumerate([(-0.12, 0.085), (0.13, 0.1)]):
        b = sphere(f"Bell{i}", r, (x, 0, r * 0.92), iron, scale=(1, 1, 0.94))
        # Flat foot.
        cyl(f"Foot{i}", r * 0.55, 0.01, (x, 0, 0.005), iron, verts=32)
        # Handle: half torus standing on the bell, plus the horns.
        h = torus(f"Handle{i}", r * 0.62, r * 0.14, (x, 0, r * 1.62), iron, rot=(PI / 2, 0, 0))
        smooth(b, 1)
    export("kettlebells")


def exercise_mat():
    """A rubber mat unrolled most of the way, the last turn still curled."""
    reset()
    rubber = mat("MatRubber", (0.09, 0.1, 0.11), rough=0.85)
    L, W, T = 1.55, 0.6, 0.006
    box("Mat", (W, L, T), (0, 0, T / 2), rubber, bev=0.002)
    # Curl at the far end.
    R = 0.055
    bpy.ops.mesh.primitive_cylinder_add(radius=R, depth=W, location=(0, L / 2 + R * 0.7, R), rotation=(0, PI / 2, 0), vertices=48)
    roll = bpy.context.active_object
    roll.name = "Roll"
    assign(roll, rubber)
    for p in roll.data.polygons:
        p.use_smooth = True
    torus("RollEdgeL", R * 0.75, 0.004, (-W / 2, L / 2 + R * 0.7, R), rubber, rot=(0, PI / 2, 0))
    torus("RollEdgeR", R * 0.75, 0.004, (W / 2, L / 2 + R * 0.7, R), rubber, rot=(0, PI / 2, 0))
    export("exercise_mat")


def steering_wheel():
    """A desk-clamped driving wheel like the Memory Care station's: leather rim, three spokes, base unit."""
    reset()
    leather = mat("Leather", (0.03, 0.03, 0.032), rough=0.7)
    plastic = mat("Plastic", (0.06, 0.06, 0.065), rough=0.45)
    metal = mat("Brushed", (0.55, 0.55, 0.56), rough=0.3, metal=1.0)
    accent = mat("Accent", (0.25, 0.75, 0.78), rough=0.4, emission=(0.2, 0.7, 0.75), strength=1.5)

    # Built upright facing -Y around the origin, then tilted back as one piece.
    R = 0.135
    parts = [
        torus("Rim", R, 0.016, (0, 0, 0), leather, rot=(PI / 2, 0, 0), major=96, minor=20),
        cyl("Hub", 0.046, 0.045, (0, 0.012, 0), plastic, rot=(PI / 2, 0, 0), verts=48, bev=0.008),
        cyl("Badge", 0.018, 0.004, (0, -0.012, 0), metal, rot=(PI / 2, 0, 0), verts=32, bev=0.001),
        box("SpokeL", (R - 0.03, 0.014, 0.032), (-(R + 0.03) / 2, 0.004, -0.006), plastic, bev=0.005),
        box("SpokeR", (R - 0.03, 0.014, 0.032), ((R + 0.03) / 2, 0.004, -0.006), plastic, bev=0.005),
        box("SpokeLow", (0.034, 0.014, R - 0.03), (0, 0.004, -(R + 0.03) / 2), plastic, bev=0.005),
        box("PaddleL", (0.05, 0.008, 0.07), (-0.075, 0.04, 0.02), metal, bev=0.003),
        box("PaddleR", (0.05, 0.008, 0.07), (0.075, 0.04, 0.02), metal, bev=0.003),
        cyl("Shaft", 0.022, 0.08, (0, 0.06, 0), plastic, rot=(PI / 2, 0, 0), verts=24, bev=0.003),
    ]
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    wheel = bpy.context.active_object
    wheel.rotation_euler = (math.radians(90 - 24), 0, 0)
    wheel.location = (0, -0.02, 0.21)
    # Base unit with a status light and a desk clamp.
    box("Base", (0.21, 0.2, 0.15), (0, 0.11, 0.075), plastic, bev=0.025)
    box("Led", (0.05, 0.003, 0.006), (0, 0.009, 0.05), accent, bev=0.0)
    box("Clamp", (0.06, 0.04, 0.09), (0, 0.19, -0.02), metal, bev=0.004)
    export("steering_wheel")


def haptic_pucks():
    """The Memory Care footrest prototype: two haptic transducers taped to a white board."""
    reset()
    boardm = mat("Board", (0.85, 0.84, 0.8), rough=0.8)
    tape = mat("Tape", (0.92, 0.9, 0.82), rough=0.6)
    black = mat("Puck", (0.03, 0.03, 0.035), rough=0.5)
    teal = mat("Teal", (0.1, 0.62, 0.66), rough=0.35)
    cable = mat("Cable", (0.5, 0.06, 0.05), rough=0.5)
    box("Board", (0.62, 0.38, 0.012), (0, 0, 0.006), boardm, bev=0.002)
    for i, x in enumerate((-0.16, 0.16)):
        cyl(f"Puck{i}", 0.085, 0.03, (x, -0.02, 0.027), black, verts=64, bev=0.006)
        cyl(f"Face{i}", 0.04, 0.004, (x, -0.02, 0.043), teal, verts=48, bev=0.001)
        tube(f"Lead{i}", [(x, 0.06, 0.02), (x * 0.6, 0.12, 0.016), (x * 0.3, 0.17, 0.016)], 0.0025, cable)
    for k in range(5):
        box(f"Tape{k}", (0.6, 0.035, 0.0012), (0, -0.16 + k * 0.08, 0.0125), tape, bev=0.0)
    export("haptic_pucks")


def rounded_slab(name, w, h, t, r, material, loc=(0, 0, 0), seg=8):
    """A rounded-rectangle slab in XY, thickness t along Z (phones, laptop halves)."""
    import bmesh as _bm
    bm = _bm.new()
    outline = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            outline.append(bm.verts.new((cx + math.cos(a) * r, cy + math.sin(a) * r, -t / 2)))
    f = bm.faces.new(outline)
    ext = _bm.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, _bm.types.BMVert)]:
        v.co.z += t
    _bm.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = loc
    assign(o, material)
    bevel(o, min(t * 0.3, 0.0012), segments=3, angle=50)
    return o


def screen_quad(name, w, h, loc, rot=(0, 0, 0)):
    """The display surface: UVs 0..1, material named Screen (Unity swaps it for an emissive display)."""
    import bmesh as _bm
    bm = _bm.new()
    uv = bm.loops.layers.uv.new()
    vs = [bm.verts.new(p) for p in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
    f = bm.faces.new(vs)
    for loop, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uv].uv = (u, v)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    assign(o, mat("Screen", (0.02, 0.02, 0.02), rough=0.1))
    return o


def phone():
    """A modern phone lying face up: screen +Z, top edge toward +Y."""
    reset()
    body = mat("PhoneBody", (0.05, 0.05, 0.055), rough=0.35, metal=0.6)
    glass = mat("PhoneGlass", (0.01, 0.01, 0.012), rough=0.05)
    lens = mat("Lens", (0.02, 0.02, 0.03), rough=0.05, metal=0.3)
    W, H, T = 0.0715, 0.147, 0.0078
    rounded_slab("Body", W, H, T, 0.010, body, loc=(0, 0, T / 2))
    rounded_slab("Front", W - 0.0012, H - 0.0012, 0.0006, 0.0095, glass, loc=(0, 0, T + 0.0002))
    screen_quad("Screen", W - 0.0045, H - 0.0045, (0, 0, T + 0.0006))
    # Camera island on the back.
    rounded_slab("CamIsland", 0.03, 0.03, 0.0016, 0.007, body, loc=(-0.016, 0.052, -0.0007))
    for dx, dy in ((-0.007, 0.007), (0.007, -0.007), (-0.007, -0.007)):
        cyl("Lens", 0.0045, 0.0018, (-0.016 + dx, 0.052 + dy, -0.0016), lens, verts=24, bev=0.0004)
    export("phone")


def phone_stand():
    """A folding aluminium phone stand; the phone rests in landscape on its lip."""
    reset()
    alu = mat("Alu", (0.55, 0.56, 0.58), rough=0.35, metal=1.0)
    pad = mat("Pad", (0.03, 0.03, 0.03), rough=0.9)
    box("Foot", (0.09, 0.09, 0.005), (0, 0, 0.0025), alu, bev=0.0015)
    box("Back", (0.085, 0.004, 0.11), (0, 0.025, 0.052), alu, rot=(math.radians(-25), 0, 0), bev=0.0012)
    box("Lip", (0.085, 0.012, 0.012), (0, -0.012, 0.011), alu, bev=0.002)
    box("LipPad", (0.08, 0.004, 0.006), (0, -0.016, 0.018), pad, bev=0.001)
    export("phone_stand")


def laptop():
    """A dark laptop, lid open about 112 degrees: keyboard grid, trackpad, inset 1.4:1 display."""
    reset()
    shell = mat("Shell", (0.035, 0.036, 0.04), rough=0.55)
    keym = mat("Keys", (0.02, 0.02, 0.022), rough=0.7)
    bezel = mat("Bezel", (0.012, 0.012, 0.014), rough=0.2)
    W, D, T = 0.32, 0.225, 0.016
    rounded_slab("Base", W, D, T, 0.008, shell, loc=(0, 0, T / 2))
    # Keyboard: 6 rows of keys in a recessed well, and a trackpad.
    kw, kh, gap = 0.0155, 0.0145, 0.0035
    for r_ in range(6):
        cols = 14
        for c in range(cols):
            x = -W / 2 + 0.03 + c * (kw + gap) + kw / 2
            if x > W / 2 - 0.03:
                continue
            y = 0.075 - r_ * (kh + gap)
            box(f"Key{r_}_{c}", (kw, kh, 0.0025), (x, y, T + 0.0006), keym, bev=0.0008)
    box("Space", (0.1, kh, 0.0025), (0, 0.075 - 6 * (kh + gap), T + 0.0006), keym, bev=0.0008)
    rounded_slab("Trackpad", 0.1, 0.06, 0.0006, 0.005, bezel, loc=(0, -0.075, T + 0.0001))
    # Lid hinged at the back edge.
    open_deg = 112
    a = math.radians(open_deg - 90)
    hinge = (0, D / 2 - 0.004, T)
    lid_h = 0.215
    import mathutils
    lid = rounded_slab("Lid", W, lid_h, 0.007, 0.008, shell)
    face = rounded_slab("LidFace", W - 0.004, lid_h - 0.004, 0.0008, 0.007, bezel, loc=(0, 0, -0.0039))
    scr_w, scr_h = 0.27, 0.27 / 1.406
    scr = screen_quad("Screen", scr_w, scr_h, (0, 0.006, -0.0045), rot=(math.pi, 0, 0))
    for o in (lid, face, scr):
        # Lid local frame: Y up the lid, -Z toward the keyboard when closed. Rotate open about the hinge.
        o.location = mathutils.Vector(o.location) + mathutils.Vector((0, lid_h / 2, 0))
        o.location.rotate(mathutils.Euler((math.pi / 2 + a, 0, 0)))
        o.rotation_euler = (mathutils.Euler((math.pi / 2 + a, 0, 0)).to_matrix() @ mathutils.Euler(o.rotation_euler).to_matrix()).to_euler()
        o.location = mathutils.Vector(o.location) + mathutils.Vector(hinge)
    cyl("Hinge", 0.006, W * 0.8, (0, D / 2 - 0.004, T), shell, rot=(0, math.pi / 2, 0), verts=24, bev=0.001)
    export("laptop")


def round_display():
    """A wall-mounted round monitor: a porthole bezel around a circular screen (UV 0..1 over the disc)."""
    reset()
    shell = mat("Shell", (0.36, 0.34, 0.31), rough=0.45)
    dark = mat("Dark", (0.02, 0.02, 0.02), rough=0.3)
    import bmesh as _bm
    R = 0.24
    torus("Bezel", R + 0.015, 0.022, (0, -0.03, 0), shell, rot=(PI / 2, 0, 0), major=96, minor=24)
    cyl("Back", R + 0.02, 0.05, (0, 0.0, 0), shell, rot=(PI / 2, 0, 0), verts=96, bev=0.01)
    cyl("Mask", R + 0.004, 0.004, (0, -0.026, 0), dark, rot=(PI / 2, 0, 0), verts=96, bev=0.0)
    bm = _bm.new()
    uv = bm.loops.layers.uv.new()
    n = 96
    centre = bm.verts.new((0, -0.03, 0))
    ring = [bm.verts.new((math.cos(2 * PI * k / n) * R, -0.03, math.sin(2 * PI * k / n) * R)) for k in range(n)]
    for k in range(n):
        f = bm.faces.new((centre, ring[k], ring[(k + 1) % n]))
        for loop in f.loops:
            co = loop.vert.co
            loop[uv].uv = (0.5 + co.x / (2 * R), 0.5 + co.z / (2 * R))
    me = bpy.data.meshes.new("Screen")
    bm.to_mesh(me)
    o = bpy.data.objects.new("Screen", me)
    bpy.context.collection.objects.link(o)
    assign(o, mat("Screen", (0.02, 0.02, 0.02), rough=0.1))
    box("Bracket", (0.12, 0.05, 0.12), (0, 0.04, 0), shell, bev=0.01)
    export("round_display")


def _frame(name, pw, ph, wood_col, stand):
    reset()
    wood = mat("FrameWood", wood_col, rough=0.5)
    mount = mat("Mount", (0.86, 0.84, 0.78), rough=0.9)
    glassm = mat("FrameBack", (0.2, 0.15, 0.1), rough=0.8)
    m, b, d = 0.022, 0.016, 0.018  # mount margin, moulding width, depth
    W, H = pw + 2 * (m + b), ph + 2 * (m + b)
    z0 = H / 2
    for sx in (-1, 1):
        box(f"Side{sx}", (b, d, H), (sx * (W / 2 - b / 2), 0, z0), wood, bev=0.003)
    for sz in (-1, 1):
        box(f"Rail{sz}", (W - 2 * b, d, b), (0, 0, z0 + sz * (H / 2 - b / 2)), wood, bev=0.003)
    box("MountBoard", (W - 2 * b, 0.003, H - 2 * b), (0, 0.002, z0), mount, bev=0.0)
    box("Backing", (W - 0.01, 0.004, H - 0.01), (0, d / 2 - 0.002, z0), glassm, bev=0.0)
    import bmesh as _bm
    bm = _bm.new()
    uv = bm.loops.layers.uv.new()
    # Counter-clockwise seen from the front (-Y), so the print faces the room.
    vs = [bm.verts.new(p) for p in ((-pw / 2, -0.0005, z0 - ph / 2), (pw / 2, -0.0005, z0 - ph / 2),
                                    (pw / 2, -0.0005, z0 + ph / 2), (-pw / 2, -0.0005, z0 + ph / 2))]
    f = bm.faces.new(vs)
    for loop, (u, v) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uv].uv = (u, v)
    me = bpy.data.meshes.new("Photo")
    bm.to_mesh(me)
    o = bpy.data.objects.new("Photo", me)
    bpy.context.collection.objects.link(o)
    assign(o, mat("Photo", (0.5, 0.5, 0.5), rough=0.4))
    if stand:
        box("Strut", (0.03, 0.004, H * 0.8), (0, d / 2 + H * 0.16, H * 0.4), glassm, rot=(math.radians(-22), 0, 0), bev=0.0)
    export(name)


def frame_landscape():
    """Standing frame for a 4:3 photo."""
    _frame("frame_landscape", 0.2, 0.15, (0.12, 0.08, 0.05), stand=True)


def frame_portrait():
    """Standing frame for a tall print."""
    _frame("frame_portrait", 0.12, 0.213, (0.05, 0.05, 0.05), stand=True)


def frame_wall():
    """A larger wall frame, 4:3."""
    _frame("frame_wall", 0.36, 0.27, (0.06, 0.045, 0.035), stand=False)


def credenza():
    """A low Space Age walnut credenza on tapered legs: sliding doors, a recessed pull line."""
    reset()
    walnut = mat("Walnut", (0.22, 0.12, 0.07), rough=0.45)
    dark = mat("Shadow", (0.04, 0.03, 0.025), rough=0.8)
    brass = mat("Brass", (0.85, 0.65, 0.32), rough=0.3, metal=1.0)
    W, D, H = 1.3, 0.44, 0.38
    leg = 0.2
    box("Case", (W, D, H), (0, 0, leg + H / 2), walnut, bev=0.01)
    box("Recess", (W - 0.04, 0.004, H - 0.08), (0, -D / 2 - 0.0005, leg + H / 2), dark, bev=0.0)
    for i, x in enumerate((-W / 4, W / 4)):
        box(f"Door{i}", (W / 2 - 0.03, 0.012, H - 0.09), (x, -D / 2 - 0.006, leg + H / 2), walnut, bev=0.003)
        box(f"Pull{i}", (0.012, 0.006, H * 0.45), (x + (0.18 if i == 0 else -0.18), -D / 2 - 0.014, leg + H / 2), brass, bev=0.002)
    for sx in (-1, 1):
        for sy in (-1, 1):
            x, y = sx * (W / 2 - 0.08), sy * (D / 2 - 0.06)
            bpy.ops.mesh.primitive_cone_add(radius1=0.014, radius2=0.022, depth=leg, location=(x, y, leg / 2),
                                            rotation=(sy * 0.12, -sx * 0.12, 0), vertices=16)
            o = bpy.context.active_object
            assign(o, walnut)
            for p in o.data.polygons:
                p.use_smooth = True
            cyl(f"Cap{sx}{sy}", 0.015, 0.012, (x + sx * 0.012, y + sy * 0.012, 0.006), brass, verts=16, bev=0.002)
    export("credenza")


def turntable():
    """A turntable with a record spinning on it (the record is a separate 'Platter' child for Unity to spin)."""
    reset()
    plinth = mat("Plinth", (0.07, 0.06, 0.055), rough=0.35)
    alu = mat("Alu", (0.7, 0.7, 0.72), rough=0.25, metal=1.0)
    vinyl = mat("Vinyl", (0.012, 0.012, 0.014), rough=0.25)
    label = mat("Label", (0.6, 0.1, 0.12), rough=0.6)
    box("Plinth", (0.45, 0.35, 0.08), (0, 0, 0.04), plinth, bev=0.008)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl(f"Foot{sx}{sy}", 0.025, 0.02, (sx * 0.19, sy * 0.14, -0.005), alu, verts=24, bev=0.003)
    # Platter + record, grouped so Unity can find and spin it.
    pl = cyl("Platter", 0.15, 0.018, (-0.04, 0, 0.09), alu, verts=96, bev=0.002)
    rec = cyl("Record", 0.152, 0.003, (-0.04, 0, 0.1005), vinyl, verts=96, bev=0.0)
    for k in range(6):
        torus(f"Groove{k}", 0.07 + k * 0.013, 0.0006, (-0.04, 0, 0.1023), vinyl, minor=4)
    lab = cyl("RecordLabel", 0.045, 0.0015, (-0.04, 0, 0.103), label, verts=48, bev=0.0)
    cyl("Spindle", 0.0035, 0.02, (-0.04, 0, 0.11), alu, verts=12, bev=0.0)
    for o in (rec, lab):
        o.parent = pl
        o.matrix_parent_inverse = pl.matrix_world.inverted()
    # Tonearm resting on the record.
    cyl("ArmBase", 0.022, 0.03, (0.16, 0.1, 0.095), alu, verts=32, bev=0.003)
    tube("Arm", [(0.16, 0.1, 0.112), (0.12, -0.02, 0.112), (0.04, -0.06, 0.108)], 0.0035, alu)
    box("Headshell", (0.02, 0.03, 0.008), (0.035, -0.07, 0.106), plinth, rot=(0, 0, 0.5), bev=0.002)
    cyl("Counterweight", 0.012, 0.025, (0.17, 0.13, 0.112), alu, rot=(math.radians(90), 0, math.radians(-20)), verts=24, bev=0.002)
    export("turntable")


def neon_sign():
    """'hridae' in glass tube neon (Tilt Neon, OFL) on a clear acrylic backer."""
    import os
    reset()
    font = bpy.data.fonts.load(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts", "TiltNeon.ttf"))
    tube_m = mat("NeonTube", (1.0, 0.2, 0.75), rough=0.2, emission=(1.0, 0.18, 0.72), strength=4.0)
    curve = bpy.data.curves.new("NeonText", "FONT")
    curve.body = "hridae"
    curve.font = font
    curve.size = 0.26
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.extrude = 0.004
    curve.bevel_depth = 0.0025
    t = bpy.data.objects.new("Neon", curve)
    bpy.context.collection.objects.link(t)
    t.rotation_euler = (math.pi / 2, 0, 0)
    t.location = (0, -0.03, 0)
    bpy.context.view_layer.objects.active = t
    t.select_set(True)
    bpy.ops.object.convert(target="MESH")
    assign(bpy.context.active_object, tube_m)
    # Acrylic backer and standoffs.
    acrylic = mat("Acrylic", (0.015, 0.015, 0.02), rough=0.05)
    box("Backer", (0.86, 0.008, 0.3), (0, -0.012, 0), acrylic, bev=0.003)
    for sx in (-1, 1):
        for sz in (-1, 1):
            cyl(f"Standoff{sx}{sz}", 0.006, 0.02, (sx * 0.39, -0.002, sz * 0.12), mat("Steel", (0.6, 0.6, 0.6), 0.3, 1.0), rot=(math.pi / 2, 0, 0), verts=12, bev=0.0)
    export("neon_sign")


def monitor():
    """A slim wall-mounted monitor on a short arm: 16:10 Screen surface, UV 0..1."""
    reset()
    shell = mat("Shell", (0.03, 0.03, 0.035), rough=0.4)
    W, H = 0.6, 0.375
    rounded_slab("Panel", W, H, 0.022, 0.006, shell, loc=(0, 0, 0))
    screen_quad("Screen", W - 0.016, H - 0.016, (0, 0, 0.0115))
    for o in list(bpy.context.scene.objects):
        o.rotation_euler = (math.pi / 2, 0, 0)
        o.location = (o.location.x, -o.location.z, o.location.y)
    # Arm back to the wall (+Y).
    box("Arm", (0.04, 0.12, 0.04), (0, 0.07, 0), shell, bev=0.006)
    box("WallPlate", (0.12, 0.012, 0.12), (0, 0.13, 0), shell, bev=0.003)
    export("monitor")


ALL = {f.__name__: f for f in (credenza, turntable, neon_sign, monitor, frame_landscape, frame_portrait, frame_wall, round_display, phone, phone_stand, laptop, drafting_table, domis_house, kettlebells, exercise_mat, steering_wheel, haptic_pucks)}
