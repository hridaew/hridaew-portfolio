using System.Globalization;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper
{
    /// Live look development from the page: SendMessage("ESPER", "Look", "key=value;key=value").
    /// Keys: vol.<_Property> (volumetric material), exposure, contrast, saturation, bloom, vignette, grain,
    /// light.<Name> (intensity), ambient (multiplier). Values are written back into the builder once chosen.
    public class LookDev : MonoBehaviour
    {
        public Material volumetric;
        public VolumeProfile post;
        Color ambSky, ambEq, ambGround;

        void Awake()
        {
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
