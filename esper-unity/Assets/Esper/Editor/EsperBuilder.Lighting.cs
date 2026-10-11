using System.IO;
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
            // The city: one cold key through the blinds. Everything else is practical.
            cityLight = NewLight("CityLight", LightType.Directional, new Color(0.52f, 0.76f, 0.92f), 1.7f);
            cityLight.transform.rotation = Quaternion.LookRotation(new Vector3(0.34f, -0.52f, -0.78f));
            cityLight.shadows = LightShadows.Soft;
            cityLight.shadowStrength = 1f;
            cityLight.shadowBias = 0.02f;
            cityLight.shadowNormalBias = 0.1f;
            cityLight.gameObject.AddComponent<SlowSweep>();

            // Desk lamp: sodium-warm cone onto the ESPER work surface.
            var lampLight = deskLamp = NewLight("DeskLamp", LightType.Spot, new Color(1f, 0.5f, 0.2f), 7f);
            lampLight.transform.position = new Vector3(RoomW / 2 - 0.42f, deskBounds.max.y + 0.62f, 1.82f);
            lampLight.transform.rotation = Quaternion.LookRotation(new Vector3(-0.5f, -1f, -0.45f));
            lampLight.spotAngle = 78f;
            lampLight.innerSpotAngle = 36f;
            lampLight.range = 4f;
            lampLight.shadows = LightShadows.Soft;
            lampLight.gameObject.AddComponent<LightFlicker>().jitter = 0.015f;
            AimLampAtBulb(lampModel, lampTarget);

            // Spill from the street: a cool wash on the window wall and ceiling.
            var spill = streetSpill = NewLight("StreetSpill", LightType.Spot, new Color(0.3f, 0.55f, 0.75f), 0.35f);
            spill.transform.position = new Vector3(0f, 0.2f, BackZ + 1.8f);
            spill.transform.rotation = Quaternion.LookRotation(new Vector3(0, 0.75f, -1f));
            spill.spotAngle = 120f;
            spill.range = 11f;
            spill.shadows = LightShadows.Soft;

            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.016f, 0.018f, 0.026f);
            RenderSettings.ambientEquatorColor = new Color(0.018f, 0.014f, 0.016f);
            RenderSettings.ambientGroundColor = new Color(0.007f, 0.006f, 0.006f);
            RenderSettings.skybox = Custom("NightSky", "Esper/NightSky");
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
            // Rain falling past the glass.
            var rain = new GameObject("Rain").AddComponent<ParticleSystem>();
            rain.transform.SetParent(outside, false);
            rain.transform.position = new Vector3(-0.2f, 9f, BackZ + 7f);
            var main = rain.main;
            main.loop = true;
            main.prewarm = true;
            main.startLifetime = 2.4f;
            main.startSpeed = 0f;
            main.startSize = 0.012f;
            main.startColor = new Color(0.65f, 0.78f, 0.95f, 0.35f);
            main.maxParticles = 12000;
            main.simulationSpace = ParticleSystemSimulationSpace.World;
            var vel = rain.velocityOverLifetime;
            vel.enabled = true;
            vel.space = ParticleSystemSimulationSpace.World;
            vel.x = new ParticleSystem.MinMaxCurve(-1.6f, -1.2f);
            vel.y = new ParticleSystem.MinMaxCurve(-11f, -9f);
            vel.z = new ParticleSystem.MinMaxCurve(0f, 0f);
            var em = rain.emission;
            em.rateOverTime = 4200f;
            var shape = rain.shape;
            shape.shapeType = ParticleSystemShapeType.Box;
            shape.scale = new Vector3(24f, 0.1f, 12f);
            var pr = rain.GetComponent<ParticleSystemRenderer>();
            pr.renderMode = ParticleSystemRenderMode.Stretch;
            pr.velocityScale = 0.045f;
            pr.lengthScale = 1f;
            pr.sharedMaterial = Custom("RainStreak", "Universal Render Pipeline/Particles/Unlit", m =>
            {
                m.SetTexture("_BaseMap", StreakTexture());
                m.SetFloat("_Surface", 1f);
                m.SetFloat("_Blend", 2f); // additive
                m.SetOverrideTag("RenderType", "Transparent");
                m.renderQueue = (int)RenderQueue.Transparent;
                m.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha);
                m.SetFloat("_DstBlend", (float)BlendMode.One);
                m.SetFloat("_ZWrite", 0f);
                m.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                m.EnableKeyword("_BLENDMODE_ADD");
            });

            // Post: filmic, grainy, a little imperfect glass.
            var profile = ScriptableObject.CreateInstance<VolumeProfile>();
            var tone = profile.Add<Tonemapping>(); tone.mode.Override(TonemappingMode.ACES);
            var bloom = profile.Add<Bloom>();
            bloom.threshold.Override(0.85f); bloom.intensity.Override(0.75f); bloom.scatter.Override(0.72f);
            bloom.tint.Override(new Color(1f, 0.92f, 0.85f));
            var ca = profile.Add<ChromaticAberration>(); ca.intensity.Override(0.14f);
            var vig = profile.Add<Vignette>(); vig.intensity.Override(0.34f); vig.smoothness.Override(0.45f);
            var grain = profile.Add<FilmGrain>(); grain.type.Override(FilmGrainLookup.Medium3); grain.intensity.Override(0.38f); grain.response.Override(0.75f);
            var lens = profile.Add<LensDistortion>(); lens.intensity.Override(-0.08f);
            var adj = profile.Add<ColorAdjustments>(); adj.postExposure.Override(0.9f); adj.contrast.Override(14f); adj.saturation.Override(-6f);
            var smh = profile.Add<ShadowsMidtonesHighlights>();
            smh.shadows.Override(new Vector4(0.92f, 1.0f, 1.08f, 0f));
            smh.highlights.Override(new Vector4(1.06f, 1.0f, 0.92f, 0f));
            var wb = profile.Add<WhiteBalance>(); wb.temperature.Override(6f);
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
            var look = root.gameObject.AddComponent<LookDev>();
            look.volumetric = AssetDatabase.LoadAssetAtPath<Material>($"{MatDir}/Volumetric.mat");
            look.post = AssetDatabase.LoadAssetAtPath<VolumeProfile>("Assets/Esper/Generated/EsperPost.asset");
            root.gameObject.AddComponent<Esper.Studio.StudioMode>();
            director.overviewCamera = vcams["overview"];

            Hotspot Spot(string id, string url, string shot, Bounds bounds, Light accent, CrtScreen screen, float boost = 1.8f)
            {
                var h = new GameObject("Hotspot_" + id).AddComponent<Hotspot>();
                h.transform.SetParent(props, false);
                h.id = id;
                h.url = url;
                h.focusCamera = vcams[shot];
                h.accent = accent;
                h.accentBoost = boost;
                h.screen = screen;
                h.enhanceRect = new Vector4(0.5f, 0.5f, 0.45f, 0.45f);
                var c = h.gameObject.AddComponent<BoxCollider>();
                c.center = bounds.center;
                c.size = bounds.size + Vector3.one * 0.04f;
                return h;
            }

            var deskB = deskBounds;
            deskB.Encapsulate(deskB.max + Vector3.up * 0.7f);
            var obscura = Spot("obscura", "/obscura", "esper", deskB, deskLamp, esperScreen.GetComponent<CrtScreen>());
            obscura.enhanceRect = new Vector4(0.47f, 0.6f, 0.34f, 0.34f);

            director.hotspots = new[]
            {
                Spot("domis", "/domis", "domis", stationBounds["domis"], stationAccent["domis"], stationScreen["domis"]),
                Spot("virdio", "/virdio", "virdio", stationBounds["virdio"], stationAccent["virdio"], stationScreen["virdio"]),
                obscura,
                Spot("memory-care", "/memory-care", "memory", stationBounds["memory-care"], stationAccent["memory-care"], stationScreen["memory-care"]),
                Spot("wafflings", "", "wafflings", stationBounds["wafflings"], stationAccent["wafflings"], null),
                Spot("taste", "", "taste", stationBounds["taste"], stationAccent["taste"], null, 1.4f),
            };
        }

        static void BuildCameras()
        {
            var camGo = new GameObject("MainCamera");
            camGo.tag = "MainCamera";
            camGo.transform.SetParent(cams, false);
            var cam = camGo.AddComponent<Camera>();
            cam.nearClipPlane = 0.03f;
            cam.farClipPlane = 4000f;
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
                if (s.reviewOnly) continue;
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
