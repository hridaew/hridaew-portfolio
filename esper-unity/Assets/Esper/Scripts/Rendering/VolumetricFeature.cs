using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.RenderGraphModule;
using UnityEngine.Rendering.Universal;

namespace Esper.Rendering
{
    /// Raymarched single-scattering of the main light through the room, shadowed by the
    /// main light shadow map — the slatted shafts through the blinds.
    public class VolumetricFeature : ScriptableRendererFeature
    {
        public Material material;
        public RenderPassEvent passEvent = RenderPassEvent.BeforeRenderingPostProcessing;

        VolumetricPass pass;

        public override void Create()
        {
            pass = new VolumetricPass { renderPassEvent = passEvent };
        }

        public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData renderingData)
        {
            if (material == null) return;
            var type = renderingData.cameraData.cameraType;
            if (type != CameraType.Game && type != CameraType.SceneView) return;
            pass.material = material;
            pass.ConfigureInput(ScriptableRenderPassInput.Depth | ScriptableRenderPassInput.Color);
            renderer.EnqueuePass(pass);
        }

        class VolumetricPass : ScriptableRenderPass
        {
            public Material material;

            class PassData
            {
                public TextureHandle source;
                public Material material;
            }

            public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
            {
                var resources = frameData.Get<UniversalResourceData>();
                if (resources.isActiveTargetBackBuffer) return;

                var source = resources.activeColorTexture;
                var desc = renderGraph.GetTextureDesc(source);
                desc.name = "_EsperVolumetricColor";
                desc.clearBuffer = false;
                desc.depthBufferBits = 0;
                var destination = renderGraph.CreateTexture(desc);

                using (var builder = renderGraph.AddRasterRenderPass<PassData>("Esper Volumetric", out var data))
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
