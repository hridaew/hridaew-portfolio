using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper.EditorTools
{
    /// Offscreen rendering helpers used by batch-mode review captures.
    public static class EsperRender
    {
        public static Texture2D Render(Camera cam, int width, int height)
        {
            var rt = RenderTexture.GetTemporary(new RenderTextureDescriptor(width, height, RenderTextureFormat.ARGBHalf, 24) { msaaSamples = 4, sRGB = false });
            var request = new UniversalRenderPipeline.SingleCameraRequest { destination = rt };
            if (RenderPipeline.SupportsRenderRequest(cam, request))
                RenderPipeline.SubmitRenderRequest(cam, request);
            else
            {
                cam.targetTexture = rt;
                cam.Render();
                cam.targetTexture = null;
            }

            // Resolve HDR -> sRGB 8-bit for review.
            var ldr = RenderTexture.GetTemporary(width, height, 0, RenderTextureFormat.ARGB32, RenderTextureReadWrite.sRGB);
            Graphics.Blit(rt, ldr);
            var prev = RenderTexture.active;
            RenderTexture.active = ldr;
            var tex = new Texture2D(width, height, TextureFormat.RGB24, false);
            tex.ReadPixels(new Rect(0, 0, width, height), 0, 0);
            tex.Apply();
            RenderTexture.active = prev;
            RenderTexture.ReleaseTemporary(rt);
            RenderTexture.ReleaseTemporary(ldr);
            return tex;
        }

        public static void Save(Texture2D tex, string path)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            File.WriteAllBytes(path, tex.EncodeToPNG());
        }

        public static string ReviewDir => Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Review"));
    }
}
