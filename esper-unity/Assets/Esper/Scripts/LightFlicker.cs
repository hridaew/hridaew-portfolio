using UnityEngine;

namespace Esper
{
    /// Uneven mains flicker: mostly steady, with the occasional stutter.
    public class LightFlicker : MonoBehaviour
    {
        [HideInInspector] public float baseIntensity;
        [HideInInspector] public float scale = 1f;
        [Range(0, 1)] public float jitter = 0.04f;
        public float stutterChance = 0.004f;
        Light lamp;
        float stutterUntil;

        void Awake() { lamp = GetComponent<Light>(); baseIntensity = lamp.intensity; }

        void Update()
        {
            float t = Time.time;
            float hum = 1f + (Mathf.PerlinNoise(t * 7.3f, 0.37f) - 0.5f) * 2f * jitter;
            if (Time.time > stutterUntil && Random.value < stutterChance) stutterUntil = Time.time + Random.Range(0.05f, 0.25f);
            if (Time.time < stutterUntil) hum *= Random.value < 0.5f ? 0.35f : 1.05f;
            lamp.intensity = baseIntensity * hum * scale;
        }
    }
}
