using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Unity.Cinemachine;
using UnityEngine;
using UnityEngine.Networking;

namespace Esper.Live
{
    /// Applies the scene spec to the running room, diffing against what is already there:
    /// unchanged items are left alone, moved items are moved, changed items are rebuilt in place,
    /// new items load on demand. Page -> Unity: SendMessage("ESPER", "ApplyScene", json).
    public class LiveScene : MonoBehaviour
    {
        string assetBase = "";
        ILiveServices svc;
        int pending;
        LiveSceneSpec lastSpec;

        public void SetAssetBase(string value) => assetBase = value ?? "";

        public void ApplyScene(string json)
        {
            LiveSceneSpec spec;
            try { spec = LiveJson.Scene(json); }
            catch (Exception e) { Debug.LogWarning($"[live] bad scene json: {e.Message}"); return; }
            if (spec == null) return;
            var rs = svc as RuntimeServices ?? new RuntimeServices(this, GetComponent<LiveLibrary>());
            rs.assetBase = assetBase;
            svc = rs;
            lastSpec = spec;

            ApplyItems(spec);
            ApplyLights(spec);
            if (pending == 0) ApplyStations(spec);
            ApplyViews(spec);
            ApplyLook(spec);
            WebBridge.Emit("live-applied", "");
        }

        /// Editor bake: build the whole spec synchronously with AssetDatabase services.
        public void ApplyEditor(LiveSceneSpec spec, ILiveServices services)
        {
            svc = services;
            lastSpec = spec;
            ApplyItems(spec);
            ApplyLights(spec);
            ApplyStations(spec);
            ApplyViews(spec);
            ApplyLook(spec);
        }

        static void Kill(GameObject go)
        {
            if (Application.isPlaying) Destroy(go);
            else DestroyImmediate(go);
        }

        // ---------------- items ----------------

        void ApplyItems(LiveSceneSpec spec)
        {
            var props = transform.Find("Props");
            var existing = new Dictionary<string, LiveItem>();
            foreach (var li in props.GetComponentsInChildren<LiveItem>(true))
                if (li.transform.parent && li.transform.parent.parent == props && !string.IsNullOrEmpty(li.id))
                    existing[li.id] = li;

            var wanted = new HashSet<string>();
            foreach (var item in spec.items)
            {
                if (string.IsNullOrEmpty(item.id)) continue;
                wanted.Add(item.id);
                var group = props.Find(item.group ?? "Room") ?? NewGroup(props, item.group ?? "Room");
                string canonical = LiveJson.Item(item);
                existing.TryGetValue(item.id, out var cur);
                if (cur && cur.spec == canonical) continue;
                if (cur && SameExceptTransform(cur.spec, item))
                {
                    if (cur.transform.parent != group) cur.transform.SetParent(group, true);
                    LiveFactory.ApplyTransform(cur.transform, item, false);
                    cur.spec = canonical;
                    continue;
                }
                // Same model, new dressing (screen image, photo, tint...): re-dress in place, no reload.
                if (cur && SameBase(cur.spec, item))
                {
                    if (cur.transform.parent != group) cur.transform.SetParent(group, true);
                    LiveFactory.ApplyTransform(cur.transform, item, false);
                    LiveFactory.Redecorate(cur.gameObject, item, svc);
                    continue;
                }
                // Build the replacement first, then retire the old one: no blink.
                pending++;
                var old = cur ? cur.gameObject : null;
                LiveFactory.Build(item, group, svc, go =>
                {
                    if (old) Kill(old);
                    pending--;
                    if (pending == 0 && lastSpec != null) ApplyStations(lastSpec);
                });
            }
            foreach (var kv in existing)
                if (!wanted.Contains(kv.Key) && kv.Value) Kill(kv.Value.gameObject);
        }

        static Transform NewGroup(Transform props, string name)
        {
            var t = new GameObject(name).transform;
            t.SetParent(props, false);
            return t;
        }

        /// Same thing underneath (kind, model, box size, material): only its dressing changed.
        static bool SameBase(string currentJson, ItemSpec next)
        {
            ItemSpec cur;
            try { cur = Newtonsoft.Json.JsonConvert.DeserializeObject<ItemSpec>(currentJson); }
            catch { return false; }
            if (cur == null || cur.kind != next.kind || cur.src != next.src || cur.material != next.material) return false;
            if (next.kind == "screen" && (cur.w != next.w || cur.h != next.h)) return false;
            if (next.kind == "print" || next.kind == "quad" || next.kind == "wall") return false;
            if (cur.radius != next.radius || cur.corner != next.corner) return false;
            return Newtonsoft.Json.JsonConvert.SerializeObject(cur.size) == Newtonsoft.Json.JsonConvert.SerializeObject(next.size);
        }

