Shader "Esper/CrtScreen"
{
    Properties
    {
        _MainTex ("Content", 2D) = "black" {}
        _Tint ("Phosphor tint", Color) = (1, 0.96, 0.88, 1)
        _Brightness ("Brightness", Float) = 2.2
        _Power ("Power", Range(0, 1)) = 1
        _Curvature ("Curvature", Float) = 0.12
        _Scanlines ("Scanline count", Float) = 420
        _Mask ("Shadow mask", Range(0, 1)) = 0.35
        _Noise ("Noise", Range(0, 1)) = 0.06
        _Enhance ("Enhance", Range(0, 1)) = 0
        _EnhanceRect ("Enhance rect (xy centre, zw size)", Vector) = (0.5, 0.5, 0.25, 0.25)
        _Grid ("ESPER grid", Range(0, 1)) = 0
        _Mono ("Monochrome", Range(0, 1)) = 0
        _Glass ("Glass reflection", Range(0, 1)) = 0.18
        _Vignette ("Vignette", Range(0, 1)) = 1
        _ScanAmount ("Scanline depth", Range(0, 1)) = 0.35
    }

    SubShader
    {
        Tags { "RenderType" = "Opaque" "Queue" = "Geometry" "RenderPipeline" = "UniversalPipeline" }

        Pass
        {
            Name "Forward"
            Tags { "LightMode" = "UniversalForward" }
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            TEXTURE2D(_MainTex); SAMPLER(sampler_MainTex);
            CBUFFER_START(UnityPerMaterial)
                float4 _MainTex_ST, _Tint, _EnhanceRect;
                float _Brightness, _Power, _Curvature, _Scanlines, _Mask, _Noise, _Enhance, _Grid, _Mono, _Glass, _Vignette, _ScanAmount;
            CBUFFER_END

            struct Attributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; float2 uv : TEXCOORD0; };
            struct Varyings { float4 positionCS : SV_POSITION; float2 uv : TEXCOORD0; float3 positionWS : TEXCOORD1; float3 normalWS : TEXCOORD2; };

            Varyings vert(Attributes v)
            {
                Varyings o;
                o.positionWS = TransformObjectToWorld(v.positionOS.xyz);
                o.positionCS = TransformWorldToHClip(o.positionWS);
                o.normalWS = TransformObjectToWorldNormal(v.normalOS);
                o.uv = v.uv;
                return o;
            }

            float Hash(float2 p) { return frac(sin(dot(p, float2(12.9898, 78.233))) * 43758.5453); }

            half4 frag(Varyings i) : SV_Target
            {
                float2 c = i.uv * 2.0 - 1.0;
                c *= 1.0 + _Curvature * dot(c, c) * float2(0.5, 0.65);
                float2 uv = c * 0.5 + 0.5;
                float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);

                // Power-on: the picture unfolds from a bright horizontal line.
                float open = smoothstep(0.0, 0.55, _Power);
                float beam = smoothstep(0.55, 1.0, _Power);
                float2 puv = float2(0.5 + (uv.x - 0.5) / max(beam, 0.02), 0.5 + (uv.y - 0.5) / max(open * open, 0.004));
                float picture = step(abs(puv.y - 0.5), 0.5) * step(abs(puv.x - 0.5), 0.5);

                // Enhance: zoom the content into a sub-rectangle.
                float2 zoomCentre = _EnhanceRect.xy;
                float2 zoomSize = lerp(float2(1, 1), _EnhanceRect.zw, smoothstep(0, 1, _Enhance));
                float2 cuv = lerp(float2(0.5, 0.5), zoomCentre, smoothstep(0, 1, _Enhance)) + (puv - 0.5) * zoomSize;
                cuv = cuv * _MainTex_ST.xy + _MainTex_ST.zw;

                float t = _Time.y;
                cuv.x += (Hash(float2(floor(uv.y * 240.0), floor(t * 24.0))) - 0.5) * 0.0015;
                half3 col;
                col.r = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, cuv + float2(0.0012, 0)).r;
                col.g = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, cuv).g;
                col.b = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, cuv - float2(0.0012, 0)).b;
                // Letterbox / pillarbox: black outside the image instead of repeating it.
                col *= step(0.0, cuv.x) * step(cuv.x, 1.0) * step(0.0, cuv.y) * step(cuv.y, 1.0);
                float lum = dot(col, float3(0.299, 0.587, 0.114));
                col = lerp(col, lum.xxx, _Mono);

                float scan = 1.0 - _ScanAmount + _ScanAmount * sin(uv.y * _Scanlines * PI * 2.0);
                float3 mask = lerp(1.0.xxx, float3(1.1, 0.9, 1.1) * (0.85 + 0.15 * frac(i.uv.x * _Scanlines * 1.5).xxx), _Mask);
                col *= scan * mask;
                col *= 1.0 - 0.06 * smoothstep(0.0, 1.0, frac(uv.y * 0.6 - t * 0.12));
                col += (Hash(uv * 512.0 + t) - 0.5) * _Noise;

                // ESPER grid: a hairline crosshair and frame that tighten around the enhanced region.
                float2 g = abs(puv - 0.5);
                float frame = smoothstep(0.004, 0.0, abs(max(g.x, g.y) - lerp(0.48, 0.2, _Enhance))) ;
                float cross = smoothstep(0.0025, 0.0, min(g.x, g.y)) * step(max(g.x, g.y), 0.48);
                col = lerp(col, float3(0.75, 0.95, 1.0), saturate(frame + cross * 0.6) * _Grid);

                float vign = lerp(1.0, smoothstep(1.25, 0.35, length(c * float2(0.9, 1.0))), _Vignette);
                col *= vign * _Tint.rgb * _Brightness;
                col *= picture * open;
                col += float3(0.9, 0.95, 1.0) * smoothstep(0.02, 0.0, abs(uv.y - 0.5)) * (1.0 - beam) * step(0.001, _Power) * 3.0;
                col *= inside;

                // Dark glass: faint room reflection on the tube.
                float3 V = normalize(GetWorldSpaceViewDir(i.positionWS));
                float3 N = normalize(i.normalWS);
                float fres = pow(1.0 - saturate(dot(N, V)), 3.0);
                half3 refl = GlossyEnvironmentReflection(reflect(-V, N), i.positionWS, 0.12, 1.0);
                col += refl * (_Glass + fres * 0.4) + 0.006;

                return half4(col, 1);
            }
            ENDHLSL
        }
    }
}
