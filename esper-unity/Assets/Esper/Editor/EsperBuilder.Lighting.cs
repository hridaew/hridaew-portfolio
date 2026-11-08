using System.IO;
using System.Linq;
using Unity.Cinemachine;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper.EditorTools
{
    public static partial class EsperBuilder
    {
        public static Light cityLight;

        static void BuildLights()
        {
            // The sun, coming in through the window. It stays put: scene.json sets its colour, direction and level.
            cityLight = NewLight("CityLight", LightType.Directional, new Color(1f, 0.94f, 0.84f), 3f);
            cityLight.transform.rotation = Quaternion.LookRotation(new Vector3(0.25f, -0.62f, -0.74f));
            cityLight.shadows = LightShadows.Soft;
            cityLight.shadowStrength = 1f;
            cityLight.shadowBias = 0.02f;
            cityLight.shadowNormalBias = 0.1f;
            cityLight.lightmapBakeType = LightmapBakeType.Realtime;

            // Spill from the street: a cool wash on the window wall and ceiling.
            var spill = streetSpill = NewLight("StreetSpill", LightType.Spot, new Color(0.3f, 0.55f, 0.75f), 0.35f);
            spill.transform.position = new Vector3(0f, 0.2f, BackZ + 1.8f);
            spill.transform.rotation = Quaternion.LookRotation(new Vector3(0, 0.75f, -1f));
            spill.spotAngle = 120f;
            spill.range = 11f;
            spill.shadows = LightShadows.Soft;

            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.95f, 0.98f, 1.03f);
            RenderSettings.ambientEquatorColor = new Color(0.86f, 0.86f, 0.84f);
            RenderSettings.ambientGroundColor = new Color(0.72f, 0.7f, 0.67f);
            RenderSettings.skybox = Custom("DaySky", "Esper/DaySky", m =>
            {
                var paper = new Color(0.93f, 0.92f, 0.9f);
                m.SetColor("_Zenith", paper);
                m.SetColor("_Horizon", paper);
                m.SetColor("_Ground", paper);
                m.SetVector("_SunDir", new Vector4(0f, -1f, 0f, 0f));
            });
            RenderSettings.defaultReflectionMode = DefaultReflectionMode.Skybox;

            var probe = new GameObject("RoomProbe").AddComponent<ReflectionProbe>();
            probe.transform.SetParent(lightsRoot, false);
            probe.transform.position = new Vector3(0, 1.4f, 0);
            probe.size = new Vector3(RoomW, RoomH, RoomD);
            probe.boxProjection = true;
            probe.mode = ReflectionProbeMode.Realtime;
            probe.refreshMode = ReflectionProbeRefreshMode.OnAwake;
            probe.timeSlicingMode = ReflectionProbeTimeSlicingMode.NoTimeSlicing;
            probe.resolution = 256;
            probe.hdr = true;
        }

        static Light NewLight(string name, LightType type, Color color, float intensity)
        {
            var l = new GameObject(name).AddComponent<Light>();
            l.transform.SetParent(lightsRoot, false);
            l.type = type;
            l.color = color;
            l.intensity = intensity;
            l.lightmapBakeType = LightmapBakeType.Mixed;
            return l;
        }

        static void BuildAtmosphere()
        {
            // Post: filmic, grainy, a little imperfect glass.
            var profile = ScriptableObject.CreateInstance<VolumeProfile>();
            var tone = profile.Add<Tonemapping>(); tone.mode.Override(TonemappingMode.Neutral);
            var bloom = profile.Add<Bloom>();
            bloom.threshold.Override(1.1f); bloom.intensity.Override(0.25f); bloom.scatter.Override(0.72f);
            bloom.tint.Override(new Color(1f, 0.92f, 0.85f));
            var ca = profile.Add<ChromaticAberration>(); ca.intensity.Override(0f);
            var vig = profile.Add<Vignette>(); vig.intensity.Override(0.05f); vig.smoothness.Override(0.45f);
            var grain = profile.Add<FilmGrain>(); grain.type.Override(FilmGrainLookup.Medium3); grain.intensity.Override(0f); grain.response.Override(0.75f);
            var lens = profile.Add<LensDistortion>(); lens.intensity.Override(0f);
            var adj = profile.Add<ColorAdjustments>(); adj.postExposure.Override(0f); adj.contrast.Override(6f); adj.saturation.Override(6f);
            var smh = profile.Add<ShadowsMidtonesHighlights>();
            smh.shadows.Override(new Vector4(1f, 1f, 1f, 0f));
            smh.highlights.Override(new Vector4(1f, 1f, 1f, 0f));
            var wb = profile.Add<WhiteBalance>(); wb.temperature.Override(0f);
            Directory.CreateDirectory("Assets/Esper/Generated");
            AssetDatabase.DeleteAsset("Assets/Esper/Generated/EsperPost.asset");
            AssetDatabase.CreateAsset(profile, "Assets/Esper/Generated/EsperPost.asset");
            foreach (var c in new VolumeComponent[] { tone, bloom, ca, vig, grain, lens, adj, smh, wb })
                AssetDatabase.AddObjectToAsset(c, profile);

            var vol = new GameObject("PostVolume").AddComponent<Volume>();
            vol.transform.SetParent(root, false);
            vol.isGlobal = true;
            vol.sharedProfile = profile;
        }

        static Texture2D StreakTexture()
        {
            const string path = "Assets/Esper/Generated/rain_streak.png";
            if (!File.Exists(path))
            {
                var t = new Texture2D(16, 64, TextureFormat.RGBA32, false);
                for (int y = 0; y < 64; y++)
                    for (int x = 0; x < 16; x++)
                    {
                        float fx = 1f - Mathf.Abs((x + 0.5f) / 8f - 1f);
                        float fy = Mathf.Sin((y + 0.5f) / 64f * Mathf.PI);
                        float a = Mathf.Pow(fx, 3f) * fy;
                        t.SetPixel(x, y, new Color(1, 1, 1, a));
                    }
                File.WriteAllBytes(path, t.EncodeToPNG());
                AssetDatabase.ImportAsset(path);
            }
            return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        }

        public struct Shot { public string name; public Vector3 pos; public Vector3 target; public float fov; public bool reviewOnly; }

        static Vector3 Yawed(Vector3 pos, Vector3 target, float deg) => pos + Quaternion.Euler(0, deg, 0) * (target - pos);
        // The opening frame: the window and the ESPER desk beside it, shafts crossing the floor.
        // The opening frame, as in the first slice: the window on the left, the ESPER desk on the right, shafts across the floor.
        static readonly Vector3 OverviewPos = new Vector3(0.25f, 1.45f, -0.35f), OverviewTarget = new Vector3(3.35f, 1.05f, 2.95f);

        public static readonly Shot[] Shots =
        {
            new Shot { name = "overview", pos = OverviewPos, target = OverviewTarget, fov = 46f },
            new Shot { name = "overview_left", pos = OverviewPos, target = Yawed(OverviewPos, OverviewTarget, -14f), fov = 46f, reviewOnly = true },
            new Shot { name = "overview_right", pos = OverviewPos, target = Yawed(OverviewPos, OverviewTarget, 14f), fov = 46f, reviewOnly = true },
            new Shot { name = "domis", pos = new Vector3(-0.9f, 1.45f, 0.75f), target = new Vector3(-1.95f, 0.95f, 2.65f), fov = 46f },
            new Shot { name = "virdio", pos = new Vector3(1.9f, 1.45f, -0.2f), target = new Vector3(4.4f, 0.7f, -1.6f), fov = 52f },
            new Shot { name = "memory", pos = new Vector3(-2.0f, 1.5f, -0.25f), target = new Vector3(-4.9f, 1.25f, -1.55f), fov = 50f },
            new Shot { name = "wafflings", pos = new Vector3(-1.45f, 1.55f, -1.05f), target = new Vector3(-2.6f, 1.25f, -3.75f), fov = 50f },
            new Shot { name = "esper", pos = new Vector3(2.75f, 1.62f, 1.6f), target = new Vector3(4.75f, 1.35f, 2.6f), fov = 50f },
            new Shot { name = "taste", pos = new Vector3(-2.3f, 1.55f, 0.35f), target = new Vector3(-5f, 1.45f, 1.7f), fov = 50f },
        };

        static readonly System.Collections.Generic.Dictionary<string, CinemachineCamera> vcams = new();
        static Light streetSpill;

        static void BuildInteraction()
        {
            var director = root.gameObject.AddComponent<EsperDirector>();
            director.overviewCamera = vcams["overview"];
            director.hotspots = new Hotspot[0];
            var look = root.gameObject.AddComponent<LookDev>();
            look.volumetric = AssetDatabase.LoadAssetAtPath<Material>($"{MatDir}/Volumetric.mat");
            look.post = AssetDatabase.LoadAssetAtPath<VolumeProfile>("Assets/Esper/Generated/EsperPost.asset");
            root.gameObject.AddComponent<Esper.Studio.StudioMode>();
            root.gameObject.AddComponent<Esper.Live.LiveScene>();
        }

        /// Everything placed in the room comes from Live/scene.json — the same spec the page applies live.
        static void BuildLiveScene()
        {
            var spec = Esper.Live.LiveJson.Scene(File.ReadAllText(EsperLive.ScenePath));
            root.GetComponent<Esper.Live.LiveScene>().ApplyEditor(spec, new EsperLive.EditorServices());
            var lib = root.gameObject.AddComponent<Esper.Live.LiveLibrary>();
            lib.materials = AssetDatabase.FindAssets("t:Material", new[] { MatDir })
                .Select(g => AssetDatabase.LoadAssetAtPath<Material>(AssetDatabase.GUIDToAssetPath(g))).ToArray();
            Debug.Log($"[esper] live scene: {spec.items.Count} items, {spec.lights.Count} lights, {spec.stations.Count} stations");
        }

        static void BuildCameras()
        {
            var camGo = new GameObject("MainCamera");
            camGo.tag = "MainCamera";
            camGo.transform.SetParent(cams, false);
            var cam = camGo.AddComponent<Camera>();
            cam.nearClipPlane = 0.1f;
            cam.farClipPlane = 500f;
            cam.allowHDR = true;
            var data = camGo.AddComponent<UniversalAdditionalCameraData>();
            data.renderPostProcessing = true;
            data.antialiasing = AntialiasingMode.SubpixelMorphologicalAntiAliasing;
            data.antialiasingQuality = AntialiasingQuality.High;
            var brain = camGo.AddComponent<CinemachineBrain>();
            brain.DefaultBlend = new CinemachineBlendDefinition(CinemachineBlendDefinition.Styles.EaseInOut, 1.4f);
            camGo.AddComponent<AudioListener>();

            int prio = 20;
            foreach (var s in Shots)
            {
                if (s.reviewOnly || s.name != "overview") continue;
                var v = new GameObject("VCam_" + s.name).AddComponent<CinemachineCamera>();
                v.transform.SetParent(cams, false);
                v.transform.position = s.pos;
                v.transform.rotation = Quaternion.LookRotation(s.target - s.pos);
                var lens = v.Lens;
                lens.FieldOfView = s.fov;
                lens.NearClipPlane = 0.03f;
                lens.FarClipPlane = 4000f;
                v.Lens = lens;
                v.Priority = prio;
                vcams[s.name] = v;
                prio = 0;
            }
            camGo.transform.SetPositionAndRotation(Shots[0].pos, Quaternion.LookRotation(Shots[0].target - Shots[0].pos));
            cam.fieldOfView = Shots[0].fov;
        }
    }
}
