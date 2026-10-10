using System.Runtime.InteropServices;
using UnityEngine;

namespace Esper
{
    /// Unity -> page events. The page listens for `window` "esper" CustomEvents.
    public static class WebBridge
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")] static extern void EsperEmit(string evt, string payload);
#else
        static void EsperEmit(string evt, string payload) => Debug.Log($"[bridge] {evt} {payload}");
#endif

        public static void Emit(string evt, string payload = "") => EsperEmit(evt, payload ?? "");
    }
}
