using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Unity.Cinemachine;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Rendering;

namespace Esper.Studio
{
    /// Studio: internal tooling driven from the page (DialKit). Select and drag objects, fly a free camera,
    /// save station views, dial lights, step render fidelity, and drop notes at points in the room.
    /// Page -> Unity: SendMessage("ESPER", <method>, <string>). Unity -> page: "studio-*" bridge events.
    public class StudioMode : MonoBehaviour
    {
        enum Tool { Select, Note }

        bool on;
        Tool tool = Tool.Select;
        bool flying;
        Transform selected;
        bool dragging;
        Plane dragPlane;
        Vector3 dragOffset;
        float flySpeed = 2.2f;
        Vector2 flyAngles;
        EsperDirector director;
        CinemachineBrain brain;
        Camera cam;
        GameObject outline;
        readonly List<GameObject> pins = new();
        readonly List<Collider> addedColliders = new();

        // Fidelity cache
        int fidelity = 4;
        readonly Dictionary<Renderer, Material[]> originalMaterials = new();
        readonly Dictionary<Light, LightShadows> originalShadows = new();
        Material clay;
        float? volDensity;
        AmbientMode ambientMode;
        Color ambSky, ambEq, ambGround;

        void Start()
        {
            director = GetComponent<EsperDirector>();
            cam = Camera.main;
            brain = cam ? cam.GetComponent<CinemachineBrain>() : null;
#if UNITY_WEBGL && !UNITY_EDITOR
            // Let the page's text fields keep the keyboard; Unity only listens when the canvas is focused.
            WebGLInput.captureAllKeyboardInput = false;
#endif
        }

        // ---------------- page -> Unity ----------------

        public void Enable(string value)
        {
            on = value == "1";
            director.inputEnabled = !on;
            if (on) { EnsureColliders(); EmitScene(); }
            else { Deselect(); SetFly("0"); }
        }

        public void SetTool(string value) => tool = value == "note" ? Tool.Note : Tool.Select;

        /// {"p":[x,y,z],"ry":deg,"s":scale}
        public void SetSelected(string json)
        {
            if (!selected) return;
            var o = JsonUtility.FromJson<ObjectOverride>(json);
            selected.position = StudioPaths.V(o.p);
            selected.rotation = Quaternion.Euler(selected.eulerAngles.x, o.ry, selected.eulerAngles.z);
            selected.localScale = Vector3.one * Mathf.Max(0.05f, o.s);
            UpdateOutline();
        }

        public void DropSelected(string _)
        {
            if (!selected) return;
            // Sit the object on whatever is below it (floor or furniture).
            var b = Bounds(selected);
            float y = 0f;
            foreach (var hit in Physics.RaycastAll(new Ray(b.center + Vector3.up * 0.01f, Vector3.down), 10f))
                if (!hit.transform.IsChildOf(selected) && hit.point.y < b.min.y + 0.02f) y = Mathf.Max(y, hit.point.y);
            selected.position += Vector3.up * (y - b.min.y);
            UpdateOutline();
            EmitSelected("studio-moved");
        }

        public void SetFly(string value)
        {
            flying = value == "1";
            if (brain) brain.enabled = !flying;
            director.studioCamera = flying;
            if (flying)
            {
                var e = cam.transform.eulerAngles;
                flyAngles = new Vector2(e.y, e.x > 180 ? e.x - 360 : e.x);
            }
        }

        public void SetFov(string value)
        {
            if (float.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var f)) cam.fieldOfView = f;
        }

        /// Save the current camera as a station's view (or "overview").
        public void SaveView(string id)
        {
            var vcam = director.CameraFor(id);
            if (!vcam) return;
            vcam.transform.SetPositionAndRotation(cam.transform.position, cam.transform.rotation);
            var lens = vcam.Lens;
            lens.FieldOfView = cam.fieldOfView;
            vcam.Lens = lens;
            director.Rebase(vcam);
            var target = cam.transform.position + cam.transform.forward * 3f;
            WebBridge.Emit("studio-view", JsonUtility.ToJson(new ViewOverride
            {
                id = id,
                pos = new[] { cam.transform.position.x, cam.transform.position.y, cam.transform.position.z },
                target = new[] { target.x, target.y, target.z },
                fov = cam.fieldOfView,
            }));
        }