        static bool SameExceptTransform(string currentJson, ItemSpec next)
        {
            ItemSpec cur;
            try { cur = Newtonsoft.Json.JsonConvert.DeserializeObject<ItemSpec>(currentJson); }
            catch { return false; }
            if (cur == null) return false;
            var a = LiveJson.Clone(cur);
            var b = LiveJson.Clone(next);
            a.p = a.r = a.s = null; a.group = null;
            b.p = b.r = b.s = null; b.group = null;
            return LiveJson.Item(a) == LiveJson.Item(b);
        }

        // ---------------- lights ----------------

        void ApplyLights(LiveSceneSpec spec)
        {
            var byName = new Dictionary<string, Light>();
            foreach (var l in GetComponentsInChildren<Light>(true))
            {
                if (l.GetComponentInParent<CrtScreen>()) continue;
                byName[l.name] = l;
            }
            var lightsRoot = transform.Find("Lights");
            var liveGroup = lightsRoot.Find("Live") ?? NewGroup(lightsRoot, "Live");
            var wanted = new HashSet<string>();
            foreach (var ls in spec.lights)
            {
                wanted.Add(ls.id);
                if (byName.TryGetValue(ls.id, out var l)) LiveFactory.ApplyLight(l, ls);
                else LiveFactory.BuildLight(ls, liveGroup);
            }
            foreach (var ll in GetComponentsInChildren<LiveLight>(true))
                if (!wanted.Contains(ll.id)) Kill(ll.gameObject);
        }

        // ---------------- stations ----------------

        void ApplyStations(LiveSceneSpec spec)
        {
            var director = GetComponent<EsperDirector>();
            var props = transform.Find("Props");
            var items = new Dictionary<string, LiveItem>();
            foreach (var li in props.GetComponentsInChildren<LiveItem>(true))
                if (li.transform.parent && li.transform.parent.parent == props) items[li.id] = li;
            var lights = GetComponentsInChildren<Light>(true).GroupBy(l => l.name).ToDictionary(g => g.Key, g => g.First());
            var list = director.hotspots.ToList();

            foreach (var st in spec.stations)
            {
                var h = list.FirstOrDefault(x => x.id == st.id);
                if (h == null)
                {
                    h = new GameObject("Hotspot_" + st.id).AddComponent<Hotspot>();
                    h.transform.SetParent(props, false);
                    h.id = st.id;
                    h.gameObject.AddComponent<BoxCollider>();
                    var cam = new GameObject("VCam_" + st.id).AddComponent<CinemachineCamera>();
                    cam.transform.SetParent(transform.Find("Cameras"), false);
                    cam.Priority = 0;
                    h.focusCamera = cam;
                    list.Add(h);
                }
                h.url = st.url ?? "";
                h.accentBoost = st.boost > 0 ? st.boost : 1.8f;
                if (st.rect != null && st.rect.Length == 4) h.enhanceRect = new Vector4(st.rect[0], st.rect[1], st.rect[2], st.rect[3]);
                if (!string.IsNullOrEmpty(st.accent) && lights.TryGetValue(st.accent, out var acc)) h.accent = acc;
                if (!string.IsNullOrEmpty(st.screen) && items.TryGetValue(st.screen, out var scr)) h.screen = scr.GetComponentInChildren<CrtScreen>(true);
                h.hasEnter = st.enter != null && st.enter.Length == 3;
                if (h.hasEnter) h.enter = LiveFactory.V(st.enter, Vector3.zero);

                // The click target wraps the station's items.
                Bounds? b = null;
                foreach (var id in st.items)
                {
                    if (!items.TryGetValue(id, out var li)) continue;
                    foreach (var r in li.GetComponentsInChildren<Renderer>())
                    {
                        if (b == null) b = r.bounds;
                        else { var bb = b.Value; bb.Encapsulate(r.bounds); b = bb; }
                    }
                }
                var col = h.GetComponent<BoxCollider>();
                if (b != null && col)
                {
                    h.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
                    col.center = b.Value.center;
                    col.size = b.Value.size + Vector3.one * 0.04f;
                }
                if (col && st.bounds != null && st.bounds.Length == 6)
                {
                    h.transform.SetPositionAndRotation(Vector3.zero, Quaternion.identity);
                    col.center = new Vector3(st.bounds[0], st.bounds[1], st.bounds[2]);
                    col.size = new Vector3(st.bounds[3], st.bounds[4], st.bounds[5]);
                }
            }
            director.hotspots = list.ToArray();
        }

