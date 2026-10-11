using System.Collections;
using System.Collections.Generic;
using Unity.Cinemachine;
using UnityEngine;
using UnityEngine.InputSystem;

namespace Esper
{
    /// Overview -> focus -> enhance. Owns input, camera priorities and the page bridge.
    /// Page -> Unity: SendMessage("ESPER", "Goto", id) / ("Back") / ("SetReducedMotion", "1").
    public class EsperDirector : MonoBehaviour
    {
        public CinemachineCamera overviewCamera;
        public Hotspot[] hotspots;
        public float parallaxDegrees = 1.4f;
        [Tooltip("Overview: how far you can look around the room toward the pointer.")]
        public Vector2 overviewLook = new Vector2(14f, 3f);
        public float enhanceDuration = 1.9f;

        enum State { Overview, Focus, Enhance }
        State state = State.Overview;
        Hotspot focused, hovered;
        Camera cam;
        CinemachineBrain brain;
        readonly Dictionary<CinemachineCamera, Quaternion> baseRotation = new();
        readonly Dictionary<CinemachineCamera, float> baseFov = new();
        Vector2 parallax;
        bool reducedMotion;
        bool intro;
        float frameOffset;
        /// Studio turns off visitor input (clicks focus/enhance) and, while flying, the camera rig.
        [HideInInspector] public bool inputEnabled = true;
        [HideInInspector] public bool studioCamera;

        void Start()
        {
            cam = Camera.main;
            brain = cam.GetComponent<CinemachineBrain>();
            Remember(overviewCamera);
            foreach (var h in hotspots) Remember(h.focusCamera);
            Activate(overviewCamera);
            WebBridge.Emit("ready");
        }

        void Remember(CinemachineCamera v)
        {
            if (v == null || baseRotation.ContainsKey(v)) return;
            baseRotation[v] = v.transform.rotation;
            baseFov[v] = v.Lens.FieldOfView;
        }

        void Activate(CinemachineCamera live)
        {
            overviewCamera.Priority = live == overviewCamera ? 20 : 0;
            foreach (var h in hotspots)
                if (h.focusCamera) h.focusCamera.Priority = h.focusCamera == live ? 20 : 0;
        }

        CinemachineCamera Live => state == State.Overview || focused == null ? overviewCamera : focused.focusCamera;

        void Update()
        {
            var mouse = Mouse.current;
            var touch = Touchscreen.current;
            var kb = Keyboard.current;

            Vector2 pointer = mouse != null ? mouse.position.ReadValue() : new Vector2(Screen.width, Screen.height) * 0.5f;
            bool pressed = mouse != null && mouse.leftButton.wasPressedThisFrame;
            if (touch != null && touch.primaryTouch.press.wasPressedThisFrame)
            {
                pointer = touch.primaryTouch.position.ReadValue();
                pressed = true;
            }

            if (!inputEnabled)
            {
                foreach (var h in hotspots)
                {
                    var col = h.GetComponent<Collider>();
                    if (col) col.enabled = false;
                }
                return;
            }
            foreach (var h in hotspots)
            {
                var col = h.GetComponent<Collider>();
                if (col && !col.enabled) col.enabled = true;
            }
            if (state != State.Enhance) UpdateHover(pointer);
            float dt = Time.unscaledDeltaTime;
            foreach (var h in hotspots)
                h.hover = Mathf.MoveTowards(h.hover, h == hovered || h == focused ? 1f : 0f, dt * 3.5f);

            if (pressed) OnPress();
            if (kb != null)
            {
                if (kb.escapeKey.wasPressedThisFrame || kb.backspaceKey.wasPressedThisFrame) Back();
                if ((kb.enterKey.wasPressedThisFrame || kb.spaceKey.wasPressedThisFrame) && state == State.Focus) StartCoroutine(Enhance(focused));
                for (int i = 0; i < hotspots.Length && i < 9; i++)
                    if (kb[(Key)((int)Key.Digit1 + i)].wasPressedThisFrame) Select(hotspots[i]);
            }
            if (mouse != null && mouse.rightButton.wasPressedThisFrame) Back();

            // Breathing parallax: the camera leans a degree toward the pointer.
            if (state != State.Enhance && !reducedMotion && !intro)
            {
                Vector2 n = new Vector2(pointer.x / Mathf.Max(1, Screen.width), pointer.y / Mathf.Max(1, Screen.height)) - Vector2.one * 0.5f;
                bool overview = state == State.Overview;
                parallax = Vector2.Lerp(parallax, n, 1f - Mathf.Exp(-dt * (overview ? 1.6f : 2.5f)));
                var live = Live;
                // In the overview the pointer turns your head across the room; up close it only breathes.
                Vector2 range = overview ? overviewLook * 2f : new Vector2(parallaxDegrees * 1.6f, parallaxDegrees);
                float ease(float v) => Mathf.Sign(v) * Mathf.SmoothStep(0f, 1f, Mathf.Abs(v) * 2f) * 0.5f;
                if (live && baseRotation.TryGetValue(live, out var rot))
                {
                    // Up close, the subject sits left of centre to clear the dossier on the right.
                    float yaw = ease(parallax.x) * range.x + (overview ? 0f : frameOffset);
                    live.transform.rotation = Quaternion.Euler(0, yaw, 0) * rot * Quaternion.Euler(-ease(parallax.y) * range.y, 0, 0);
                }
            }
        }