        /// 0 clay, 1 clay + shadows, 2 materials, 3 + grade, 4 + atmosphere (full).
        public void Fidelity(string value)
        {
            int level = Mathf.Clamp(int.Parse(value, CultureInfo.InvariantCulture), 0, 4);
            if (level == fidelity) return;
            CacheFidelity();
            bool clayOn = level <= 1;
            foreach (var kv in originalMaterials)
                if (kv.Key) kv.Key.sharedMaterials = clayOn && !IsScreen(kv.Key) ? Enumerable.Repeat(clay, kv.Value.Length).ToArray() : kv.Value;
            foreach (var kv in originalShadows)
                if (kv.Key) kv.Key.shadows = level == 0 ? LightShadows.None : kv.Value;
            RenderSettings.ambientMode = level == 0 ? AmbientMode.Flat : ambientMode;
            if (level == 0) RenderSettings.ambientLight = new Color(0.32f, 0.32f, 0.34f);
            else { RenderSettings.ambientSkyColor = ambSky; RenderSettings.ambientEquatorColor = ambEq; RenderSettings.ambientGroundColor = ambGround; }
            foreach (var v in FindObjectsByType<Volume>(FindObjectsSortMode.None))
                if (v.name == "PostVolume") v.weight = level >= 3 ? 1 : 0;
            var look = GetComponent<LookDev>();
            if (look && look.volumetric) look.volumetric.SetFloat("_Density", level >= 4 ? volDensity.Value : 0f);
            foreach (var ps in FindObjectsByType<ParticleSystem>(FindObjectsSortMode.None))
                ps.gameObject.SetActive(level >= 4);
            fidelity = level;
        }

        public void SetPins(string json)
        {
            foreach (var p in pins) Destroy(p);
            pins.Clear();
            if (string.IsNullOrEmpty(json)) return;
            var list = JsonUtility.FromJson<PinList>(json);
            foreach (var p in list.pins)
            {
                var pin = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                Destroy(pin.GetComponent<Collider>());
                pin.transform.position = StudioPaths.V(p.p);
                pin.transform.localScale = Vector3.one * 0.05f;
                pin.GetComponent<MeshRenderer>().sharedMaterial = PinMaterial();
                pins.Add(pin);
            }
        }

        [System.Serializable] class Pin { public float[] p; }
        [System.Serializable] class PinList { public List<Pin> pins = new(); }

        // ---------------- input ----------------

        void Update()
        {
            if (!on || cam == null) return;
            var mouse = Mouse.current;
            var kb = Keyboard.current;
            if (mouse == null) return;
            Vector2 pointer = mouse.position.ReadValue();

            if (flying) Fly(mouse, kb);

            if (mouse.leftButton.wasPressedThisFrame && !PointerGate.OverUi)
            {
                var ray = cam.ScreenPointToRay(pointer);
                if (Physics.Raycast(ray, out var hit, 60f))
                {
                    if (tool == Tool.Note) EmitPoint(hit, pointer);
                    else
                    {
                        var s = StudioPaths.SelectableFor(hit.transform, transform);
                        if (s) { Select(s.transform); BeginDrag(ray); }
                        else Deselect();
                    }
                }
            }
            if (dragging && selected)
            {
                if (mouse.leftButton.isPressed)
                {
                    var ray = cam.ScreenPointToRay(pointer);
                    if (dragPlane.Raycast(ray, out float d))
                    {
                        var p = ray.GetPoint(d) + dragOffset;
                        selected.position = new Vector3(p.x, selected.position.y, p.z);
                        UpdateOutline();
                    }
                }
                else
                {
                    dragging = false;
                    EmitSelected("studio-moved");
                }
            }
            // Rotate the selection with the wheel while held, or with [ and ].
            if (selected && kb != null)
            {
                float r = (kb.leftBracketKey.isPressed ? -1 : 0) + (kb.rightBracketKey.isPressed ? 1 : 0);
                if (r != 0)
                {
                    selected.Rotate(Vector3.up, r * 90f * Time.unscaledDeltaTime, Space.World);
                    UpdateOutline();
                }
                if (kb.leftBracketKey.wasReleasedThisFrame || kb.rightBracketKey.wasReleasedThisFrame) EmitSelected("studio-moved");
            }
        }

