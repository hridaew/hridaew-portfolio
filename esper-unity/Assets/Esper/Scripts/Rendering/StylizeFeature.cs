using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.RenderGraphModule;
using UnityEngine.Rendering.Universal;

namespace Esper.Rendering
{
    /// Whole-frame render styles (pixel, voxel, 1-bit, painterly, cyberspace, cel, noir), applied after the
    /// grade. Chosen live from Studio through look dev; with no style set the pass is not scheduled at all.
    public class StylizeFeature : ScriptableRendererFeature
    {
        public Material material;

        public static readonly string[] Styles = { "None", "Pixel", "Voxel", "Obra Dinn", "Pixar", "Cyberspace", "Cel", "Noir" };
        /// Index into Styles; 0 = off.
        public static int Style;
        /// Style-specific scale (pixel size, voxel size, line weight).
        public static float Size = 4f;

        StylizePass pass;

        public override void Create()
        {
            pass = new StylizePass { renderPassEvent = RenderPassEvent.AfterRenderingPostProcessing, requiresIntermediateTexture = true };
        }

        public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData renderingData)
        {
            if (material == null || Style <= 0) return;
            var type = renderingData.cameraData.cameraType;
            if (type != CameraType.Game && type != CameraType.SceneView) return;
            pass.material = material;
            pass.ConfigureInput(ScriptableRenderPassInput.Depth);
            renderer.EnqueuePass(pass);
        }

        class StylizePass : ScriptableRenderPass
        {
            public Material material;
            static readonly int StyleId = Shader.PropertyToID("_Style");
            static readonly int SizeId = Shader.PropertyToID("_Size");

            class PassData
            {
                public TextureHandle source;
                public Material material;
            }

            public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
            {
                var resources = frameData.Get<UniversalResourceData>();
                if (resources.isActiveTargetBackBuffer) return;
                material.SetFloat(StyleId, Style);
                material.SetFloat(SizeId, Size);

                var source = resources.activeColorTexture;
                var desc = renderGraph.GetTextureDesc(source);
                desc.name = "_EsperStylized";
                desc.clearBuffer = false;
                desc.depthBufferBits = 0;
                var destination = renderGraph.CreateTexture(desc);

                using (var builder = renderGraph.AddRasterRenderPass<PassData>("Esper Stylize", out var data))
                {
                    data.source = source;
                    data.material = material;
                    builder.UseTexture(source);
                    builder.UseAllGlobalTextures(true);
                    builder.SetRenderAttachment(destination, 0);
                    builder.SetRenderFunc((PassData d, RasterGraphContext ctx) =>
                        Blitter.BlitTexture(ctx.cmd, d.source, new Vector4(1, 1, 0, 0), d.material, 0));
                }

                resources.cameraColor = destination;
            }
        }
    }
}
