using System.Globalization;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper
{
    /// Live look development from the page: SendMessage("ESPER", "Look", "key=value;key=value").
    /// Keys: vol.<_Property> (volumetric material), exposure, contrast, saturation, bloom, vignette, grain,
    /// light.<Name> (intensity), ambient (multiplier), and the performance keys listed in Apply. Values are written back into the builder once chosen.
    public class LookDev : MonoBehaviour
    {
        public Material volumetric;
        public VolumeProfile post;

        // Bounce light. Nothing is baked yet, so this stands in for light coming back off the white floor and
        // walls: a soft sky from above, a warmer floor bounce from below. ambient = level, ambient.warm = 0..1.
        float ambientLevel = 1f, ambientWarm = 0.4f;
        static readonly Color Sky = new(0.97f, 0.985f, 1f), Horizon = new(0.95f, 0.95f, 0.94f);
        static readonly Color GroundCool = new(0.86f, 0.86f, 0.86f), GroundWarm = new(0.97f, 0.88f, 0.76f);
        float sunYaw = float.NaN, sunHeight = float.NaN, sunWarm = float.NaN;

        void Awake()
        {
            if (!GetComponent<Esper.Rendering.RenderBudget>()) gameObject.AddComponent<Esper.Rendering.RenderBudget>();
            ApplyAmbient();
        }

        void ApplyAmbient()
        {
            var ground = Color.Lerp(GroundCool, GroundWarm, ambientWarm);
            Color sky = Sky * ambientLevel, eq = Horizon * ambientLevel, gr = ground * ambientLevel;
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = sky;
            RenderSettings.ambientEquatorColor = eq;
            RenderSettings.ambientGroundColor = gr;
            // Players keep whatever probe was saved with the scene, so build it from the three colours.
            var sh = new SphericalHarmonicsL2();
            sh.AddAmbientLight(eq);
            sh.AddDirectionalLight(Vector3.up, sky - eq, 1f);
            sh.AddDirectionalLight(Vector3.down, gr - eq, 1f);
            RenderSettings.ambientProbe = sh;
        }

        static Light Sun()
        {
            var go = GameObject.Find("CityLight");
            return go ? go.GetComponent<Light>() : null;
        }

        void ApplySun()
        {
            var sun = Sun();
            if (!sun) return;
            var e = sun.transform.eulerAngles;
            float yaw = float.IsNaN(sunYaw) ? e.y : sunYaw, height = float.IsNaN(sunHeight) ? e.x : sunHeight;
            sun.transform.rotation = Quaternion.Euler(height, yaw, 0f);
            if (!float.IsNaN(sunWarm)) sun.color = Color.Lerp(new Color(1f, 0.99f, 0.97f), new Color(1f, 0.86f, 0.68f), sunWarm);
        }

        // Contact shadows: URP's screen-space ambient occlusion, reached by reflection (its settings are internal).
        static object aoSettings;
        static System.Type aoType;
        static void SetAo(string field, float v)
        {
            if (aoSettings == null)
            {
                if (!(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp)) return;
                foreach (var data in urp.rendererDataList)
                {
                    if (!data) continue;
                    foreach (var f in data.rendererFeatures)
                    {
                        if (!(f is ScreenSpaceAmbientOcclusion ssao)) continue;
                        var fi = typeof(ScreenSpaceAmbientOcclusion).GetField("m_Settings", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
                        aoSettings = fi?.GetValue(ssao);
                        aoType = aoSettings?.GetType();
                    }
                }
                if (aoSettings == null) return;
            }
            var target = aoType.GetField(field, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
            if (target != null && target.FieldType == typeof(float)) target.SetValue(aoSettings, v);
        }

        static void SetAoActive(bool on)
        {
            if (!(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp)) return;
            foreach (var data in urp.rendererDataList)
                if (data)
                    foreach (var f in data.rendererFeatures)
                        if (f is ScreenSpaceAmbientOcclusion ssao && ssao.isActive != on) ssao.SetActive(on);
        }

        public void Look(string commands)
        {
            foreach (var cmd in commands.Split(';'))
            {
                var kv = cmd.Split('=');
                if (kv.Length != 2) continue;
                string key = kv[0].Trim();
                if (!float.TryParse(kv[1].Trim(), NumberStyles.Float, CultureInfo.InvariantCulture, out float v)) continue;
                Apply(key, v);
            }
        }

        void Apply(string key, float v)
        {
            // Performance: fog.res (1/n resolution), fog.steps; pipe.cap (16:9 lines, 0 = native), pipe.scale
            // (fixed render scale), pipe.aa (0 off, 1 FXAA, 2 SMAA, 3 TAA), pipe.upscale (0 linear, 1 point; FSR is not available on WebGL),
            // pipe.msaa, pipe.shadow (map size).
            if (key == "fog.res") { Esper.Rendering.VolumetricFeature.DownsampleOverride = Mathf.RoundToInt(v); return; }
            if (key == "fog.steps") { Esper.Rendering.VolumetricFeature.StepsOverride = Mathf.RoundToInt(v); return; }
            if (key == "pipe.cap") { Esper.Rendering.RenderBudget.CapLines = Mathf.RoundToInt(v); return; }
            if (key == "pipe.scale") { Esper.Rendering.RenderBudget.ManualScale = v; return; }
            if (key == "pipe.aa")
            {
                var cam = Camera.main;
                if (cam && cam.TryGetComponent(out UniversalAdditionalCameraData data))
                {
                    int m = Mathf.RoundToInt(v);
                    data.antialiasing = m == 1 ? AntialiasingMode.FastApproximateAntialiasing
                        : m == 2 ? AntialiasingMode.SubpixelMorphologicalAntiAliasing
                        : m == 3 ? AntialiasingMode.TemporalAntiAliasing
                        : AntialiasingMode.None;
                    data.antialiasingQuality = AntialiasingQuality.High;
                }
                return;
            }
            if (key.StartsWith("pipe.") && GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp)
            {
                if (key == "pipe.upscale")
                {
                    int m = Mathf.RoundToInt(v);
                    urp.upscalingFilter = m == 1 ? UpscalingFilterSelection.Point : UpscalingFilterSelection.Linear;
                }
                if (key == "pipe.msaa") urp.msaaSampleCount = Mathf.RoundToInt(v);
                if (key == "pipe.shadow")
                {
                    urp.mainLightShadowmapResolution = Mathf.RoundToInt(v);
                    urp.additionalLightsShadowmapResolution = Mathf.RoundToInt(v);
                }
                return;
            }
            // Render styles: style (index into StylizeFeature.Styles, 0 = off), style.size.
            if (key == "style") { Esper.Rendering.StylizeFeature.Style = Mathf.RoundToInt(v); return; }
            if (key == "style.size") { Esper.Rendering.StylizeFeature.Size = v; return; }
            // Reflections: environment and probe reflections; the room reads glossy when these run hot.
            if (key == "reflections")
            {
                RenderSettings.reflectionIntensity = v;
                foreach (var probe in FindObjectsByType<ReflectionProbe>(FindObjectsSortMode.None)) probe.intensity = v;
                return;
            }
            if (key.StartsWith("vol.") && volumetric) { volumetric.SetFloat(key.Substring(4), v); return; }
            if (key.StartsWith("light."))
            {
                var go = GameObject.Find(key.Substring(6));
                var l = go ? go.GetComponent<Light>() : null;
                if (l)
                {
                    var f = l.GetComponent<LightFlicker>();
                    if (f) f.baseIntensity = v; else l.intensity = v;
                }
                return;
            }
            if (key == "ambient") { ambientLevel = v; ApplyAmbient(); return; }
            if (key == "ambient.warm") { ambientWarm = Mathf.Clamp01(v); ApplyAmbient(); return; }
            // The sun: sun.yaw / sun.height in degrees, sun.warm 0..1, sun.shadow (shadow strength 0..1).
            if (key == "sun.yaw") { sunYaw = v; ApplySun(); return; }
            if (key == "sun.height") { sunHeight = v; ApplySun(); return; }
            if (key == "sun.warm") { sunWarm = Mathf.Clamp01(v); ApplySun(); return; }
            if (key == "sun.shadow") { var s = Sun(); if (s) s.shadowStrength = Mathf.Clamp01(v); return; }
            // Contact shadows: ao (strength, 0 = off), ao.radius (metres), ao.direct (how much they darken sunlight).
            if (key == "ao") { SetAoActive(v > 0.001f); SetAo("Intensity", v); return; }
            if (key == "ao.radius") { SetAo("Radius", v); return; }
            if (key == "ao.direct") { SetAo("DirectLightingStrength", v); return; }
            // Camera: lens (one field of view for every view, 0 = as authored), orbit (drag range in degrees).
            if (key == "lens") { EsperDirector.LensOverride = v; return; }
            if (key == "orbit") { EsperDirector.OrbitRange = v; return; }
            // The figure outside: seconds on each activity (0 = only move on when clicked).
            if (key == "cycle") { foreach (var c in FindObjectsByType<Esper.Live.LiveCycle>(FindObjectsSortMode.None)) c.seconds = v; return; }
            if (!post) return;
            if (post.TryGet(out ColorAdjustments adj))
            {
                if (key == "exposure") adj.postExposure.value = v;
                if (key == "contrast") adj.contrast.value = v;
                if (key == "saturation") adj.saturation.value = v;
            }
            if (key == "bloom" && post.TryGet(out Bloom bloom)) bloom.intensity.value = v;
            if (key == "vignette" && post.TryGet(out Vignette vig)) vig.intensity.value = v;
            if (key == "grain" && post.TryGet(out FilmGrain grain)) grain.intensity.value = v;
        }
    }
}
