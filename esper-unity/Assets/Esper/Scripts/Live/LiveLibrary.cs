using System.Linq;
using UnityEngine;

namespace Esper.Live
{
    /// Materials the spec can name (boxes, quads). Populated by the builder so they ship in the build.
    public class LiveLibrary : MonoBehaviour
    {
        public Material[] materials;
        public Material ByName(string n) => materials?.FirstOrDefault(m => m && m.name == n);
    }
}
