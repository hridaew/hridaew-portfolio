using System.IO;
using System.Linq;
using Esper.Rendering;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering.Universal;

namespace Esper.EditorTools
{
    /// Adds ESPER's optional render passes to the URP renderer. Called by the builder; also runnable on its own
    /// (Tools/unity.sh Esper.EditorTools.EsperRenderFeatures.Install) so a new pass doesn't need a full rebake.
    public static class EsperRenderFeatures
    {
        const string RendererPath = "Assets/Settings/PC_Renderer.asset";
        const string MatDir = "Assets/Esper/Generated/Materials";

        public static void Install()
        {
            var data = AssetDatabase.LoadAssetAtPath<UniversalRendererData>(RendererPath);
            InstallStylize(data);
            AssetDatabase.SaveAssets();
            Debug.Log("[esper] render features installed");
        }

        public static void InstallStylize(UniversalRendererData data)
        {
            Directory.CreateDirectory(MatDir);
            string path = $"{MatDir}/Stylize.mat";
            var mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (mat == null)
            {
                mat = new Material(Shader.Find("Hidden/Esper/Stylize"));
                AssetDatabase.CreateAsset(mat, path);
            }

            var feature = data.rendererFeatures.OfType<StylizeFeature>().FirstOrDefault();
            if (feature == null)
            {
                feature = ScriptableObject.CreateInstance<StylizeFeature>();
                feature.name = "Esper Stylize";
                AssetDatabase.AddObjectToAsset(feature, data);
                data.rendererFeatures.Add(feature);
                var so = new SerializedObject(data);
                var map = so.FindProperty("m_RendererFeatureMap");
                map.arraySize = data.rendererFeatures.Count;
                AssetDatabase.TryGetGUIDAndLocalFileIdentifier(feature, out _, out long id);
                map.GetArrayElementAtIndex(map.arraySize - 1).longValue = id;
                so.ApplyModifiedPropertiesWithoutUndo();
            }
            feature.material = mat;
            feature.SetActive(true);
            EditorUtility.SetDirty(feature);
            EditorUtility.SetDirty(data);
        }
    }
}
