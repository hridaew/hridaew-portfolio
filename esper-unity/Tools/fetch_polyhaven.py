"""Fetch CC0 assets from Poly Haven into Assets/ThirdParty/PolyHaven.

Usage: python -P Tools/fetch_polyhaven.py models <id> [<id> ...]
       python -P Tools/fetch_polyhaven.py textures <id> [<id> ...]
       python -P Tools/fetch_polyhaven.py hdris <id> [<id> ...]
Re-running skips files that already exist. Appends each asset to ASSETS.md.
"""
import json
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEST = ROOT / "Assets" / "ThirdParty" / "PolyHaven"
LEDGER = ROOT / "ASSETS.md"
UA = {"User-Agent": "esper-portfolio-asset-fetch/1.0"}
RES = "2k"


def get_json(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r:
        return json.load(r)


def download(url, path):
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA)) as r:
        path.write_bytes(r.read())


def ledger(kind, asset_id):
    line = f"| {asset_id} | Poly Haven {kind} | CC0 | https://polyhaven.com/a/{asset_id} |\n"
    if not LEDGER.exists():
        LEDGER.write_text("| Asset | Source | Licence | URL |\n|---|---|---|---|\n")
    if line not in LEDGER.read_text():
        with LEDGER.open("a") as f:
            f.write(line)


def fetch_model(asset_id, res):
    files = get_json(f"https://api.polyhaven.com/files/{asset_id}")
    entry = files["gltf"].get(res) or files["gltf"]["1k"]
    gltf = entry["gltf"]
    out = DEST / "Models" / asset_id
    download(gltf["url"], out / pathlib.Path(gltf["url"]).name)
    for rel, inc in gltf.get("include", {}).items():
        download(inc["url"], out / rel)


def fetch_texture(asset_id, res):
    files = get_json(f"https://api.polyhaven.com/files/{asset_id}")
    out = DEST / "Textures" / asset_id
    for key, name in (("Diffuse", "diff"), ("nor_gl", "nor_gl"), ("Rough", "rough"), ("AO", "ao"), ("Displacement", "disp")):
        if key in files and res in files[key]:
            src = files[key][res]["jpg"]["url"] if "jpg" in files[key][res] else files[key][res]["png"]["url"]
            download(src, out / f"{asset_id}_{name}{pathlib.Path(src).suffix}")


def fetch_hdri(asset_id, res):
    files = get_json(f"https://api.polyhaven.com/files/{asset_id}")
    src = files["hdri"][res]["hdr"]["url"]
    download(src, DEST / "HDRI" / f"{asset_id}_{res}.hdr")


def main():
    kind, ids = sys.argv[1], sys.argv[2:]
    fn = {"models": fetch_model, "textures": fetch_texture, "hdris": fetch_hdri}[kind]
    for asset_id in ids:
        res = RES
        if ":" in asset_id:
            asset_id, res = asset_id.split(":")
        try:
            fn(asset_id, res)
            ledger(kind[:-1], asset_id)
            print("ok", asset_id)
        except Exception as e:  # keep going; report at the end
            print("FAIL", asset_id, e)


if __name__ == "__main__":
    main()
