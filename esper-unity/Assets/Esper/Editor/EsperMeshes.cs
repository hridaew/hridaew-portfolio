using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Esper.EditorTools
{
    /// Procedural meshes saved as assets so scenes stay reproducible.
    public static class EsperMeshes
    {
        public const string Dir = "Assets/Esper/Generated/Meshes";

        public static Mesh Box(Vector3 size) => Esper.Live.LiveMeshes.Box(size);

        public static Mesh CurledQuad(float w, float h, float curl, int seg = 8) => Esper.Live.LiveMeshes.CurledQuad(w, h, curl, seg);

        public static Mesh Bulge(float w, float h, float bulge, int seg = 16) => Esper.Live.LiveMeshes.Bulge(w, h, bulge, seg);

        public static Mesh Combine(string name, List<CombineInstance> parts)
        {
            var m = new Mesh { name = name, indexFormat = UnityEngine.Rendering.IndexFormat.UInt32 };
            m.CombineMeshes(parts.ToArray(), true, true);
            m.RecalculateBounds();
            return m;
        }

        public static Mesh Save(Mesh mesh, string name, bool lightmapUVs)
        {
            Directory.CreateDirectory(Dir);
            if (lightmapUVs) Unwrapping.GenerateSecondaryUVSet(mesh);
            string path = $"{Dir}/{name}.asset";
            var existing = AssetDatabase.LoadAssetAtPath<Mesh>(path);
            if (existing != null)
            {
                EditorUtility.CopySerialized(mesh, existing);
                return existing;
            }
            AssetDatabase.CreateAsset(mesh, path);
            return mesh;
        }
    }
}
