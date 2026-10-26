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
        Color ambSky, ambEq, ambGround;

        void Awake()
        {
            if (!GetComponent<Esper.Rendering.RenderBudget>()) gameObject.AddComponent<Esper.Rendering.RenderBudget>();
            ambSky = RenderSettings.ambientSkyColor;
            ambEq = RenderSettings.ambientEquatorColor;
            ambGround = RenderSettings.ambientGroundColor;
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
            if (key == "ambient")
            {
                RenderSettings.ambientSkyColor = ambSky * v;
                RenderSettings.ambientEquatorColor = ambEq * v;
                RenderSettings.ambientGroundColor = ambGround * v;
                return;
            }
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
