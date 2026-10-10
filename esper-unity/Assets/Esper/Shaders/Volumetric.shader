Shader "Hidden/Esper/Volumetric"
{
    Properties
    {
        _VolColor ("Light tint", Color) = (0.55, 0.8, 1, 1)
        _VolIntensity ("Intensity", Float) = 0.9
        _Density ("Density", Float) = 0.35
        _Anisotropy ("Anisotropy", Range(-0.9, 0.95)) = 0.55
        _Steps ("Steps", Float) = 64
        _MaxDistance ("Max distance", Float) = 12
        _NoiseScale ("Dust scale", Float) = 1.6
        _NoiseStrength ("Dust strength", Range(0, 1)) = 0.65
        _NoiseSpeed ("Dust drift", Vector) = (0.03, 0.012, -0.02, 0)
        _HeightFalloff ("Height falloff", Float) = 0.25
        _AmbientFog ("Ambient haze", Color) = (0.05, 0.035, 0.022, 1)
        _BoxMin ("Volume min", Vector) = (-3, 0, -2.5, 0)
        _BoxMax ("Volume max", Vector) = (3, 2.9, 2.5, 0)
    }

    SubShader
    {
        Tags { "RenderPipeline" = "UniversalPipeline" }
        ZWrite Off ZTest Always Cull Off Blend Off

        Pass
        {
            Name "Volumetric"
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
            #pragma multi_compile_fragment _ _SHADOWS_SOFT

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Shadows.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
            #include "Packages/com.unity.render-pipelines.core/Runtime/Utilities/Blit.hlsl"

            float4 _VolColor;
            float _VolIntensity, _Density, _Anisotropy, _Steps, _MaxDistance;
            float _NoiseScale, _NoiseStrength, _HeightFalloff;
            float4 _NoiseSpeed, _AmbientFog, _BoxMin, _BoxMax;

            float Hash13(float3 p)
            {
                p = frac(p * 0.1031);
                p += dot(p, p.zyx + 31.32);
                return frac((p.x + p.y) * p.z);
            }

            float ValueNoise(float3 p)
            {
                float3 i = floor(p);
                float3 f = frac(p);
                f = f * f * (3.0 - 2.0 * f);
                float n000 = Hash13(i);
                float n100 = Hash13(i + float3(1, 0, 0));
                float n010 = Hash13(i + float3(0, 1, 0));
                float n110 = Hash13(i + float3(1, 1, 0));
                float n001 = Hash13(i + float3(0, 0, 1));
                float n101 = Hash13(i + float3(1, 0, 1));
                float n011 = Hash13(i + float3(0, 1, 1));
                float n111 = Hash13(i + float3(1, 1, 1));
                return lerp(lerp(lerp(n000, n100, f.x), lerp(n010, n110, f.x), f.y),
                            lerp(lerp(n001, n101, f.x), lerp(n011, n111, f.x), f.y), f.z);
            }

            float Dust(float3 p)
            {
                float3 q = p * _NoiseScale + _NoiseSpeed.xyz * _Time.y * 10.0;
                float n = ValueNoise(q) * 0.55 + ValueNoise(q * 2.13 + 7.1) * 0.3 + ValueNoise(q * 4.7 - 3.3) * 0.15;
                // Slow, lazy curls of smoke: bias toward sparse wisps rather than uniform fog.
                n = smoothstep(0.25, 0.85, n);
                return lerp(1.0, n * 1.8, _NoiseStrength);
            }

            float PhaseHG(float cosTheta, float g)
            {
                float g2 = g * g;
                return (1.0 - g2) / (4.0 * PI * pow(max(1e-4, 1.0 + g2 - 2.0 * g * cosTheta), 1.5));
            }

            float2 RayBox(float3 ro, float3 rd, float3 bmin, float3 bmax)
            {
                float3 inv = 1.0 / rd;
                float3 t0 = (bmin - ro) * inv;
                float3 t1 = (bmax - ro) * inv;
                float3 tmin = min(t0, t1);
                float3 tmax = max(t0, t1);
                return float2(max(max(tmin.x, tmin.y), tmin.z), min(min(tmax.x, tmax.y), tmax.z));
            }

            half4 Frag(Varyings input) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
                float2 uv = input.texcoord;
                half4 scene = SAMPLE_TEXTURE2D_X(_BlitTexture, sampler_LinearClamp, uv);

                float rawDepth = SampleSceneDepth(uv);
                #if !UNITY_REVERSED_Z
                // OpenGL / WebGL: clip-space depth is -1..1.
                rawDepth = lerp(UNITY_NEAR_CLIP_VALUE, 1, rawDepth);
                #endif
                float3 worldPos = ComputeWorldSpacePosition(uv, rawDepth, UNITY_MATRIX_I_VP);
                float3 ro = GetCameraPositionWS();
                float3 toSurf = worldPos - ro;
                float sceneDist = length(toSurf);
                float3 rd = toSurf / max(sceneDist, 1e-4);

                float2 tb = RayBox(ro, rd, _BoxMin.xyz, _BoxMax.xyz);
                float tStart = max(tb.x, 0.0);
                float tEnd = min(min(tb.y, sceneDist), _MaxDistance);
                if (tEnd <= tStart) return scene;

                int steps = (int)_Steps;
                float stepLen = (tEnd - tStart) / steps;
                // Interleaved gradient noise jitter, animated so film grain hides banding.
                float2 px = uv * _ScreenParams.xy + floor(_Time.y * 60.0) * float2(5.588238, 5.588238);
                float jitter = frac(52.9829189 * frac(dot(px, float2(0.06711056, 0.00583715))));

                float3 L = _MainLightPosition.xyz;
                float phase = PhaseHG(dot(rd, L), _Anisotropy) * 4.0 * PI;
                float3 lightCol = _MainLightColor.rgb * _VolColor.rgb * _VolIntensity;

                float3 scatter = 0;
                float transmittance = 1.0;
                for (int i = 0; i < steps; i++)
                {
                    float t = tStart + (i + jitter) * stepLen;
                    float3 p = ro + rd * t;
                    float h = saturate(1.0 - (p.y - _BoxMin.y) * _HeightFalloff * 0.5);
                    float dens = _Density * Dust(p) * lerp(0.6, 1.0, h) * smoothstep(0.25, 1.4, t);
                    float shadow = MainLightRealtimeShadow(TransformWorldToShadowCoord(p));
                    float3 inscatter = (lightCol * phase * shadow + _AmbientFog.rgb) * dens;
                    scatter += inscatter * transmittance * stepLen;
                    transmittance *= exp(-dens * stepLen * 0.35);
                }

                return half4(scene.rgb * transmittance + scatter, scene.a);
            }
            ENDHLSL
        }
    }
}
