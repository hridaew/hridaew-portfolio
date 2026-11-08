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
        [Tooltip("March the haze at 1/n resolution on each axis.")]
        [Range(1, 4)] public int downsample = 2;
        [Range(8, 96)] public int steps = 24;
        /// Live overrides from look dev (fog.res, fog.steps); 0 = use the serialized value.
        public static int DownsampleOverride, StepsOverride;

        VolumetricPass pass;

        public override void Create()
        {
            pass = new VolumetricPass { renderPassEvent = passEvent };
        }

        public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData renderingData)
        {
            if (material == null || material.GetFloat("_Density") <= 0f) return;
            var type = renderingData.cameraData.cameraType;
            if (type != CameraType.Game && type != CameraType.SceneView) return;
            pass.material = material;
            pass.downsample = DownsampleOverride > 0 ? DownsampleOverride : downsample;
            pass.steps = StepsOverride > 0 ? StepsOverride : steps;
            pass.ConfigureInput(ScriptableRenderPassInput.Depth | ScriptableRenderPassInput.Color);
            renderer.EnqueuePass(pass);
        }

        class VolumetricPass : ScriptableRenderPass
        {
            public Material material;
            public int downsample = 2;
            public int steps = 24;
            static readonly int VolumetricId = Shader.PropertyToID("_EsperVolumetric");
            static readonly int StepsId = Shader.PropertyToID("_Steps");

            class PassData
            {
                public TextureHandle source;
                public Material material;
            }

            public override void RecordRenderGraph(RenderGraph renderGraph, ContextContainer frameData)
            {
                var resources = frameData.Get<UniversalResourceData>();
                if (resources.isActiveTargetBackBuffer) return;
                material.SetFloat(StepsId, steps);

                var source = resources.activeColorTexture;
                var desc = renderGraph.GetTextureDesc(source);
                desc.clearBuffer = false;
                desc.depthBufferBits = 0;

                // The haze is soft, so march it at a fraction of the pixels; this pass is most of the frame's cost.
                var fogDesc = desc;
                fogDesc.name = "_EsperVolumetric";
                fogDesc.width = Mathf.Max(1, desc.width / downsample);
                fogDesc.height = Mathf.Max(1, desc.height / downsample);
                fogDesc.msaaSamples = MSAASamples.None;
                fogDesc.colorFormat = UnityEngine.Experimental.Rendering.GraphicsFormat.R16G16B16A16_SFloat;
                var fog = renderGraph.CreateTexture(fogDesc);

                using (var builder = renderGraph.AddRasterRenderPass<PassData>("Esper Volumetric March", out var data))
                {
                    data.source = source;
                    data.material = material;
                    builder.UseTexture(source);
                    builder.UseAllGlobalTextures(true);
                    builder.SetRenderAttachment(fog, 0);
                    builder.SetGlobalTextureAfterPass(fog, VolumetricId);
                    builder.SetRenderFunc((PassData d, RasterGraphContext ctx) =>
                        Blitter.BlitTexture(ctx.cmd, d.source, new Vector4(1, 1, 0, 0), d.material, 0));
                }

                desc.name = "_EsperVolumetricColor";
                var destination = renderGraph.CreateTexture(desc);
                using (var builder = renderGraph.AddRasterRenderPass<PassData>("Esper Volumetric Composite", out var data))
                {
                    data.source = source;
                    data.material = material;
                    builder.UseTexture(source);
                    builder.UseTexture(fog);
                    builder.UseAllGlobalTextures(true);
                    builder.SetRenderAttachment(destination, 0);
                    builder.SetRenderFunc((PassData d, RasterGraphContext ctx) =>
                        Blitter.BlitTexture(ctx.cmd, d.source, new Vector4(1, 1, 0, 0), d.material, 1));
                }

                resources.cameraColor = destination;
            }
        }
    }
}
