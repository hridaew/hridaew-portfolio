using UnityEngine;

namespace Esper
{
    /// Slow searchlight drift for the city light through the blinds, with rare passes.
    public class SlowSweep : MonoBehaviour
    {
        public Vector2 yawPitchAmplitude = new Vector2(3.5f, 1.2f);
        public float period = 38f;
        public float passIntensity = 0.9f;
        Quaternion baseRotation;
        Light lamp;
        float baseIntensity;

        void Awake()
        {
            baseRotation = transform.localRotation;
            lamp = GetComponent<Light>();
            if (lamp) baseIntensity = lamp.intensity;
        }

        void Update()
        {
            float t = Time.time / period * Mathf.PI * 2f;
            transform.localRotation = baseRotation * Quaternion.Euler(Mathf.Sin(t * 0.7f) * yawPitchAmplitude.y, Mathf.Sin(t) * yawPitchAmplitude.x, 0);
            if (lamp)
            {
                // Every so often something bright passes outside.
                // Rare: roughly once a minute, never at load.
                float pass = Mathf.Pow(Mathf.Max(0f, Mathf.Sin(Time.time * 0.11f - 2.4f)), 40f);
                lamp.intensity = baseIntensity * (1f + pass * passIntensity);
            }
        }
    }
}
