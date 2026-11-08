Shader "Esper/FlatVertex"
{
    // Unlit vertex colour: for geometry whose shading is decided when it is built, like the city outside.
    SubShader
    {
        Tags { "RenderType" = "Opaque" "RenderPipeline" = "UniversalPipeline" }
        Cull Off

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes { float4 positionOS : POSITION; half4 color : COLOR; };
            struct Varyings { float4 positionCS : SV_POSITION; half4 color : COLOR; };

            Varyings vert(Attributes i)
            {
                Varyings o;
                o.positionCS = TransformObjectToHClip(i.positionOS.xyz);
                o.color = i.color;
                return o;
            }

            half4 frag(Varyings i) : SV_Target { return half4(i.color.rgb, 1); }
            ENDHLSL
        }
    }
}
