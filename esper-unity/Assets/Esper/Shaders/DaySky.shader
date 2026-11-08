Shader "Esper/DaySky"
{
    // A clear day: deep blue overhead, pale at the horizon, a soft glow around the sun.
    Properties
    {
        _Zenith ("Zenith", Color) = (0.2, 0.46, 0.86, 1)
        _Horizon ("Horizon", Color) = (0.8, 0.88, 0.96, 1)
        _Ground ("Below the horizon", Color) = (0.62, 0.7, 0.76, 1)
        _SunDir ("Toward the sun", Vector) = (-0.25, 0.62, 0.74, 0)
    }

    SubShader
    {
        Tags { "Queue" = "Background" "RenderType" = "Background" "PreviewType" = "Skybox" "RenderPipeline" = "UniversalPipeline" }
        Cull Off ZWrite Off

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            CBUFFER_START(UnityPerMaterial)
                float4 _Zenith, _Horizon, _Ground, _SunDir;
            CBUFFER_END

            struct Attributes { float4 positionOS : POSITION; };
            struct Varyings { float4 positionCS : SV_POSITION; float3 dir : TEXCOORD0; };

            Varyings vert(Attributes i)
            {
                Varyings o;
                o.positionCS = TransformObjectToHClip(i.positionOS.xyz);
                o.dir = i.positionOS.xyz;
                return o;
            }

            half4 frag(Varyings i) : SV_Target
            {
                float3 d = normalize(i.dir);
                float3 c = d.y >= 0 ? lerp(_Horizon.rgb, _Zenith.rgb, pow(saturate(d.y), 0.55)) : lerp(_Horizon.rgb, _Ground.rgb, saturate(-d.y * 6.0));
                float s = saturate(dot(d, normalize(_SunDir.xyz)));
                c += pow(s, 48.0) * 0.5 + pow(s, 900.0) * 3.0;
                return half4(c, 1);
            }
            ENDHLSL
        }
    }
}