        void Fly(Mouse mouse, Keyboard kb)
        {
            float dt = Time.unscaledDeltaTime;
            if (mouse.rightButton.isPressed)
            {
                var delta = mouse.delta.ReadValue() * 0.15f;
                flyAngles.x += delta.x;
                flyAngles.y = Mathf.Clamp(flyAngles.y - delta.y, -85f, 85f);
                cam.transform.rotation = Quaternion.Euler(flyAngles.y, flyAngles.x, 0);
            }
            if (kb == null) return;
            var move = Vector3.zero;
            if (kb.wKey.isPressed) move += Vector3.forward;
            if (kb.sKey.isPressed) move += Vector3.back;
            if (kb.aKey.isPressed) move += Vector3.left;
            if (kb.dKey.isPressed) move += Vector3.right;
            if (kb.eKey.isPressed) move += Vector3.up;
            if (kb.qKey.isPressed) move += Vector3.down;
            float speed = flySpeed * (kb.shiftKey.isPressed ? 3f : 1f);
            cam.transform.position += cam.transform.rotation * move * speed * dt;
        }

        void BeginDrag(Ray ray)
        {
            var b = Bounds(selected);
            dragPlane = new Plane(Vector3.up, new Vector3(0, b.min.y, 0));
            if (dragPlane.Raycast(ray, out float d)) dragOffset = selected.position - ray.GetPoint(d);
            dragging = true;
        }

        // ---------------- selection ----------------

        void Select(Transform t)
        {
            selected = t;
            UpdateOutline();
            EmitSelected("studio-select");
        }

        void Deselect()
        {
            selected = null;
            if (outline) outline.SetActive(false);
            WebBridge.Emit("studio-select", "");
        }

        void EmitSelected(string evt)
        {
            if (!selected) return;
            var p = selected.position;
            WebBridge.Emit(evt, JsonUtility.ToJson(new ObjectOverride
            {
                path = selected.GetComponent<Esper.Live.LiveItem>().id,
                rough = selected.GetComponent<Esper.Live.LiveItem>().rough > 0f ? selected.GetComponent<Esper.Live.LiveItem>().rough : 1f,
                p = new[] { p.x, p.y, p.z },
                ry = selected.eulerAngles.y,
                s = selected.localScale.x,
            }));
        }

        void UpdateOutline()
        {
            if (!selected) return;
            if (!outline) outline = BuildOutline();
            outline.SetActive(true);
            var b = Bounds(selected);
            outline.transform.position = b.center;
            outline.transform.localScale = b.size + Vector3.one * 0.02f;
        }

        GameObject BuildOutline()
        {
            var go = new GameObject("StudioOutline");
            var m = PinMaterial();
            // Twelve thin edges of a unit cube.
            foreach (var axis in new[] { Vector3.right, Vector3.up, Vector3.forward })
                for (int i = 0; i < 4; i++)
                {
                    var e = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    Destroy(e.GetComponent<Collider>());
                    e.transform.SetParent(go.transform, false);
                    Vector3 a = axis == Vector3.right ? Vector3.up : Vector3.right;
                    Vector3 c = Vector3.Cross(axis, a);
                    e.transform.localPosition = a * ((i & 1) == 0 ? -0.5f : 0.5f) + c * ((i & 2) == 0 ? -0.5f : 0.5f);
                    e.transform.localScale = axis + (Vector3.one - axis) * 0.004f;
                    e.GetComponent<MeshRenderer>().sharedMaterial = m;
                }
            return go;
        }

        Material pinMat;
        Material PinMaterial()
        {
            if (!pinMat)
            {
                pinMat = new Material(Shader.Find("Universal Render Pipeline/Unlit"));
                pinMat.SetColor("_BaseColor", new Color(0.4f, 2.2f, 2.6f));
            }
            return pinMat;
        }

        // ---------------- notes ----------------

