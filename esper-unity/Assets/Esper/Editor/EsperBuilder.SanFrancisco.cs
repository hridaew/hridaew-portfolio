using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    /// The view: a clear San Francisco day from a hillside flat, looking across rooftops to downtown, the bay and
    /// the Golden Gate. Everything is one unlit, vertex-coloured mesh (a single draw call), shaded and hazed as it
    /// is built. Evokes the city rather than mapping it: landmarks sit where the window frames them.
    public static partial class EsperBuilder
    {
        static readonly Color Haze = new Color(0.8f, 0.88f, 0.96f);

        class LowPoly
        {
            public readonly List<Vector3> v = new();
            public readonly List<Color> c = new();
            public readonly List<int> t = new();

            static Color Aerial(Color col, Vector3 p)
            {
                float d = new Vector2(p.x, p.z).magnitude;
                return Color.Lerp(col, Haze, 1f - Mathf.Exp(-d / 7000f));
            }

            public void Quad(Vector3 a, Vector3 b, Vector3 d, Vector3 e, Color col)
            {
                int i = v.Count;
                v.Add(a); v.Add(b); v.Add(d); v.Add(e);
                c.Add(Aerial(col, a)); c.Add(Aerial(col, b)); c.Add(Aerial(col, d)); c.Add(Aerial(col, e));
                t.Add(i); t.Add(i + 1); t.Add(i + 2);
                t.Add(i); t.Add(i + 2); t.Add(i + 3);
            }

            public void Tri(Vector3 a, Vector3 b, Vector3 d, Color col)
            {
                int i = v.Count;
                v.Add(a); v.Add(b); v.Add(d);
                c.Add(Aerial(col, a)); c.Add(Aerial(col, b)); c.Add(Aerial(col, d));
                t.Add(i); t.Add(i + 1); t.Add(i + 2);
            }

            /// A box standing on `b` (centre of its base). The sun is ahead of the viewer, so faces toward us sit in soft shade.
            public void Box(Vector3 b, Vector3 s, Color col)
            {
                float x = s.x / 2, z = s.z / 2, h = s.y;
                Vector3 P(float px, float py, float pz) => b + new Vector3(px, py, pz);
                Quad(P(-x, h, -z), P(-x, h, z), P(x, h, z), P(x, h, -z), col * 1.04f);                    // top
                Quad(P(-x, 0, -z), P(-x, h, -z), P(x, h, -z), P(x, 0, -z), col * 0.8f);                   // toward the viewer
                Quad(P(x, 0, -z), P(x, h, -z), P(x, h, z), P(x, 0, z), col * 0.92f);                      // right
                Quad(P(-x, 0, z), P(-x, h, z), P(-x, h, -z), P(-x, 0, -z), col * 0.7f);                   // left
                Quad(P(x, 0, z), P(x, h, z), P(-x, h, z), P(-x, 0, z), col);                              // away
            }

            /// A square-section beam between two points.
            public void Beam(Vector3 a, Vector3 b, float w, Color col)
            {
                var dir = (b - a).normalized;
                var side = Vector3.Cross(dir, Mathf.Abs(dir.y) > 0.95f ? Vector3.right : Vector3.up).normalized * (w / 2);
                var up = Vector3.Cross(side, dir).normalized * (w / 2);
                Quad(a - side - up, a - side + up, b - side + up, b - side - up, col * 0.75f);
                Quad(a + side + up, a + side - up, b + side - up, b + side + up, col * 0.85f);
                Quad(a - side + up, a + side + up, b + side + up, b - side + up, col);
                Quad(a + side - up, a - side - up, b - side - up, b + side - up, col * 0.7f);
            }

            /// A tapering four-sided spire, base centred on `b`.
            public void Spire(Vector3 b, float baseW, float h, Color col)
            {
                float w = baseW / 2;
                var top = b + Vector3.up * h;
                Vector3 P(float x, float z) => b + new Vector3(x, 0, z);
                Tri(P(-w, -w), top, P(w, -w), col * 0.88f);
                Tri(P(w, -w), top, P(w, w), col);
                Tri(P(w, w), top, P(-w, w), col * 0.95f);
                Tri(P(-w, w), top, P(-w, -w), col * 0.8f);
            }
        }

        const float BayY = -72f;

        // Land falls away from the flat toward the bay, in gentle hills; the Presidio runs out to the bridge on the left.
        static float ShoreZ(float x) => 1300f + Mathf.Max(0f, 620f - x) / 1300f * 1050f;

        static float LandY(float x, float z)
        {
            float shore = ShoreZ(x);
            float f = Mathf.Clamp01(z / shore);
            float y = Mathf.Lerp(-46f, BayY + 4f, f) + 9f * Mathf.Sin(x / 230f + 0.6f) * Mathf.Cos(z / 190f) * f * (1f - f);
            return z > shore ? BayY - (z - shore) * 0.05f : y;
        }

        static void BuildSanFrancisco()
        {
            var m = new LowPoly();
            var rng = new System.Random(1906);
            float R(float a, float b) => a + (float)rng.NextDouble() * (b - a);

            // Land: a coarse grid, greener out toward the Presidio.
            const float step = 90f;
            for (float x = -2400f; x < 2600f; x += step)
                for (float z = 10f; z < 2600f; z += step)
                {
                    Vector3 P(float px, float pz) => new Vector3(px, LandY(px, pz), pz);
                    float t = Mathf.Clamp01((500f - x) / 900f);
                    var land = Color.Lerp(new Color(0.72f, 0.69f, 0.62f), new Color(0.42f, 0.56f, 0.36f), t);
                    m.Quad(P(x, z), P(x, z + step), P(x + step, z + step), P(x + step, z), land);
                }

            // The bay.
            var water = new Color(0.2f, 0.5f, 0.74f);
            m.Quad(new Vector3(-6000, BayY, 300), new Vector3(-6000, BayY, 3900), new Vector3(6000, BayY, 3900), new Vector3(6000, BayY, 300), water);

            // Marin: low-poly headlands across the water, and Angel Island.
            var marin = new Color(0.4f, 0.5f, 0.36f);
            float px0 = -3600f, py0 = R(60f, 140f);
            for (float x = -3400f; x < 2800f; x += 260f)
            {
                float y = R(120f, 330f) * Mathf.Clamp01(1.25f - Mathf.Abs(x + 200f) / 3400f);
                m.Quad(new Vector3(px0, BayY, 3050f), new Vector3(px0, py0, 3400f), new Vector3(x, y, 3400f), new Vector3(x, BayY, 3050f), marin * (rng.NextDouble() < 0.5 ? 0.92f : 1f));
                px0 = x; py0 = y;
            }
            m.Spire(new Vector3(620f, BayY, 2780f), 620f, 170f, marin);
            // Alcatraz: a rock and a pale block.
            m.Box(new Vector3(360f, BayY, 1750f), new Vector3(120f, 14f, 60f), new Color(0.5f, 0.47f, 0.4f));
            m.Box(new Vector3(360f, BayY + 14f, 1750f), new Vector3(60f, 16f, 24f), new Color(0.88f, 0.86f, 0.8f));

            // Neighbourhoods: pastel flats in street grids, peaked roofs nearby.
            Color[] paint =
            {
                new Color(0.96f, 0.93f, 0.85f), new Color(0.97f, 0.97f, 0.95f), new Color(0.95f, 0.85f, 0.66f), new Color(0.93f, 0.74f, 0.7f),
                new Color(0.72f, 0.82f, 0.72f), new Color(0.7f, 0.81f, 0.9f), new Color(0.86f, 0.78f, 0.68f), new Color(0.92f, 0.9f, 0.88f),
            };
            int col = 0;
            for (float x = -1300f; x < 1900f; x += 26f)
            {
                col++;
                if (col % 6 == 0) continue; // a street
                int row = 0;
                for (float z = 110f; z < 1300f; z += 30f)
                {
                    row++;
                    if (row % 5 == 0) continue; // a cross street
                    float bx = x + R(-2f, 2f), bz = z + R(-3f, 3f);
                    if (bz > ShoreZ(bx) - 40f) continue;
                    if (rng.NextDouble() < 0.12) continue;
                    // Downtown takes this ground.
                    if (bx > 760f && bx < 1500f && bz > 880f) continue;
                    float y = LandY(bx, bz);
                    var size = new Vector3(R(16f, 22f), R(9f, 17f), R(18f, 26f));
                    var c = paint[rng.Next(paint.Length)];
                    m.Box(new Vector3(bx, y - 3f, bz), size + Vector3.up * 3f, c);
                    if (bz < 520f)
                    {
                        var ridge = new Vector3(bx, y + size.y + 4.5f, bz);
                        var roof = new Color(0.46f, 0.42f, 0.4f);
                        float w = size.x / 2, d = size.z / 2;
                        Vector3 E(float ex, float ez) => new Vector3(bx + ex, y + size.y, bz + ez);
                        m.Quad(E(-w, -d), ridge + Vector3.back * d, ridge + Vector3.forward * d, E(-w, d), roof);
                        m.Quad(E(w, d), ridge + Vector3.forward * d, ridge + Vector3.back * d, E(w, -d), roof * 0.85f);
                        m.Tri(E(-w, -d), E(w, -d), ridge + Vector3.back * d, c * 0.82f);
                    }
                    else if (rng.NextDouble() < 0.1)
                        m.Spire(new Vector3(bx + 18f, y, bz), R(14f, 22f), R(14f, 22f), new Color(0.34f, 0.5f, 0.32f)); // street trees
                }
            }

            // Downtown: a tight cluster, tallest toward the landmarks.
            Color[] glass = { new Color(0.72f, 0.78f, 0.84f), new Color(0.86f, 0.83f, 0.76f), new Color(0.62f, 0.7f, 0.78f), new Color(0.92f, 0.9f, 0.86f) };
            for (int i = 0; i < 70; i++)
            {
                float bx = R(790f, 1470f), bz = R(900f, 1270f);
                float near = 1f - Mathf.Clamp01(new Vector2(bx - 1110f, bz - 1120f).magnitude / 400f);
                float top = R(70f, 150f) + near * R(60f, 150f);
                m.Box(new Vector3(bx, BayY, bz), new Vector3(R(26f, 50f), top - BayY, R(26f, 50f)), glass[rng.Next(glass.Length)]);
            }
            // The pyramid.
            m.Spire(new Vector3(980f, BayY, 1080f), 62f, 300f, new Color(0.95f, 0.94f, 0.9f));
            // The rounded tower: stacked, narrowing, with a domed cap.
            var sf = new Color(0.78f, 0.84f, 0.9f);
            m.Box(new Vector3(1200f, BayY, 1150f), new Vector3(62f, 300f, 62f), sf);
            m.Box(new Vector3(1200f, 228f, 1150f), new Vector3(52f, 45f, 52f), sf);
            m.Spire(new Vector3(1200f, 273f, 1150f), 52f, 22f, sf);

            // The Golden Gate.
            var orange = new Color(0.82f, 0.27f, 0.12f);
            const float gz = 2330f, deckY = -20f, tower = 150f;
            float tx0 = 770f, tx1 = 1160f, a0 = 480f, a1 = 1420f;
            foreach (float tx in new[] { tx0, tx1 })
            {
                foreach (float o in new[] { -9f, 9f })
                    m.Box(new Vector3(tx, BayY, gz + o), new Vector3(7f, tower - BayY, 5f), orange);
                foreach (float y in new[] { deckY + 12f, 60f, 105f, tower - 4f })
                    m.Box(new Vector3(tx, y, gz), new Vector3(5f, 7f, 20f), orange);
            }
            m.Beam(new Vector3(a0, deckY, gz), new Vector3(a1, deckY, gz), 7f, orange);
            void Cable(float x0, float y0, float x1, float y1, float sag)
            {
                const int n = 14;
                for (int i = 0; i < n; i++)
                {
                    float u0 = i / (float)n, u1 = (i + 1) / (float)n;
                    Vector3 P(float u) => new Vector3(Mathf.Lerp(x0, x1, u), Mathf.Lerp(y0, y1, u) - sag * 4f * u * (1f - u), gz);
                    m.Beam(P(u0), P(u1), 2.6f, orange);
                }
            }
            Cable(tx0, tower, tx1, tower, 150f);
            Cable(a0, deckY + 2f, tx0, tower, 22f);
            Cable(tx1, tower, a1, deckY + 2f, 22f);

            var mesh = new Mesh { name = "SanFrancisco", indexFormat = IndexFormat.UInt32 };
            mesh.SetVertices(m.v);
            mesh.SetColors(m.c);
            mesh.SetTriangles(m.t, 0);
            mesh.RecalculateBounds();
            mesh = EsperMeshes.Save(mesh, "SanFrancisco", false);

            var go = new GameObject("SanFrancisco");
            go.transform.SetParent(outside, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var r = go.AddComponent<MeshRenderer>();
            r.sharedMaterial = Custom("SFFlat", "Esper/FlatVertex");
            r.shadowCastingMode = ShadowCastingMode.Off;
            r.receiveShadows = false;
            r.lightProbeUsage = LightProbeUsage.Off;
            r.reflectionProbeUsage = ReflectionProbeUsage.Off;
            Debug.Log($"[esper] san francisco: {m.v.Count} verts, {m.t.Count / 3} tris");
        }

        /// The seamless ground the house sits on, like a studio sweep. The camera looks down, so its edge never shows.
        static void BuildGround()
        {
            var ground = Block("Ground", outside, new Vector3(0f, -0.15f, 0f), new Vector3(600f, 0.1f, 600f), Plain("Ground", new Color(0.93f, 0.92f, 0.9f), 0.05f), isStatic: false);
            ground.GetComponent<MeshRenderer>().shadowCastingMode = ShadowCastingMode.Off;
        }

        /// Materials the stations' boxes name in scene.json.
        static void BuildLivePalette()
        {
            Plain("Figure", new Color(0.74f, 0.76f, 0.8f), 0.15f);
            Plain("Bezel", new Color(0.03f, 0.03f, 0.035f), 0.4f);
            Plain("DeskTop", new Color(0.74f, 0.6f, 0.44f), 0.3f);
            Plain("DeskLeg", new Color(0.09f, 0.09f, 0.1f), 0.35f);
            Plain("Console", new Color(0.86f, 0.85f, 0.82f), 0.25f);
            Plain("Plinth", new Color(0.93f, 0.93f, 0.91f), 0.2f);
            Plain("WallWhite", new Color(0.965f, 0.96f, 0.95f), 0.06f);
            Plain("FloorOak", new Color(0.86f, 0.74f, 0.58f), 0.2f);
            // The white diorama: a floor a shade off the walls so they separate, and a matte clay that the
            // soft furniture, the tree and the figure's things are tinted from.
            Plain("Floor", new Color(0.925f, 0.92f, 0.91f), 0.08f);
            Plain("Clay", new Color(0.94f, 0.935f, 0.925f), 0.08f);
            Plain("Me", new Color(0.16f, 0.16f, 0.18f), 0.15f);
        }
    }
}
