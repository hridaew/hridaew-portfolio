using UnityEngine;

namespace Esper.Live
{
    /// One child at a time, moving on every `seconds` or when clicked (EsperDirector calls Next). Each change
    /// lands with a small settle so the swap reads as a beat rather than a cut. Adds a click target around itself.
    public class LiveCycle : MonoBehaviour
    {
        public float seconds = 7f;
        int current;
        float elapsed, pop = 1f;
        BoxCollider hit;

        public void Next()
        {
            current++;
            elapsed = 0f;
            pop = 0f;
            Apply();
        }

        void Start() => Apply();

        void Update()
        {
            if (transform.childCount == 0) return;
            if (seconds > 0f && (elapsed += Time.unscaledDeltaTime) >= seconds) Next();
            if (pop < 1f)
            {
                pop = Mathf.Min(1f, pop + Time.unscaledDeltaTime / 0.32f);
                // Ease out with a little overshoot: dips to 0.9, lands just past 1, settles.
                float s = 1f + 0.1f * (Mathf.Sin(pop * Mathf.PI * 1.25f) * (1f - pop)) - 0.1f * (1f - pop) * (1f - pop);
                var child = transform.GetChild(current % transform.childCount);
                child.localScale = Vector3.one * s;
            }
            if (!hit) Fit();
        }

        void Apply()
        {
            int n = transform.childCount;
            for (int i = 0; i < n; i++)
            {
                var c = transform.GetChild(i);
                bool on = i == current % n;
                if (c.gameObject.activeSelf != on) c.gameObject.SetActive(on);
                if (!on) c.localScale = Vector3.one;
            }
        }

        /// A click target around what's showing, padded so the next activity is covered too.
        void Fit()
        {
            Bounds? b = null;
            foreach (var r in GetComponentsInChildren<Renderer>(false))
            {
                if (b == null) b = r.bounds;
                else { var bb = b.Value; bb.Encapsulate(r.bounds); b = bb; }
            }
            if (b == null) return;
            hit = gameObject.AddComponent<BoxCollider>();
            hit.center = transform.InverseTransformPoint(b.Value.center);
            hit.size = b.Value.size + new Vector3(0.6f, 0.2f, 0.6f);
        }
    }
}
