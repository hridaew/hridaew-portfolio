using Unity.Cinemachine;
using UnityEngine;

namespace Esper
{
    /// One piece of work in the room: what you click, where the camera goes, what it opens.
    public class Hotspot : MonoBehaviour
    {
        public string id;
        public string url;
        public CinemachineCamera focusCamera;
        [Tooltip("Practical that warms when the object is hovered.")]
        public Light accent;
        public float accentBoost = 1.8f;
        [Tooltip("Optional screen that runs the ESPER enhance.")]
        public CrtScreen screen;
        public Vector4 enhanceRect = new Vector4(0.5f, 0.55f, 0.3f, 0.3f);
        [Tooltip("How far the camera narrows during enhance.")]
        public float enhanceFov = 9f;

        [HideInInspector] public float hover;
        float accentBase, lastSet = -1f;
        Light tracked;

        void Update()
        {
            if (!accent) return;
            float k = Mathf.Lerp(1f, accentBoost, hover);
            // Respect a flicker component driving the same light: scale on top of it.
            var flicker = accent.GetComponent<LightFlicker>();
            if (flicker)
            {
                flicker.scale = k;
                return;
            }
            // Anyone else setting the light (the live scene, Studio, look dev) sets its resting level.
            if (accent != tracked || !Mathf.Approximately(accent.intensity, lastSet))
            {
                tracked = accent;
                accentBase = accent.intensity;
            }
            lastSet = accentBase * k;
            accent.intensity = lastSet;
        }
    }
}
