using System;
using System.Collections.Generic;
using System.Globalization;
using Unity.Cinemachine;
using UnityEngine;

namespace Esper.Studio
{
    /// Layout overrides edited in Studio. One JSON file is the source of truth for hand-placed changes:
    /// the scene builder bakes it in, and the live build applies it at load so edits show without a rebuild.
    [Serializable] public class ObjectOverride { public string path; public float[] p; public float ry; public float s = 1f; }
    [Serializable] public class ViewOverride { public string id; public float[] pos; public float[] target; public float fov; }
    [Serializable] public class ValueOverride { public string key; public float value; }

    [Serializable]
    public class Overrides
    {
        public List<ObjectOverride> objects = new();
        public List<ViewOverride> views = new();
        public List<ValueOverride> lights = new();
        public List<ValueOverride> look = new();
    }

    public static class StudioPaths
    {
        /// "Props/Virdio/Television_01#0": names joined by '/', '#n' disambiguates same-named siblings.
        public static string PathOf(Transform t, Transform root)
        {
            var parts = new List<string>();
            for (var cur = t; cur != null && cur != root; cur = cur.parent)
            {
                int index = 0;
                if (cur.parent)
                    for (int i = 0; i < cur.GetSiblingIndex(); i++)
                        if (cur.parent.GetChild(i).name == cur.name) index++;
                parts.Insert(0, $"{cur.name}#{index}");
            }
            return string.Join("/", parts);
        }

        public static Transform Find(Transform root, string path)
        {
            var cur = root;
            foreach (var part in path.Split('/'))
            {
                int hash = part.LastIndexOf('#');
                string name = hash >= 0 ? part.Substring(0, hash) : part;
                int want = hash >= 0 ? int.Parse(part.Substring(hash + 1), CultureInfo.InvariantCulture) : 0;
                Transform next = null;
                int seen = 0;
                for (int i = 0; i < cur.childCount; i++)
                {
                    var c = cur.GetChild(i);
                    if (c.name != name) continue;
                    if (seen++ == want) { next = c; break; }
                }
                if (next == null) return null;
                cur = next;
            }
            return cur;
        }

        /// The selectable unit for a hit: the direct child of a station group (Props/<Station>/<Object>).
        public static Transform SelectableFor(Transform hit, Transform root)
        {
            var props = root.Find("Props");
            for (var cur = hit; cur != null; cur = cur.parent)
                if (cur.parent != null && cur.parent.parent == props) return cur;
            return null;
        }
    }

    public static class StudioApply
    {
        public static Vector3 V(float[] a) => a != null && a.Length == 3 ? new Vector3(a[0], a[1], a[2]) : Vector3.zero;

        public static void Objects(Transform root, Overrides o)
        {
            foreach (var ob in o.objects)
            {
                var t = StudioPaths.Find(root, ob.path);
                if (t == null) { Debug.LogWarning($"[studio] no object {ob.path}"); continue; }
                t.position = V(ob.p);
                t.rotation = Quaternion.Euler(t.eulerAngles.x, ob.ry, t.eulerAngles.z);
                t.localScale = Vector3.one * (ob.s <= 0 ? 1 : ob.s);
            }
        }

        public static void Views(Transform root, Overrides o, Func<string, CinemachineCamera> camFor)
        {
            foreach (var v in o.views)
            {
                var cam = camFor(v.id);
                if (cam == null) continue;
                var pos = V(v.pos);
                cam.transform.SetPositionAndRotation(pos, Quaternion.LookRotation(V(v.target) - pos));
                var lens = cam.Lens;
                lens.FieldOfView = v.fov;
                cam.Lens = lens;
            }
        }

        public static void Lights(Overrides o)
        {
            foreach (var l in o.lights)
            {
                var go = GameObject.Find(l.key);
                var light = go ? go.GetComponent<Light>() : null;
                if (light) light.intensity = l.value;
            }
        }
    }
}
