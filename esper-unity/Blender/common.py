"""Shared helpers for ESPER's Blender-authored props. Run via Blender/build.py (headless)."""
import math
import os

import bmesh
import bpy

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Assets", "Esper", "Models")


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, color, rough=0.6, metal=0.0, emission=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emission:
        b.inputs["Emission Color"].default_value = (*emission, 1.0)
        b.inputs["Emission Strength"].default_value = strength
    return m


def assign(obj, material):
    obj.data.materials.clear()
    obj.data.materials.append(material)
    return obj


def bevel(obj, width=0.004, segments=3, angle=40):
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle)
    m.harden_normals = True
    return obj


def smooth(obj, levels=2):
    m = obj.modifiers.new("Subd", "SUBSURF")
    m.levels = levels
    m.render_levels = levels
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def shade_smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def box(name, size, loc, material, rot=(0, 0, 0), bev=0.003):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    assign(o, material)
    if bev:
        bevel(o, bev)
    return o


def cyl(name, r, depth, loc, material, rot=(0, 0, 0), verts=32, bev=0.002):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    assign(o, material)
    shade_smooth(o)
    if bev:
        bevel(o, bev, angle=60)
    return o


def sphere(name, r, loc, material, scale=(1, 1, 1), seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=seg, ring_count=seg // 2)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    assign(o, material)
    return shade_smooth(o)


def torus(name, R, r, loc, material, rot=(0, 0, 0), major=64, minor=16):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot,
                                     major_segments=major, minor_segments=minor)
    o = bpy.context.active_object
    o.name = name
    assign(o, material)
    return shade_smooth(o)


def tube(name, points, r, material, segments=12):
    """A tube along a polyline (steel frames, cables)."""
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = r
    curve.bevel_resolution = 3
    curve.use_fill_caps = True
    spl = curve.splines.new("POLY")
    spl.points.add(len(points) - 1)
    for i, p in enumerate(points):
        spl.points[i].co = (*p, 1)
    o = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.active_object
    assign(o, material)
    return shade_smooth(o)


def export(name):
    """Apply modifiers and export everything as GLB. Blender is Z-up; glTF export converts to Y-up."""
    os.makedirs(OUT, exist_ok=True)
    path = os.path.abspath(os.path.join(OUT, f"{name}.glb"))
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_apply=True, use_selection=True,
                              export_yup=True)
    print("exported", path)
    preview(name)


def preview(name):
    """Quick Eevee turnaround frame for review (Review/blender_<name>.png)."""
    import mathutils
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    lo = mathutils.Vector((min(min((o.matrix_world @ mathutils.Vector(c)).x for c in o.bound_box) for o in objs),
                           min(min((o.matrix_world @ mathutils.Vector(c)).y for c in o.bound_box) for o in objs),
                           min(min((o.matrix_world @ mathutils.Vector(c)).z for c in o.bound_box) for o in objs)))
    hi = mathutils.Vector((max(max((o.matrix_world @ mathutils.Vector(c)).x for c in o.bound_box) for o in objs),
                           max(max((o.matrix_world @ mathutils.Vector(c)).y for c in o.bound_box) for o in objs),
                           max(max((o.matrix_world @ mathutils.Vector(c)).z for c in o.bound_box) for o in objs)))
    centre = (lo + hi) / 2
    radius = (hi - lo).length / 2
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new("PreviewCam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    scene.collection.objects.link(cam)
    d = mathutils.Vector((0.75, -1.0, 0.55)).normalized()
    cam.location = centre + d * radius * 2.9
    cam.rotation_euler = (centre - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    key = bpy.data.lights.new("Key", "AREA")
    key.energy = 2500 * max(radius, 0.1) ** 2
    key.size = radius * 2
    k = bpy.data.objects.new("Key", key)
    k.location = centre + mathutils.Vector((-1.2, -1.0, 1.6)) * radius * 2.5
    k.rotation_euler = (centre - k.location).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(k)
    world = bpy.data.worlds.new("W")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.05, 0.06, 1)
    scene.world = world
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 640
    scene.render.resolution_y = 480
    scene.render.filepath = os.path.abspath(os.path.join(OUT, "..", "..", "..", "Review", f"blender_{name}.png"))
    bpy.ops.render.render(write_still=True)
