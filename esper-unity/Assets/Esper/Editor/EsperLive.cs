using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using Esper.Live;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    /// The live scene in the editor: services for baking the spec, and the one-time exporter that
    /// turned the hand-coded room into Live/scene.json.
    public static class EsperLive
    {
        public static string ScenePath => Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Live", "scene.json"));

        public class EditorServices : ILiveServices
        {
            public void LoadModel(string src, Action<GameObject> done)
            {
                string path = null;
                if (src.StartsWith("ph:"))
                {
                    var dir = $"Assets/ThirdParty/PolyHaven/Models/{src.Substring(3)}";
                    path = Directory.Exists(dir) ? Directory.GetFiles(dir, "*.gltf").FirstOrDefault()?.Replace('\\', '/') : null;
                }
                else if (src.StartsWith("esper:")) path = $"Assets/Esper/Models/{src.Substring(6)}.glb";
                var prefab = path != null ? AssetDatabase.LoadAssetAtPath<GameObject>(path) : null;
                done(prefab ? (GameObject)PrefabUtility.InstantiatePrefab(prefab) : null);
            }

            public void LoadTexture(string src, Action<Texture2D> done)
            {
                if (string.IsNullOrEmpty(src)) return;
                var t = AssetDatabase.LoadAssetAtPath<Texture2D>($"Assets/Esper/{src}");
                if (t) done(t);
                else Debug.LogWarning($"[live] missing texture {src}");
            }

            public Material MaterialByName(string name) =>
                string.IsNullOrEmpty(name) ? null : AssetDatabase.LoadAssetAtPath<Material>($"Assets/Esper/Generated/Materials/{name}.mat");

            public Material Persist(Material m, string name)
            {
                Directory.CreateDirectory("Assets/Esper/Generated/Materials");
                string path = $"Assets/Esper/Generated/Materials/{name}.mat";
                var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
                if (existing)
                {
                    existing.shader = m.shader;
                    existing.CopyPropertiesFromMaterial(m);
                    existing.shaderKeywords = m.shaderKeywords;
                    return existing;
                }
                AssetDatabase.CreateAsset(m, path);
                return m;
            }

            public Mesh PersistMesh(Mesh m, string key) => EsperMeshes.Save(m, key, false);
        }

        // ---------------- export ----------------

        static readonly string[] DisplayFloats = { "_Brightness", "_Curvature", "_Scanlines", "_ScanAmount", "_Mask", "_Noise", "_Mono", "_Glass", "_Vignette" };
        static readonly Dictionary<string, string[]> StationGroups = new()
        {
            ["domis"] = new[] { "Domis" },
            ["virdio"] = new[] { "Virdio" },
            ["obscura"] = new[] { "ESPER_Desk", "ESPER_Bank" },
            ["memory-care"] = new[] { "MemoryCare" },
            ["wafflings"] = new[] { "Wafflings" },
            ["taste"] = new[] { "Taste" },
        };

        /// Build the room the old way, then write what was built as data.
        public static void BuildAndExport()
        {
            EsperBuilder.Build();
            var root = GameObject.Find("ESPER").transform;
            var spec = new LiveSceneSpec();
            var props = root.Find("Props");
            var ids = new HashSet<string>();
            var itemOf = new Dictionary<Transform, string>();
            foreach (Transform group in props)
            {
                if (group.GetComponent<Hotspot>()) continue;
                foreach (Transform t in group)
                {
                    if (t.GetComponent<Light>() && t.childCount == 0) continue; // practicals are exported as lights
                    var item = ExportItem(t, true);
                    if (item == null) continue;
                    item.group = group.name;
                    string baseId = $"{group.name.ToLowerInvariant()}/{Slug(t.name)}", id = baseId;
                    for (int n = 2; ids.Contains(id); n++) id = $"{baseId}-{n}";
                    ids.Add(id);
                    item.id = id;
                    itemOf[t] = id;
                    spec.items.Add(item);
                }
            }

            foreach (var l in root.GetComponentsInChildren<Light>(true))
            {
                if (l.transform.IsChildOf(root.Find("Outside"))) continue;
                if (l.GetComponentInParent<CrtScreen>()) continue;
                if (l.name == "TubeLight") continue;
                var f = l.GetComponent<LightFlicker>();
                spec.lights.Add(new LightSpec
                {
                    id = l.name,
                    type = l.type == LightType.Spot ? "spot" : l.type == LightType.Directional ? "directional" : "point",
                    p = A(l.transform.position),
                    dir = l.type == LightType.Point ? null : A(l.transform.forward),
                    color = new[] { R(l.color.r), R(l.color.g), R(l.color.b) },
                    intensity = R(l.intensity),
                    range = l.type == LightType.Directional ? 0 : R(l.range),
                    angle = l.type == LightType.Spot ? R(l.spotAngle) : 0,
                    shadows = l.shadows != LightShadows.None,
                    flicker = f != null,
                    group = l.transform.parent ? l.transform.parent.name : null,
                });
            }

            var director = root.GetComponent<EsperDirector>();
            spec.views.Add(View("overview", director.overviewCamera));
            foreach (var h in director.hotspots)
            {
                spec.views.Add(View(h.id, h.focusCamera));
                var st = new StationSpec { id = h.id, url = h.url, view = h.id, boost = h.accentBoost, accent = h.accent ? h.accent.name : null };
                if (h.enhanceRect != Vector4.zero) st.rect = new[] { R(h.enhanceRect.x), R(h.enhanceRect.y), R(h.enhanceRect.z), R(h.enhanceRect.w) };
                if (StationGroups.TryGetValue(h.id, out var groups))
                    st.items = spec.items.Where(i => groups.Contains(i.group)).Select(i => i.id).ToList();
                if (h.screen)
                    for (var t = h.screen.transform; t; t = t.parent)
                        if (itemOf.TryGetValue(t, out var sid)) { st.screen = sid; break; }
                spec.stations.Add(st);
            }

            Directory.CreateDirectory(Path.GetDirectoryName(ScenePath));
            File.WriteAllText(ScenePath, LiveJson.Scene(spec));
            Debug.Log($"[esper] live export: {spec.items.Count} items, {spec.lights.Count} lights, {spec.views.Count} views, {spec.stations.Count} stations -> {ScenePath}");
        }

        static ViewSpec View(string id, Unity.Cinemachine.CinemachineCamera cam) => new()
        {
            id = id,
            p = A(cam.transform.position),
            target = A(cam.transform.position + cam.transform.forward * 3f),
            fov = R(cam.Lens.FieldOfView),
        };

        static ItemSpec ExportItem(Transform t, bool world)
        {
            var go = t.gameObject;
            var item = new ItemSpec
            {
                p = A(world ? t.position : t.localPosition),
                r = A(world ? t.eulerAngles : t.localEulerAngles),
                s = Scale(t.localScale),
            };
            if (PrefabUtility.IsOutermostPrefabInstanceRoot(go))
            {
                item.kind = "model";
                var path = PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(go).Replace('\\', '/');
                if (path.Contains("/PolyHaven/Models/")) item.src = "ph:" + path.Split('/')[^2];
                else if (path.Contains("/Esper/Models/")) item.src = "esper:" + Path.GetFileNameWithoutExtension(path);
                ExportDecorations(go, item);
                return item;
            }
            var mf = go.GetComponent<MeshFilter>();
            var mr = go.GetComponent<MeshRenderer>();
            if (mf && mf.sharedMesh && mr)
            {
                string mesh = MeshKey(mf.sharedMesh);
                if (mesh.StartsWith("box_"))
                {
                    item.kind = "box";
                    item.size = A(mf.sharedMesh.bounds.size);
                    item.material = mr.sharedMaterial ? mr.sharedMaterial.name : null;
                }
                else if (mesh.StartsWith("print_"))
                {
                    item.kind = "print";
                    item.src = TexSrc(mr.sharedMaterial, "_BaseMap");
                    var parts = mesh.Split('_');
                    // print_<width>_<aspect>_<curl>
                    item.w = F(parts[1]); item.h = R(item.w * F(parts[2])); item.curl = F(parts[3]);
                }
                else if (mesh == "Quad")
                {
                    item.kind = "quad";
                    item.material = mr.sharedMaterial ? mr.sharedMaterial.name : null;
                }
                else return null;
                if (mr.shadowCastingMode == ShadowCastingMode.Off) item.noShadows = true;
            }
            else item.kind = "group";

            if (t.childCount > 0)
            {
                item.children = new List<ItemSpec>();
                int n = 0;
                foreach (Transform c in t)
                {
                    if (c.GetComponent<Light>()) continue;
                    var child = ExportItem(c, false);
                    if (child == null) continue;
                    child.id = $"{Slug(c.name)}-{n++}";
                    item.children.Add(child);
                }
            }
            return item;
        }

        static void ExportDecorations(GameObject go, ItemSpec item)
        {
            var crt = go.GetComponentInChildren<CrtScreen>(true);
            if (crt)
            {
                var mr = crt.GetComponent<MeshRenderer>();
                var mf = crt.GetComponent<MeshFilter>();
                var m = mr.sharedMaterial;
                var d = new DisplaySpec
                {
                    src = TexSrc(m, "_MainTex"),
                    floats = DisplayFloats.Where(m.HasProperty).ToDictionary(p => p, p => R(m.GetFloat(p))),
                    tint = Col(m.GetColor("_Tint")),
                };
                var sc = m.GetTextureScale("_MainTex");
                var of = m.GetTextureOffset("_MainTex");
                if (sc != Vector2.one || of != Vector2.zero) d.st = new[] { R(sc.x), R(sc.y), R(of.x), R(of.y) };
                if (mf && mf.sharedMesh && MeshKey(mf.sharedMesh).StartsWith("crt_"))
                {
                    var parts = MeshKey(mf.sharedMesh).Split('_');
                    var lp = go.transform.InverseTransformPoint(crt.transform.position);
                    d.crt = new[] { R(lp.x), R(lp.y), R(lp.z - 0.0015f), F(parts[1]), F(parts[2]), F(parts[3]) };
                }
                else d.surface = crt.name;
                // Glows that live on the screen travel with it; free-standing ones are exported as lights.
                if (crt.glow && crt.glow.transform.IsChildOf(crt.transform))
                {
                    d.glow = R(crt.glowIntensity);
                    d.glowColor = Col(crt.glow.color).Take(3).ToArray();
                    d.glowOffset = A(crt.glow.transform.localPosition);
                }
                item.display = d;
            }
            var photo = go.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == "Photo");
            if (photo && photo.GetComponent<MeshRenderer>() is { } pr && pr.sharedMaterial && pr.sharedMaterial.name.StartsWith("Photo_"))
                item.photo = new PhotoSpec { surface = "Photo", src = TexSrc(pr.sharedMaterial, "_BaseMap") };
            var tinted = go.GetComponentsInChildren<MeshRenderer>(true).SelectMany(r => r.sharedMaterials).FirstOrDefault(m => m && m.name.StartsWith("LampBody"));
            if (tinted) item.tint = Col(tinted.HasProperty("baseColorFactor") ? tinted.GetColor("baseColorFactor") : tinted.GetColor("_BaseColor")).Take(3).ToArray();
            var spin = go.GetComponentInChildren<Spin>(true);
            if (spin) item.spin = new SpinSpec { child = spin.gameObject == go ? null : spin.name, dps = spin.degreesPerSecond };
            var renderers = go.GetComponentsInChildren<MeshRenderer>(true).Where(r => !r.GetComponent<CrtScreen>()).ToArray();
            if (renderers.Length > 0 && renderers.All(r => r.shadowCastingMode == ShadowCastingMode.Off)) item.noShadows = true;
        }

        static string TexSrc(Material m, string prop)
        {
            if (!m || !m.HasProperty(prop)) return null;
            var tex = m.GetTexture(prop);
            if (!tex) return null;
            var path = AssetDatabase.GetAssetPath(tex).Replace('\\', '/');
            return path.StartsWith("Assets/Esper/") ? path.Substring("Assets/Esper/".Length) : path;
        }

        /// Generated meshes are saved as Generated/Meshes/<key>.asset; the key encodes their parameters.
        static string MeshKey(Mesh m)
        {
            var path = AssetDatabase.GetAssetPath(m);
            return path.StartsWith("Assets/") ? Path.GetFileNameWithoutExtension(path) : m.name;
        }

        static string Slug(string s) => new string(s.ToLowerInvariant().Select(c => char.IsLetterOrDigit(c) ? c : '-').ToArray()).Trim('-');
        static float R(float v) => (float)Math.Round(v, 4);
        static float F(string s) => float.Parse(s.Replace('p', '.'), CultureInfo.InvariantCulture);
        static float[] A(Vector3 v) => new[] { R(v.x), R(v.y), R(v.z) };
        static float[] Col(Color c) => new[] { R(c.r), R(c.g), R(c.b), R(c.a) };
        static float[] Scale(Vector3 s) => Mathf.Approximately(s.x, s.y) && Mathf.Approximately(s.y, s.z) ? (Mathf.Approximately(s.x, 1) ? null : new[] { R(s.x) }) : A(s);
    }
}
