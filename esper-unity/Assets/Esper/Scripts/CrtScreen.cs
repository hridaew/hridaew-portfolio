using UnityEngine;

namespace Esper
{
    /// Per-instance CRT state: power, enhance, grid. Writes to a material instance.
    public class CrtScreen : MonoBehaviour
    {
        [Range(0, 1)] public float power = 1f;
        [Range(0, 1)] public float enhance;
        [Range(0, 1)] public float grid;
        public Light glow;
        public float glowIntensity = 0.6f;
        public Vector4 enhanceRect = new Vector4(0.5f, 0.5f, 0.25f, 0.25f);
        Renderer rend;
        MaterialPropertyBlock block;
        static readonly int PowerId = Shader.PropertyToID("_Power");
        static readonly int EnhanceId = Shader.PropertyToID("_Enhance");
        static readonly int GridId = Shader.PropertyToID("_Grid");
        static readonly int RectId = Shader.PropertyToID("_EnhanceRect");

        void Awake() { rend = GetComponent<Renderer>(); block = new MaterialPropertyBlock(); }

        void LateUpdate()
        {
            rend.GetPropertyBlock(block);
            block.SetFloat(PowerId, power);
            block.SetFloat(EnhanceId, enhance);
            block.SetFloat(GridId, grid);
            block.SetVector(RectId, enhanceRect);
            rend.SetPropertyBlock(block);
            if (glow) glow.intensity = glowIntensity * power * (0.92f + 0.08f * Mathf.PerlinNoise(Time.time * 18f, 0.5f));
        }
    }
}
