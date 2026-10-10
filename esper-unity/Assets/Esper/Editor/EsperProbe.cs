using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Esper.EditorTools
{
    /// Measures model geometry in batch mode (e.g. where a CRT's glass sits inside its bezel).
    public static class EsperProbe
    {
        public static void DepthMap()
        {
            string model = System.Environment.GetEnvironmentVariable("ESPER_MODEL") ?? "television_02";
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var go = EsperBuilder.Place(model, null, Vector3.zero, 0f);
            foreach (var mf in go.GetComponentsInChildren<MeshFilter>()) mf.gameObject.AddComponent<MeshCollider>().sharedMesh = mf.sharedMesh;
            var b = EsperBuilder.BoundsOf(go);
            var sb = new StringBuilder();
            sb.AppendLine($"bounds min={b.min:F3} max={b.max:F3}");
            const int nx = 48, ny = 32;
            float[,] d = new float[nx, ny];
            // Model front faces +Z: cast from in front toward -Z.
            for (int j = ny - 1; j >= 0; j--)
            {
                for (int i = 0; i < nx; i++)
                {
                    float x = Mathf.Lerp(b.min.x, b.max.x, (i + 0.5f) / nx);
                    float y = Mathf.Lerp(b.min.y, b.max.y, (j + 0.5f) / ny);
                    var ray = new Ray(new Vector3(x, y, b.max.z + 1f), Vector3.back);
                    d[i, j] = Physics.Raycast(ray, out var hit, 5f) ? hit.point.z : float.NaN;
                    char c = float.IsNaN(d[i, j]) ? ' ' : " .:-=+*#%@"[Mathf.Clamp((int)((d[i, j] - b.min.z) / b.size.z * 9.99f), 0, 9)];
                    sb.Append(c);
                }
                sb.AppendLine($"  y={Mathf.Lerp(b.min.y, b.max.y, (j + 0.5f) / ny):F3}");
            }
            sb.Append("x: ");
            for (int i = 0; i < nx; i += 8) sb.Append($"{Mathf.Lerp(b.min.x, b.max.x, (i + 0.5f) / nx):F3}    ");
            sb.AppendLine();
            // Middle row depth profile for precise numbers.
            int mid = ny / 2;
            sb.AppendLine("mid-row z: " + string.Join(" ", Enumerable.Range(0, nx).Select(i => float.IsNaN(d[i, mid]) ? "nan" : d[i, mid].ToString("F3"))));
            int midc = nx / 2;
            sb.AppendLine("mid-col z: " + string.Join(" ", Enumerable.Range(0, ny).Select(j => float.IsNaN(d[midc, j]) ? "nan" : d[midc, j].ToString("F3"))));
            File.WriteAllText(Path.Combine(EsperRender.ReviewDir, $"depth_{model}.txt"), sb.ToString());
            Debug.Log("[esper] depth map written");
        }
    }
}
