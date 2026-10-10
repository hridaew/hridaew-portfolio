using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    public static partial class EsperBuilder
    {
        const string ObscuraDir = "Assets/Esper/Content/Obscura";
        public static GameObject esperScreen;
        static Bounds deskBounds;

        static void BuildProps()
        {
            float hw = RoomW / 2;
            var esper = Group("ESPER_Desk", props);

            // The ESPER station: steel desk along the right wall, its user facing the wall, the window at their left shoulder.
            var desk = Place("metal_office_desk", esper, new Vector3(hw - 0.5f, 0, 1.3f), -90f);
            SitOn(desk, 0f);
            deskBounds = BoundsOf(desk);
            float top = deskBounds.max.y;

            var crt = Place("television_02", esper, new Vector3(hw - 0.3f, 0, 1.45f), -90f);
            SitOn(crt, top);
            var instrument = Place("vintage_spacecraft_instrument", esper, new Vector3(hw - 0.38f, 0, 0.88f), -112f);
            SitOn(instrument, top);
            var meter = Place("retro_multimeter", esper, new Vector3(hw - 0.22f, 0, 2.02f), -62f);
            SitOn(meter, top);
            var camera = Place("Camera_01", esper, new Vector3(hw - 0.78f, 0, 1.02f), 24f);
            SitOn(camera, top);
            var glass = Place("magnifying_glass_01", esper, new Vector3(hw - 0.72f, 0, 1.62f), 0, 1f, new Vector3(90f, 0f, 38f));
            SitOn(glass, top);
            var specs = Place("round_spectacles", esper, new Vector3(hw - 0.86f, 0, 1.86f), 150f);
            SitOn(specs, top);
            var pens = Place("stationery_supplies", esper, new Vector3(hw - 0.2f, 0, 0.5f), -80f);
            SitOn(pens, top);
            var lamp = Place("desk_lamp_arm_01", esper, new Vector3(hw - 0.24f, 0, 2.12f), 38f);
            SitOn(lamp, top);
            Recolour(lamp, new Color(0.16f, 0.17f, 0.17f), "LampBody");
            foreach (var r in lamp.GetComponentsInChildren<MeshRenderer>()) r.shadowCastingMode = ShadowCastingMode.Off;

            var chair = Place("modern_arm_chair_01", esper, new Vector3(hw - 1.45f, 0, 1.42f), 78f);
            SitOn(chair, 0f);
            var radio = Place("vintage_radio_transceiver", esper, new Vector3(hw - 0.55f, 0, 2.38f), 190f);
            SitOn(radio, 0f);

            // Glass measured with EsperProbe.DepthMap: centre (0, 0.257), 0.31 x 0.25 m, edge z 0.098 bulging to 0.122.
            esperScreen = CrtFace(crt, "ESPER_Screen", Path.Combine(ObscuraDir, "wayne_archive_dsc05127asoldierportrait.jpg"),
                new Vector3(0.002f, 0.257f, 0.1f), new Vector2(0.305f, 0.248f), 0.023f);
            lampModel = lamp;
            lampTarget = BoundsOf(crt).center + new Vector3(-0.32f, -0.12f, 0.05f);

            // Loose prints on the desk: the work in progress.
            var prints = Group("Prints", esper);
            var photos = Directory.GetFiles(ObscuraDir, "*.jpg").Select(p => p.Replace('\\', '/')).OrderBy(p => p).ToArray();
            Print(prints, photos[0], new Vector3(hw - 0.62f, top + 0.002f, 1.28f), new Vector3(90, 0, 101), 0.13f, 0.002f);
            Print(prints, photos[9], new Vector3(hw - 0.58f, top + 0.004f, 1.38f), new Vector3(90, 0, 84), 0.13f, 0.002f);
            Print(prints, photos[16], new Vector3(hw - 0.9f, top + 0.003f, 1.15f), new Vector3(90, 0, 117), 0.1f, 0.002f);

            BuildRoomDressing();
            BuildVirdio();
            BuildDomis();
            BuildMemoryCare();
            BuildWafflings();
            BuildTaste();
        }

        static void Recolour(GameObject go, Color tint, string name)
        {
            foreach (var r in go.GetComponentsInChildren<MeshRenderer>())
            {
                var mats = r.sharedMaterials;
                for (int i = 0; i < mats.Length; i++)
                {
                    if (mats[i] == null) continue;
                    var m = new Material(mats[i]) { name = $"{name}_{i}" };
                    if (m.HasProperty("baseColorFactor")) m.SetColor("baseColorFactor", tint);
                    if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", tint);
                    mats[i] = SaveMatAsset(m, $"{name}_{r.name}_{i}");
                }
                r.sharedMaterials = mats;
            }
        }

        static Material SaveMatAsset(Material m, string name)
        {
            Directory.CreateDirectory(MatDir);
            string path = $"{MatDir}/{name}.mat";
            AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(m, path);
            return m;
        }

        /// A glowing CRT face fitted to the front of a television model (front faces -X after placement).
        public static Light deskLamp;
        static GameObject lampModel;
        static Vector3 lampTarget;

        /// Put the desk lamp's spot inside its shade (submesh 1 is the bulb/shade interior).
        static void AimLampAtBulb(GameObject lamp, Vector3 target)
        {
            var mf = lamp.GetComponentInChildren<MeshFilter>();
            var mesh = mf.sharedMesh;
            var idx = mesh.GetIndices(mesh.subMeshCount > 1 ? 1 : 0);
            var verts = mesh.vertices;
            Vector3 c = Vector3.zero;
            foreach (var i in idx) c += verts[i];
            c = mf.transform.TransformPoint(c / idx.Length);
            deskLamp.transform.position = c;
            deskLamp.transform.rotation = Quaternion.LookRotation(target - c);
            Debug.Log($"[esper] lamp at {c:F3} -> {target:F3} model {lamp.transform.position:F3} bounds {BoundsOf(lamp).min:F3}..{BoundsOf(lamp).max:F3} sub={mesh.subMeshCount} n={idx.Length}");
            var bulb = mf.GetComponent<MeshRenderer>().sharedMaterials;
            if (bulb.Length > 1 && bulb[1] != null)
            {
                var m = new Material(bulb[1]);
                if (m.HasProperty("emissiveFactor")) m.SetColor("emissiveFactor", new Color(1f, 0.62f, 0.3f) * 4f);
                m.EnableKeyword("_EMISSION");
                bulb[1] = SaveMatAsset(m, "LampBulb");
                mf.GetComponent<MeshRenderer>().sharedMaterials = bulb;
            }
        }

        static GameObject CrtFace(GameObject tv, string name, string contentPath, Vector3 localCentre, Vector2 size, float bulge)
        {
            var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(contentPath);
            var mat = Custom(name, "Esper/CrtScreen", m =>
            {
                m.SetTexture("_MainTex", tex);
                m.SetFloat("_Mono", 0.85f);
                m.SetColor("_Tint", new Color(0.78f, 0.95f, 1f));
                m.SetFloat("_Brightness", 2.6f);
                m.SetFloat("_Curvature", 0.05f);
            });
            var go = new GameObject(name);
            go.transform.SetParent(tv.transform, false);
            go.transform.localPosition = localCentre + new Vector3(0, 0, 0.0015f);
            string key = $"crt_{size.x:0.###}_{size.y:0.###}_{bulge:0.###}".Replace('.', 'p');
            go.AddComponent<MeshFilter>().sharedMesh = EsperMeshes.Save(EsperMeshes.Bulge(size.x, size.y, bulge), key, false);
            var r = go.AddComponent<MeshRenderer>();
            r.sharedMaterial = mat;
            r.shadowCastingMode = ShadowCastingMode.Off;
            var screen = go.AddComponent<CrtScreen>();

            var glow = new GameObject(name + "_Glow").AddComponent<Light>();
            glow.transform.SetParent(go.transform, false);
            glow.transform.localPosition = new Vector3(0, 0.05f, 0.45f);
            glow.lightmapBakeType = LightmapBakeType.Mixed;
            glow.type = LightType.Point;
            glow.color = new Color(0.62f, 0.86f, 1f);
            glow.range = 2.2f;
            glow.intensity = 0.25f;
            glow.shadows = LightShadows.None;
            screen.glow = glow;
            screen.glowIntensity = 0.25f;
            return go;
        }

        static GameObject Print(Transform parent, string photoPath, Vector3 pos, Vector3 euler, float width, float curl)
        {
            var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(photoPath);
            float aspect = tex ? tex.height / (float)tex.width : 1.3f;
            string key = Path.GetFileNameWithoutExtension(photoPath);
            var mat = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            mat.SetTexture("_BaseMap", tex);
            mat.SetColor("_BaseColor", new Color(0.92f, 0.88f, 0.8f));
            mat.SetFloat("_Smoothness", 0.62f);
            mat.SetFloat("_Cull", 0f);
            mat = SaveMat(mat, "Print_" + key);
            var go = new GameObject("Print");
            go.transform.SetParent(parent, false);
            go.transform.position = pos;
            go.transform.rotation = Quaternion.Euler(euler);
            // Prints have a white border: scale the image inside a slightly larger card.
            string meshKey = $"print_{width:0.###}_{aspect:0.##}_{curl:0.####}".Replace('.', 'p');
            go.AddComponent<MeshFilter>().sharedMesh = EsperMeshes.Save(EsperMeshes.CurledQuad(width, width * aspect, curl), meshKey, false);
            go.AddComponent<MeshRenderer>().sharedMaterial = mat;
            return go;
        }

        static void BuildPhotoLine()
        {
            float hw = RoomW / 2;
            var line = Group("PhotoLine", props);
            var wire = Plain("Wire", new Color(0.12f, 0.12f, 0.12f), 0.3f, 0.6f);
            var clipMat = Plain("Clip", new Color(0.32f, 0.3f, 0.27f), 0.5f, 0.8f);
            Vector3 a = new Vector3(hw - 0.06f, 2.12f, 0.35f), b = new Vector3(hw - 0.06f, 2.12f, 2.35f);
            Vector3 Sag(float t) => Vector3.Lerp(a, b, t) + Vector3.down * (0.07f * 4f * t * (1f - t));
            const int segs = 16;
            for (int i = 0; i < segs; i++)
            {
                var p0 = Sag(i / (float)segs); var p1 = Sag((i + 1) / (float)segs);
                var seg = Block("Wire", line, (p0 + p1) / 2, new Vector3(0.0018f, 0.0018f, (p1 - p0).magnitude), wire, isStatic: false, rot: Quaternion.LookRotation(p1 - p0));
                seg.GetComponent<MeshRenderer>().shadowCastingMode = ShadowCastingMode.On;
            }
            Block("Hook_A", line, a, new Vector3(0.02f, 0.02f, 0.02f), clipMat);
            Block("Hook_B", line, b, new Vector3(0.02f, 0.02f, 0.02f), clipMat);

            var photos = Directory.GetFiles(ObscuraDir, "*.jpg").Select(p => p.Replace('\\', '/')).OrderBy(p => p).ToArray();
            int[] pick = { 15, 3, 12, 18, 6, 14, 17 };
            var rng = new System.Random(7);
            for (int i = 0; i < pick.Length; i++)
            {
                float t = 0.08f + i * (0.84f / (pick.Length - 1));
                var p = Sag(t);
                float w = 0.12f + (float)rng.NextDouble() * 0.03f;
                var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(photos[pick[i]]);
                float h = w * (tex ? tex.height / (float)tex.width : 1.3f);
                float sway = ((float)rng.NextDouble() - 0.5f) * 8f;
                Print(line, photos[pick[i]], p + new Vector3(-0.004f, -h / 2 - 0.008f, 0), new Vector3(sway * 0.4f, 90f, sway), w, 0.006f);
                Block("Clip", line, p + new Vector3(-0.004f, -0.006f, 0), new Vector3(0.008f, 0.022f, 0.016f), clipMat, isStatic: false);
            }
        }
    }
}
