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
            InstallContactShadows(data);
        }

        /// URP's screen-space ambient occlusion: the soft darkening where things meet the floor and walls meet,
        /// which is most of what makes the white diorama read as solid. Tuned live with the ao.* look keys.
        public static void InstallContactShadows(UniversalRendererData data)
        {
            var ao = data.rendererFeatures.OfType<ScreenSpaceAmbientOcclusion>().FirstOrDefault();
            if (ao == null)
            {
                ao = ScriptableObject.CreateInstance<ScreenSpaceAmbientOcclusion>();
                ao.name = "Contact Shadows";
                AssetDatabase.AddObjectToAsset(ao, data);
                data.rendererFeatures.Add(ao);
                var so = new SerializedObject(data);
                var map = so.FindProperty("m_RendererFeatureMap");
                map.arraySize = data.rendererFeatures.Count;
                AssetDatabase.TryGetGUIDAndLocalFileIdentifier(ao, out _, out long id);
                map.GetArrayElementAtIndex(map.arraySize - 1).longValue = id;
                so.ApplyModifiedPropertiesWithoutUndo();
            }
            var s = new SerializedObject(ao);
            void F(string p, float v) { var sp = s.FindProperty("m_Settings." + p); if (sp != null) sp.floatValue = v; else Debug.LogWarning("[esper] no ssao " + p); }
            void I(string p, int v) { var sp = s.FindProperty("m_Settings." + p); if (sp != null) { if (sp.propertyType == SerializedPropertyType.Boolean) sp.boolValue = v != 0; else sp.enumValueIndex = v; } else Debug.LogWarning("[esper] no ssao " + p); }
            F("Intensity", 1.1f);
            F("Radius", 0.45f);
            F("DirectLightingStrength", 0.2f);
            F("Falloff", 200f);
            I("Downsample", 1);
            I("AfterOpaque", 0);
            I("Source", 1);        // depth + normals
            I("NormalSamples", 1); // medium
            I("Samples", 1);       // medium, 8
            I("BlurQuality", 0);   // bilateral
            I("AOMethod", 0);      // blue noise
            s.ApplyModifiedPropertiesWithoutUndo();
            ao.SetActive(true);
            EditorUtility.SetDirty(ao);
            EditorUtility.SetDirty(data);
        }
    }
}
