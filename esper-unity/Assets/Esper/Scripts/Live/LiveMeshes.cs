using System.Collections.Generic;
using UnityEngine;

namespace Esper.Live
{
    /// Procedural meshes shared by the scene builder and the live runtime.
    public static class LiveMeshes
    {
        /// Box with UVs in metres (material tiling decides texel density).
        public static Mesh Box(Vector3 size)
        {
            var m = new Mesh { name = "box" };
            var v = new List<Vector3>(); var n = new List<Vector3>(); var uv = new List<Vector2>(); var t = new List<int>();
            Vector3 h = size * 0.5f;
            void Face(Vector3 normal, Vector3 u, Vector3 w, float su, float sw)
            {
                int i = v.Count;
                Vector3 c = Vector3.Scale(normal, h);
                v.Add(c - u * su * 0.5f - w * sw * 0.5f); v.Add(c + u * su * 0.5f - w * sw * 0.5f);
                v.Add(c + u * su * 0.5f + w * sw * 0.5f); v.Add(c - u * su * 0.5f + w * sw * 0.5f);
                for (int k = 0; k < 4; k++) n.Add(normal);
                uv.Add(new Vector2(0, 0)); uv.Add(new Vector2(su, 0)); uv.Add(new Vector2(su, sw)); uv.Add(new Vector2(0, sw));
                t.AddRange(new[] { i, i + 2, i + 1, i, i + 3, i + 2 });
            }
            Face(Vector3.right, Vector3.forward * -1, Vector3.up, size.z, size.y);
            Face(Vector3.left, Vector3.forward, Vector3.up, size.z, size.y);
            Face(Vector3.up, Vector3.right, Vector3.forward * -1, size.x, size.z);
            Face(Vector3.down, Vector3.right, Vector3.forward, size.x, size.z);
            Face(Vector3.forward, Vector3.right, Vector3.up, size.x, size.y);
            Face(Vector3.back, Vector3.right * -1, Vector3.up, size.x, size.y);
            // Winding: ensure outward-facing triangles.
            for (int f = 0; f < t.Count; f += 3)
            {
                var a = v[t[f]]; var b = v[t[f + 1]]; var c = v[t[f + 2]];
                if (Vector3.Dot(Vector3.Cross(b - a, c - a), n[t[f]]) < 0) { (t[f + 1], t[f + 2]) = (t[f + 2], t[f + 1]); }
            }
            m.SetVertices(v); m.SetNormals(n); m.SetUVs(0, uv); m.SetTriangles(t, 0);
            m.RecalculateTangents(); m.RecalculateBounds();
            return m;
        }

        /// Photo print: a quad with a gentle curl along its width.
        public static Mesh CurledQuad(float w, float h, float curl, int seg = 8)
        {
            var m = new Mesh { name = "print" };
            var v = new List<Vector3>(); var uv = new List<Vector2>(); var t = new List<int>();
            for (int y = 0; y <= seg; y++)
                for (int x = 0; x <= seg; x++)
                {
                    float u = x / (float)seg, s = y / (float)seg;
                    float px = (u - 0.5f) * w, py = (s - 0.5f) * h;
                    float z = curl * Mathf.Pow((u - 0.5f) * 2f, 2f) + curl * 0.4f * Mathf.Pow(1f - s, 3f);
                    v.Add(new Vector3(px, py, z)); uv.Add(new Vector2(u, s));
                }
            for (int y = 0; y < seg; y++)
                for (int x = 0; x < seg; x++)
                {
                    int i = y * (seg + 1) + x;
                    t.AddRange(new[] { i, i + seg + 1, i + 1, i + 1, i + seg + 1, i + seg + 2 });
                }
            m.SetVertices(v); m.SetUVs(0, uv); m.SetTriangles(t, 0);
            m.RecalculateNormals(); m.RecalculateTangents(); m.RecalculateBounds();
            return m;
        }

        /// CRT glass: a cap that bulges toward +Z, UVs 0..1, front face +Z.
        public static Mesh Bulge(float w, float h, float bulge, int seg = 16)
        {
            var m = new Mesh { name = "crt_glass" };
            var v = new List<Vector3>(); var uv = new List<Vector2>(); var t = new List<int>();
            for (int y = 0; y <= seg; y++)
                for (int x = 0; x <= seg; x++)
                {
                    float u = x / (float)seg, s = y / (float)seg;
                    float cu = (u - 0.5f) * 2f, cs = (s - 0.5f) * 2f;
                    v.Add(new Vector3(cu * w * 0.5f, cs * h * 0.5f, bulge * (1f - cu * cu) * (1f - cs * cs)));
                    uv.Add(new Vector2(1f - u, s));
                }
            for (int y = 0; y < seg; y++)
                for (int x = 0; x < seg; x++)
                {
                    int i = y * (seg + 1) + x;
                    t.AddRange(new[] { i, i + 1, i + seg + 1, i + 1, i + seg + 2, i + seg + 1 });
                }
            m.SetVertices(v); m.SetUVs(0, uv); m.SetTriangles(t, 0);
            m.RecalculateNormals(); m.RecalculateTangents(); m.RecalculateBounds();
            return m;
        }

    }
}
