using System.Collections.Generic;
using System.IO;
using System.Linq;
using Esper.Rendering;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper.EditorTools
{
    /// Builds the ESPER apartment scene from scratch. Re-run after any change; nothing is hand-placed.
    public static partial class EsperBuilder
    {
        public const string ScenePath = "Assets/Esper/Esper.unity";
        const string MatDir = "Assets/Esper/Generated/Materials";
        const string Models = "Assets/ThirdParty/PolyHaven/Models";
        const string Textures = "Assets/ThirdParty/PolyHaven/Textures";

        // Room interior extents (metres). Window wall is +Z.
        public const float RoomW = 6f, RoomD = 5.2f, RoomH = 2.85f, WallT = 0.25f;
        public static readonly Vector2 WinX = new Vector2(-1.5f, 2.25f);
        public static readonly Vector2 WinY = new Vector2(0.85f, 2.45f);
        static float BackZ => RoomD * 0.5f;

        static Transform root, shell, props, outside, lightsRoot, cams;

        public static void Build()
        {
            ConfigurePipeline();
            PrepareTextureImporters();

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            root = new GameObject("ESPER").transform;
            shell = Group("Shell");
            props = Group("Props");
            outside = Group("Outside");
            lightsRoot = Group("Lights");
            cams = Group("Cameras");

            BuildShell();
            BuildWindow();
            BuildBlinds();
            BuildCity();
            BuildProps();
            BuildPhotoLine();
            BuildLights();
            BuildAtmosphere();
            BuildCameras();
            BuildInteraction();

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            AssetDatabase.SaveAssets();
            Debug.Log("[esper] scene built");
        }

        // ---------- helpers ----------

        static Transform Group(string name, Transform parent = null)
        {
            var t = new GameObject(name).transform;
            t.SetParent(parent ? parent : root, false);
            return t;
        }

        static GameObject Block(string name, Transform parent, Vector3 center, Vector3 size, Material mat, bool isStatic = true, Quaternion? rot = null)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = center;
            go.transform.localRotation = rot ?? Quaternion.identity;
            string key = $"box_{size.x:0.###}_{size.y:0.###}_{size.z:0.###}".Replace('.', 'p');
            go.AddComponent<MeshFilter>().sharedMesh = EsperMeshes.Save(EsperMeshes.Box(size), key, isStatic);
            go.AddComponent<MeshRenderer>().sharedMaterial = mat;
            if (isStatic) MarkStatic(go);
            return go;
        }

        static void MarkStatic(GameObject go)
        {
            GameObjectUtility.SetStaticEditorFlags(go, StaticEditorFlags.ContributeGI | StaticEditorFlags.BatchingStatic | StaticEditorFlags.ReflectionProbeStatic | StaticEditorFlags.OccluderStatic | StaticEditorFlags.OccludeeStatic);
        }

        public static GameObject Place(string model, Transform parent, Vector3 pos, float yaw, float scale = 1f, Vector3? euler = null)
        {
            var dir = Path.Combine(Models, model);
            var path = Directory.Exists(dir) ? Directory.GetFiles(dir, "*.gltf").FirstOrDefault() : null;
            var prefab = path != null ? AssetDatabase.LoadAssetAtPath<GameObject>(path.Replace('\\', '/')) : null;
            if (prefab == null) { Debug.LogError($"[esper] missing model {model}"); return new GameObject(model); }
            var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            go.name = model;
            go.transform.SetParent(parent, false);
            go.transform.localPosition = pos;
            go.transform.localRotation = Quaternion.Euler(euler ?? new Vector3(0, yaw, 0));
            go.transform.localScale = Vector3.one * scale;
            foreach (var r in go.GetComponentsInChildren<MeshRenderer>())
            {
                r.shadowCastingMode = ShadowCastingMode.On;
                r.reflectionProbeUsage = ReflectionProbeUsage.BlendProbes;
            }
            return go;
        }

        /// Lowest point of a placed model, so props sit on surfaces instead of floating.
        public static void SitOn(GameObject go, float surfaceY)
        {
            var rends = go.GetComponentsInChildren<Renderer>();
            if (rends.Length == 0) return;
            var b = rends[0].bounds;
            foreach (var r in rends) b.Encapsulate(r.bounds);
            go.transform.position += Vector3.up * (surfaceY - b.min.y);
        }

        public static Bounds BoundsOf(GameObject go)
        {
            var rends = go.GetComponentsInChildren<Renderer>();
            var b = rends[0].bounds;
            foreach (var r in rends) b.Encapsulate(r.bounds);
            return b;
        }

        static Material SaveMat(Material m, string name)
        {
            Directory.CreateDirectory(MatDir);
            string path = $"{MatDir}/{name}.mat";
            var existing = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (existing != null) { existing.shader = m.shader; existing.CopyPropertiesFromMaterial(m); existing.shaderKeywords = m.shaderKeywords; return existing; }
            AssetDatabase.CreateAsset(m, path);
            return m;
        }

        /// URP Lit from a Poly Haven texture set. tiling = repeats per metre.
        static Material Surface(string name, string set, float tiling, Color tint, float smooth = 1f)
        {
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            string d = $"{Textures}/{set}/{set}";
            var diff = AssetDatabase.LoadAssetAtPath<Texture2D>($"{d}_diff.jpg");
            var nrm = AssetDatabase.LoadAssetAtPath<Texture2D>($"{d}_nor_gl.jpg");
            var ms = AssetDatabase.LoadAssetAtPath<Texture2D>($"{d}_ms.png");
            Texture2D ao = null; // Baked GI supplies occlusion.
            m.SetTexture("_BaseMap", diff);
            m.SetColor("_BaseColor", tint);
            if (nrm) { m.SetTexture("_BumpMap", nrm); m.EnableKeyword("_NORMALMAP"); m.SetFloat("_BumpScale", 1f); }
            if (ms) { m.SetTexture("_MetallicGlossMap", ms); m.EnableKeyword("_METALLICSPECGLOSSMAP"); }
            m.SetFloat("_Smoothness", smooth);
            if (ao) { m.SetTexture("_OcclusionMap", ao); m.EnableKeyword("_OCCLUSIONMAP"); m.SetFloat("_OcclusionStrength", 1f); }
            m.SetTextureScale("_BaseMap", Vector2.one * tiling);
            return SaveMat(m, name);
        }

        static Material Plain(string name, Color color, float smooth, float metal = 0f, Color? emission = null)
        {
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            m.SetColor("_BaseColor", color);
            m.SetFloat("_Smoothness", smooth);
            m.SetFloat("_Metallic", metal);
            if (emission.HasValue)
            {
                m.EnableKeyword("_EMISSION");
                m.SetColor("_EmissionColor", emission.Value);
                m.globalIlluminationFlags = MaterialGlobalIlluminationFlags.BakedEmissive;
            }
            return SaveMat(m, name);
        }

        static Material Custom(string name, string shader, System.Action<Material> setup = null)
        {
            var m = new Material(Shader.Find(shader));
            setup?.Invoke(m);
            return SaveMat(m, name);
        }

        // Objects the camera gets close to keep 2K; everything else is 1K. All crunched for the web.
        static readonly string[] HeroModels = { "television_02", "metal_office_desk", "vintage_spacecraft_instrument", "desk_lamp_arm_01", "Camera_01", "magnifying_glass_01", "retro_multimeter" };

        static void PrepareTextureImporters()
        {
            AssetDatabase.StartAssetEditing();
            try
            {
                foreach (var guid in AssetDatabase.FindAssets("t:Texture2D", new[] { "Assets/ThirdParty/PolyHaven", "Assets/Esper/Content" }))
                {
                    string p = AssetDatabase.GUIDToAssetPath(guid);
                    if (AssetImporter.GetAtPath(p) is not TextureImporter imp) continue;
                    bool isRoomSet = p.StartsWith(Textures);
                    bool data = p.Contains("_ms.") || p.Contains("_ao") || p.Contains("_rough") || p.Contains("_disp") || p.Contains("_arm") || p.Contains("_metal");
                    bool hero = HeroModels.Any(h => p.Contains("/" + h + "/"));
                    int size = isRoomSet ? (data ? 1024 : 2048) : hero ? 2048 : 1024;
                    if (p.StartsWith("Assets/Esper/Content")) size = 1024;
                    bool dirty = false;
                    if (p.Contains("_nor_gl") && isRoomSet && imp.textureType != TextureImporterType.NormalMap) { imp.textureType = TextureImporterType.NormalMap; dirty = true; }
                    if (data && isRoomSet && imp.sRGBTexture) { imp.sRGBTexture = false; dirty = true; }
                    if (imp.maxTextureSize != size) { imp.maxTextureSize = size; dirty = true; }
                    if (!imp.crunchedCompression || imp.compressionQuality != 60) { imp.crunchedCompression = true; imp.compressionQuality = 60; dirty = true; }
                    if (dirty) imp.SaveAndReimport();
                }
            }
            finally { AssetDatabase.StopAssetEditing(); }
        }

        // ---------- pipeline ----------

        static void ConfigurePipeline()
        {
            var rp = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>("Assets/Settings/PC_RPAsset.asset");
            var so = new SerializedObject(rp);
            void Set(string prop, System.Action<SerializedProperty> f) { var p = so.FindProperty(prop); if (p != null) f(p); else Debug.LogWarning("[esper] no prop " + prop); }
            Set("m_RequireDepthTexture", p => p.boolValue = true);
            Set("m_RequireOpaqueTexture", p => p.boolValue = true);
            Set("m_SupportsHDR", p => p.boolValue = true);
            Set("m_MSAA", p => p.intValue = 4);
            Set("m_RenderScale", p => p.floatValue = 1f);
            Set("m_MainLightShadowsSupported", p => p.boolValue = true);
            Set("m_MainLightShadowmapResolution", p => p.intValue = 4096);
            Set("m_AdditionalLightShadowsSupported", p => p.boolValue = true);
            Set("m_AdditionalLightsShadowmapResolution", p => p.intValue = 4096);
            Set("m_ShadowDistance", p => p.floatValue = 14f);
            Set("m_ShadowCascadeCount", p => p.intValue = 1);
            Set("m_SoftShadowsSupported", p => p.boolValue = true);
            Set("m_SoftShadowQuality", p => p.intValue = 3);
            Set("m_ColorGradingMode", p => p.intValue = 1); // HDR grading
            Set("m_SupportsLightLayers", p => p.boolValue = false);
            so.ApplyModifiedPropertiesWithoutUndo();

            GraphicsSettings.defaultRenderPipeline = rp;
            for (int i = 0; i < QualitySettings.names.Length; i++)
            {
                QualitySettings.SetQualityLevel(i, false);
                QualitySettings.renderPipeline = rp;
            }

            var rendererData = AssetDatabase.LoadAssetAtPath<UniversalRendererData>("Assets/Settings/PC_Renderer.asset");
            var volMat = Custom("Volumetric", "Hidden/Esper/Volumetric", m =>
            {
                m.SetVector("_BoxMin", new Vector4(-RoomW / 2, 0, -RoomD / 2, 0));
                m.SetVector("_BoxMax", new Vector4(RoomW / 2, RoomH, RoomD / 2, 0));
            });
            var feature = rendererData.rendererFeatures.OfType<VolumetricFeature>().FirstOrDefault();
            if (feature == null)
            {
                feature = ScriptableObject.CreateInstance<VolumetricFeature>();
                feature.name = "Esper Volumetric";
                AssetDatabase.AddObjectToAsset(feature, rendererData);
                rendererData.rendererFeatures.Add(feature);
                var rso = new SerializedObject(rendererData);
                var map = rso.FindProperty("m_RendererFeatureMap");
                map.arraySize = rendererData.rendererFeatures.Count;
                AssetDatabase.TryGetGUIDAndLocalFileIdentifier(feature, out _, out long id);
                map.GetArrayElementAtIndex(map.arraySize - 1).longValue = id;
                rso.ApplyModifiedPropertiesWithoutUndo();
            }
            feature.material = volMat;
            feature.SetActive(true);
            EditorUtility.SetDirty(feature);
            EditorUtility.SetDirty(rendererData);
            EditorUtility.SetDirty(rp);
            AssetDatabase.SaveAssets();
        }
    }
}
