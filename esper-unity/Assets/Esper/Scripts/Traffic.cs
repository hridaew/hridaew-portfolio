using UnityEngine;

namespace Esper
{
    /// Sky traffic: lanes of vehicles crossing the city, headlights one way, tail lights the other.
    public class Traffic : MonoBehaviour
    {
        [System.Serializable]
        public struct Lane
        {
            public Vector3 start, end;
            public int count;
            public float speed;
            public float jitter;
        }

        public Lane[] lanes;
        public Material headMaterial, tailMaterial;
        Transform[][] cars;
        float[][] phase;

        void Start()
        {
            cars = new Transform[lanes.Length][];
            phase = new float[lanes.Length][];
            var rng = new System.Random(2049);
            for (int l = 0; l < lanes.Length; l++)
            {
                cars[l] = new Transform[lanes[l].count];
                phase[l] = new float[lanes[l].count];
                for (int i = 0; i < lanes[l].count; i++)
                {
                    var car = new GameObject("Car").transform;
                    car.SetParent(transform, false);
                    var dir = (lanes[l].end - lanes[l].start).normalized;
                    car.rotation = Quaternion.LookRotation(dir);
                    var size = new Vector3(1.6f, 0.9f, 4.2f) * (0.8f + (float)rng.NextDouble() * 0.6f);
                    Light(car, new Vector3(0, 0, size.z * 0.5f), size * 0.35f, headMaterial);
                    Light(car, new Vector3(0, 0, -size.z * 0.5f), size * 0.3f, tailMaterial);
                    var trail = car.gameObject.AddComponent<TrailRenderer>();
                    trail.time = 0.35f;
                    trail.startWidth = size.y * 0.35f;
                    trail.endWidth = 0f;
                    trail.sharedMaterial = tailMaterial;
                    trail.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
                    cars[l][i] = car;
                    phase[l][i] = (i + (float)rng.NextDouble() * lanes[l].jitter) / lanes[l].count;
                }
            }
        }

        static void Light(Transform parent, Vector3 pos, Vector3 size, Material m)
        {
            var g = GameObject.CreatePrimitive(PrimitiveType.Cube);
            Destroy(g.GetComponent<Collider>());
            g.transform.SetParent(parent, false);
            g.transform.localPosition = pos;
            g.transform.localScale = size;
            var r = g.GetComponent<MeshRenderer>();
            r.sharedMaterial = m;
            r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
        }

        void Update()
        {
            for (int l = 0; l < lanes.Length; l++)
            {
                var lane = lanes[l];
                float len = Vector3.Distance(lane.start, lane.end);
                for (int i = 0; i < cars[l].Length; i++)
                {
                    float t = Mathf.Repeat(phase[l][i] + Time.time * lane.speed / len, 1f);
                    var p = Vector3.Lerp(lane.start, lane.end, t);
                    // Clear the trail when wrapping so it doesn't streak across the sky.
                    if (Vector3.Distance(cars[l][i].position, p) > lane.speed) cars[l][i].GetComponent<TrailRenderer>().Clear();
                    cars[l][i].position = p;
                }
            }
        }
    }
}
