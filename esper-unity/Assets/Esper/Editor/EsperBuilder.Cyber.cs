using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper.EditorTools
{
    /// The cyberpunk layer: ceiling tubes for "lights on", neon and LED inside, a living city outside.
    public static partial class EsperBuilder
    {
        static Material Glow(string name, Color hdr)
        {
            var m = new Material(Shader.Find("Universal Render Pipeline/Unlit"));
            m.SetColor("_BaseColor", hdr);
            return SaveMat(m, name);
        }

        static void BuildRoomLights()
        {
            var g = Group("CeilingTubes", lightsRoot);
            var housing = Plain("TubeHousing", new Color(0.12f, 0.12f, 0.13f), 0.4f, 0.6f);
            var tubeMat = Plain("TubeGlass", new Color(0.25f, 0.26f, 0.27f), 0.6f, 0f, Color.black);
            var lights = new System.Collections.Generic.List<Light>();
            var glows = new System.Collections.Generic.List<Renderer>();
            foreach (var c in new[] { new Vector3(-2.4f, 0, -0.6f), new Vector3(2.4f, 0, -0.6f), new Vector3(-2.4f, 0, 2.0f), new Vector3(2.4f, 0, 2.0f) })
            {
                Block("Housing", g, new Vector3(c.x, RoomH - 0.03f, c.z), new Vector3(1.25f, 0.05f, 0.2f), housing, isStatic: false);
                for (int i = -1; i <= 1; i += 2)
                {
                    var t = Block("Tube", g, new Vector3(c.x, RoomH - 0.07f, c.z + i * 0.05f), new Vector3(1.18f, 0.032f, 0.032f), tubeMat, isStatic: false);
                    t.GetComponent<MeshRenderer>().shadowCastingMode = ShadowCastingMode.Off;
                    glows.Add(t.GetComponent<MeshRenderer>());
                }
                var l = new GameObject("TubeLight").AddComponent<Light>();
                l.transform.SetParent(g, false);
                l.transform.position = new Vector3(c.x, RoomH - 0.25f, c.z);
                l.type = LightType.Point;
                l.color = new Color(0.86f, 0.94f, 1f);
                l.intensity = 2.6f;
                l.range = 7f;
                l.shadows = LightShadows.Soft;
                l.lightmapBakeType = LightmapBakeType.Realtime;
                lights.Add(l);
            }

            var profile = ScriptableObject.CreateInstance<VolumeProfile>();
            var adj = profile.Add<ColorAdjustments>();
            adj.postExposure.Override(0.55f);
            adj.saturation.Override(4f);
            AssetDatabase.DeleteAsset("Assets/Esper/Generated/LightsOn.asset");
            AssetDatabase.CreateAsset(profile, "Assets/Esper/Generated/LightsOn.asset");
            AssetDatabase.AddObjectToAsset(adj, profile);
            var vol = new GameObject("LightsOnVolume").AddComponent<Volume>();
            vol.transform.SetParent(root, false);
            vol.isGlobal = true;
            vol.priority = 1;
            vol.weight = 0;
            vol.sharedProfile = profile;

            var rl = root.gameObject.AddComponent<RoomLights>();
            rl.tubes = lights.ToArray();
            rl.tubeGlow = glows.ToArray();
            rl.lightsOnVolume = vol;
            foreach (var r in glows) r.sharedMaterial.EnableKeyword("_EMISSION");
        }

        static void BuildCityLife()
        {
            var g = Group("CityLife", outside);
            // Two billboards at city scale, and two quiet neon signs. Restraint: the city is texture, not noise.
            Billboard(g, "Billboards/virdio_climber.jpg", new Vector3(26f, 6f, 46.7f), new Vector2(22f, 12.4f));
            Billboard(g, "Billboards/domis.jpg", new Vector3(-20f, 14f, 36.7f), new Vector2(18f, 10.1f));
            var cyan = Glow("NeonCyan", new Color(0.2f, 1.2f, 1.6f));
            NeonColumn(g, new Vector3(-70f, -10f, 160f), 12, cyan, 2.2f);

            // Sky traffic.
            var traffic = new GameObject("Traffic").AddComponent<Traffic>();
            traffic.transform.SetParent(g, false);
            traffic.headMaterial = Glow("CarHead", new Color(3.5f, 3.6f, 4f));
            traffic.tailMaterial = Glow("CarTail", new Color(4f, 0.35f, 0.3f));
            traffic.lanes = new[]
            {
                new Traffic.Lane { start = new Vector3(-220, 9, 28), end = new Vector3(220, 9, 28), count = 3, speed = 26, jitter = 0.5f },
                new Traffic.Lane { start = new Vector3(220, 19, 62), end = new Vector3(-220, 19, 62), count = 5, speed = 34, jitter = 0.6f },
                new Traffic.Lane { start = new Vector3(-320, 42, 140), end = new Vector3(320, 42, 140), count = 8, speed = 48, jitter = 0.7f },
                new Traffic.Lane { start = new Vector3(320, -14, 95), end = new Vector3(-320, -14, 95), count = 7, speed = 40, jitter = 0.5f },
                new Traffic.Lane { start = new Vector3(-450, 75, 300), end = new Vector3(450, 75, 300), count = 12, speed = 60, jitter = 0.8f },
                new Traffic.Lane { start = new Vector3(400, 120, 520), end = new Vector3(-400, 60, 480), count = 12, speed = 70, jitter = 0.8f },
            };
        }

        static void Billboard(Transform parent, string content, Vector3 centre, Vector2 size)
        {
            var go = new GameObject("Billboard");
            go.transform.SetParent(parent, false);
            go.transform.position = centre;
            go.transform.localScale = new Vector3(size.x, size.y, 1);
            go.AddComponent<MeshFilter>().sharedMesh = Resources.GetBuiltinResource<Mesh>("Quad.fbx");
            var r = go.AddComponent<MeshRenderer>();
            r.shadowCastingMode = ShadowCastingMode.Off;
            var tex = AssetDatabase.LoadAssetAtPath<Texture2D>($"{ContentDir}/{content}");
            r.sharedMaterial = Custom("Billboard_" + System.IO.Path.GetFileNameWithoutExtension(content), "Esper/CrtScreen", m =>
            {
                m.SetTexture("_MainTex", tex);
                m.SetFloat("_Brightness", 1.3f);
                m.SetFloat("_Curvature", 0f);
                m.SetFloat("_Scanlines", 90f);
                m.SetFloat("_ScanAmount", 0.18f);
                m.SetFloat("_Mask", 0.3f);
                m.SetFloat("_Noise", 0.03f);
                m.SetFloat("_Vignette", 0f);
                m.SetFloat("_Glass", 0f);
                m.SetFloat("_Mono", 0f);
            });
            // A dark frame so the screen reads as a sign, not a hole in the sky.
            Block("BillboardFrame", parent, centre + new Vector3(0, 0, 0.3f), new Vector3(size.x + 0.8f, size.y + 0.8f, 0.4f), Plain("SignFrame", new Color(0.02f, 0.02f, 0.025f), 0.3f), isStatic: false);
        }

        static void NeonColumn(Transform parent, Vector3 baseCentre, int segments, Material mat, float scale = 1f)
        {
            var rng = new System.Random(baseCentre.GetHashCode());
            for (int i = 0; i < segments; i++)
            {
                float h = (1.2f + (float)rng.NextDouble() * 1.6f) * scale;
                var y = baseCentre.y + i * 2.4f * scale;
                var w = (rng.NextDouble() < 0.3 ? 1.4f : 0.5f) * scale;
                var seg = Block("NeonSeg", parent, new Vector3(baseCentre.x, y, baseCentre.z), new Vector3(w, h, 0.25f), mat, isStatic: false);
                seg.GetComponent<MeshRenderer>().shadowCastingMode = ShadowCastingMode.Off;
            }
        }
    }
}
