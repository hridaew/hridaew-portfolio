using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    public static partial class EsperBuilder
    {
        static Material wallMat, floorMat, ceilMat, trimMat, frameMat, slatMat, cordMat;

        static void BuildShell()
        {
            // Nicotine-stained plaster, tired oak boards, a ceiling that hasn't been painted in decades.
            wallMat = Surface("Wall", "painted_plaster_wall", 0.55f, new Color(0.62f, 0.55f, 0.46f), 0.55f);
            floorMat = Surface("Floor", "old_wood_floor", 0.45f, new Color(0.58f, 0.5f, 0.44f), 0.9f);
            ceilMat = Surface("Ceiling", "grey_plaster", 0.5f, new Color(0.5f, 0.47f, 0.43f), 0.4f);
            trimMat = Surface("Trim", "wood_floor_worn", 1f, new Color(0.3f, 0.24f, 0.2f), 0.7f);

            float hw = RoomW / 2, hd = RoomD / 2;
            Block("Floor", shell, new Vector3(0, -0.05f, 0), new Vector3(RoomW + 2 * WallT, 0.1f, RoomD + 2 * WallT), floorMat);
            Block("Ceiling", shell, new Vector3(0, RoomH + 0.05f, 0), new Vector3(RoomW + 2 * WallT, 0.1f, RoomD + 2 * WallT), ceilMat);
            Block("Wall_L", shell, new Vector3(-hw - WallT / 2, RoomH / 2, 0), new Vector3(WallT, RoomH, RoomD + 2 * WallT), wallMat);
            Block("Wall_R", shell, new Vector3(hw + WallT / 2, RoomH / 2, 0), new Vector3(WallT, RoomH, RoomD + 2 * WallT), wallMat);
            Block("Wall_F", shell, new Vector3(0, RoomH / 2, -hd - WallT / 2), new Vector3(RoomW, RoomH, WallT), wallMat);

            // Back wall with the window opening.
            float z = hd + WallT / 2;
            float lw = WinX.x + hw, rw = hw - WinX.y, ww = WinX.y - WinX.x;
            Block("Wall_B_L", shell, new Vector3(-hw + lw / 2, RoomH / 2, z), new Vector3(lw, RoomH, WallT), wallMat);
            Block("Wall_B_R", shell, new Vector3(hw - rw / 2, RoomH / 2, z), new Vector3(rw, RoomH, WallT), wallMat);
            Block("Wall_B_Sill", shell, new Vector3((WinX.x + WinX.y) / 2, WinY.x / 2, z), new Vector3(ww, WinY.x, WallT), wallMat);
            Block("Wall_B_Head", shell, new Vector3((WinX.x + WinX.y) / 2, (WinY.y + RoomH) / 2, z), new Vector3(ww, RoomH - WinY.y, WallT), wallMat);

            // Skirting and picture rail: the small horizontals that make a room read as lived-in architecture.
            float sk = 0.11f, st = 0.018f;
            Block("Skirt_L", shell, new Vector3(-hw + st / 2, sk / 2, 0), new Vector3(st, sk, RoomD), trimMat);
            Block("Skirt_R", shell, new Vector3(hw - st / 2, sk / 2, 0), new Vector3(st, sk, RoomD), trimMat);
            Block("Skirt_F", shell, new Vector3(0, sk / 2, -hd + st / 2), new Vector3(RoomW, sk, st), trimMat);
            Block("Skirt_BL", shell, new Vector3(-hw + lw / 2, sk / 2, hd - st / 2), new Vector3(lw, sk, st), trimMat);
            Block("Skirt_BR", shell, new Vector3(hw - rw / 2, sk / 2, hd - st / 2), new Vector3(rw, sk, st), trimMat);
            float pr = 2.3f;
            Block("Rail_L", shell, new Vector3(-hw + 0.012f, pr, 0), new Vector3(0.024f, 0.04f, RoomD), trimMat);
            Block("Rail_R", shell, new Vector3(hw - 0.012f, pr, 0), new Vector3(0.024f, 0.04f, RoomD), trimMat);
            Block("Rail_F", shell, new Vector3(0, pr, -hd + 0.012f), new Vector3(RoomW, 0.04f, 0.024f), trimMat);
        }

        static void BuildWindow()
        {
            frameMat = Surface("WindowFrame", "painted_metal_shutter", 1.5f, new Color(0.2f, 0.21f, 0.2f), 0.7f);
            var win = Group("Window", shell);
            float z = BackZ + 0.16f;
            float cx = (WinX.x + WinX.y) / 2, cy = (WinY.x + WinY.y) / 2;
            float ww = WinX.y - WinX.x, wh = WinY.y - WinY.x;
            float f = 0.07f, d = 0.09f;

            // Industrial steel sash: four tall panes, a transom, heavy outer frame.
            Block("Frame_T", win, new Vector3(cx, WinY.y - f / 2, z), new Vector3(ww, f, d), frameMat);
            Block("Frame_B", win, new Vector3(cx, WinY.x + f / 2, z), new Vector3(ww, f, d), frameMat);
            Block("Frame_L", win, new Vector3(WinX.x + f / 2, cy, z), new Vector3(f, wh, d), frameMat);
            Block("Frame_R", win, new Vector3(WinX.y - f / 2, cy, z), new Vector3(f, wh, d), frameMat);
            for (int i = 1; i < 4; i++)
            {
                float x = WinX.x + ww * i / 4f;
                Block($"Mullion_{i}", win, new Vector3(x, cy, z), new Vector3(0.04f, wh, 0.07f), frameMat);
            }
            Block("Transom", win, new Vector3(cx, 1.98f, z), new Vector3(ww, 0.04f, 0.07f), frameMat);
            // Glazing bars in the upper lights.
            for (int i = 0; i < 8; i++)
            {
                float x = WinX.x + ww * (i + 0.5f) / 8f;
                if (i % 2 == 1) continue;
                Block($"Bar_{i}", win, new Vector3(x + ww / 16f, (1.98f + WinY.y) / 2, z + 0.01f), new Vector3(0.018f, WinY.y - 1.98f, 0.03f), frameMat);
            }

            var glassMat = Custom("RainGlass", "Esper/RainGlass");
            var glass = Block("Glass", win, new Vector3(cx, cy, z + 0.02f), new Vector3(ww, wh, 0.004f), glassMat, isStatic: false);
            var gr = glass.GetComponent<MeshRenderer>();
            gr.shadowCastingMode = ShadowCastingMode.Off;
            // Use a quad-friendly UV: the box UVs are in metres already.

            // Deep sill with a lip; stained where pots have stood.
            var sillMat = Surface("Sill", "wood_floor_worn", 1.2f, new Color(0.36f, 0.3f, 0.25f), 0.8f);
            Block("Sill", win, new Vector3(cx, WinY.x - 0.02f, BackZ - 0.02f), new Vector3(ww + 0.16f, 0.04f, 0.36f), sillMat);
            Block("SillApron", win, new Vector3(cx, WinY.x - 0.09f, BackZ - 0.185f), new Vector3(ww + 0.08f, 0.1f, 0.02f), sillMat);
            // Reveals.
            Block("Reveal_L", win, new Vector3(WinX.x - 0.01f, cy, BackZ + 0.08f), new Vector3(0.02f, wh, 0.16f), wallMat);
            Block("Reveal_R", win, new Vector3(WinX.y + 0.01f, cy, BackZ + 0.08f), new Vector3(0.02f, wh, 0.16f), wallMat);
            Block("Reveal_T", win, new Vector3(cx, WinY.y + 0.01f, BackZ + 0.08f), new Vector3(ww, 0.02f, 0.16f), wallMat);
        }

        static void BuildBlinds()
        {
            slatMat = Plain("Slat", new Color(0.66f, 0.63f, 0.57f), 0.45f, 0.1f);
            cordMat = Plain("Cord", new Color(0.55f, 0.52f, 0.46f), 0.2f);
            var blinds = Group("Blinds", shell);
            float z = BackZ - 0.04f;
            float mid = 0.4f;
            // Left unit fully down, with a few slats bent open at eye height — someone has been watching the street.
            BlindUnit(blinds, "Blind_A", WinX.x - 0.04f, mid - 0.01f, z, WinY.x + 0.06f, 0f, peek: true, seed: 3);
            // Right unit hauled up crooked, the stack bunched at the head.
            BlindUnit(blinds, "Blind_B", mid + 0.01f, WinX.y + 0.04f, z, 1.72f, 5.5f, peek: false, seed: 11);
        }

        static void BlindUnit(Transform parent, string name, float x0, float x1, float z, float bottomY, float crookDeg, bool peek, int seed)
        {
            var rng = new System.Random(seed);
            float R(float a, float b) => a + (float)rng.NextDouble() * (b - a);
            var unit = Group(name, parent);
            float w = x1 - x0, cx = (x0 + x1) / 2;
            float top = WinY.y + 0.03f;
            const float pitch = 0.043f, slatW = 0.05f, slatT = 0.0025f;
            var slatMesh = EsperMeshes.Box(new Vector3(1f, slatT, slatW));
            var parts = new List<CombineInstance>();
            void Slat(Vector3 pos, float len, Quaternion rot)
            {
                parts.Add(new CombineInstance { mesh = slatMesh, transform = Matrix4x4.TRS(pos, rot, new Vector3(len, 1, 1)) });
            }

            Block(name + "_Head", unit, new Vector3(cx, top + 0.025f, z), new Vector3(w + 0.02f, 0.05f, 0.06f), slatMat);

            float span = top - bottomY;
            int count = Mathf.FloorToInt(span / pitch);
            float crook = crookDeg * Mathf.Deg2Rad;
            for (int i = 0; i < count; i++)
            {
                float y = top - 0.03f - i * pitch;
                float tilt = -24f + R(-3f, 3f);
                // Crooked unit: lower slats follow the angled bottom rail.
                float k = crookDeg == 0 ? 0 : (i / (float)count);
                var rot = Quaternion.Euler(tilt, 0, crookDeg * k);
                float yy = y - Mathf.Sin(crook * k) * 0f;
                bool peekZone = peek && y > 1.42f && y < 1.62f;
                if (peekZone)
                {
                    // Two fingers' width pulled down: split the slat and bend the middle.
                    float g0 = -0.95f, g1 = -0.68f;
                    float bend = Mathf.Lerp(30f, 42f, Mathf.InverseLerp(1.62f, 1.42f, y));
                    Slat(new Vector3((x0 + g0) / 2, yy, z), g0 - x0, rot);
                    Slat(new Vector3((g1 + x1) / 2, yy, z), x1 - g1, rot);
                    Slat(new Vector3((g0 + g1) / 2, yy - 0.012f, z - 0.01f), g1 - g0, Quaternion.Euler(tilt + bend, 0, 0));
                }
                else
                {
                    Slat(new Vector3(cx, yy, z), w, rot);
                }
            }
            float bottom = top - 0.03f - count * pitch;
            var railRot = Quaternion.Euler(0, 0, crookDeg);
            Block(name + "_Rail", unit, new Vector3(cx, bottom, z), new Vector3(w, 0.018f, 0.055f), slatMat, rot: railRot);

            if (crookDeg != 0)
            {
                // Raised stack: slats packed flat under the head rail.
                for (int i = 0; i < 26; i++)
                    Slat(new Vector3(cx, top - 0.035f - i * 0.0042f, z), w, Quaternion.Euler(R(-2, 2), 0, R(-0.3f, 0.3f)));
            }

            var slats = new GameObject(name + "_Slats");
            slats.transform.SetParent(unit, false);
            slats.AddComponent<MeshFilter>().sharedMesh = EsperMeshes.Save(EsperMeshes.Combine(name + "_slats", parts), name + "_slats", true);
            slats.AddComponent<MeshRenderer>().sharedMaterial = slatMat;
            MarkStatic(slats);

            // Ladder cords front and back, and a pull cord with a weight.
            foreach (float fx in new[] { 0.12f, 0.5f, 0.88f })
            {
                float x = Mathf.Lerp(x0, x1, fx);
                foreach (float dz in new[] { -0.026f, 0.026f })
                {
                    float len = top - bottom;
                    Block($"{name}_Ladder", unit, new Vector3(x, top - len / 2, z + dz), new Vector3(0.002f, len, 0.002f), cordMat);
                }
            }
            float cordX = x1 - 0.05f;
            float cordLen = top - 1.05f;
            Block(name + "_Pull", unit, new Vector3(cordX, top - cordLen / 2, z - 0.035f), new Vector3(0.003f, cordLen, 0.003f), cordMat, isStatic: false);
            Block(name + "_Weight", unit, new Vector3(cordX, top - cordLen - 0.02f, z - 0.035f), new Vector3(0.014f, 0.04f, 0.014f), slatMat, isStatic: false);
        }
    }
}
