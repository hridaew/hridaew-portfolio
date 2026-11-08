"""Hridae's head for the room: the photo-fitted scan (FaceVerse, MIT) in clay, hair and beard sculpted into the surface.

Blender, headless:  blender -b --factory-startup -P build_me_head.py -- <out.glb> [<preview.png>]
Blender is Z-up with the face toward -Y; the export is glTF Y-up with the face toward +Z, origin at the skull base
(the scan rig's head pivot), so it sits on a body's head bone.
"""
import bpy, bmesh, math, sys
from mathutils import Vector

SRC = r"C:\Users\Hridae Walia\Documents\Codex\2026-10-21\is-x20\outputs\complete-head-v2\head_LOD1.glb"
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0]
PREVIEW = argv[1] if len(argv) > 1 else None
PIVOT = Vector((0.0, 0.015, -0.06))  # the scan rig's head bone: base of the skull

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
objs = {o.name: o for o in bpy.context.scene.objects}

# Teeth and tongue are never seen; the eyes stay (white clay eyes, like a sculpture).
for n in ("lower_teeth_LOD1", "upper_teeth_LOD1", "tongue_LOD1"):
    bpy.data.objects.remove(objs[n], do_unlink=True)
head, eyes = objs["head_LOD1"], [objs["left_eye_LOD1"], objs["right_eye_LOD1"]]
for o in [head] + eyes:
    for m in list(o.modifiers):
        o.modifiers.remove(m)
    o.parent = None
    if o.data.shape_keys:
        o.shape_key_clear()
bpy.data.objects.remove(objs["HeadRig"], do_unlink=True)

# ---- where hair and beard grow, and how thick ----
def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)

def hair_weight(v):
    """Thickness of hair (m) at a scalp point. Hairline from the photos: high at the front, above the ears at the
    sides, down to the nape at the back."""
    x, y, z = v
    c = -y / max(1e-6, math.hypot(x, y))  # 1 = straight ahead (face is -Y), -1 = straight back
    if c > 0:
        line = 0.03 + (0.098 - 0.03) * (c ** 1.3)
    else:
        line = 0.03 + (-0.05 - 0.03) * ((-c) ** 0.9)
    inside = smooth(line - 0.004, line + 0.018, z)
    # The ears stay clear (hair sits just above them).
    ear = smooth(0.078, 0.092, abs(x)) * (1 - smooth(0.045, 0.062, z)) * (1 - smooth(0.035, 0.055, abs(y - 0.005)))
    inside *= 1 - ear
    # Volume: big and curly on top, close at the sides and back.
    top = smooth(0.05, 0.13, z)
    front = smooth(0.2, 0.9, c)
    thick = 0.009 + 0.022 * top + 0.006 * top * front
    return inside * thick

def beard_weight(v):
    """Beard presence 0..1: jaw, chin and cheeks below the cheekbones, a moustache; the lips stay clear."""
    x, y, z = v
    if y > 0.03:  # behind the jaw line
        return 0.0
    cheek = 1 - smooth(-0.004, 0.012, z + 0.02 * (1 - smooth(0.03, 0.07, abs(x))))  # lower face only
    side = smooth(0.0, 0.03, -y + 0.03)
    lips = smooth(0.0, 0.006, abs(x) - 0.026) if -0.058 < z < -0.022 and y < -0.07 else 1.0
    stache = 1.0 if (-0.03 < z < -0.012 and abs(x) < 0.034 and y < -0.07) else 0.0
    w = max(cheek * side * lips, stache * 0.8)
    under = smooth(-0.11, -0.085, z)  # fades out under the chin toward the neck
    return w * (0.35 + 0.65 * under)

HAIR_MAX = 0.05
hair_g = head.vertex_groups.new(name="hair")
hair_on = head.vertex_groups.new(name="hair_on")
beard_g = head.vertex_groups.new(name="beard")
for v in head.data.vertices:
    p = head.matrix_world @ v.co
    hw = hair_weight(p)
    if hw > 1e-4:
        hair_g.add([v.index], min(1.0, hw / HAIR_MAX), "REPLACE")
        hair_on.add([v.index], min(1.0, hw / 0.012), "REPLACE")
    bw = beard_weight(p)
    if bw > 1e-3:
        beard_g.add([v.index], bw, "REPLACE")

