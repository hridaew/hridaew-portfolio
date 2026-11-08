using System.Collections;
using System.Collections.Generic;
using Unity.Cinemachine;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Esper
{
    /// Overview -> focus -> enhance. Owns input, camera priorities and the page bridge.
    /// Page -> Unity: SendMessage("ESPER", "Goto", id) / ("Back") / ("SetReducedMotion", "1").
    ///
    /// Views are isometric: a long lens from far away, so the house reads like a diorama. Dragging turns the
    /// house (overview) or the room (focus) about the point on the floor the view looks at. Going in is a dolly
    /// zoom: the lens widens while the camera closes in, so depth arrives as you enter the device.
    public class EsperDirector : MonoBehaviour
    {
        public CinemachineCamera overviewCamera;
        public Hotspot[] hotspots;
        [Tooltip("How long the move into a project takes before the page fades.")]
        public float enhanceDuration = 1.6f;

        /// Look key "lens": one field of view for every view, distances refit so framing holds (0 = as authored).
        public static float LensOverride;
        /// Look key "orbit": how far a drag may turn the house, in degrees (rooms get half).
        public static float OrbitRange = 40f;

        enum State { Overview, Focus, Enhance }
        State state = State.Overview;
        const float DragThreshold = 6f;
        bool pressing, dragged;
        Vector2 pressAt, lastPointer, look, lookTarget;
        Hotspot focused, hovered;
        Camera cam;
        CinemachineBrain brain;
        bool reducedMotion;
        bool intro;
        float frameOffset;
        CinemachineCamera moving; // the camera an enhance is flying; left alone by the rest poses
        /// Studio turns off visitor input (clicks focus/enhance) and, while flying, the camera rig.
        [HideInInspector] public bool inputEnabled = true;
        [HideInInspector] public bool studioCamera;

        /// A view as authored: where it sits, where it looks, its lens, and the floor point it turns about.
        class Rest { public Vector3 pos; public Quaternion rot; public float fov; public Vector3 pivot; }
        readonly Dictionary<CinemachineCamera, Rest> rest = new();

        void Start()
        {
            cam = Camera.main;
            brain = cam.GetComponent<CinemachineBrain>();
            Remember(overviewCamera);
            foreach (var h in hotspots) Remember(h.focusCamera);
            Activate(overviewCamera);
            WebBridge.Emit("ready");
        }

        void Remember(CinemachineCamera v, bool force = false)
        {
            if (v == null || (!force && rest.ContainsKey(v))) return;
            var t = v.transform;
            float d = t.forward.y < -0.01f ? -t.position.y / t.forward.y : 30f;
            rest[v] = new Rest { pos = t.position, rot = t.rotation, fov = v.Lens.FieldOfView, pivot = t.position + t.forward * d };
        }

        void Activate(CinemachineCamera live)
        {
            overviewCamera.Priority = live == overviewCamera ? 20 : 0;
            foreach (var h in hotspots)
                if (h.focusCamera) h.focusCamera.Priority = h.focusCamera == live ? 20 : 0;
        }

        CinemachineCamera Live => state == State.Overview || focused == null ? overviewCamera : focused.focusCamera;

        /// The lens a view uses now, and how far back it has to sit to keep its framing.
        static float Fov(Rest r) => LensOverride > 0.5f ? LensOverride : r.fov;
        static float Distance(Rest r)
        {
            float d0 = Vector3.Distance(r.pos, r.pivot);
            return d0 * Mathf.Tan(r.fov * 0.5f * Mathf.Deg2Rad) / Mathf.Tan(Fov(r) * 0.5f * Mathf.Deg2Rad);
        }

        /// Sets a view's camera: its rest pose turned by (yaw, pitch) about its pivot, slid sideways by the frame offset.
        void Pose(CinemachineCamera v, Rest r, Vector2 turnBy)
        {
            float fov = Fov(r);
            float dist = Distance(r);
            var fwd = r.rot * Vector3.forward;
            var flat = Vector3.ProjectOnPlane(-fwd, Vector3.up).normalized;
            var turn = Quaternion.Euler(0, turnBy.x, 0) * Quaternion.AngleAxis(turnBy.y, Vector3.Cross(Vector3.up, flat));
            var rot = turn * r.rot;
            // The frame offset is given in degrees at a 36 degree lens; as a slide it holds at any lens.
            float slide = v == overviewCamera ? 0f : dist * Mathf.Tan(fov * 0.5f * Mathf.Deg2Rad) * Mathf.Tan(frameOffset * Mathf.Deg2Rad) / Mathf.Tan(18f * Mathf.Deg2Rad);
            var pos = r.pivot - (rot * Vector3.forward) * dist + (rot * Vector3.right) * slide;
            v.transform.SetPositionAndRotation(pos, rot);
            var lens = v.Lens;
            lens.FieldOfView = fov;
            lens.NearClipPlane = Mathf.Max(0.1f, dist - 40f);
            lens.FarClipPlane = dist + 80f;
            v.Lens = lens;
        }

        void Update()
        {
            var mouse = Mouse.current;
            var touch = Touchscreen.current;
            var kb = Keyboard.current;

            Vector2 pointer = mouse != null ? mouse.position.ReadValue() : new Vector2(Screen.width, Screen.height) * 0.5f;
            bool down = mouse != null && mouse.leftButton.wasPressedThisFrame;
            bool held = mouse != null && mouse.leftButton.isPressed;
            bool up = mouse != null && mouse.leftButton.wasReleasedThisFrame;
            if (touch != null && (touch.primaryTouch.press.isPressed || touch.primaryTouch.press.wasReleasedThisFrame))
            {
                pointer = touch.primaryTouch.position.ReadValue();
                down |= touch.primaryTouch.press.wasPressedThisFrame;
                held |= touch.primaryTouch.press.isPressed;
                up |= touch.primaryTouch.press.wasReleasedThisFrame;
            }
            float dt = Time.unscaledDeltaTime;
            UpdateCameras(dt);

            if (!inputEnabled)
            {
                foreach (var h in hotspots)
                {
                    var col = h.GetComponent<Collider>();
                    if (col) col.enabled = false;
                }
                pressing = false;
                return;
            }
            foreach (var h in hotspots)
            {
                var col = h.GetComponent<Collider>();
                if (col && !col.enabled) col.enabled = true;
            }
            if (state != State.Enhance) UpdateHover(PointerGate.OverUi || (pressing && dragged) ? (Vector2?)null : pointer);
            foreach (var h in hotspots)
                h.hover = Mathf.MoveTowards(h.hover, h == hovered || h == focused ? 1f : 0f, dt * 3.5f);

            // Press and drag turns the view; a press that doesn't travel is a click, acted on at release.
            if (down && !PointerGate.OverUi)
            {
                pressing = true;
                dragged = false;
                pressAt = lastPointer = pointer;
            }
            if (pressing && held)
            {
                if (!dragged && (pointer - pressAt).magnitude > DragThreshold) dragged = true;
                if (dragged && state != State.Enhance && !intro)
                {
                    var delta = pointer - lastPointer;
                    float range = state == State.Overview ? OrbitRange : OrbitRange * 0.5f;
                    lookTarget += new Vector2(delta.x, -delta.y) * (220f / Mathf.Max(400f, Screen.width));
                    lookTarget.x = Mathf.Clamp(lookTarget.x, -range, range);
                    lookTarget.y = Mathf.Clamp(lookTarget.y, -10f, 12f);
                }
                lastPointer = pointer;
            }
            if (pressing && up)
            {
                pressing = false;
                if (!dragged && !PointerGate.OverUi) OnPress(pointer);
            }

            if (kb != null)
            {
                if (kb.escapeKey.wasPressedThisFrame || kb.backspaceKey.wasPressedThisFrame) Back();
                if ((kb.enterKey.wasPressedThisFrame || kb.spaceKey.wasPressedThisFrame) && state == State.Focus) StartCoroutine(Enhance(focused));
                for (int i = 0; i < hotspots.Length && i < 9; i++)
                    if (kb[(Key)((int)Key.Digit1 + i)].wasPressedThisFrame) Select(hotspots[i]);
            }
            if (mouse != null && mouse.rightButton.wasPressedThisFrame && !PointerGate.OverUi) Back();
        }

        /// Every view sits at its rest pose (so blends start from the right place); the live one also carries the drag.
        void UpdateCameras(float dt)
        {
            if (state != State.Enhance && !intro) look = Vector2.Lerp(look, lookTarget, 1f - Mathf.Exp(-dt * 10f));
            var live = Live;
            foreach (var kv in rest)
            {
                if (kv.Key == null || kv.Key == moving) continue;
                Pose(kv.Key, kv.Value, kv.Key == live ? look : Vector2.zero);
            }
            FitShadows();
        }

        /// The camera is far away for the isometric look, so the shadow range has to reach the house: one empty
        /// near cascade, and a second one fitted around the house.
        void FitShadows()
        {
            if (!cam || !(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset urp)) return;
            var t = cam.transform;
            float d = t.forward.y < -0.01f ? -t.position.y / t.forward.y : 20f;
            const float reach = 18f;
            float distance = d + reach;
            float split = Mathf.Clamp((d - reach) / distance, 0.02f, 0.9f);
            if (Mathf.Abs(urp.shadowDistance - distance) > 0.5f) urp.shadowDistance = distance;
            if (urp.shadowCascadeCount != 2) urp.shadowCascadeCount = 2;
            if (Mathf.Abs(urp.cascade2Split - split) > 0.002f) urp.cascade2Split = split;
        }

        void ResetLook()
        {
            lookTarget = Vector2.zero;
        }

        void UpdateHover(Vector2? pointer)
        {
            Hotspot hit = null;
            if (cam && pointer.HasValue && Physics.Raycast(cam.ScreenPointToRay(pointer.Value), out var info, 2000f))
                hit = info.collider.GetComponentInParent<Hotspot>();
            if (hit != hovered)
            {
                hovered = hit;
                WebBridge.Emit("hover", hit ? hit.id : "");
            }
        }

        void OnPress(Vector2 pointer)
        {
            // The figure outside: a tap moves it on to its next pastime.
            if (cam && Physics.Raycast(cam.ScreenPointToRay(pointer), out var info, 2000f))
            {
                var cycle = info.collider.GetComponentInParent<Esper.Live.LiveCycle>();
                if (cycle) { cycle.Next(); return; }
            }
            switch (state)
            {
                case State.Overview:
                    if (hovered) Focus(hovered);
                    break;
                case State.Focus:
                    if (hovered == focused) StartCoroutine(Enhance(focused));
                    else if (hovered) Focus(hovered);
                    else Back();
                    break;
            }
        }

        void Select(Hotspot h)
        {
            if (state == State.Focus && focused == h) StartCoroutine(Enhance(h));
            else if (state != State.Enhance) Focus(h);
        }

        void Focus(Hotspot h)
        {
            focused = h;
            state = State.Focus;
            ResetLook();
            Esper.Live.StationStates.Set(transform, h.id);
            Activate(h.focusCamera);
            WebBridge.Emit("focus", h.id);
        }

        /// Going in: a dolly zoom from the isometric view into the device (or the person's view of it), then the
        /// page fades. The lens opens over the first half, so perspective arrives before the camera gets close.
        IEnumerator Enhance(Hotspot h)
        {
            if (h == null || state == State.Enhance) yield break;
            state = State.Enhance;
            WebBridge.Emit("enhance-start", h.id);
            var v = h.focusCamera;
            moving = v;
            Vector3 fromPos = v.transform.position;
            Quaternion fromRot = v.transform.rotation;
            float fromFov = v.Lens.FieldOfView;
            Vector3 aim = h.screen ? h.screen.transform.position : h.transform.position;
            Vector3 toPos = h.hasEnter ? h.enter : Vector3.Lerp(fromPos, aim, 0.9f);
            Quaternion toRot = Quaternion.LookRotation(aim - toPos);
            const float toFov = 50f;
            float half(float fov) => Mathf.Tan(fov * 0.5f * Mathf.Deg2Rad);
            // Frame size at the aim point, start and end; the move eases between them in log space.
            float d0 = Vector3.Distance(fromPos, aim), d1 = Vector3.Distance(toPos, aim);
            float s0 = d0 * half(fromFov), s1 = d1 * half(toFov);
            float t = 0;
            float duration = reducedMotion ? 0.3f : enhanceDuration;
            var lens = v.Lens;
            while (t < 1f)
            {
                t += Time.unscaledDeltaTime / duration;
                float k = Mathf.Clamp01(t);
                float e = k * k * k * (k * (k * 6f - 15f) + 10f); // smootherstep
                float lensK = Mathf.SmoothStep(0f, 1f, Mathf.Clamp01(k * 2f));
                float fov = Mathf.Lerp(fromFov, toFov, lensK);
                float size = Mathf.Exp(Mathf.Lerp(Mathf.Log(s0), Mathf.Log(s1), e));
                var rot = Quaternion.Slerp(fromRot, toRot, e);
                float dist = size / half(fov);
                v.transform.SetPositionAndRotation(aim - rot * Vector3.forward * dist, rot);
                lens.FieldOfView = fov;
                lens.NearClipPlane = Mathf.Clamp(dist * 0.02f, 0.02f, Mathf.Max(0.1f, dist - 40f));
                lens.FarClipPlane = dist + 80f;
                v.Lens = lens;
                yield return null;
            }
            WebBridge.Emit("enhance", h.url);
            // If the page does not navigate (no case study, editor, blocked), settle back into focus.
            yield return new WaitForSecondsRealtime(2.5f);
            moving = null;
            state = State.Focus;
        }

        public void Goto(string id)
        {
            foreach (var h in hotspots)
                if (h.id == id) { Select(h); return; }
        }

        public void Back()
        {
            if (state != State.Focus) return;
            state = State.Overview;
            focused = null;
            ResetLook();
            Esper.Live.StationStates.Set(transform, null);
            Activate(overviewCamera);
            WebBridge.Emit("overview");
        }

        /// The opening: the house swings round into its resting angle while the title card is up.
        public void PlayIntro(string seconds)
        {
            if (reducedMotion) return;
            float.TryParse(seconds, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out float d);
            StartCoroutine(Intro(d > 0 ? d : 4.5f));
        }

        IEnumerator Intro(float duration)
        {
            intro = true;
            var start = new Vector2(-22f, 6f);
            for (float k = 0; k < 1f; k += Time.unscaledDeltaTime / duration)
            {
                float e = 1f - Mathf.Pow(1f - k, 3f);
                look = Vector2.Lerp(start, Vector2.zero, e);
                yield return null;
            }
            look = Vector2.zero;
            intro = false;
        }

        /// From the page: the pointer is over the interface, not the room. Hover and clicks stay out of the scene.
        public void SetPointerOverUi(string on) => PointerGate.OverUi = on == "1";

        public void SetFrameOffset(string degrees)
        {
            float.TryParse(degrees, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out frameOffset);
        }

        /// Look development: "x,y,z,tx,ty,tz,fov" re-aims the overview.
        public void DevCamera(string spec)
        {
            var f = System.Array.ConvertAll(spec.Split(','), v => float.Parse(v, System.Globalization.CultureInfo.InvariantCulture));
            var pos = new Vector3(f[0], f[1], f[2]);
            overviewCamera.transform.SetPositionAndRotation(pos, Quaternion.LookRotation(new Vector3(f[3], f[4], f[5]) - pos));
            var lens = overviewCamera.Lens;
            lens.FieldOfView = f[6];
            overviewCamera.Lens = lens;
            Remember(overviewCamera, true);
        }

        public CinemachineCamera CameraFor(string id)
        {
            if (id == "overview") return overviewCamera;
            foreach (var h in hotspots) if (h.id == id) return h.focusCamera;
            return null;
        }

        /// After a camera is moved by Studio or overrides, make it the new resting pose.
        public void Rebase(CinemachineCamera v)
        {
            if (v == null) return;
            Remember(v, true);
        }

        /// Moves the figure outside on to its next activity (Studio's "Next" dial).
        public void NextActivity()
        {
            foreach (var c in FindObjectsByType<Esper.Live.LiveCycle>(FindObjectsSortMode.None)) c.Next();
        }

        public void SetLights(string on)
        {
            var lights = GetComponent<RoomLights>();
            if (lights) lights.Set(on == "1");
        }

        public void SetReducedMotion(string on)
        {
            reducedMotion = on == "1";
            if (brain) brain.DefaultBlend = new CinemachineBlendDefinition(reducedMotion ? CinemachineBlendDefinition.Styles.Cut : CinemachineBlendDefinition.Styles.EaseInOut, 1.4f);
        }
    }
}
