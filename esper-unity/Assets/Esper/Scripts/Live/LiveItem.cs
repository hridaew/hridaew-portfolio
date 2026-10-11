using UnityEngine;

namespace Esper.Live
{
    /// Marks an object built from a spec, so the live applier can diff against it.
    public class LiveItem : MonoBehaviour
    {
        public string id;
        [TextArea] public string spec;
    }
}
