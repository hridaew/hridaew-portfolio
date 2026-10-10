"""Headless entry: blender -b -P Blender/build.py -- [asset ...]   (no names = all)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import props  # noqa: E402
import soft  # noqa: E402

ALL = {**props.ALL, **soft.ALL}
names = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
for name in names or ALL:
    ALL[name]()
