"""One-off: copy hero expanded PNGs from Figma export zip into public/. Run from repo root."""
import os
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIP = os.path.join(ROOT, "Create React Card Component.zip")
OUT = os.path.join(ROOT, "public", "assets", "home", "hero-card-expanded")

# zip_inner_path -> kebab filename
MAPPING = {
    "src/imports/Component24/8df67b793a95dd2dda45eaff5364cc944949d138.png": "about-primary.png",
    "src/imports/Component24/37e684ae8291872636e7a1395a3a7b5148e28c06.png": "tilt-1.png",
    "src/imports/Component24/f38c2fa03505041b5b28edde23240f1ab080a32d.png": "tilt-2.png",
    "src/imports/Component24/213ad03b598ce1686fe9f29c28f84c987a417e54.png": "tilt-3.png",
    "src/imports/Component24/ebbb67bdd23da65773e74908796f277f611b11c2.png": "tilt-4.png",
    "src/imports/Component24/0077ddd295e284dbca4fca3cbe37e4c539bec8a9.png": "game-1.png",
    "src/imports/Component24/c42d17d2fc5427c147b741da22557bfe5062dae0.png": "game-2.png",
    "src/imports/Component24/71f493ffad5503082ba7a2cae8b0cf5c5024c4d9.png": "game-3.png",
    "src/imports/Component24/f48b5484dae72f9aafcd4a455a9188a51c597e07.png": "album-1.png",
    "src/imports/Component24/c3e9349a1dab52ea8cd6f24abdd5da2ca93d5dd8.png": "album-2.png",
    "src/imports/Component24/6e8b65b0caa86bd3dfee7926951f044838fb49de.png": "album-3.png",
    "src/imports/Component24/7ff77fd7f73851f47885a20906f4453197effbf1.png": "move-1.png",
    "src/imports/Component24/7776bbb5a5802d3667e8229d6aedac520bd7bc28.png": "move-2.png",
    "src/imports/Component24/f341f36368c84642ee10bdeb01b09da4a65663f5.png": "move-3.png",
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    with zipfile.ZipFile(ZIP, "r") as zf:
        for inner, name in MAPPING.items():
            dest = os.path.join(OUT, name)
            with zf.open(inner) as src, open(dest, "wb") as out:
                out.write(src.read())
            print("wrote", dest)


if __name__ == "__main__":
    main()
