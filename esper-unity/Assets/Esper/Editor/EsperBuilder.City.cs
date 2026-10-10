using UnityEngine;
using UnityEngine.Rendering;

namespace Esper.EditorTools
{
    public static partial class EsperBuilder
    {
        // The apartment is ~200 m up; the street is a glow far below.
        const float StreetY = -200f;

        static void BuildCity()
        {
            var towerMat = Custom("CityTower", "Esper/CityTower");
            var nearMat = Custom("CityTowerNear", "Esper/CityTower", m =>
            {
                m.SetVector("_WindowSize", new Vector4(1.6f, 3.2f, 0, 0));
                m.SetFloat("_LitRatio", 0.22f);
                m.SetColor("_Facade", new Color(0.028f, 0.03f, 0.034f));
            });
            var megaMat = Custom("CityMega", "Esper/CityTower", m =>
            {
                m.SetVector("_WindowSize", new Vector4(5f, 7f, 0, 0));
                m.SetFloat("_LitRatio", 0.5f);
                m.SetFloat("_WindowGlow", 1.4f);
            });

            var city = Group("City", outside);
            var rng = new System.Random(1982);
            float R(float a, float b) => a + (float)rng.NextDouble() * (b - a);

            // Neighbour: a brutalist slab across the canyon, close enough to read individual flats.
            Tower(city, "Neighbour", new Vector3(-26f, StreetY, 46f), new Vector3(44f, 236f, 18f), nearMat);
            Tower(city, "Neighbour_Wing", new Vector3(30f, StreetY, 58f), new Vector3(26f, 214f, 22f), nearMat);

            for (int i = 0; i < 260; i++)
            {
                float dist = Mathf.Lerp(80f, 1600f, Mathf.Pow((float)rng.NextDouble(), 1.6f));
                float ang = R(-62f, 62f) * Mathf.Deg2Rad;
                var pos = new Vector3(Mathf.Sin(ang) * dist, StreetY, Mathf.Cos(ang) * dist + 20f);
                float h = Mathf.Lerp(60f, 420f, Mathf.Pow((float)rng.NextDouble(), 2.2f));
                if (rng.NextDouble() < 0.05) h = R(500f, 760f);
                float w = R(18f, 70f), d = R(18f, 70f);
                var t = Tower(city, "Tower", pos, new Vector3(w, h, d), h > 480f ? megaMat : towerMat);
                t.transform.rotation = Quaternion.Euler(0, R(-8f, 8f), 0);
                // Setbacks and spires on the tall ones.
                if (h > 220f && rng.NextDouble() < 0.6)
                {
                    var s = Tower(t.transform, "Setback", new Vector3(0, h, 0), new Vector3(w * 0.6f, h * R(0.12f, 0.3f), d * 0.6f), towerMat, local: true);
                    if (rng.NextDouble() < 0.5)
                        Tower(s.transform, "Spire", new Vector3(0, s.transform.lossyScale.y, 0), new Vector3(2.5f, R(30f, 90f), 2.5f), towerMat, local: true);
                }
            }
        }

        static GameObject Tower(Transform parent, string name, Vector3 basePos, Vector3 size, Material mat, bool local = false)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var unit = EsperMeshes.Save(EsperMeshes.Box(Vector3.one), "tower_unit", false);
            var child = new GameObject("Mass");
            child.transform.SetParent(go.transform, false);
            child.transform.localPosition = new Vector3(0, 0.5f, 0);
            child.AddComponent<MeshFilter>().sharedMesh = unit;
            var r = child.AddComponent<MeshRenderer>();
            r.sharedMaterial = mat;
            r.shadowCastingMode = ShadowCastingMode.Off;
            r.receiveShadows = false;
            go.transform.localPosition = basePos;
            if (local)
            {
                // Child sizes are relative to the parent's unit scale.
                var ps = parent.lossyScale;
                go.transform.localScale = new Vector3(size.x / ps.x, size.y / ps.y, size.z / ps.z);
                go.transform.localPosition = new Vector3(basePos.x, basePos.y / ps.y, basePos.z);
            }
            else go.transform.localScale = size;
            return go;
        }
    }
}
