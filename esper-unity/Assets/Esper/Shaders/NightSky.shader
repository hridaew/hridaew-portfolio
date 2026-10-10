Shader "Esper/NightSky"
{
    Properties
    {
        _Zenith ("Zenith", Color) = (0.006, 0.009, 0.016, 1)
        _Horizon ("Horizon glow", Color) = (0.16, 0.085, 0.07, 1)
        _Accent ("Underglow accent", Color) = (0.12, 0.03, 0.09, 1)
        _CloudScale ("Cloud scale", Float) = 2.2
        _CloudSpeed ("Cloud drift", Float) = 0.004
        _Exposure ("Exposure", Float) = 1
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
                float4 _Zenith, _Horizon, _Accent;
                float _CloudScale, _CloudSpeed, _Exposure;
            CBUFFER_END

            struct Attributes { float4 positionOS : POSITION; };
            struct Varyings { float4 positionCS : SV_POSITION; float3 dir : TEXCOORD0; };

            Varyings vert(Attributes v)
            {
                Varyings o;
                o.positionCS = TransformObjectToHClip(v.positionOS.xyz);
                o.dir = v.positionOS.xyz;
                return o;
            }

            float Hash(float2 p) { p = frac(p * float2(123.34, 456.21)); p += dot(p, p + 45.32); return frac(p.x * p.y); }
            float Noise(float2 p)
            {
                float2 i = floor(p), f = frac(p);
                f = f * f * (3 - 2 * f);
                return lerp(lerp(Hash(i), Hash(i + float2(1, 0)), f.x), lerp(Hash(i + float2(0, 1)), Hash(i + 1), f.x), f.y);
            }
            float Fbm(float2 p)
            {
                float a = 0.5, s = 0;
                [unroll] for (int k = 0; k < 5; k++) { s += a * Noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
                return s;
            }

            half4 frag(Varyings i) : SV_Target
            {
                float3 d = normalize(i.dir);
                float up = saturate(d.y);
                half3 col = lerp(_Horizon.rgb, _Zenith.rgb, pow(up, 0.45));
                // Low cloud deck lit from below by the city.
                float2 cuv = d.xz / max(d.y + 0.08, 0.02) * _CloudScale * 0.1 + _Time.y * _CloudSpeed;
                float c = smoothstep(0.42, 0.85, Fbm(cuv));
                float under = exp(-up * 6.0);
                half3 cloudCol = lerp(_Horizon.rgb * 1.4, _Accent.rgb * 2.0, Noise(cuv * 0.3));
                col = lerp(col, cloudCol * (0.35 + under), c * (1.0 - up * 0.6));
                col = d.y < 0 ? _Horizon.rgb * 0.6 : col;
                return half4(col * _Exposure, 1);
            }
            ENDHLSL
        }
    }
}