        void UpdateHover(Vector2 pointer)
        {
            Hotspot hit = null;
            if (cam && Physics.Raycast(cam.ScreenPointToRay(pointer), out var info, 30f))
                hit = info.collider.GetComponentInParent<Hotspot>();
            if (hit != hovered)
            {
                hovered = hit;
                WebBridge.Emit("hover", hit ? hit.id : "");
            }
        }

        void OnPress()
        {
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
            Activate(h.focusCamera);
            WebBridge.Emit("focus", h.id);
        }

        IEnumerator Enhance(Hotspot h)
        {
            if (h == null || state == State.Enhance) yield break;
            state = State.Enhance;
            WebBridge.Emit("enhance-start", h.id);
            var v = h.focusCamera;
            Quaternion from = v.transform.rotation;
            Vector3 aim = h.screen ? h.screen.transform.position : h.transform.position;
            Quaternion to = Quaternion.LookRotation(aim - v.transform.position);
            float fov0 = baseFov[v];
            if (h.screen) h.screen.enhanceRect = h.enhanceRect;
            float t = 0;
            float duration = reducedMotion ? 0.35f : enhanceDuration;
            while (t < 1f)
            {
                t += Time.unscaledDeltaTime / duration;
                // Anticipation: a slight pull back before the push in.
                float e = t < 0.18f ? -Mathf.Sin(t / 0.18f * Mathf.PI) * 0.04f : Mathf.SmoothStep(0, 1, (t - 0.18f) / 0.82f);
                var lens = v.Lens;
                lens.FieldOfView = Mathf.LerpUnclamped(fov0, h.enhanceFov, Mathf.Clamp(e, -0.1f, 1f));
                v.Lens = lens;
                v.transform.rotation = Quaternion.Slerp(from, to, Mathf.Clamp01(e * 1.4f));
                if (h.screen)
                {
                    h.screen.grid = Mathf.Clamp01(t * 3f);
                    h.screen.enhance = Mathf.SmoothStep(0, 1, Mathf.Clamp01((t - 0.35f) / 0.65f));
                }
                yield return null;
            }
            WebBridge.Emit("enhance", h.url);
            // If the page does not navigate (editor, blocked), settle back into focus.
            yield return new WaitForSecondsRealtime(2.5f);
            ResetEnhance(h);
            state = State.Focus;
        }

        void ResetEnhance(Hotspot h)
        {
            var v = h.focusCamera;
            var lens = v.Lens;
            lens.FieldOfView = baseFov[v];
            v.Lens = lens;
            v.transform.rotation = baseRotation[v];
            if (h.screen) { h.screen.enhance = 0; h.screen.grid = 0; }
        }

        // ---- page -> Unity ----

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
            Activate(overviewCamera);
            WebBridge.Emit("overview");
        }

        /// The opening: the camera eases in from the doorway while the title card is up.
        public void PlayIntro(string seconds)
        {
            if (reducedMotion) return;
            float.TryParse(seconds, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out float d);
            StartCoroutine(Intro(d > 0 ? d : 4.5f));
        }

        IEnumerator Intro(float duration)
        {
            intro = true;
            var t = overviewCamera.transform;
            Vector3 end = t.position;
            Quaternion endRot = baseRotation[overviewCamera];
            Vector3 start = end - endRot * Vector3.forward * 1.6f + Vector3.up * 0.12f;
            Quaternion startRot = endRot * Quaternion.Euler(4f, -6f, 0);
            float fovEnd = baseFov[overviewCamera];
            var lens = overviewCamera.Lens;
            for (float k = 0; k < 1f; k += Time.unscaledDeltaTime / duration)
            {
                float e = 1f - Mathf.Pow(1f - k, 3f);
                t.SetPositionAndRotation(Vector3.Lerp(start, end, e), Quaternion.Slerp(startRot, endRot, e));
                lens.FieldOfView = Mathf.Lerp(fovEnd - 6f, fovEnd, e);
                overviewCamera.Lens = lens;
                yield return null;
            }
            t.SetPositionAndRotation(end, endRot);
            lens.FieldOfView = fovEnd;
            overviewCamera.Lens = lens;
            intro = false;
        }

        public void SetFrameOffset(string degrees)
        {
            float.TryParse(degrees, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out frameOffset);
        }

        /// Look development: "x,y,z,tx,ty,tz,fov" re-aims the overview.
        public void DevCamera(string spec)
        {
            var f = System.Array.ConvertAll(spec.Split(','), v => float.Parse(v, System.Globalization.CultureInfo.InvariantCulture));
            var pos = new Vector3(f[0], f[1], f[2]);
            overviewCamera.transform.position = pos;
            baseRotation[overviewCamera] = Quaternion.LookRotation(new Vector3(f[3], f[4], f[5]) - pos);
            var lens = overviewCamera.Lens;
            lens.FieldOfView = f[6];
            overviewCamera.Lens = lens;
            baseFov[overviewCamera] = f[6];
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
            baseRotation[v] = v.transform.rotation;
            baseFov[v] = v.Lens.FieldOfView;
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
