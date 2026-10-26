using UnityEngine;

namespace Esper.Live
{
    /// Marks an object built from a spec, so the live applier can diff against it.
    public class LiveItem : MonoBehaviour
    {
        public string id;
        [TextArea] public string spec;
        /// Roughness multiplier from the spec (0 = as authored), reported to Studio's Selection panel.
        public float rough;
    }
}
