using UnityEngine;

namespace Esper.Live
{
    /// A screen with an idle image and, while its station is in use, one image or a changing sequence.
    public class LiveDisplayState : MonoBehaviour
    {
        static readonly int MainTex = Shader.PropertyToID("_MainTex");
        static readonly int Brightness = Shader.PropertyToID("_Brightness");

        public string station;
        public MeshRenderer target;
        public Texture2D idle;
        public Texture2D[] frames;
        public float seconds = 2.5f;
        /// Screen width / height; images crop to fill it. 0 leaves the UVs alone.
        public float aspect;
        public float idleBrightness = 1f, activeBrightness = 1f;

        int index;
        float elapsed;
        bool wasActive;

        bool Active => !string.IsNullOrEmpty(station) && StationStates.Active == station;

        void OnEnable() => Refresh();

        void Update()
        {
            bool active = Active;
            if (active != wasActive)
            {
                wasActive = active;
                index = 0;
                elapsed = 0f;
                Refresh();
            }
            if (!active || frames == null || frames.Length < 2) return;
            elapsed += Time.unscaledDeltaTime;
            if (elapsed < seconds) return;
            elapsed = 0f;
            index = (index + 1) % frames.Length;
            Refresh();
        }

        public void Refresh()
        {
            if (!target) return;
            var frame = frames != null && index < frames.Length ? frames[index] : null;
            var tex = Active && frame ? frame : idle;
            if (!tex) return;
            var m = target.sharedMaterial;
            m.SetTexture(MainTex, tex);
            m.SetFloat(Brightness, Active ? activeBrightness : idleBrightness);
            if (aspect <= 0f) return;
            float ta = tex.width / (float)Mathf.Max(1, tex.height);
            var scale = ta > aspect ? new Vector2(aspect / ta, 1f) : new Vector2(1f, ta / aspect);
            m.SetTextureScale(MainTex, scale);
            m.SetTextureOffset(MainTex, (Vector2.one - scale) * 0.5f);
        }
    }
}
