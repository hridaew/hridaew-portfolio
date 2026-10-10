"""Soft goods. Front faces -Y, Z up."""
import math
import os

import bmesh
import bpy
from mathutils import Vector

from common import OUT, assign, box, cyl, export, mat, reset, sphere

PI = math.pi


def scarf():
    """A red and white terrace scarf folded over a wall hook: a knit strip swept along a hand-placed path."""
    reset()
    red = mat("ScarfRed", (0.5, 0.018, 0.025), rough=0.92)
    white = mat("ScarfWhite", (0.85, 0.84, 0.8), rough=0.92)
    Wd, T = 0.19, 0.008
    # Path in the YZ plane (Y out from the wall, Z up): back tail hugging the wall, over the hook, front tail.
    path = [(-0.02, -0.62), (-0.025, -0.4), (-0.03, -0.2), (-0.035, -0.05), (-0.045, 0.015), (-0.07, 0.03),
            (-0.095, 0.01), (-0.105, -0.06), (-0.112, -0.25), (-0.118, -0.5), (-0.13, -0.72), (-0.14, -0.86)]
    # Resample densely with Catmull-Rom.
    pts = []
    for i in range(len(path) - 1):
        p0 = path[max(i - 1, 0)]; p1 = path[i]; p2 = path[i + 1]; p3 = path[min(i + 2, len(path) - 1)]
        for k in range(12):
            t = k / 12
            t2, t3 = t * t, t * t * t
            pts.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in range(2)))
    pts.append(path[-1])
    lengths = [0.0]
    for i in range(1, len(pts)):
        lengths.append(lengths[-1] + math.dist(pts[i], pts[i - 1]))
    total = lengths[-1]

    bm = bmesh.new()
    cols = 9
    rows = []
    for i, (y, z) in enumerate(pts):
        u = lengths[i] / total
        # Tangent and normal in YZ.
        j0, j1 = max(i - 1, 0), min(i + 1, len(pts) - 1)
        ty, tz = pts[j1][0] - pts[j0][0], pts[j1][1] - pts[j0][1]
        n = math.hypot(ty, tz) or 1
        ny, nz = -tz / n, ty / n
        # Soft knit folds: a gentle wave across the width, a slow twist toward the hanging ends.
        sway = 0.012 * math.sin(u * 23.0) * min(1.0, abs(u - 0.5) * 3)
        twist = 0.1 * math.sin(u * 7.0) * abs(u - 0.5)
        row = []
        for c in range(cols):
            x = (c / (cols - 1) - 0.5) * Wd
            fold = 0.006 * math.sin(c / (cols - 1) * PI) * math.sin(u * 40.0)
            off = sway + fold + x * twist
            for side in (-1, 1):
                pass
            row.append(bm.verts.new((x + 0.0, y + ny * off, z + nz * off)))
        rows.append(row)
    uvl = bm.loops.layers.uv.new()
    for i in range(len(rows) - 1):
        for c in range(cols - 1):
            f = bm.faces.new((rows[i][c], rows[i][c + 1], rows[i + 1][c + 1], rows[i + 1][c]))
            # U across the width, V along the length (0 = wall end, 1 = front end): the knit texture maps here.
            for loop, (ci, ri) in zip(f.loops, ((c, i), (c + 1, i), (c + 1, i + 1), (c, i + 1))):
                loop[uvl].uv = (ci / (cols - 1), lengths[ri] / total)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new("Scarf")
    bm.to_mesh(me)
    o = bpy.data.objects.new("Scarf", me)
    bpy.context.collection.objects.link(o)
    knit = bpy.data.materials.new("ScarfKnit")
    knit.use_nodes = True
    nt = knit.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(os.path.join(os.path.dirname(os.path.abspath(__file__)), "textures", "scarf_knit.png"))
    nt.links.new(tex.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.95
    o.data.materials.append(knit)
    sol = o.modifiers.new("Thick", "SOLIDIFY")
    sol.thickness = T
    sol.offset = 0
    sub = o.modifiers.new("Subd", "SUBSURF")
    sub.levels = 1
    for p in o.data.polygons:
        p.use_smooth = True
    # Fringe at both ends.
    fringe = mat("Fringe", (0.85, 0.84, 0.8), rough=0.95)
    for end in (0, len(pts) - 1):
        y, z = pts[end]
        for c in range(14):
            x = (c / 13 - 0.5) * Wd * 0.95
            cyl(f"Tassel{end}_{c}", 0.0025, 0.05, (x, y, z - 0.025), fringe, verts=6, bev=0.0)
    # The hook.
    steel = mat("Hook", (0.08, 0.08, 0.08), rough=0.4, metal=1.0)
    cyl("Hook", 0.011, 0.11, (0, -0.055, 0.0), steel, rot=(PI / 2, 0, 0), verts=24, bev=0.002)
    cyl("Rose", 0.025, 0.012, (0, -0.006, 0.0), steel, rot=(PI / 2, 0, 0), verts=32, bev=0.002)
    export("scarf")


ALL = {f.__name__: f for f in (scarf,)}
