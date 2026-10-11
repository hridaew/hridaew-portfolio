using System.IO;
using System.Linq;
using Esper.Studio;
using UnityEngine;

namespace Esper.EditorTools
{
    public static partial class EsperBuilder
    {
        /// Studio edits (Layout/overrides.json) are baked into the scene so hand placement survives rebuilds.
        public static string OverridesPath => Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Layout", "overrides.json"));

        static void ApplyStudioOverrides()
        {
            if (!File.Exists(OverridesPath)) return;
            var o = JsonUtility.FromJson<Overrides>(File.ReadAllText(OverridesPath));
            if (o == null) return;
            StudioApply.Objects(root, o);
            StudioApply.Views(root, o, id => vcams.TryGetValue(id == "memory-care" ? "memory" : id == "obscura" ? "esper" : id, out var v) ? v : null);
            StudioApply.Lights(o);
            var look = root.GetComponent<LookDev>();
            foreach (var l in o.look) look.Look($"{l.key}={l.value.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
            Debug.Log($"[esper] studio overrides: {o.objects.Count} objects, {o.views.Count} views, {o.lights.Count} lights, {o.look.Count} look");
        }
    }
}
