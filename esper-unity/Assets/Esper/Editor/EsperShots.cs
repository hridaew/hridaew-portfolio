using System.IO;
using System.Linq;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Esper.EditorTools
{
    /// Batch-mode review renders of each composed shot.
    public static class EsperShots
    {
        public static void BuildAndCapture()
        {
            EsperBuilder.Build();
            Capture();
        }

        public static void Capture()
        {
            EditorSceneManager.OpenScene(EsperBuilder.ScenePath, OpenSceneMode.Single);
            var cam = Camera.main;
            var brain = cam.GetComponent<CinemachineBrain>();
            if (brain) brain.enabled = false;
            foreach (var ps in Object.FindObjectsByType<ParticleSystem>(FindObjectsSortMode.None)) ps.Simulate(3f, true, true);
            foreach (var probe in Object.FindObjectsByType<ReflectionProbe>(FindObjectsSortMode.None)) probe.RenderProbe();

            string only = System.Environment.GetEnvironmentVariable("ESPER_SHOT");
            // Overview variants from the builder, then every view in the live spec.
            var shots = EsperBuilder.Shots.Where(s => s.name.StartsWith("overview")).ToList();
            var spec = Esper.Live.LiveJson.Scene(File.ReadAllText(EsperLive.ScenePath));
            foreach (var v in spec.views)
            {
                if (v.id == "overview") continue;
                shots.Add(new EsperBuilder.Shot { name = v.id, pos = Esper.Live.LiveFactory.V(v.p, Vector3.zero), target = Esper.Live.LiveFactory.V(v.target, Vector3.forward), fov = v.fov });
            }
            foreach (var s in shots.Where(s => string.IsNullOrEmpty(only) || only.Split(',').Contains(s.name)))
            {
                cam.transform.SetPositionAndRotation(s.pos, Quaternion.LookRotation(s.target - s.pos));
                cam.fieldOfView = s.fov;
                var tex = EsperRender.Render(cam, 1600, 900);
                EsperRender.Save(tex, Path.Combine(EsperRender.ReviewDir, $"shot_{s.name}.png"));
                Object.DestroyImmediate(tex);
                Debug.Log($"[esper] captured {s.name}");
            }
        }
    }
}
