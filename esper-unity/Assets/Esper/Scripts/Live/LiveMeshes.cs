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

        /// Box with soft edges: every edge rounded by `edge`, and the corners seen from above by `corner` (at least
        /// `edge`). Half the width on both gives a pill; half of every side, a ball. Centred, like Box.
        public static Mesh Rounded(Vector3 size, float corner, float edge)
        {
            var h = size * 0.5f;
            float e = Mathf.Max(0.001f, Mathf.Min(edge, Mathf.Min(h.x, Mathf.Min(h.y, h.z))));
            float c = Mathf.Clamp(corner, e, Mathf.Min(h.x, h.z));
            int cs = c > 0.25f ? 8 : c > 0.06f ? 5 : 3;   // segments per corner arc
            int es = e > 0.25f ? 6 : e > 0.06f ? 4 : 3;   // segments per edge arc

            // The profile, bottom to top: inset from the outline, height, and its normal (out, up).
            var prof = new List<Vector4>();
            for (int i = 0; i <= es; i++)
            {
                float a = Mathf.Lerp(-90f, 0f, i / (float)es) * Mathf.Deg2Rad;
                prof.Add(new Vector4(e - e * Mathf.Cos(a), -h.y + e + e * Mathf.Sin(a), Mathf.Cos(a), Mathf.Sin(a)));
            }
            for (int i = 0; i <= es; i++)
            {
                float a = Mathf.Lerp(0f, 90f, i / (float)es) * Mathf.Deg2Rad;
                prof.Add(new Vector4(e - e * Mathf.Cos(a), h.y - e + e * Mathf.Sin(a), Mathf.Cos(a), Mathf.Sin(a)));
            }

            var v = new List<Vector3>(); var n = new List<Vector3>(); var uv = new List<Vector2>(); var t = new List<int>();
            int ringN = 4 * (cs + 1);
            float cx = h.x - c, cz = h.z - c;
            foreach (var pr in prof)
            {
                float rc = c - pr.x;
                for (int k = 0; k < 4; k++)
                {
                    float sx = k == 0 || k == 3 ? 1f : -1f, sz = k < 2 ? 1f : -1f;
                    for (int i = 0; i <= cs; i++)
                    {
                        float th = (k * 90f + 90f * i / cs) * Mathf.Deg2Rad;
                        float ox = Mathf.Cos(th), oz = Mathf.Sin(th);
                        var p = new Vector3(sx * cx + ox * rc, pr.y, sz * cz + oz * rc);
                        v.Add(p);
                        n.Add(new Vector3(ox * pr.z, pr.w, oz * pr.z).normalized);
                        uv.Add(new Vector2(p.x + p.z, p.y));
                    }
                }
            }
            for (int r = 0; r + 1 < prof.Count; r++)
                for (int i = 0; i < ringN; i++)
                {
                    int a = r * ringN + i, b = r * ringN + (i + 1) % ringN, a2 = a + ringN, b2 = b + ringN;
                    t.AddRange(new[] { a, a2, b, b, a2, b2 });
                }
            // Flat caps, fanned from the centre.
            int bottom = v.Count; v.Add(new Vector3(0, -h.y, 0)); n.Add(Vector3.down); uv.Add(Vector2.zero);
            int top = v.Count; v.Add(new Vector3(0, h.y, 0)); n.Add(Vector3.up); uv.Add(Vector2.zero);
            int last = (prof.Count - 1) * ringN;
            for (int i = 0; i < ringN; i++)
            {
                t.AddRange(new[] { bottom, i, (i + 1) % ringN });
                t.AddRange(new[] { top, last + i, last + (i + 1) % ringN });
            }
            return Finish("rounded", v, n, uv, t);
        }

        /// A soft wall along a centre line of x,z pairs: straight sides, a round top, round free ends.
        /// Curves come from the path itself (dense points); thickness holds through gentle turns.
        public static Mesh Wall(float[] path, float height, float thick)
        {
            int count = path.Length / 2;
            var pts = new Vector3[count];
            for (int i = 0; i < count; i++) pts[i] = new Vector3(path[2 * i], 0, path[2 * i + 1]);
            float r = thick * 0.5f;
            float hs = Mathf.Max(0f, height - r); // where the side meets the round top
            const int ts = 6, cap = 10;

            // Cross-section, left foot over the top to the right foot: offset, height, normal (side, up).
            var prof = new List<Vector4> { new(-r, 0, -1, 0), new(-r, hs, -1, 0) };
            for (int i = 1; i < 2 * ts; i++)
            {
                float a = Mathf.Lerp(180f, 0f, i / (2f * ts)) * Mathf.Deg2Rad;
                prof.Add(new Vector4(r * Mathf.Cos(a), hs + r * Mathf.Sin(a), Mathf.Cos(a), Mathf.Sin(a)));
            }
            prof.Add(new Vector4(r, hs, 1, 0));
            prof.Add(new Vector4(r, 0, 1, 0));

            var v = new List<Vector3>(); var n = new List<Vector3>(); var uv = new List<Vector2>(); var t = new List<int>();
            var side = new Vector3[count];
            var miter = new float[count];
            var along = new float[count];
            for (int i = 0; i < count; i++)
            {
                var prev = pts[Mathf.Max(0, i - 1)]; var next = pts[Mathf.Min(count - 1, i + 1)];
                var tan = (next - prev).normalized;
                side[i] = new Vector3(-tan.z, 0, tan.x);
                var seg = (i + 1 < count ? pts[i + 1] - pts[i] : pts[i] - pts[i - 1]).normalized;
                miter[i] = Mathf.Clamp(1f / Mathf.Max(0.2f, Vector3.Dot(side[i], new Vector3(-seg.z, 0, seg.x))), 1f, 2f);
                along[i] = i == 0 ? 0 : along[i - 1] + Vector3.Distance(pts[i], pts[i - 1]);
            }
            int ringN = prof.Count;
            for (int i = 0; i < count; i++)
                foreach (var pr in prof)
                {
                    var p = pts[i] + side[i] * pr.x * miter[i] + Vector3.up * pr.y;
                    v.Add(p);
                    n.Add((side[i] * pr.z + Vector3.up * pr.w).normalized);
                    uv.Add(new Vector2(along[i], pr.y));
                }
            for (int i = 0; i + 1 < count; i++)
                for (int k = 0; k + 1 < ringN; k++)
                {
                    int a = i * ringN + k, b = a + 1, a2 = a + ringN, b2 = b + ringN;
                    t.AddRange(new[] { a, a2, b, b, a2, b2 });
                }

            // Round ends: half the cross-section turned about the end of the centre line.
            var half = new List<Vector4> { new(r, 0, 1, 0), new(r, hs, 1, 0) };
            for (int i = 1; i <= ts; i++)
            {
                float a = Mathf.Lerp(0f, 90f, i / (float)ts) * Mathf.Deg2Rad;
                half.Add(new Vector4(r * Mathf.Cos(a), hs + r * Mathf.Sin(a), Mathf.Cos(a), Mathf.Sin(a)));
            }
            void End(Vector3 at, Vector3 sideDir, Vector3 outward)
            {
                int start = v.Count;
                for (int j = 0; j <= cap; j++)
                {
                    float phi = Mathf.PI * j / cap;
                    var dir = sideDir * Mathf.Cos(phi) + outward * Mathf.Sin(phi);
                    foreach (var hp in half)
                    {
                        v.Add(at + dir * hp.x + Vector3.up * hp.y);
                        n.Add((dir * hp.z + Vector3.up * hp.w).normalized);
                        uv.Add(new Vector2(phi * r, hp.y));
                    }
                }
                int m = half.Count;
                for (int j = 0; j < cap; j++)
                    for (int k = 0; k + 1 < m; k++)
                    {
                        int a = start + j * m + k, b = a + 1, a2 = a + m, b2 = b + m;
                        t.AddRange(new[] { a, a2, b, b, a2, b2 });
                    }
            }
            bool closed = count > 2 && Vector3.Distance(pts[0], pts[count - 1]) < 1e-3f;
            if (!closed && count >= 2)
            {
                End(pts[0], side[0], (pts[0] - pts[1]).normalized);
                End(pts[count - 1], side[count - 1], (pts[count - 1] - pts[count - 2]).normalized);
            }
            return Finish("wall", v, n, uv, t);
        }

        /// Shared tail: winding made to face the normals, then tangents and bounds.
        static Mesh Finish(string name, List<Vector3> v, List<Vector3> n, List<Vector2> uv, List<int> t)
        {
            for (int f = 0; f < t.Count; f += 3)
            {
                var a = v[t[f]]; var b = v[t[f + 1]]; var c = v[t[f + 2]];
                var avg = n[t[f]] + n[t[f + 1]] + n[t[f + 2]];
                if (Vector3.Dot(Vector3.Cross(b - a, c - a), avg) < 0) (t[f + 1], t[f + 2]) = (t[f + 2], t[f + 1]);
            }
            var m = new Mesh { name = name };
            if (v.Count > 65000) m.indexFormat = UnityEngine.Rendering.IndexFormat.UInt32;
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