        // ---------------- views + look ----------------

        void ApplyViews(LiveSceneSpec spec)
        {
            var director = GetComponent<EsperDirector>();
            foreach (var v in spec.views)
            {
                var cam = director.CameraFor(v.id);
                if (!cam) continue;
                var pos = LiveFactory.V(v.p, cam.transform.position);
                var target = LiveFactory.V(v.target, pos + cam.transform.forward);
                cam.transform.SetPositionAndRotation(pos, Quaternion.LookRotation(target - pos));
                var lens = cam.Lens;
                if (v.fov > 0) lens.FieldOfView = v.fov;
                cam.Lens = lens;
                director.Rebase(cam);
            }
        }

        void ApplyLook(LiveSceneSpec spec)
        {
            var look = GetComponent<LookDev>();
            if (!look || spec.look == null) return;
            look.Look(string.Join(";", spec.look.Select(kv => $"{kv.Key}={kv.Value.ToString(CultureInfo.InvariantCulture)}")));
        }

        // ---------------- network services ----------------

        class RuntimeServices : ILiveServices
        {
            readonly MonoBehaviour host;
            readonly LiveLibrary library;
            public string assetBase = "";
            readonly Dictionary<string, Texture2D> textures = new();
            readonly Dictionary<string, List<Action<Texture2D>>> waitingTextures = new();
            readonly Dictionary<string, GLTFast.GltfImport> models = new();
            readonly Dictionary<string, Mesh> meshes = new();

            public RuntimeServices(MonoBehaviour host, LiveLibrary library)
            {
                this.host = host;
                this.library = library;
            }

            string ModelUrl(string src)
            {
                if (src.StartsWith("ph:")) { var id = src.Substring(3); return $"{assetBase}ThirdParty/PolyHaven/Models/{id}/{id}_2k.gltf"; }
                if (src.StartsWith("esper:")) return $"{assetBase}Esper/Models/{src.Substring(6)}.glb";
                return assetBase + src;
            }

            public async void LoadModel(string src, Action<GameObject> done)
            {
                try
                {
                    if (!models.TryGetValue(src, out var gltf))
                    {
                        gltf = new GLTFast.GltfImport();
                        if (!await gltf.Load(ModelUrl(src))) { done(null); return; }
                        models[src] = gltf;
                    }
                    var go = new GameObject(src);
                    await gltf.InstantiateMainSceneAsync(go.transform);
                    done(go);
                }
                catch (Exception e)
                {
                    Debug.LogWarning($"[live] model {src}: {e.Message}");
                    done(null);
                }
            }

            public void LoadTexture(string src, Action<Texture2D> done)
            {
                if (string.IsNullOrEmpty(src)) return;
                if (textures.TryGetValue(src, out var t)) { done(t); return; }
                if (waitingTextures.TryGetValue(src, out var q)) { q.Add(done); return; }
                waitingTextures[src] = new List<Action<Texture2D>> { done };
                host.StartCoroutine(FetchTexture(src));
            }

            IEnumerator FetchTexture(string src)
            {
                using var req = UnityWebRequestTexture.GetTexture($"{assetBase}Esper/{src}");
                yield return req.SendWebRequest();
                Texture2D tex = req.result == UnityWebRequest.Result.Success ? DownloadHandlerTexture.GetContent(req) : null;
                if (tex) { tex.wrapMode = TextureWrapMode.Clamp; textures[src] = tex; }
                else Debug.LogWarning($"[live] texture {src}: {req.error}");
                foreach (var cb in waitingTextures[src]) if (tex) cb(tex);
                waitingTextures.Remove(src);
            }

            public Material MaterialByName(string name) => library ? library.ByName(name) : null;
            public Material Persist(Material m, string name) => m;

            public Mesh PersistMesh(Mesh m, string key)
            {
                if (meshes.TryGetValue(key, out var cached)) return cached;
                meshes[key] = m;
                return m;
            }
        }
    }
}
