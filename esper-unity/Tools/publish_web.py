"""Publish ESPER for the live site.

Copies esper-unity/Live/scene.json to public/esper/live/scene.json, and every asset the scene uses (models with
their buffers and textures, pictures, the splat, the people) to public/esper/assets/, at the same paths the dev
asset route serves them from. Production reads from there; nothing else in esper-unity ships.

Run from the repo root:  python esper-unity/Tools/publish_web.py
"""
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSETS = os.path.join(ROOT, "esper-unity", "Assets")
SCENE = os.path.join(ROOT, "esper-unity", "Live", "scene.json")
OUT = os.path.join(ROOT, "public", "esper")
PEOPLE = ["Eric", "Carla", "Claudia"]  # three/EsperEngine.ts PEOPLE


def model_path(src):
    """Mirrors EsperEngine.url()."""
    if src.startswith("ph:"):
        i = src[3:]
        return f"ThirdParty/PolyHaven/Models/{i}/{i}_2k.gltf"
    for prefix, folder in (("esper:", "Esper/Models"), ("kenney:", "ThirdParty/Kenney"), ("rp:", "ThirdParty/Renderpeople")):
        if src.startswith(prefix):
            return f"{folder}/{src[len(prefix):]}.glb"
    raise ValueError(f"unknown model source {src}")


def walk(items):
    for it in items:
        yield it
        yield from walk(it.get("children", []))


def slim(dest):
    """The room is white clay: models keep only their normal and AO (arm) maps, so colour maps become a 4 px
    stand-in (the glTF stays valid) and the rest drop to 1K, plenty at this distance. Returns the new total size."""
    from PIL import Image

    for dirpath, _, names in os.walk(os.path.join(dest, "ThirdParty", "PolyHaven")):
        for n in names:
            if not n.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            p = os.path.join(dirpath, n)
            im = Image.open(p)
            if "_diff_" in n:
                im = Image.new("RGB", (4, 4), (235, 235, 235))
            elif max(im.size) > 1024:
                im = im.resize((1024, 1024 * im.size[1] // im.size[0]), Image.LANCZOS)
            if n.lower().endswith(".png"):
                im.save(p, optimize=True)
            else:
                im.convert("RGB").save(p, quality=84, optimize=True)
    # Pictures on screens, shelves and walls: no bigger than they ever show. A record sleeve is a few centimetres of
    # screen even up close (512 px); a TV or projector fills more of it (1024 px).
    for dirpath, _, names in os.walk(os.path.join(dest, "Esper", "Content")):
        for n in names:
            if not n.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            p = os.path.join(dirpath, n)
            im = Image.open(p)
            cap = 512 if os.path.basename(dirpath) in ("Albums", "Games") else 1024
            if max(im.size) > cap:
                k = cap / max(im.size)
                im = im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)
            if n.lower().endswith(".png"):
                (im if im.mode in ("RGB", "RGBA", "L", "LA", "P") else im.convert("RGBA")).save(p, optimize=True)
            else:
                im.convert("RGB").save(p, quality=82, optimize=True, progressive=True)
    return sum(os.path.getsize(os.path.join(d, n)) for d, _, ns in os.walk(dest) for n in ns)


def main():
    scene = json.load(open(SCENE, encoding="utf8"))
    files = set()
    for it in walk(scene["items"]):
        if it.get("kind") == "model" and it.get("src"):
            files.add(model_path(it["src"]))
        if it.get("kind") == "splat" and it.get("src"):
            files.add("Esper/" + it["src"])
        # A person wearing their own head (Hridae), and a record's label art.
        if it.get("kind") == "person" and (it.get("head") or {}).get("src"):
            files.add(model_path(it["head"]["src"]))
        if it.get("kind") == "turntable":
            files.add("Esper/" + (it.get("src") or "Content/Albums/motm2_front.jpg"))
        d = it.get("display") or {}
        for src in [d.get("src")] + list(d.get("active") or []):
            if src:
                files.add("Esper/" + src)
    files |= {f"ThirdParty/Renderpeople/{p}.glb" for p in PEOPLE}
    # A .gltf pulls in its buffers and textures.
    for f in [f for f in files if f.endswith(".gltf")]:
        g = json.load(open(os.path.join(ASSETS, f), encoding="utf8"))
        base = os.path.dirname(f)
        for ref in [b.get("uri") for b in g.get("buffers", [])] + [im.get("uri") for im in g.get("images", [])]:
            if ref and not ref.startswith("data:"):
                files.add(f"{base}/{ref}")

    dest = os.path.join(OUT, "assets")
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    missing, total = [], 0
    for f in sorted(files):
        src = os.path.join(ASSETS, f)
        if not os.path.isfile(src):
            missing.append(f)
            continue
        out = os.path.join(dest, f)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        shutil.copy2(src, out)
        total += os.path.getsize(src)
    slim(dest)
    # Models: Meshopt geometry compression, every node kept (the hand solver aims the empty fingertip bones).
    import subprocess
    subprocess.run(["node", os.path.join(ROOT, "scripts", "compress-esper-models.mjs"), dest], check=True, cwd=ROOT)
    total = sum(os.path.getsize(os.path.join(d, n)) for d, _, ns in os.walk(dest) for n in ns)
    os.makedirs(os.path.join(OUT, "live"), exist_ok=True)
    shutil.copy2(SCENE, os.path.join(OUT, "live", "scene.json"))
    print(f"{len(files) - len(missing)} files, {total / 1e6:.1f} MB -> public/esper/assets")
    if missing:
        print("MISSING:", *missing, sep="\n  ")
        sys.exit(1)


if __name__ == "__main__":
    main()
