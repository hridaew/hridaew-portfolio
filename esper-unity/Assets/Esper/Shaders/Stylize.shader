Shader "Hidden/Esper/Stylize"
{
    // Whole-frame render styles, after the grade. _Style indexes StylizeFeature.Styles:
    // 1 Pixel, 2 Voxel, 3 Obra Dinn, 4 Pixar, 5 Cyberspace, 6 Cel, 7 Noir. _Size is per-style scale.
    Properties
    {
        _Style ("Style", Float) = 0
        _Size ("Size", Float) = 4
    }

    SubShader
    {
        Tags { "RenderPipeline" = "UniversalPipeline" }
        ZWrite Off ZTest Always Cull Off Blend Off

        Pass
        {
            Name "Stylize"
            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareDepthTexture.hlsl"
            #include "Packages/com.unity.render-pipelines.core/Runtime/Utilities/Blit.hlsl"
            #include "Packages/com.unity.render-pipelines.core/ShaderLibrary/Color.hlsl"

            // Styles work in display (sRGB) space, so palettes, posterising and dithering are perceptual;
            // Frag converts the result back to the linear target.
            float _Style, _Size;

            static const float Bayer8[64] =
            {
                 0, 32,  8, 40,  2, 34, 10, 42,
                48, 16, 56, 24, 50, 18, 58, 26,
                12, 44,  4, 36, 14, 46,  6, 38,
                60, 28, 52, 20, 62, 30, 54, 22,
                 3, 35, 11, 43,  1, 33,  9, 41,
                51, 19, 59, 27, 49, 17, 57, 25,
                15, 47,  7, 39, 13, 45,  5, 37,
                63, 31, 55, 23, 61, 29, 53, 21
            };

            float Bayer(float2 cell)
            {
                int x = (int)fmod(cell.x, 8.0);
                int y = (int)fmod(cell.y, 8.0);
                return (Bayer8[y * 8 + x] + 0.5) / 64.0;
            }

            half3 Scene(float2 uv) { return LinearToSRGB(saturate(SAMPLE_TEXTURE2D_X(_BlitTexture, sampler_LinearClamp, uv).rgb)); }
            half3 ScenePoint(float2 uv) { return LinearToSRGB(saturate(SAMPLE_TEXTURE2D_X(_BlitTexture, sampler_PointClamp, uv).rgb)); }
            float Luma(float3 c) { return dot(c, float3(0.2126, 0.7152, 0.0722)); }

            float RawDepth(float2 uv)
            {
                float d = SampleSceneDepth(uv);
                #if !UNITY_REVERSED_Z
                // OpenGL / WebGL: clip-space depth is -1..1.
                d = lerp(UNITY_NEAR_CLIP_VALUE, 1, d);
                #endif
                return d;
            }

            float EyeDepth(float2 uv) { return LinearEyeDepth(SampleSceneDepth(uv), _ZBufferParams); }
            float3 WorldPos(float2 uv) { return ComputeWorldSpacePosition(uv, RawDepth(uv), UNITY_MATRIX_I_VP); }

            // Silhouettes and creases: the depth Laplacian, relative to distance. Flat planes (even at grazing
            // angles) stay near zero; folds and outlines spike.
            float DepthEdge(float2 uv, float2 step)
            {
                float d = EyeDepth(uv);
                float h = abs(EyeDepth(uv + float2(step.x, 0)) + EyeDepth(uv - float2(step.x, 0)) - 2.0 * d);
                float v = abs(EyeDepth(uv + float2(0, step.y)) + EyeDepth(uv - float2(0, step.y)) - 2.0 * d);
                return saturate(((h + v) / max(d, 1e-3) - 0.015) * 30.0);
            }

            // How far a world position sits from a grid line on the two axes along the surface.
            float GridLine(float3 p, float3 n, float cell, float width)
            {
                float3 f = abs(frac(p / cell + 0.5) - 0.5) * cell;
                float3 w = step(abs(n), 0.75.xxx);           // ignore the axis the surface faces along
                float3 d = lerp(1e3.xxx, f, w);
                float e = min(min(d.x, d.y), d.z);
                return 1.0 - smoothstep(width * 0.5, width, e);
            }

            half3 Pixel(float2 uv)
            {
                float block = max(1.0, round(_Size * _ScreenParams.y / 1080.0));
                float2 res = _ScreenParams.xy;
                float2 cell = floor(uv * res / block);
                half3 c = ScenePoint((cell + 0.5) * block / res);
                // A small palette, ordered-dithered per block.
                float levels = 12.0;
                c = floor(c * levels + Bayer(cell)) / levels;
                return c;
            }

            half3 Voxel(float2 uv)
            {
                float raw = RawDepth(uv);
                if (EyeDepth(uv) > 30.0) return Scene(uv);
                float cell = max(0.01, _Size * 0.015);
                float3 p = ComputeWorldSpacePosition(uv, raw, UNITY_MATRIX_I_VP);
                float3 n = normalize(cross(ddy(p), ddx(p)));
                // Sample the colour at the centre of the voxel this surface point falls in.
                float3 centre = (floor(p / cell) + 0.5) * cell;
                float2 cuv = ComputeNormalizedDeviceCoordinates(centre, UNITY_MATRIX_VP);
                half3 c = Scene(saturate(cuv));
                // Faces read as blocks: lit tops, darker sides, a fine seam between cubes.
                c *= lerp(0.78, 1.08, saturate(n.y * 0.5 + 0.5));
                c *= 1.0 - 0.35 * GridLine(p, n, cell, cell * 0.06);
                return c;
            }

            half3 ObraDinn(float2 uv)
            {
                float block = max(1.0, round(_Size * _ScreenParams.y / 1080.0));
                float2 res = _ScreenParams.xy;
                float2 cell = floor(uv * res / block);
                float2 cuv = (cell + 0.5) * block / res;
                // The room is dark: lift into a range the two-tone dither can describe.
                float l = saturate(Luma(Scene(cuv)) * 1.7 - 0.04);
                float bit = step(Bayer(cell), l);
                float edge = step(0.5, DepthEdge(cuv, block / res));
                bit = lerp(bit, 1.0 - bit, edge);
                const half3 ink = half3(0.2, 0.2, 0.098);
                const half3 paper = half3(0.898, 1.0, 1.0);
                return lerp(ink, paper, bit);
            }

            half3 Pixar(float2 uv)
            {
                // Kuwahara: the flattest of four quadrants wins, so surfaces go smooth and edges stay crisp.
                float2 t = max(1.0, _Size * 0.5) / _ScreenParams.xy;
                float3 mean[4];
                float var[4];
                [unroll] for (int q = 0; q < 4; q++)
                {
                    float2 dir = float2(q % 2 == 0 ? -1.0 : 1.0, q < 2 ? -1.0 : 1.0);
                    float3 sum = 0, sum2 = 0;
                    [unroll] for (int y = 0; y < 3; y++)
                    [unroll] for (int x = 0; x < 3; x++)
                    {
                        float3 s = Scene(uv + dir * float2(x, y) * t);
                        sum += s;
                        sum2 += s * s;
                    }
                    mean[q] = sum / 9.0;
                    float3 v = sum2 / 9.0 - mean[q] * mean[q];
                    var[q] = v.r + v.g + v.b;
                }
                float3 c = mean[0];
                float best = var[0];
                [unroll] for (int k = 1; k < 4; k++) if (var[k] < best) { best = var[k]; c = mean[k]; }
                // Clean CG grade: lifted, warm, saturated, soft.
                float l = Luma(c);
                c = lerp(l.xxx, c, 1.35);
                c = c * 1.15 + half3(0.035, 0.022, 0.012);
                return c;
            }

            half3 Cyberspace(float2 uv)
            {
                float2 px = 1.0 / _ScreenParams.xy;
                float3 p = WorldPos(uv);
                float3 n = normalize(cross(ddy(p), ddx(p)));
                float depth = EyeDepth(uv);
                float edge = DepthEdge(uv, px * max(1.0, _Size));
                float grid = GridLine(p, n, 0.25, 0.012) * saturate(1.0 - depth / 12.0);
                float3 base = Scene(uv);
                float scan = 0.85 + 0.15 * sin(uv.y * _ScreenParams.y * 1.2 + _Time.y * 4.0);
                float3 c = half3(0.01, 0.02, 0.05) + Luma(base) * half3(0.05, 0.12, 0.25);
                c += grid * half3(0.55, 0.2, 1.0) * 0.45;
                c += edge * half3(0.25, 0.95, 1.0) * 1.4;
                return c * scan;
            }

            half3 Cel(float2 uv)
            {
                float3 c = Scene(uv);
                float l = Luma(c);
                float bands = 4.0;
                float q = (floor(saturate(l * 1.3) * bands) + 0.5) / bands;
                c = saturate(c / max(l, 1e-4) * q);
                float edge = DepthEdge(uv, max(1.0, _Size * 0.5) / _ScreenParams.xy);
                return lerp(c, half3(0.02, 0.02, 0.03), edge);
            }

            half3 Noir(float2 uv)
            {
                float l = saturate(Luma(Scene(uv)) * 1.5);
                l = smoothstep(0.02, 0.85, l);
                return l.xxx * half3(1.0, 0.98, 0.94);
            }

            half4 Frag(Varyings input) : SV_Target
            {
                float2 uv = input.texcoord;
                int s = (int)round(_Style);
                half3 c;
                if (s == 1) c = Pixel(uv);
                else if (s == 2) c = Voxel(uv);
                else if (s == 3) c = ObraDinn(uv);
                else if (s == 4) c = Pixar(uv);
                else if (s == 5) c = Cyberspace(uv);
                else if (s == 6) c = Cel(uv);
                else if (s == 7) c = Noir(uv);
                else c = Scene(uv);
                return half4(SRGBToLinear(saturate(c)), 1);
            }
            ENDHLSL
        }
    }
}