# ---- sculpt: subdivide, push the hair out, break it into curls, give the beard a stubbly relief ----
def mod(obj, kind, **kw):
    m = obj.modifiers.new(kind.lower(), kind)
    for k, val in kw.items():
        setattr(m, k, val)
    return m

mod(head, "SUBSURF", levels=1, render_levels=1, subdivision_type="SIMPLE")
mod(head, "DISPLACE", direction="NORMAL", mid_level=0.0, strength=HAIR_MAX, vertex_group="hair")
curls = bpy.data.textures.new("curls", "VORONOI")
curls.noise_scale = 0.022
curls.distance_metric = "DISTANCE"
curls.intensity = 1.2
mod(head, "DISPLACE", direction="NORMAL", mid_level=0.55, strength=0.013, vertex_group="hair_on", texture=curls, texture_coords="GLOBAL")
stubble = bpy.data.textures.new("stubble", "CLOUDS")
stubble.noise_scale = 0.006
stubble.noise_depth = 1
mod(head, "DISPLACE", direction="NORMAL", mid_level=0.0, strength=0.0045, vertex_group="beard")
mod(head, "DISPLACE", direction="NORMAL", mid_level=0.5, strength=0.0016, vertex_group="beard", texture=stubble, texture_coords="GLOBAL")
mod(head, "SMOOTH", factor=0.5, iterations=2, vertex_group="hair_on")
mod(head, "DECIMATE", ratio=0.42)

bpy.context.view_layer.objects.active = head
for o in [head] + eyes:
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
bpy.ops.object.select_all(action="DESELECT")
for o in [head] + eyes:
    o.select_set(True)
bpy.context.view_layer.objects.active = head
bpy.ops.object.join()
me = bpy.context.view_layer.objects.active
me.name = "me_head"
me.vertex_groups.clear()
me.data.materials.clear()
for uv in list(me.data.uv_layers):
    me.data.uv_layers.remove(uv)
for a in [a for a in me.data.attributes if a.name.startswith("Col") or a.domain == "CORNER" and a.name != "sharp_face"]:
    pass
# Origin at the skull base.
me.data.transform(__import__("mathutils").Matrix.Translation(-PIVOT))
me.location = (0, 0, 0)
bpy.ops.object.shade_smooth()
print("VERTS", len(me.data.vertices), "TRIS", sum(len(p.vertices) - 2 for p in me.data.polygons))

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_texcoords=False, export_materials="NONE",
                          export_yup=True, export_apply=True, export_skins=False, export_morph=False, export_animations=False)
print("WROTE", OUT)

if PREVIEW:
    # Three views in plain white clay, to judge the sculpt.
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x, scene.render.resolution_y = 1500, 600
    mat = bpy.data.materials.new("clay")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.86, 0.86, 0.86, 1)
    bsdf.inputs["Roughness"].default_value = 0.85
    world = bpy.data.worlds.new("w")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.12, 0.12, 0.13, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.6
    sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
    sun.data.energy = 3.2
    sun.rotation_euler = (math.radians(50), math.radians(-20), math.radians(-35))
    scene.collection.objects.link(sun)
    for i, ang in enumerate((0, -40, -90)):
        dup = me.copy()
        dup.data = me.data.copy()
        dup.data.materials.append(mat)
        dup.data.transform(__import__("mathutils").Matrix.Rotation(math.radians(ang), 4, "Z"))
        dup.location = ((i - 1) * 0.32, 0, 0)
        scene.collection.objects.link(dup)
    me.hide_render = True
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 1.0
    cam.location = (0, -2, 0.1)
    cam.rotation_euler = (math.radians(90), 0, 0)
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)
    print("PREVIEW", PREVIEW)
