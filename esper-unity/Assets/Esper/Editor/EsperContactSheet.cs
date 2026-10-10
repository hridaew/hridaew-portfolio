using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Esper.EditorTools
{
    /// Renders every imported Poly Haven model as a labelled tile so props can be cast by eye.
    public static class EsperContactSheet
    {
        const int Tile = 384;
        const int Cols = 6;

        public static void Run()
        {
            AssetDatabase.Refresh();
            var paths = AssetDatabase.FindAssets("t:GameObject", new[] { "Assets/ThirdParty/PolyHaven/Models" })
                .Select(AssetDatabase.GUIDToAssetPath).Where(p => p.EndsWith(".gltf")).OrderBy(p => p).ToArray();
            Debug.Log($"[contact] {paths.Length} models");

            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var camGo = new GameObject("cam");
            var cam = camGo.AddComponent<Camera>();
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.18f, 0.18f, 0.2f);
            cam.fieldOfView = 30;
            var key = new GameObject("key").AddComponent<Light>();
            key.type = LightType.Directional;
            key.intensity = 2.2f;
            key.transform.rotation = Quaternion.Euler(40, -35, 0);
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.45f, 0.45f, 0.5f);

            int rows = Mathf.CeilToInt(paths.Length / (float)Cols);
            var sheet = new Texture2D(Tile * Cols, Tile * rows, TextureFormat.RGB24, false);
            for (int i = 0; i < paths.Length; i++)
            {
                var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(paths[i]);
                var go = Object.Instantiate(prefab);
                var rends = go.GetComponentsInChildren<Renderer>();
                if (rends.Length == 0) { Object.DestroyImmediate(go); continue; }
                var b = rends[0].bounds;
                foreach (var r in rends) b.Encapsulate(r.bounds);
                float radius = b.extents.magnitude;
                var dir = new Vector3(0.75f, 0.45f, -1f).normalized;
                cam.transform.position = b.center + dir * radius / Mathf.Sin(cam.fieldOfView * 0.5f * Mathf.Deg2Rad) * 1.05f;
                cam.transform.LookAt(b.center);
                cam.nearClipPlane = radius * 0.05f;
                cam.farClipPlane = radius * 20f;
                var tex = EsperRender.Render(cam, Tile, Tile);
                int cx = i % Cols, cy = rows - 1 - i / Cols;
                sheet.SetPixels(cx * Tile, cy * Tile, Tile, Tile, tex.GetPixels());
                Object.DestroyImmediate(tex);
                Object.DestroyImmediate(go);
                Debug.Log($"[contact] {i} {Path.GetFileNameWithoutExtension(paths[i])} size={b.size}");
            }
            sheet.Apply();
            EsperRender.Save(sheet, Path.Combine(EsperRender.ReviewDir, "contact-sheet.png"));
            File.WriteAllLines(Path.Combine(EsperRender.ReviewDir, "contact-sheet.txt"), paths.Select((p, i) => $"{i}: {Path.GetFileNameWithoutExtension(p)}"));
        }
    }
}
