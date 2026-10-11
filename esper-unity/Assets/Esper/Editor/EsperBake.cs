using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    /// Baked indirect lighting: bounce from the lamp, the CRT and the city into the room.
    public static class EsperBake
    {
        public static void BuildBakeOnly()
        {
            EsperBuilder.Build();
            Bake();
        }

        public static void BuildBakeCapture()
        {
            EsperBuilder.Build();
            Bake();
            EsperShots.Capture();
        }

        public static void Bake()
        {
            var scene = EditorSceneManager.OpenScene(EsperBuilder.ScenePath, OpenSceneMode.Single);

            var settings = new LightingSettings
            {
                name = "EsperLighting",
                bakedGI = true,
                realtimeGI = false,
                mixedBakeMode = MixedLightingMode.IndirectOnly,
                lightmapper = LightingSettings.Lightmapper.ProgressiveGPU,
                lightmapResolution = 24f,
                lightmapPadding = 4,
                lightmapMaxSize = 2048,
                directSampleCount = 32,
                indirectSampleCount = 512,
                environmentSampleCount = 256,
                maxBounces = 4,
                indirectScale = 1.6f,
                filteringMode = LightingSettings.FilterMode.Auto,
                ao = true,
                aoMaxDistance = 0.6f,
                aoExponentIndirect = 1.2f,
                compressLightmaps = false,
                directionalityMode = LightmapsMode.CombinedDirectional,
            };
            const string path = "Assets/Esper/Generated/EsperLighting.lighting";
            AssetDatabase.DeleteAsset(path);
            AssetDatabase.CreateAsset(settings, path);
            Lightmapping.lightingSettings = settings;

            // Light probes through the room so the (dynamic) props pick up the bounce.
            var group = new GameObject("LightProbes").AddComponent<LightProbeGroup>();
            var pts = new System.Collections.Generic.List<Vector3>();
            float hw = EsperBuilder.RoomW / 2 - 0.2f, hd = EsperBuilder.RoomD / 2 - 0.2f;
            for (float x = -hw; x <= hw + 0.01f; x += 0.8f)
                for (float y = 0.15f; y <= EsperBuilder.RoomH - 0.2f; y += 0.65f)
                    for (float z = -hd; z <= hd + 0.01f; z += 0.8f)
                        pts.Add(new Vector3(x, y, z));
            group.probePositions = pts.ToArray();

            var start = System.DateTime.Now;
            bool ok = Lightmapping.Bake();
            Debug.Log($"[esper] bake {(ok ? "ok" : "FAILED")} in {(System.DateTime.Now - start).TotalSeconds:0}s, lightmaps={LightmapSettings.lightmaps.Length}");
            EditorSceneManager.SaveScene(scene);
        }
    }
}
