using System.Collections.Generic;

namespace Esper.Live
{
    /// The room as data: esper-unity/Live/scene.json. The builder bakes it; the page applies it live.
    /// Units are metres and degrees. Positions/rotations are world space for top-level items and
    /// local space for an item's children.
    public class LiveSceneSpec
    {
        public List<ItemSpec> items = new();
        public List<LightSpec> lights = new();
        public List<ViewSpec> views = new();
        public List<StationSpec> stations = new();
        public Dictionary<string, float> look = new();
    }

    public class ItemSpec
    {
        /// Stable id, e.g. "virdio/tv". Children ids are local to their parent.
        public string id;
        /// Station group the item belongs to (its parent under Props), e.g. "Virdio".
        public string group;
        /// model | box | quad | print | group
        public string kind;
        /// model: "ph:<polyhaven id>" or "esper:<blender model>"; quad/print: content path, e.g. "Content/Domis/hero.jpg".
        public string src;
        public float[] p;
        public float[] r;
        public float[] s;
        /// box: size in metres.
        public float[] size;
        /// box/quad: a material from the library (Generated/Materials) by name.
        public string material;
        /// print: width, height, curl.
        public float w, h, curl;
        public bool noShadows;
        public bool hidden;
        public DisplaySpec display;
        public PhotoSpec photo;
        public SpinSpec spin;
        public float[] tint;
        /// Roughness multiplier: 1 (or 0/absent) = as authored, 2 = twice as rough. Everything reads less glossy above 1.
        public float rough;
        public List<ItemSpec> children;
    }

    /// A glowing screen: either a named surface on the model ("Screen") or a CRT face fitted to the tube.
    public class DisplaySpec
    {
        public string surface;
        /// CRT face: [cx, cy, cz, width, height, bulge] in the model's local space.
        public float[] crt;
        public string src;
        public Dictionary<string, float> floats;
        public float[] tint;
        /// Texture scale and offset: [sx, sy, ox, oy].
        public float[] st;
        public float glow;
        public float[] glowColor;
        public float[] glowOffset;
    }

    public class PhotoSpec
    {
        public string surface = "Photo";
        public string src;
    }

    public class SpinSpec
    {
        public string child;
        public float dps;
    }

    public class LightSpec
    {
        public string id;
        /// point | spot | directional
        public string type;
        public float[] p;
        /// Forward direction (spot/directional).
        public float[] dir;
        public float[] color;
        public float intensity;
        public float range;
        public float angle;
        public bool shadows;
        public bool flicker;
        public string group;
    }

    public class ViewSpec
    {
        public string id;
        public float[] p;
        public float[] target;
        public float fov;
    }

    public class StationSpec
    {
        public string id;
        public string url;
        public string view;
        public List<string> items = new();
        public string accent;
        public string screen;
        public float boost = 1.8f;
        public float[] rect;
    }
}
