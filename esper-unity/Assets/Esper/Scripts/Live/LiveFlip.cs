using System.Collections.Generic;
using UnityEngine;

namespace Esper.Live
{
    /// Plays a group's children as key poses, `seconds` apart. When every pose is built from the same parts
    /// (a blocked-out figure), the first pose's parts glide between the poses with an ease; otherwise the
    /// children simply take turns.
    public class LiveFlip : MonoBehaviour
    {
        public float seconds = 0.5f;
        float elapsed;

        struct Key { public Vector3 p; public Quaternion r; public float len; }
        Transform first;
        int builtFor = -1;
        readonly List<Transform> parts = new();
        readonly List<float> baseLen = new();
        readonly List<Key[]> keys = new();   // per pose, per part
        bool tween;

        void OnEnable() => elapsed = 0f;

        void Update()
        {
            int n = transform.childCount;
            if (seconds <= 0f || n < 2) return;
            elapsed += Time.unscaledDeltaTime;
            if (first != transform.GetChild(0) || builtFor != n || (tween && parts.Exists(p => p == null))) Cache();
            float phase = elapsed / seconds;
            int k = Mathf.FloorToInt(phase) % n;

            if (!tween)
            {
                for (int i = 0; i < n; i++) Show(transform.GetChild(i).gameObject, i == k);
                return;
            }
            Show(first.gameObject, true);
            for (int i = 1; i < n; i++) Show(transform.GetChild(i).gameObject, false);
            float f = phase - Mathf.Floor(phase);
            f = f * f * (3f - 2f * f);
            var a = keys[k]; var b = keys[(k + 1) % n];
            for (int j = 0; j < parts.Count; j++)
            {
                var t = parts[j];
                t.localPosition = Vector3.LerpUnclamped(a[j].p, b[j].p, f);
                t.localRotation = Quaternion.Slerp(a[j].r, b[j].r, f);
                float len = Mathf.Lerp(a[j].len, b[j].len, f);
                t.localScale = new Vector3(1f, baseLen[j] > 1e-4f ? len / baseLen[j] : 1f, 1f);
            }
        }

        static void Show(GameObject go, bool on) { if (go.activeSelf != on) go.SetActive(on); }

        void Cache()
        {
            int n = transform.childCount;
            first = transform.GetChild(0);
            builtFor = n;
            parts.Clear(); baseLen.Clear(); keys.Clear();
            tween = first.childCount > 0;
            for (int i = 0; i < n && tween; i++)
            {
                var pose = transform.GetChild(i);
                if (pose.childCount != first.childCount) { tween = false; break; }
                var row = new Key[pose.childCount];
                for (int j = 0; j < pose.childCount; j++)
                {
                    var c = pose.GetChild(j);
                    if (c.name != first.GetChild(j).name) { tween = false; break; }
                    var mf = c.GetComponent<MeshFilter>();
                    row[j] = new Key { p = c.localPosition, r = c.localRotation, len = mf && mf.sharedMesh ? mf.sharedMesh.bounds.size.y : 1f };
                }
                keys.Add(row);
            }
            if (!tween) return;
            for (int j = 0; j < first.childCount; j++)
            {
                parts.Add(first.GetChild(j));
                baseLen.Add(keys[0][j].len);
            }
        }
    }
}