        void EmitPoint(RaycastHit hit, Vector2 pointer)
        {
            var s = StudioPaths.SelectableFor(hit.transform, transform);
            var c = cam.transform;
            string where = s ? s.id : hit.transform.name;
            WebBridge.Emit("studio-point", JsonUtility.ToJson(new PointInfo
            {
                p = new[] { hit.point.x, hit.point.y, hit.point.z },
                n = new[] { hit.normal.x, hit.normal.y, hit.normal.z },
                path = where,
                cam = new[] { c.position.x, c.position.y, c.position.z, c.forward.x, c.forward.y, c.forward.z, cam.fieldOfView },
                sx = pointer.x / Mathf.Max(1, Screen.width),
                sy = 1f - pointer.y / Mathf.Max(1, Screen.height),
            }));
        }

        [System.Serializable] class PointInfo { public float[] p; public float[] n; public string path; public float[] cam; public float sx, sy; }

        // ---------------- scene listing ----------------

        void EmitScene()
        {
            var scene = new SceneInfo();
            var props = transform.Find("Props");
            foreach (var li in props.GetComponentsInChildren<Esper.Live.LiveItem>(true))
                if (li.transform.parent && li.transform.parent.parent == props) scene.objects.Add(li.id);
            foreach (var l in FindObjectsByType<Light>(FindObjectsSortMode.None).OrderBy(l => l.name))
                scene.lights.Add(new ValueOverride { key = l.name, value = l.GetComponent<LightFlicker>() ? l.GetComponent<LightFlicker>().baseIntensity : l.intensity });
            scene.views.Add("overview");
            foreach (var h in director.hotspots) scene.views.Add(h.id);
            WebBridge.Emit("studio-scene", JsonUtility.ToJson(scene));
        }

        [System.Serializable] class SceneInfo { public List<string> objects = new(); public List<ValueOverride> lights = new(); public List<string> views = new(); }

        void EnsureColliders()
        {
            if (addedColliders.Count > 0) return;
            var props = transform.Find("Props");
            foreach (var mf in props.GetComponentsInChildren<MeshFilter>(true))
            {
                if (mf.GetComponent<Collider>() || mf.sharedMesh == null) continue;
                var c = mf.gameObject.AddComponent<MeshCollider>();
                c.sharedMesh = mf.sharedMesh;
                addedColliders.Add(c);
            }
            // The room shell, so notes can land on walls and floor.
            foreach (var mf in transform.Find("Shell").GetComponentsInChildren<MeshFilter>(true))
            {
                if (mf.GetComponent<Collider>() || mf.sharedMesh == null) continue;
                var c = mf.gameObject.AddComponent<MeshCollider>();
                c.sharedMesh = mf.sharedMesh;
                addedColliders.Add(c);
            }
        }

        void CacheFidelity()
        {
            if (clay) return;
            clay = new Material(Shader.Find("Universal Render Pipeline/Lit"));
            clay.SetColor("_BaseColor", new Color(0.62f, 0.6f, 0.57f));
            clay.SetFloat("_Smoothness", 0.2f);
            foreach (var r in FindObjectsByType<MeshRenderer>(FindObjectsSortMode.None))
                if (!r.transform.IsChildOf(transform.Find("Outside"))) originalMaterials[r] = r.sharedMaterials;
            foreach (var l in FindObjectsByType<Light>(FindObjectsSortMode.None)) originalShadows[l] = l.shadows;
            var look = GetComponent<LookDev>();
            volDensity = look && look.volumetric ? look.volumetric.GetFloat("_Density") : 0f;
            ambientMode = RenderSettings.ambientMode;
            ambSky = RenderSettings.ambientSkyColor; ambEq = RenderSettings.ambientEquatorColor; ambGround = RenderSettings.ambientGroundColor;
        }

        static bool IsScreen(Renderer r) => r.sharedMaterial && r.sharedMaterial.shader && r.sharedMaterial.shader.name == "Esper/CrtScreen";

        static Bounds Bounds(Transform t)
        {
            var rs = t.GetComponentsInChildren<Renderer>();
            if (rs.Length == 0) return new Bounds(t.position, Vector3.one * 0.1f);
            var b = rs[0].bounds;
            foreach (var r in rs) b.Encapsulate(r.bounds);
            return b;
        }
    }
}
