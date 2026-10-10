Shader "Esper/RainGlass"
{
    Properties
    {
        _Tint ("Glass tint", Color) = (0.82, 0.9, 0.95, 1)
        _DropScale ("Drop scale (per metre)", Float) = 9
        _Refraction ("Refraction", Float) = 0.045
        _Blur ("Condensation blur", Float) = 0.004
        _Speed ("Rain speed", Float) = 1
        _StaticAmount ("Static beads", Range(0, 1)) = 0.8
        _SlideAmount ("Sliding drops", Range(0, 1)) = 0.9
        _Reflection ("Reflection", Range(0, 1)) = 0.12
        _Grime ("Grime", Range(0, 1)) = 0.25
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent" "RenderPipeline" = "UniversalPipeline" }
        ZWrite Off
        Cull Back
        Blend One Zero

        Pass
        {
            Name "Forward"
            Tags { "LightMode" = "UniversalForward" }
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"

            CBUFFER_START(UnityPerMaterial)
                float4 _Tint;
                float _DropScale, _Refraction, _Blur, _Speed, _StaticAmount, _SlideAmount, _Reflection, _Grime;
            CBUFFER_END

            struct Attributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; float4 tangentOS : TANGENT; float2 uv : TEXCOORD0; };
            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
                float3 normalWS : TEXCOORD1;
                float4 screenPos : TEXCOORD2;
                float2 dropUV : TEXCOORD3;
                float3 tangentWS : TEXCOORD4;
                float3 bitangentWS : TEXCOORD5;
            };

            Varyings vert(Attributes v)
            {
                Varyings o;
                VertexPositionInputs p = GetVertexPositionInputs(v.positionOS.xyz);
                VertexNormalInputs n = GetVertexNormalInputs(v.normalOS, v.tangentOS);
                o.positionCS = p.positionCS;
                o.positionWS = p.positionWS;
                o.normalWS = n.normalWS;
                o.tangentWS = n.tangentWS;
                o.bitangentWS = n.bitangentWS;
                o.screenPos = ComputeScreenPos(p.positionCS);
                // Drops live in world metres so every pane gets the same bead size.
                float3 scale = float3(length(unity_ObjectToWorld._m00_m10_m20), length(unity_ObjectToWorld._m01_m11_m21), 1);
                o.dropUV = v.uv * scale.xy * _DropScale;
                return o;
            }

            float3 Hash32(float2 p)
            {
                float3 q = frac(float3(p.xyx) * float3(0.1031, 0.1030, 0.0973));
                q += dot(q, q.yxz + 33.33);
                return frac((q.xxy + q.yzz) * q.zyx);
            }

            // Small beads that bloom and evaporate in place.
            float StaticBeads(float2 uv, float t)
            {
                uv *= 4.0;
                float2 id = floor(uv);
                float2 f = frac(uv) - 0.5;
                float3 n = Hash32(id);
                float2 c = (n.xy - 0.5) * 0.7;
                float d = length((f - c) * float2(1.0, 1.15));
                float life = saturate(sin(t * 0.35 + n.z * 6.2831) * 0.6 + 0.4);
                float r = lerp(0.08, 0.2, n.z) * life;
                return smoothstep(r, r * 0.35, d) * step(0.35, n.x);
            }

            // Larger drops that hang, then slip down, leaving a trail of beads behind them.
            float SlidingDrops(float2 uv, float t, float cellsX)
            {
                float2 aspect = float2(1.0, 2.6);
                float2 g = uv * float2(cellsX, cellsX / aspect.y);
                float colRnd = Hash32(float2(floor(g.x), 7.0)).x;
                g.y += t * (0.05 + colRnd * 0.06) + colRnd * 13.0;
                float2 id = floor(g);
                float3 n = Hash32(id);
                float2 f = frac(g) - 0.5;

                // Stop-start motion: hang, then slip.
                float phase = frac(t * (0.18 + n.z * 0.2) + n.y);
                float y = -(smoothstep(0.0, 0.85, phase) - 0.5) * 0.85 + 0.0;
                float x = (n.x - 0.5) * 0.6 + sin(phase * 9.0 + n.y * 20.0) * 0.04;
                float2 dp = (f - float2(x, y)) * aspect;
                float drop = smoothstep(0.17, 0.06, length(dp));

                // Trail: beads in the drop's wake, fading with distance.
                float trailMask = smoothstep(0.0, 0.05, f.y - y) * smoothstep(0.65, 0.0, f.y - y);
                float2 tf = float2(f.x - x, frac(f.y * 7.0) - 0.5);
                float bead = smoothstep(0.07, 0.025, length(tf * float2(aspect.y, 1.0)));
                float trail = bead * trailMask * smoothstep(0.08, 0.0, abs(f.x - x));

                float alive = step(0.25, n.x);
                return saturate(drop + trail * 0.75) * alive;
            }

            float Height(float2 uv, float t)
            {
                return StaticBeads(uv, t) * _StaticAmount
                     + SlidingDrops(uv, t, 2.0) * _SlideAmount
                     + SlidingDrops(uv * 1.7 + 3.1, t * 1.1, 2.5) * _SlideAmount * 0.7;
            }

            half4 frag(Varyings i) : SV_Target
            {
                float t = _Time.y * _Speed;
                float2 uv = i.dropUV;
                float e = 0.006;
                float h = Height(uv, t);
                float hx = Height(uv + float2(e, 0), t);
                float hy = Height(uv + float2(0, e), t);
                float2 grad = float2(hx - h, hy - h) / e;

                float2 screenUV = i.screenPos.xy / i.screenPos.w;
                float2 offset = -grad * _Refraction * 0.02;

                // Condensation blur where there is no bead; beads read sharp.
                float blur = _Blur * (1.0 - saturate(h * 2.0));
                half3 col = 0;
                const int TAPS = 8;
                [unroll] for (int k = 0; k < TAPS; k++)
                {
                    float a = k * 2.3999632;
                    float r = sqrt((k + 0.5) / TAPS);
                    col += SampleSceneColor(screenUV + offset + float2(cos(a), sin(a)) * r * blur);
                }
                col /= TAPS;

                // Beads darken at their rims and catch a pinpoint of the city.
                float rim = saturate(length(grad) * 0.03);
                col *= lerp(1.0, 0.72, rim);

                float3 N = normalize(i.normalWS + (i.tangentWS * -grad.x + i.bitangentWS * -grad.y) * 0.004);
                float3 V = normalize(GetWorldSpaceViewDir(i.positionWS));
                float fres = pow(1.0 - saturate(dot(N, V)), 4.0);
                half3 refl = GlossyEnvironmentReflection(reflect(-V, N), i.positionWS, 0.05, 1.0);
                col += refl * (_Reflection + fres * 0.5);

                Light mainLight = GetMainLight();
                float3 H = normalize(mainLight.direction + V);
                col += mainLight.color * pow(saturate(dot(N, H)), 220.0) * saturate(h * 3.0) * 0.6;

                float grime = Hash32(floor(uv * 25.0)).x;
                col *= lerp(1.0, 0.85 + grime * 0.15, _Grime);
                return half4(col * _Tint.rgb, 1);
            }
            ENDHLSL
        }
    }
}
