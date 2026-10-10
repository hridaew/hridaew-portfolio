using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    public static partial class EsperBuilder
    {
        const string OwnModels = "Assets/Esper/Models";
        const string ContentDir = "Assets/Esper/Content";

        /// Place one of the Blender-authored models (Assets/Esper/Models/<name>.glb).
        static GameObject PlaceModel(string name, Transform parent, Vector3 pos, Quaternion rot, float scale = 1f)
        {
            var prefab = AssetDatabase.LoadAssetAtPath<GameObject>($"{OwnModels}/{name}.glb");
            if (prefab == null) { Debug.LogError($"[esper] missing model {name}"); return new GameObject(name); }
            var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            go.name = name;
            go.transform.SetParent(parent, false);
            go.transform.localPosition = pos;
            go.transform.localRotation = rot;
            go.transform.localScale = Vector3.one * scale;
            foreach (var r in go.GetComponentsInChildren<MeshRenderer>())
            {
                r.shadowCastingMode = ShadowCastingMode.On;
                r.reflectionProbeUsage = ReflectionProbeUsage.BlendProbes;
            }
            return go;
        }

        static GameObject PlaceModel(string name, Transform parent, Vector3 pos, float yaw, float scale = 1f)
            => PlaceModel(name, parent, pos, Quaternion.Euler(0, yaw, 0), scale);

        static Transform FindChild(GameObject go, string name)
            => go.GetComponentsInChildren<Transform>(true).FirstOrDefault(t => t.name == name || t.name.StartsWith(name + "."));

        /// A glowing display on a device's "Screen" surface. Returns the CrtScreen driver for enhance.
        static CrtScreen Display(GameObject device, string content, bool crt = false, float brightness = 1.6f, string surface = "Screen")
        {
            var screenT = FindChild(device, surface);
            if (screenT == null) { Debug.LogError($"[esper] {device.name} has no {surface}"); return null; }
            var tex = AssetDatabase.LoadAssetAtPath<Texture2D>($"{ContentDir}/{content}");
            if (tex == null) Debug.LogError($"[esper] missing content {content}");
            var mat = Custom($"Display_{device.name}_{Path.GetFileNameWithoutExtension(content)}", "Esper/CrtScreen", m =>
            {
                m.SetTexture("_MainTex", tex);
                m.SetFloat("_Brightness", brightness);
                m.SetFloat("_Mono", 0f);
                m.SetColor("_Tint", Color.white);
                if (!crt)
                {
                    // LCD: flat, fine pixel grid, almost no noise.
                    m.SetFloat("_Curvature", 0f);
                    m.SetFloat("_Scanlines", 1600f);
                    m.SetFloat("_Mask", 0.06f);
                    m.SetFloat("_Noise", 0.008f);
                    m.SetFloat("_Glass", 0.12f);
                }
            });
            var r = screenT.GetComponent<MeshRenderer>();
            r.sharedMaterial = mat;
            r.shadowCastingMode = ShadowCastingMode.Off;
            return screenT.gameObject.GetComponent<CrtScreen>() ?? screenT.gameObject.AddComponent<CrtScreen>();
        }

        /// A photograph in a Blender frame's "Photo" slot.
        static void FramePhoto(GameObject frame, string content)
        {
            var t = FindChild(frame, "Photo");
            var tex = AssetDatabase.LoadAssetAtPath<Texture2D>($"{ContentDir}/{content}");
            var m = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            m.SetTexture("_BaseMap", tex);
            m.SetColor("_BaseColor", new Color(0.9f, 0.88f, 0.84f));
            m.SetFloat("_Smoothness", 0.7f);
            t.GetComponent<MeshRenderer>().sharedMaterial = SaveMat(m, $"Photo_{Path.GetFileNameWithoutExtension(content)}");
        }

        /// Highest surface of `go` below `from` (world), found by raycasting against its meshes.
        static float SurfaceY(GameObject go, Vector3 from, float maxDown = 3f)
        {
            var temp = new List<MeshCollider>();
            foreach (var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                var c = mf.gameObject.AddComponent<MeshCollider>();
                c.sharedMesh = mf.sharedMesh;
                temp.Add(c);
            }
            Physics.SyncTransforms();
            float y = Physics.Raycast(from, Vector3.down, out var hit, maxDown) ? hit.point.y : from.y - maxDown;
            foreach (var c in temp) Object.DestroyImmediate(c);
            return y;
        }

        /// All shelf levels of a piece of furniture at a world XZ, top to bottom.
        static List<float> ShelfLevels(GameObject go, float x, float z)
        {
            var levels = new List<float>();
            var b = BoundsOf(go);
            float y = b.max.y + 0.05f;
            for (int i = 0; i < 8 && y > b.min.y + 0.02f; i++)
            {
                float s = SurfaceY(go, new Vector3(x, y, z), y - b.min.y);
                if (s <= b.min.y + 0.001f) break;
                levels.Add(s);
                y = s - 0.02f;
            }
            return levels;
        }

        static Light Practical(string name, Transform parent, Vector3 pos, Color c, float intensity, float range, LightType type = LightType.Point, Vector3? aim = null, float angle = 60f)
        {
            var l = new GameObject(name).AddComponent<Light>();
            l.transform.SetParent(parent, false);
            l.transform.position = pos;
            l.type = type;
            l.color = c;
            l.intensity = intensity;
            l.range = range;
            l.shadows = LightShadows.Soft;
            l.lightmapBakeType = LightmapBakeType.Mixed;
            if (type == LightType.Spot)
            {
                l.spotAngle = angle;
                l.innerSpotAngle = angle * 0.45f;
                if (aim.HasValue) l.transform.rotation = Quaternion.LookRotation(aim.Value - pos);
            }
            return l;
        }
    }
}
