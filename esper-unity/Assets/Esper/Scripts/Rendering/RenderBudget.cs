using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper.Rendering
{
    /// Renders at most CapLines worth of pixels (a 16:9 frame of that height), whatever the display, and lets
    /// URP upscale to the canvas. A 4K screen at a 1080 cap draws a quarter of the pixels; the page's HTML
    /// chrome stays native and sharp.
    public class RenderBudget : MonoBehaviour
    {
        /// Vertical lines of a 16:9 frame; 0 renders natively.
        public static int CapLines = 1080;
        /// Overrides the cap with a fixed render scale when above zero (look dev: pipe.scale).
        public static float ManualScale;

        int width, height, cap = -1;
        float manual = -1f;

        void Update()
        {
            if (Screen.width == width && Screen.height == height && CapLines == cap && Mathf.Approximately(ManualScale, manual)) return;
            if (GraphicsSettings.currentRenderPipeline is not UniversalRenderPipelineAsset urp) return;
            width = Screen.width;
            height = Screen.height;
            cap = CapLines;
            manual = ManualScale;
            float budget = cap * cap * 16f / 9f;
            float scale = manual > 0f ? manual : cap <= 0 ? 1f : Mathf.Sqrt(budget / Mathf.Max(1f, width * (float)height));
            urp.renderScale = Mathf.Clamp(scale, 0.1f, 1f);
        }
    }
}
