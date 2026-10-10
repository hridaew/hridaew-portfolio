using System.Collections;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper
{
    /// "Turn the lights on": ceiling tubes stutter to life, practicals come up, exposure lifts.
    public class RoomLights : MonoBehaviour
    {
        public Light[] tubes;
        public Renderer[] tubeGlow;
        public Volume lightsOnVolume;
        public Color glowColor = new Color(0.85f, 0.95f, 1f);
        public float glowIntensity = 6f;
        public bool on;

        float[] tubeTarget;
        MaterialPropertyBlock block;
        static readonly int EmissionId = Shader.PropertyToID("_EmissionColor");
        static readonly int BaseId = Shader.PropertyToID("_BaseColor");

        void Awake()
        {
            block = new MaterialPropertyBlock();
            tubeTarget = new float[tubes.Length];
            for (int i = 0; i < tubes.Length; i++)
            {
                tubeTarget[i] = tubes[i].intensity;
                tubes[i].intensity = 0;
                tubes[i].enabled = false;
            }
            SetGlow(0);
            if (lightsOnVolume) lightsOnVolume.weight = 0;
        }

        public void Set(bool value)
        {
            if (value == on) return;
            on = value;
            StopAllCoroutines();
            StartCoroutine(value ? TurnOn() : TurnOff());
        }

        IEnumerator TurnOn()
        {
            foreach (var t in tubes) t.enabled = true;
            // Fluorescent start: two or three stutters, then steady.
            float[] pattern = { 0.6f, 0f, 0.9f, 0.2f, 1f };
            float[] waits = { 0.05f, 0.09f, 0.05f, 0.12f, 0f };
            for (int k = 0; k < pattern.Length; k++)
            {
                Apply(pattern[k]);
                yield return new WaitForSecondsRealtime(waits[k]);
            }
            float t0 = 0;
            while (t0 < 1f)
            {
                t0 += Time.unscaledDeltaTime / 0.5f;
                if (lightsOnVolume) lightsOnVolume.weight = Mathf.SmoothStep(0, 1, t0);
                yield return null;
            }
        }

        IEnumerator TurnOff()
        {
            Apply(0);
            float t0 = 1;
            while (t0 > 0f)
            {
                t0 -= Time.unscaledDeltaTime / 0.35f;
                if (lightsOnVolume) lightsOnVolume.weight = Mathf.SmoothStep(0, 1, t0);
                yield return null;
            }
            foreach (var t in tubes) t.enabled = false;
        }

        void Apply(float k)
        {
            for (int i = 0; i < tubes.Length; i++) tubes[i].intensity = tubeTarget[i] * k;
            SetGlow(k);
        }

        void SetGlow(float k)
        {
            foreach (var r in tubeGlow)
            {
                r.GetPropertyBlock(block);
                block.SetColor(EmissionId, glowColor * glowIntensity * k);
                block.SetColor(BaseId, Color.Lerp(new Color(0.25f, 0.26f, 0.27f), Color.white, k));
                r.SetPropertyBlock(block);
            }
        }
    }
}
