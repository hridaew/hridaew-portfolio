Shader "Esper/CityTower"
{
    Properties
    {
        _Facade ("Facade", Color) = (0.018, 0.02, 0.026, 1)
        _WindowSize ("Window cell (w, h)", Vector) = (1.4, 3.3, 0, 0)
        _LitRatio ("Lit ratio", Range(0, 1)) = 0.32
        _WindowGlow ("Window glow", Float) = 2.2
        _WarmColor ("Sodium", Color) = (1, 0.55, 0.22, 1)
        _CoolColor ("Fluorescent", Color) = (0.55, 0.85, 1, 1)
        _AccentColor ("Accent", Color) = (1, 0.25, 0.6, 1)
        _FogColor ("Haze", Color) = (0.08, 0.12, 0.16, 1)
        _FogDensity ("Haze density", Float) = 0.0045
        _FogHeight ("Haze height falloff", Float) = 0.004
        _GroundGlow ("Street glow", Color) = (0.35, 0.18, 0.1, 1)
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

            CBUFFER_START(UnityPerMaterial)
                float4 _Facade, _WindowSize, _WarmColor, _CoolColor, _AccentColor, _FogColor, _GroundGlow;
                float _LitRatio, _WindowGlow, _FogDensity, _FogHeight;
            CBUFFER_END

            struct Attributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; };
            struct Varyings { float4 positionCS : SV_POSITION; float3 positionWS : TEXCOORD0; float3 normalWS : TEXCOORD1; float3 seed : TEXCOORD2; };

            Varyings vert(Attributes v)
            {
                Varyings o;
                o.positionWS = TransformObjectToWorld(v.positionOS.xyz);
                o.positionCS = TransformWorldToHClip(o.positionWS);
                o.normalWS = TransformObjectToWorldNormal(v.normalOS);
                o.seed = unity_ObjectToWorld._m03_m13_m23;
                return o;
            }

            float3 Hash33(float3 p)
            {
                p = frac(p * float3(0.1031, 0.1030, 0.0973));
                p += dot(p, p.yxz + 33.33);
                return frac((p.xxy + p.yxx) * p.zyx);
            }

            half4 frag(Varyings i) : SV_Target
            {
                float3 n = normalize(i.normalWS);
                float3 p = i.positionWS;
                half3 col = _Facade.rgb;

                if (abs(n.y) < 0.5)
                {
                    float3 tangent = normalize(cross(float3(0, 1, 0), n));
                    float2 f = float2(dot(p, tangent), p.y) / _WindowSize.xy;
                    float2 id = floor(f);
                    float2 w = frac(f);
                    float3 h = Hash33(float3(id, dot(i.seed, float3(1.3, 0.7, 2.1)) + n.x * 3.0 + n.z * 7.0));
                    // Floors switch on in runs, like real offices and flats.
                    float3 rowH = Hash33(float3(floor(id.x / 4.0), id.y, i.seed.x));
                    float lit = step(1.0 - _LitRatio, h.x * 0.55 + rowH.y * 0.45);
                    float pane = step(0.12, w.x) * step(w.x, 0.88) * step(0.22, w.y) * step(w.y, 0.82);
                    half3 tint = h.y < 0.62 ? _WarmColor.rgb : (h.y < 0.95 ? _CoolColor.rgb : _AccentColor.rgb);
                    float blind = lerp(1.0, 0.35 + 0.65 * step(0.5, frac(w.y * 9.0)), step(0.7, h.z));
                    float flick = 1.0 - step(0.995, h.z) * step(0.5, frac(_Time.y * (2.0 + h.x * 3.0)));
                    col += tint * pane * lit * blind * flick * _WindowGlow * (0.4 + 0.6 * h.z);
                    // Spandrel bands catch the street glow from below.
                    col += _GroundGlow.rgb * (1.0 - pane) * exp(-max(p.y, 0.0) * 0.012) * 0.4;
                }

                float dist = length(p - GetCameraPositionWS());
                float fog = 1.0 - exp(-dist * _FogDensity * exp(-max(p.y, 0.0) * _FogHeight));
                half3 haze = lerp(_FogColor.rgb + _GroundGlow.rgb * 0.25, _FogColor.rgb, saturate(p.y / 220.0));
                col = lerp(col, haze, saturate(fog));
                return half4(col, 1);
            }
            ENDHLSL
        }
    }
}
