using System;
using UnityEngine;

namespace Esper.Studio
{
    /// Studio <-> page payloads. Edits are written to Live/scene.json by the page; Unity only reports them.
    [Serializable] public class ObjectOverride { public string path; public float[] p; public float ry; public float s = 1f; }
    [Serializable] public class ValueOverride { public string key; public float value; }
    [Serializable] public class ViewOverride { public string id; public float[] pos; public float[] target; public float fov; }

    public static class StudioPaths
    {
        /// The selectable unit for a hit: the live item directly under a station group (Props/<Station>/<Item>).
        public static Esper.Live.LiveItem SelectableFor(Transform hit, Transform root)
        {
            var props = root.Find("Props");
            for (var cur = hit; cur != null; cur = cur.parent)
                if (cur.parent != null && cur.parent.parent == props && cur.GetComponent<Esper.Live.LiveItem>() is { } li)
                    return li;
            return null;
        }

        public static Vector3 V(float[] a) => a != null && a.Length == 3 ? new Vector3(a[0], a[1], a[2]) : Vector3.zero;
    }
}
