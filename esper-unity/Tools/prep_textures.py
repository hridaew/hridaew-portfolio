"""Pack Poly Haven roughness into URP Lit metallic/smoothness maps (R=metal, A=smoothness)."""
import pathlib, sys
from PIL import Image, ImageOps
root = pathlib.Path(sys.argv[1])
for d in sorted(root.iterdir()):
    rough = next(d.glob("*_rough.*"), None)
    out = d / f"{d.name}_ms.png"
    if not rough or out.exists():
        continue
    r = ImageOps.grayscale(Image.open(rough))
    smooth = ImageOps.invert(r)
    black = Image.new("L", r.size, 0)
    Image.merge("RGBA", (black, black, black, smooth)).save(out)
    print("ms", d.name)
