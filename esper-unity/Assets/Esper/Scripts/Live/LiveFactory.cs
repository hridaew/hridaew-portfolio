using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.Live
{
    /// Where the factory gets models, textures and materials. The editor answers synchronously from the
    /// AssetDatabase (and persists what it makes); the live runtime loads over the network.
    public interface ILiveServices
    {
        void LoadModel(string src, Action<GameObject> done);
        void LoadTexture(string src, Action<Texture2D> done);
        Material MaterialByName(string name);
        Material Persist(Material m, string name);
        Mesh PersistMesh(Mesh m, string key);
    }

    public static class LiveFactory
    {
        static readonly int MainTex = Shader.PropertyToID("_MainTex");
        static readonly int BaseMap = Shader.PropertyToID("_BaseMap");

        public static void Build(ItemSpec spec, Transform parent, ILiveServices svc, Action<GameObject> done)
        {
            void Finish(GameObject go)
            {
                go.name = Name(spec);
                go.transform.SetParent(parent, true);
                ApplyTransform(go.transform, spec, parent != null && parent.GetComponent<LiveItem>() != null);
                Decorate(go, spec, svc);
                done?.Invoke(go);
            }

            switch (spec.kind)
            {
                case "model":
                    svc.LoadModel(spec.src, go =>
                    {
                        if (go == null) { go = new GameObject("missing " + spec.src); Debug.LogWarning($"[live] missing model {spec.src}"); }
                        Finish(go);
                    });
                    break;
                case "box":
                {
                    var go = new GameObject();
                    var size = V(spec.size, Vector3.one * 0.1f);
                    string key = $"box_{size.x:0.###}_{size.y:0.###}_{size.z:0.###}".Replace('.', 'p');
                    go.AddComponent<MeshFilter>().sharedMesh = svc.PersistMesh(LiveMeshes.Box(size), key);
                    go.AddComponent<MeshRenderer>().sharedMaterial = svc.MaterialByName(spec.material);
                    Finish(go);
                    break;
                }
                case "quad":
                {
                    var go = new GameObject();
                    go.AddComponent<MeshFilter>().sharedMesh = Resources.GetBuiltinResource<Mesh>("Quad.fbx");
                    var r = go.AddComponent<MeshRenderer>();
                    var baseMat = svc.MaterialByName(spec.material);
                    if (!string.IsNullOrEmpty(spec.src))
                    {
                        var m = baseMat ? new Material(baseMat) : LitTextured();
                        m.name = "Quad_" + Key(spec.src);
                        r.sharedMaterial = svc.Persist(m, m.name);
                        svc.LoadTexture(spec.src, t => { if (r) { r.sharedMaterial.SetTexture(BaseMap, t); } });
                    }
                    else r.sharedMaterial = baseMat;
                    Finish(go);
                    break;
                }
                case "print":
                {
                    var go = new GameObject();
                    string key = $"print_{spec.w:0.###}_{spec.h:0.##}_{spec.curl:0.####}".Replace('.', 'p');
                    go.AddComponent<MeshFilter>().sharedMesh = svc.PersistMesh(LiveMeshes.CurledQuad(spec.w, spec.h, spec.curl), key);
                    var r = go.AddComponent<MeshRenderer>();
                    var m = LitTextured();
                    m.SetColor("_BaseColor", new Color(0.92f, 0.88f, 0.8f));
                    m.SetFloat("_Smoothness", 0.62f);
                    m.SetFloat("_Cull", 0f);
                    m.name = "Print_" + Key(spec.src);
                    r.sharedMaterial = svc.Persist(m, m.name);
                    svc.LoadTexture(spec.src, t => { if (r) r.sharedMaterial.SetTexture(BaseMap, t); });
                    Finish(go);
                    break;
                }
                default: // group
                    Finish(new GameObject());
                    break;
            }
        }

        static string Name(ItemSpec spec)
        {
            var id = spec.id ?? spec.kind;
            int slash = id.LastIndexOf('/');
            return slash >= 0 ? id.Substring(slash + 1) : id;
        }

        public static string Key(string src) => System.IO.Path.GetFileNameWithoutExtension(src ?? "none");

        static Material LitTextured() => new Material(Shader.Find("Universal Render Pipeline/Lit"));

        public static void ApplyTransform(Transform t, ItemSpec spec, bool local)
        {
            var p = V(spec.p, Vector3.zero);
            var r = Quaternion.Euler(V(spec.r, Vector3.zero));
            var s = spec.s == null ? Vector3.one : spec.s.Length == 1 ? Vector3.one * spec.s[0] : V(spec.s, Vector3.one);
            if (local) { t.localPosition = p; t.localRotation = r; }
            else { t.position = p; t.rotation = r; }
            t.localScale = s;
        }

        /// Re-dress an existing item in place (new screen image, photo, tint, spin, children) without reloading its model.
        public static void Redecorate(GameObject go, ItemSpec spec, ILiveServices svc)
        {
            var doomed = new List<GameObject>();
            foreach (Transform t in go.GetComponentsInChildren<Transform>(true))
            {
                if (t == go.transform) continue;
                if (t.name == "LiveScreen" || t.name.EndsWith("_Glow") || (t.parent == go.transform && t.GetComponent<LiveItem>())) doomed.Add(t.gameObject);
            }
            foreach (var d in doomed)
            {
                if (Application.isPlaying) UnityEngine.Object.Destroy(d);
                else UnityEngine.Object.DestroyImmediate(d);
            }
            Decorate(go, spec, svc);
        }

        static void Decorate(GameObject go, ItemSpec spec, ILiveServices svc)
        {
            var li = go.GetComponent<LiveItem>() ?? go.AddComponent<LiveItem>();
            li.id = spec.id;
            li.spec = LiveJson.Item(spec);

            if (spec.tint != null)
            {
                var c = C(spec.tint);
                foreach (var r in go.GetComponentsInChildren<MeshRenderer>())
                {
                    var mats = r.sharedMaterials;
                    for (int i = 0; i < mats.Length; i++)
                    {
                        if (!mats[i]) continue;
                        var m = new Material(mats[i]) { name = $"Tint_{spec.id?.Replace('/', '_')}_{r.name}_{i}" };
                        if (m.HasProperty("baseColorFactor")) m.SetColor("baseColorFactor", c);
                        if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);
                        mats[i] = svc.Persist(m, m.name);
                    }
                    r.sharedMaterials = mats;
                }
            }

            foreach (var r in go.GetComponentsInChildren<MeshRenderer>())
            {
                r.shadowCastingMode = spec.noShadows ? ShadowCastingMode.Off : ShadowCastingMode.On;
                r.reflectionProbeUsage = ReflectionProbeUsage.BlendProbes;
            }

            if (spec.display != null) ApplyDisplay(go, spec, svc);
            if (spec.photo != null)
            {
                var t = Find(go.transform, spec.photo.surface ?? "Photo");
                if (t)
                {
                    var m = LitTextured();
                    m.SetColor("_BaseColor", new Color(0.9f, 0.88f, 0.84f));
                    m.SetFloat("_Smoothness", 0.7f);
                    m.name = "Photo_" + Key(spec.photo.src);
                    var r = t.GetComponent<MeshRenderer>();
                    r.sharedMaterial = svc.Persist(m, m.name);
                    svc.LoadTexture(spec.photo.src, tex => { if (r) r.sharedMaterial.SetTexture(BaseMap, tex); });
                }
            }
            if (spec.spin != null)
            {
                var t = string.IsNullOrEmpty(spec.spin.child) ? go.transform : Find(go.transform, spec.spin.child);
                if (t) (t.GetComponent<Spin>() ?? t.gameObject.AddComponent<Spin>()).degreesPerSecond = spec.spin.dps;
            }
            if (spec.children != null)
                foreach (var c in spec.children)
                    Build(c, go.transform, svc, null);
            go.SetActive(!spec.hidden);
        }

        static void ApplyDisplay(GameObject go, ItemSpec spec, ILiveServices svc)
        {
            var d = spec.display;
            GameObject screen;
            if (d.crt != null && d.crt.Length >= 6)
            {
                // A CRT face fitted to the tube glass, in the model's local space.
                screen = new GameObject("LiveScreen");
                screen.transform.SetParent(go.transform, false);
                screen.transform.localPosition = new Vector3(d.crt[0], d.crt[1], d.crt[2] + 0.0015f);
                string key = $"crt_{d.crt[3]:0.###}_{d.crt[4]:0.###}_{d.crt[5]:0.###}".Replace('.', 'p');
                screen.AddComponent<MeshFilter>().sharedMesh = svc.PersistMesh(LiveMeshes.Bulge(d.crt[3], d.crt[4], d.crt[5]), key);
                screen.AddComponent<MeshRenderer>();
            }
            else
            {
                var t = Find(go.transform, d.surface ?? "Screen");
                if (!t) { Debug.LogWarning($"[live] {spec.id}: no surface {d.surface}"); return; }
                screen = t.gameObject;
            }
            var r = screen.GetComponent<MeshRenderer>();
            var m = new Material(Shader.Find("Esper/CrtScreen")) { name = "Display_" + (spec.id ?? "x").Replace('/', '_') };
            if (d.floats != null) foreach (var kv in d.floats) m.SetFloat(kv.Key, kv.Value);
            if (d.tint != null) m.SetColor("_Tint", C(d.tint));
            if (d.st != null && d.st.Length == 4) { m.SetTextureScale(MainTex, new Vector2(d.st[0], d.st[1])); m.SetTextureOffset(MainTex, new Vector2(d.st[2], d.st[3])); }
            r.sharedMaterial = svc.Persist(m, m.name);
            r.shadowCastingMode = ShadowCastingMode.Off;
            svc.LoadTexture(d.src, tex => { if (r) r.sharedMaterial.SetTexture(MainTex, tex); });
            var crt = screen.GetComponent<CrtScreen>() ?? screen.AddComponent<CrtScreen>();
            if (d.glow > 0)
            {
                var glow = new GameObject(screen.name + "_Glow").AddComponent<Light>();
                glow.transform.SetParent(screen.transform, false);
                glow.transform.localPosition = V(d.glowOffset, new Vector3(0, 0.05f, 0.45f));
                glow.type = LightType.Point;
                glow.color = d.glowColor != null ? C(d.glowColor) : new Color(0.62f, 0.86f, 1f);
                glow.range = 2.4f;
                glow.intensity = d.glow;
                glow.shadows = LightShadows.None;
#if UNITY_EDITOR
                glow.lightmapBakeType = LightmapBakeType.Mixed;
#endif
                crt.glow = glow;
                crt.glowIntensity = d.glow;
            }
        }

        public static Light BuildLight(LightSpec spec, Transform parent)
        {
            var l = new GameObject(spec.id).AddComponent<Light>();
            l.transform.SetParent(parent, false);
            l.gameObject.AddComponent<LiveLight>().id = spec.id;
            ApplyLight(l, spec);
            return l;
        }

        public static void ApplyLight(Light l, LightSpec spec)
        {
            l.type = spec.type == "spot" ? LightType.Spot : spec.type == "directional" ? LightType.Directional : LightType.Point;
            l.transform.position = V(spec.p, l.transform.position);
            if (spec.dir != null) l.transform.rotation = Quaternion.LookRotation(V(spec.dir, Vector3.forward));
            if (spec.color != null) l.color = C(spec.color);
            var flick = l.GetComponent<LightFlicker>();
            if (spec.flicker && !flick) flick = l.gameObject.AddComponent<LightFlicker>();
            if (flick) flick.baseIntensity = spec.intensity;
            l.intensity = spec.intensity;
            if (spec.range > 0) l.range = spec.range;
            if (spec.angle > 0) { l.spotAngle = spec.angle; l.innerSpotAngle = spec.angle * 0.45f; }
            l.shadows = spec.shadows ? LightShadows.Soft : LightShadows.None;
#if UNITY_EDITOR
            l.lightmapBakeType = LightmapBakeType.Mixed;
#endif
        }

        public static Transform Find(Transform root, string name)
        {
            foreach (var t in root.GetComponentsInChildren<Transform>(true))
                if (t.name == name || t.name.StartsWith(name + ".")) return t;
            return null;
        }

        public static Vector3 V(float[] a, Vector3 fallback) => a != null && a.Length >= 3 ? new Vector3(a[0], a[1], a[2]) : fallback;
        public static Color C(float[] a) => a.Length >= 4 ? new Color(a[0], a[1], a[2], a[3]) : new Color(a[0], a[1], a[2]);
    }
}
