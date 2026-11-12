import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { roundedBox, roundedPanel, softWall } from "./geometry";
import { lathe, tube, type Joints } from "./kit";
import { BotPerson, type HandPose, type Talk } from "./bot";
import { GuestbookBoard, type BoardNote, type PinStart } from "./guestbook";
import { Turntable } from "./turntable";
import { buildTune, progress, settleTime, type BuildTune } from "./buildTune";

type Person = BotPerson;
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { clone as cloneRig } from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * ESPER in three.js. Reads Live/scene.json (the same spec the Unity build used) and answers the same messages
 * the page sends (Goto, Back, Look, ApplyScene...), emitting the same "esper" window events back. A scene edit shows the moment it's saved.
 *
 * scene.json is authored in Unity's left-handed space (+Z north). Everything is built in those numbers under a
 * root mirrored in Z, so positions, rotations and the generated meshes carry over exactly.
 */

type Item = {
  id: string; group?: string; kind: string; src?: string; p?: number[]; r?: number[]; s?: number[];
  size?: number[]; material?: string; w?: number; h?: number; t?: number; path?: number[]; radius?: number; corner?: number;
  noShadows?: boolean; hidden?: boolean; tint?: number[]; station?: string; when?: string; flip?: number | number[]; cycle?: number;
  display?: {
    surface?: string; src?: string; floats?: Record<string, number>; active?: string[]; seconds?: number; activeBrightness?: number; lit?: boolean;
    /** A looping, muted video (a site path like /assets/...), always playing, fitted inside the panel on black. */
    video?: string;
    /** "top": the idle picture is cropped from its top edge rather than its centre. */
    align?: string;
    /** Follow a person's movement instead of a timer: `syncTo` names them, `frames` maps each of their key poses to
     *  one of the `active` pictures (the push-up class shows "up" while they're up, "down" while they're down). */
    sync?: { to: string; frames: number[] };
  };
  /** A child that rides on its person's chest bone (e.g. a viewer held to the face), so it turns with them. */
  attach?: string;
  /** person: turns to look around, up to this many degrees either way. */
  look?: number;
  /** person: the shape of each hand, [left, right]: relaxed, grip (a wheel), hold (a phone), rest (on an armrest). */
  hands?: string[];
  /** Never ghosts when another room is picked out (the house's outer walls). */
  solid?: boolean;
  /** person: one of the bodies by name (Eric, Carla, Claudia), when the role needs it (no heels for push-ups). */
  body?: string;
  /** person: "floor" puts the palms flat on the floor (push-ups). */
  palms?: string;
  /** person: now and then looks up from what they hold to what's in front of them. */
  glance?: boolean;
  /** person: the head drifts slowly around what they're watching (the driver taking in the road on the screen). */
  scan?: boolean;
  /** person: in conversation with someone beside them (see Talk in bot.ts). */
  talk?: Talk;
  /** person: wears this head instead of the rig's own (a model src), at this scale and offset (head frame, metres). */
  head?: { src: string; scale?: number; offset?: number[] };
  /** person: a print raised on the shirt ("hw": the HW mark). */
  emboss?: string;
  /** Rattles in short bursts while its room is in use (metres of jitter); its swung parts twitch too. */
  shake?: number;
  /** person: what their hands hold. phone (right hand) and wheel name the object; viewer is the one they carry. */
  grip?: { kind: "phone" | "wheel" | "viewer"; object?: string };
  /** model: named parts rotated (degrees), e.g. a fridge door open. */
  nodes?: Record<string, number[]>;
  /** screen: border around the image (m); torus: ring radius is `radius`, tube thickness `t`. */
  border?: number;
  /** lathe: [radius, height] pairs; tube: [x, y, z] points (diameter t); person: poses of joints. */
  profile?: number[];
  poses?: Joints[];
  wear?: { torso?: number[]; sleeves?: number[]; shorts?: number[] };
  /** model: scale it to this height (m) and stand it on the floor, centred on its footprint. */
  height?: number;
  /** Rest on top of this (top-level) item's real surface once everything has loaded. */
  on?: string;
  children?: Item[];
};
type Spec = {
  items: Item[];
  lights: { id: string; type: string; dir?: number[]; color?: number[]; intensity: number }[];
  views: { id: string; p: number[]; target: number[]; fov: number }[];
  /** hover: false for a place reached from inside another room (the guestbook), not picked from the overview. */
  stations: { id: string; url?: string; screen?: string; enter?: number[]; bounds?: number[]; hover?: boolean }[];
  look?: Record<string, number>;
};
type Rest = { pos: THREE.Vector3; fwd: THREE.Vector3; fov: number; pivot: THREE.Vector3 };
type Pose = { pos: THREE.Vector3; target: THREE.Vector3; fov: number };

const D2R = Math.PI / 180;

/** One thing the opening build moves into place: when its turn comes, and where and how big it is at rest. */
type BuildPiece = { obj: THREE.Object3D; at: number; wall: boolean; p0: THREE.Vector3; s0: THREE.Vector3; c: THREE.Vector3 };
const smooth01 = (x: number) => {
  const k = Math.max(0, Math.min(1, x));
  return k * k * (3 - 2 * k);
};
/** A wall's hologram: a glassy white shell (brighter at its silhouette, faint scanlines drifting up), shown only above
 *  the clay that's risen into it, with a bright print edge where the two meet. */
const HOLO_VS = /* glsl */ `
  varying float vY; varying vec3 vN; varying vec3 vV;
  void main() {
    vY = position.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;
const HOLO_FS = /* glsl */ `
  uniform float uRise; uniform float uAlpha; uniform float uT; uniform vec3 uAccent;
  uniform float uRim; uniform float uScan; uniform float uEdge;
  varying float vY; varying vec3 vN; varying vec3 vV;
  void main() {
    if (vY < uRise - 0.004) discard;
    float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
    float scan = smoothstep(0.6, 1.0, sin(vY * 70.0 - uT * 9.0) * 0.5 + 0.5);
    float edge = exp(-pow((vY - uRise) / 0.018, 2.0));
    float a = uAlpha * (0.07 + uRim * fres + uScan * scan) + edge * min(uAlpha * 2.0, 1.0);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uAccent * (1.0 + uEdge * edge), a);
  }`;

/** The HW mark (the favicon's six bars, as in EsperLogo), raised 2.5 mm: a print on a shirt. 7 cm across, facing +z. */
function hwMark(mat: THREE.Material) {
  const bars = [
    [[0, 0], [3, 0], [3, 16], [0, 16]],
    [[4, 4.6], [7, 1.6], [7, 14.6], [4, 14.6]],
    [[8, 0], [11, 0], [11, 16], [8, 16]],
    [[12, 0], [15, 0], [15, 16], [12, 16]],
    [[16, 4.6], [19, 1.6], [19, 16], [16, 16]],
    [[20, 0], [23, 0], [23, 16], [20, 16]],
  ];
  const k = 0.07 / 23;
  const shapes = bars.map((pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2((x - 11.5) * k, (8 - y) * k))));
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.0005, bevelSize: 0.0004, bevelSegments: 2 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
const UP = new THREE.Vector3(0, 1, 0);
/** Unity space -> three world (the root mirror, for things that live outside it). */
const toWorld = (v: THREE.Vector3) => new THREE.Vector3(v.x, v.y, -v.z);
const srgb = (c: number[]) => new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);

const PALETTE: Record<string, number[]> = {
  // Whites are neutral (no cream): the room reads as white clay under a neutral sun.
  WallWhite: [0.96, 0.96, 0.96], Floor: [0.92, 0.92, 0.92], Clay: [0.94, 0.94, 0.94], Figure: [0.74, 0.76, 0.8],
  Me: [0.16, 0.16, 0.18], Bezel: [0.94, 0.94, 0.94], Console: [0.94, 0.94, 0.94], Plinth: [0.94, 0.94, 0.94],
  DeskTop: [0.94, 0.94, 0.94], DeskLeg: [0.94, 0.94, 0.94],
  // Neutrals for a finished look without colour: a mid clay, soft fabric, dark graphite, satin metal.
  ClayMid: [0.84, 0.84, 0.84], Fabric: [0.9, 0.9, 0.9], Graphite: [0.16, 0.16, 0.17], Satin: [0.78, 0.78, 0.79],
  // The guestbook's corkboard: the one warm surface in the clay, so the paper notes have something to sit on.
  Cork: [0.8, 0.69, 0.53],
  // People.
  Skin: [0.86, 0.86, 0.85], Top: [0.7, 0.7, 0.7], Bottom: [0.42, 0.42, 0.43], Hair: [0.2, 0.2, 0.2], Shoes: [0.25, 0.25, 0.26],
};
/** The dark variant: the same house in charcoal clay; screens and the ghosts glow against it. */
const DARK_CLAY = [0.34, 0.34, 0.36];
const PALETTE_DARK: Record<string, number[]> = {
  ...PALETTE,
  WallWhite: [0.3, 0.3, 0.32], Floor: [0.24, 0.24, 0.26], Clay: DARK_CLAY, Bezel: DARK_CLAY, Console: DARK_CLAY, Plinth: DARK_CLAY,
  DeskTop: DARK_CLAY, DeskLeg: DARK_CLAY, ClayMid: [0.26, 0.26, 0.28], Fabric: [0.3, 0.3, 0.32], Cork: [0.42, 0.36, 0.28],
};
/** Things that give light (the fridge's lamp): emissive strength by theme, light and dark. */
const GLOW: Record<string, { color: number[]; light: number; dark: number }> = {
  Lamp: { color: [1, 1, 0.97], light: 0.9, dark: 1.6 },
};
/** A lamp also lights what's around it: a small, soft, shadowless point light just under it (candela; the sun is
 *  about 3 here, so this lifts the shelves and food without flooding the room). */
const LAMP_LIGHT = { color: [0.94, 0.97, 1], light: 0.35, dark: 0.6, range: 1.5 };
/** Screens big enough to light a room (TVs, monitors, the laptop, the projection; not phones or covers) throw a soft
 *  light the colour of what they show. Strength grows with the screen's size; it's stronger in the dark room. */
const SCREEN_LIGHT = { minArea: 0.05, light: 0.18, dark: 0.5 };
const FINISH: Record<string, { roughness: number; metalness: number }> = {
  Satin: { roughness: 0.32, metalness: 0.75 }, Graphite: { roughness: 0.45, metalness: 0.1 }, Bezel: { roughness: 0.4, metalness: 0.1 },
  Fabric: { roughness: 1, metalness: 0 }, Hair: { roughness: 0.75, metalness: 0 },
};
const SKY = [0.97, 0.97, 0.97], GROUND_COOL = [0.88, 0.88, 0.88], GROUND_WARM = [0.93, 0.91, 0.88];
const SUN_SCALE = 2.6, BOUNCE_SCALE = 2.2; // three's light units against the Unity-tuned look values

class Flip {
  t = 0;
  parts: THREE.Object3D[] = [];
  keys: { p: THREE.Vector3; q: THREE.Quaternion; len: number }[][] = [];
  constructor(public obj: THREE.Object3D, public seconds: number) {
    const poses = obj.children;
    const first = poses[0];
    const same = poses.length > 1 && poses.every((p) => p.children.length === first.children.length && p.children.every((c, j) => c.name === first.children[j].name));
    if (!same) return;
    this.parts = [...first.children];
    this.keys = poses.map((pose) => pose.children.map((c) => ({ p: c.position.clone(), q: c.quaternion.clone(), len: (c.userData.len as number) ?? 1 })));
  }
  update(dt: number) {
    const n = this.obj.children.length;
    if (n < 2 || this.seconds <= 0) return;
    this.t += dt;
    const phase = this.t / this.seconds;
    const k = Math.floor(phase) % n;
    if (!this.parts.length) {
      this.obj.children.forEach((c, i) => (c.visible = i === k));
      return;
    }
    this.obj.children.forEach((c, i) => (c.visible = i === 0));
    let f = phase - Math.floor(phase);
    f = f * f * (3 - 2 * f);
    const a = this.keys[k], b = this.keys[(k + 1) % n];
    this.parts.forEach((part, j) => {
      part.position.lerpVectors(a[j].p, b[j].p, f);
      part.quaternion.slerpQuaternions(a[j].q, b[j].q, f);
      const base = this.keys[0][j].len;
      part.scale.set(1, base > 1e-4 ? (a[j].len + (b[j].len - a[j].len) * f) / base : 1, 1);
    });
  }
}

class Cycle {
  t = 0;
  current = 0;
  pop = 1;
  constructor(public obj: THREE.Object3D, public seconds: number) {
    this.apply();
  }
  next() {
    this.current++;
    this.t = 0;
    this.pop = 0;
    this.apply();
  }
  apply() {
    const n = this.obj.children.length;
    this.obj.children.forEach((c, i) => {
      c.visible = i === this.current % n;
      if (!c.visible) c.scale.setScalar(1);
    });
  }
  update(dt: number) {
    if (!this.obj.children.length) return;
    if (this.seconds > 0 && (this.t += dt) >= this.seconds) this.next();
    if (this.pop < 1) {
      this.pop = Math.min(1, this.pop + dt / 0.32);
      const p = this.pop;
      const s = 1 + 0.1 * Math.sin(p * Math.PI * 1.25) * (1 - p) - 0.1 * (1 - p) * (1 - p);
      this.obj.children[this.current % this.obj.children.length].scale.setScalar(s);
    }
  }
}

/** The people: three Renderpeople bodies (exported without their textures), so they aren't all the same. Who gets
 *  which is fixed by their id. They're drawn as soft ghosts (see ghost()): gesture, not detail. */
const PEOPLE = ["rp:Eric", "rp:Carla", "rp:Claudia"];
const personModel = (id: string) => PEOPLE[[...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % PEOPLE.length];

type Display = {
  mat: THREE.MeshBasicMaterial; station?: string; idle?: THREE.Texture; frames: (THREE.Texture | undefined)[];
  seconds: number; idleB: number; activeB: number; aspect: number; t: number; i: number;
  /** A copy of the face just in front, that the next picture fades in on; then it becomes the face's picture. */
  over: THREE.MeshBasicMaterial;
  /** What the screen is showing or fading to (null: the device's own white), and how far the fade has got (1 = done). */
  shown: THREE.Texture | null; fade: number;
  /** Whether its room was in use when last shown, so the slideshow restarts only when that changes. */
  on: boolean;
  face: THREE.Mesh;
  sync?: { to: string; frames: number[] };
  /** The light the screen throws on what's in front of it: tinted by its picture, dark when it shows nothing. */
  glow?: ScreenGlow;
};

type ScreenGlow = { light: THREE.PointLight; base: number; to: number; color: THREE.Color; toColor: THREE.Color; video?: HTMLVideoElement; t: number };

export class EsperEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(6, 1, 1, 1000);
  private root = new THREE.Group();
  private world = new THREE.Group();
  private composer: EffectComposer;
  private gtao: GTAOPass;
  private sun = new THREE.DirectionalLight(0xffffff, 1);
  private hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  // Published models are Meshopt-compressed (scripts/compress-esper-models.mjs); dev serves them as authored.
  private loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  private models = new Map<string, Promise<GLTF | null>>();
  private textures = new Map<string, Promise<THREE.Texture | null>>();
  /** Dev reads straight from the Unity project; the live site from public/esper/assets (esper-unity/Tools/publish_web.py). */
  private assetBase = process.env.NODE_ENV === "production" ? "/esper/assets/" : "/api/esper-asset/";
  private raf = 0;
  private clock = new THREE.Clock();
  private observer: ResizeObserver;

  private flips: Flip[] = [];
  private persons: Person[] = [];
  private cycles: Cycle[] = [];
  private displays: Display[] = [];
  private staged: { obj: THREE.Object3D; station: string; when: string }[] = [];
  private stations = new Map<string, { url: string; hit: THREE.Mesh; enter?: THREE.Vector3; screen?: string }>();
  private screens = new Map<string, THREE.Object3D>();
  private views = new Map<string, Rest>();
  /** Focus fades everything outside the room: top-level objects, which room they belong to, walls by position. */
  private tops: { obj: THREE.Object3D; station: string; path?: number[] }[] = [];
  private stationBounds = new Map<string, number[]>();
  // The guestbook: its board (rebuilt with the scene), everyone's notes, and whether the pointer is over it.
  private board: GuestbookBoard | null = null;
  private guestbookNotes: BoardNote[] = [];
  private boardHover = false;
  // Record players, and the room each one plays for.
  private turntables: { deck: Turntable; station: string }[] = [];
  private faded = new Map<THREE.Material, THREE.Material>();
  private fade = { speed: 0.45 };
  /** People who come and go with a station fade in and out where they stand: opacity only, no movement. */
  private appears = new Map<THREE.Object3D, { to: number; wait: number }>();
  private popDelay = 0.3;
  private ready = false;
  private built = 0;

  // camera state
  private state: "overview" | "focus" | "enhance" = "overview";
  private focused: string | null = null;
  private activeStation: string | null = null;
  private look = new THREE.Vector2();
  private lookTarget = new THREE.Vector2();
  private blend: { from: Pose; t: number; duration: number } | null = null;
  private current: Pose | null = null;
  private moving: Pose | null = null;
  private intro = false;
  private reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private dark = false;
  private groundMat = new THREE.ShadowMaterial({ opacity: 0.16 });
  private paused = false;
  private frameOffset = 0;
  private lens = 0;
  private orbit = 40;
  private hovered = "";
  private uiHover = "";
  // input
  private pressing = false;
  private dragged = false;
  private pressAt = new THREE.Vector2();
  private last = new THREE.Vector2();
  private overUi = false;
  private enabled = true;
  private tool: "select" | "note" = "select";
  private raycaster = new THREE.Raycaster();

  // look
  private ambient = { level: 1.15, warm: 0.35 };
  private sunAngles = { yaw: 125, height: 55, warm: 0.25, strength: 1.6 };

  constructor(private canvas: HTMLCanvasElement, opts: { preserveDrawingBuffer?: boolean } = {}) {
    // Unpack the compressed models on worker threads, so the page (and the loading mark) keeps moving meanwhile.
    (MeshoptDecoder as { useWorkers?: (n: number) => void }).useWorkers?.(Math.min(4, Math.max(1, (navigator.hardwareConcurrency || 2) - 1)));
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: !!opts.preserveDrawingBuffer, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.shadowMap.enabled = true;
    // Variance shadows blur to a wide, soft penumbra: the airy look, not hard cut-outs.
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.scene.background = new THREE.Color("#ece9e4");

    this.root.scale.z = -1; // Unity's left-handed numbers, shown right-handed
    this.root.add(this.world);
    this.scene.add(this.root);

    // Ground: shows only the shadows and contact darkening, so the house sits on the page colour.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.002;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    const sc = this.sun.shadow.camera;
    sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 90;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.03;
    this.sun.shadow.radius = 22;
    this.sun.shadow.blurSamples = 25;
    this.scene.add(this.sun, this.sun.target, this.hemi);
    // Draws Gaussian splats (the Mighty Hand) in with everything else.
    this.scene.add(new SparkRenderer({ renderer: this.renderer }));
    this.applyAmbient();
    this.applySun();

    // Multisampled, so edges stay clean through the post passes.
    this.composer = new EffectComposer(this.renderer, new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType }));
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.gtao = new GTAOPass(this.scene, this.camera, 1, 1);
    this.gtao.blendIntensity = 1;
    this.gtao.updateGtaoMaterial({ radius: 0.7, distanceExponent: 1.2, thickness: 1.5, scale: 0.9, samples: 16 });
    this.gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
    this.composer.addPass(this.gtao);
    // The opening build's light-only layers (plan, holograms) cast no ambient occlusion: hide them from the
    // pass's normal render, as it already hides lines and points.
    const ao = this.gtao as unknown as { _overrideVisibility: () => void; _visibilityCache: THREE.Object3D[] };
    const hideLines = ao._overrideVisibility.bind(ao);
    ao._overrideVisibility = () => {
      hideLines();
      for (const o of this.noAO) {
        if (!o.visible) continue;
        o.visible = false;
        ao._visibilityCache.push(o);
      }
    };
    this.composer.addPass(new OutputPass());

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();

    canvas.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp);
    window.addEventListener("pointercancel", this.onCancel);
    document.addEventListener("pointerout", this.onLeave);
    canvas.addEventListener("contextmenu", this.onContext);
    this.raf = requestAnimationFrame(this.frame);
    if (process.env.NODE_ENV !== "production") (window as unknown as { __esper?: unknown }).__esper = this;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("pointercancel", this.onCancel);
    document.removeEventListener("pointerout", this.onLeave);
    this.canvas.removeEventListener("contextmenu", this.onContext);
    this.stopVideos();
    this.board?.dispose();
    for (const t of this.turntables) t.deck.dispose();
    this.composer.dispose();
    this.renderer.dispose();
  }

  /** A little colour, only in the room being looked at: each tinted thing eases from clay to its colour and back. */
  private tinted: { obj: THREE.Object3D; mats: THREE.MeshStandardMaterial[]; base: THREE.Color[]; tint: THREE.Color; k: number }[] = [];

  private tintable(obj: THREE.Object3D, tint: number[], out: typeof this.tinted) {
    const mats: THREE.MeshStandardMaterial[] = [];
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.material || m.name === "Screen" || m.name === "Video" || m.name === "Veil") return;
      const list = (Array.isArray(m.material) ? m.material : [m.material]).map((x) => x.clone() as THREE.MeshStandardMaterial);
      m.material = Array.isArray(m.material) ? list : list[0];
      for (const x of list) if (x.color) mats.push(x);
    });
    const c = new THREE.Color().setRGB(tint[0], tint[1], tint[2], THREE.SRGBColorSpace);
    out.push({ obj, mats, base: mats.map((x) => x.color.clone()), tint: c, k: 0 });
  }

  private roomOf(o: THREE.Object3D | null) {
    while (o && o.userData.room === undefined) o = o.parent;
    return (o?.userData.room as string | undefined) ?? "";
  }

  private updateTints(dt: number) {
    const lit = this.activeStation;
    for (const t of this.tinted) {
      const to = lit && this.roomOf(t.obj) === lit ? 1 : 0;
      if (t.k === to) continue;
      t.k = to > t.k ? Math.min(1, t.k + dt / 0.9) : Math.max(0, t.k - dt / 0.6);
      const e = t.k * t.k * (3 - 2 * t.k);
      t.mats.forEach((m, i) => m.color.copy(t.base[i]).lerp(t.tint, e));
    }
  }

  /** Things that rattle (a failing fridge): quiet, then a short burst of buzzing, only while their room is in use. */
  private shakers: { obj: THREE.Object3D; amp: number; base: THREE.Vector3; parts: THREE.Object3D[]; partY: number[] }[] = [];

  /** Failing lamps (the broken fridge's): steady most of the time, then a stutter of dropouts every few seconds. */
  private lamps: { light: THREE.PointLight; mat: THREE.MeshStandardMaterial; light0: number; glow0: number; t: number; next: number; burst: number }[] = [];
  private updateLamps(dt: number) {
    for (const l of this.lamps) {
      let k = 1;
      if (!this.reducedMotion) {
        l.t += dt;
        if (l.burst <= 0 && l.t >= l.next) {
          l.burst = 0.35 + Math.random() * 0.55; // a stutter lasts a fraction of a second
          l.t = 0;
        }
        if (l.burst > 0) {
          l.burst -= dt;
          // Uneven dropouts: mostly dim flicks, the odd full blackout, never a regular rhythm.
          const n = Math.sin(l.t * 61) * Math.sin(l.t * 23 + 1.7) + Math.sin(l.t * 97 + 0.4) * 0.5;
          k = n > 0.55 ? 0.08 : n > 0.1 ? 0.55 : 1;
          if (l.burst <= 0) {
            l.next = 2.5 + Math.random() * 5;
            l.t = 0;
          }
        }
      }
      l.light.intensity = l.light0 * k;
      l.mat.emissiveIntensity = l.glow0 * (0.25 + 0.75 * k);
    }
  }
  private shakeT = 0;

  private updateShakers(dt: number) {
    this.shakeT += dt;
    const t = this.shakeT;
    // A burst of about 0.9 s every 2.8 s, easing in and out.
    const ph = (t % 2.8) / 0.9;
    const env = ph < 1 ? Math.sin(Math.PI * ph) : 0;
    for (const s of this.shakers) {
      const on = !this.reducedMotion && !!this.activeStation && this.roomOf(s.obj) === this.activeStation;
      const k = on ? env : 0;
      const n = (f: number, p: number) => Math.sin(t * f + p) * 0.6 + Math.sin(t * f * 1.7 + p * 2.3) * 0.4;
      s.obj.position.set(s.base.x + s.amp * k * n(61, 0.3), s.base.y, s.base.z + s.amp * k * n(53, 1.1));
      s.obj.rotation.z = 0.0025 * k * n(47, 2.0);
      s.parts.forEach((o, i) => (o.rotation.y = s.partY[i] + 0.022 * k * n(38 + i * 5, i * 1.9)));
    }
  }

  /**
   * People as soft ghosts: a milky, slightly see-through body with no surface detail, brightening toward its
   * silhouette (a fresnel rim), so a figure reads as a gesture rather than a particular person.
   */
  private ghostMat: THREE.MeshStandardMaterial | null = null;
  private ghostUniform = { value: 0 };
  private themeMix = 0;
  private themeTarget = 0;
  private ghost() {
    if (this.ghostMat) return this.ghostMat;
    this.ghostUniform.value = this.themeMix;
    const uDark = this.ghostUniform;
    const m = new THREE.MeshStandardMaterial({
      color: srgb([0.86, 0.86, 0.85]).lerp(srgb([0.4, 0.405, 0.42]), this.themeMix),
      roughness: 1,
      metalness: 0,
    });
    m.userData.baseOpacity = 1;
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uDark = uDark;
      shader.fragmentShader = "uniform float uDark;\n" + shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float rim = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0), 2.2);
        vec3 flatCol = mix(vec3(0.8, 0.81, 0.83), vec3(0.36, 0.365, 0.38), uDark);
        vec3 rimCol = mix(vec3(0.98, 0.98, 0.99), vec3(0.62, 0.63, 0.66), uDark);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, flatCol, 0.45);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, rimCol, rim * 0.55);`,
      );
    };
    m.customProgramCacheKey = () => "esper-ghost-blend";
    this.ghostMat = m;
    return m;
  }

  /** People whose hands go to something; placed once that thing (often a model still loading) is in the scene. */
  private holders: { bot: BotPerson; it: Item; obj: THREE.Object3D }[] = [];
  private items = new Map<string, Item>();

  private placeHands() {
    this.holders = this.holders.filter(({ bot, it, obj }) => {
      const g = it.grip!;
      const target = g.object ? this.screens.get(g.object) : obj.getObjectByName("headset");
      if (!target) return true;
      target.updateWorldMatrix(true, true);
      if (g.kind === "phone") {
        const ph = this.items.get(g.object!);
        const m = target.matrixWorld;
        const x = new THREE.Vector3(), y = new THREE.Vector3(), z = new THREE.Vector3();
        m.extractBasis(x, y, z);
        bot.holdPhone(target.getWorldPosition(new THREE.Vector3()), y.normalize(), z.normalize().negate(), { w: ph?.w ?? 0.075, h: ph?.h ?? 0.155, t: ph?.t ?? 0.009 });
        return false;
      }
      if (g.kind === "wheel") {
        let torus: THREE.Mesh | null = null;
        target.traverse((o) => {
          if (!torus && (o as THREE.Mesh).isMesh && o.parent?.name === "Rim" && o.name === "Torus") torus = o as THREE.Mesh;
        });
        if (!torus) return true; // still loading
        const t = torus as THREE.Mesh;
        t.geometry.computeBoundingBox();
        const b = t.geometry.boundingBox!;
        const tube = b.max.y, ring = b.max.x - tube; // a torus about its own Y
        const centre = t.localToWorld(new THREE.Vector3());
        const normal = t.localToWorld(new THREE.Vector3(0, 1, 0)).sub(centre).normalize();
        const radius = t.localToWorld(new THREE.Vector3(ring, 0, 0)).distanceTo(centre);
        bot.holdWheel(centre, normal, radius);
        return false;
      }
      bot.holdViewer(target.getWorldPosition(new THREE.Vector3()), 0.19);
      return false;
    });
  }

  private videos: HTMLVideoElement[] = [];
  /** Everything the current build is waiting on (pictures join as screens ask for them). */
  private loads: Promise<unknown>[] = [];
  private stopVideos() {
    for (const v of this.videos) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    this.videos = [];
  }

  private emit(event: string, payload = "") {
    window.dispatchEvent(new CustomEvent("esper", { detail: { event, payload } }));
  }

  /** The page's messages, as the Unity player took them. */
  send(method: string, value = "") {
    switch (method) {
      case "ApplyScene": return this.applyScene(JSON.parse(value) as Spec);
      case "Goto": return this.select(value);
      case "Enhance": return this.enhance(value || this.focused || "");
      case "Back": return this.back();
      case "Look": return this.applyLook(value);
      case "NextActivity": return this.cycles.forEach((c) => c.next());
      case "SetPointerOverUi": this.overUi = value === "1"; return;
      case "SetFrameOffset": this.frameOffset = parseFloat(value) || 0; return;
      case "SetReducedMotion": this.reducedMotion = value === "1"; return;
      // A case study sheet covers the room: stop drawing it until the sheet closes.
      case "SetPaused": this.paused = value === "1"; return;
      case "Hover":
        this.uiHover = value;
        if (this.state === "overview" && !this.building) this.setHover(value);
        return;
      case "SetTheme":
        this.setTheme(value === "dark");
        return;
      case "SetAssetBase": this.assetBase = value; return;
      case "PlayIntro": return this.playIntro(parseFloat(value) || undefined);
      case "ReplayBuild": return this.replayBuild();
      case "Enable": this.enabled = value !== "1"; return;
      case "SetTool": this.tool = value === "note" ? "note" : "select"; return;
      case "GuestbookNotes":
        this.guestbookNotes = JSON.parse(value) as BoardNote[];
        this.board?.setNotes(this.guestbookNotes);
        return;
      case "GuestbookPin": return this.guestbookPin(value);
      case "GuestbookUnpin":
        this.guestbookNotes = this.guestbookNotes.filter((n) => n.id !== value);
        return this.board?.unpin(value);
      case "GuestbookFinish": return this.board?.finish();
      default: return; // Studio's move and fly tools are Unity-only for now.
    }
  }

  private setTheme(dark: boolean) {
    this.dark = dark;
    this.themeTarget = dark ? 1 : 0;
    if (!this.materials.size && !this.clays.size && !this.persons.length) {
      this.themeMix = this.themeTarget;
      this.ghostUniform.value = this.themeMix;
      this.scene.background = new THREE.Color(this.dark ? "#232325" : "#ece9e4"); // tone mapping darkens it to the page colour
      this.groundMat.opacity = this.dark ? 0.45 : 0.16;
      this.ghostMat = null;
      return;
    }
    if (this.reducedMotion) {
      const prev = this.themeMix * this.themeMix * (3 - 2 * this.themeMix);
      this.themeMix = this.themeTarget;
      this.applyThemeMix(prev, this.themeTarget);
    }
  }

  private updateTheme(dt: number) {
    if (this.themeMix === this.themeTarget) return;
    const prev = this.themeMix;
    const duration = 0.5;
    this.themeMix = this.themeTarget > prev
      ? Math.min(this.themeTarget, prev + dt / duration)
      : Math.max(this.themeTarget, prev - dt / duration);
    const prevE = prev * prev * (3 - 2 * prev);
    const nextE = this.themeMix * this.themeMix * (3 - 2 * this.themeMix);
    this.applyThemeMix(prevE, nextE);
  }

  private applyThemeMix(prevK: number, k: number) {
    if (!(this.scene.background instanceof THREE.Color)) this.scene.background = new THREE.Color();
    this.scene.background.set("#ece9e4").lerp(new THREE.Color("#232325"), k);
    this.groundMat.opacity = 0.16 + (0.45 - 0.16) * k;
    for (const [key, m] of this.materials) {
      const name = key.split(":")[0];
      const glow = GLOW[name];
      if (glow) {
        m.color.copy(srgb(glow.color)).lerp(srgb([0.82, 0.83, 0.86]), k);
        m.emissive.copy(srgb(glow.color));
        m.emissiveIntensity = glow.light + (glow.dark - glow.light) * k;
      } else {
        m.color.copy(srgb(PALETTE[name] ?? PALETTE.Clay)).lerp(srgb(PALETTE_DARK[name] ?? PALETTE_DARK.Clay), k);
      }
    }
    for (const m of this.clays.values()) {
      const name = (m.userData.matName as string) || "Clay";
      m.color.copy(srgb(PALETTE[name] ?? PALETTE.Clay)).lerp(srgb(PALETTE_DARK[name] ?? PALETTE_DARK.Clay), k);
    }
    for (const t of this.tinted) {
      const e = t.k * t.k * (3 - 2 * t.k);
      t.mats.forEach((m, i) => {
        const name = (m.userData.matName as string) || "Clay";
        t.base[i].copy(srgb(PALETTE[name] ?? PALETTE.Clay)).lerp(srgb(PALETTE_DARK[name] ?? PALETTE_DARK.Clay), k);
        m.color.copy(t.base[i]).lerp(t.tint, e);
      });
    }
    this.world.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const orig = (mesh.userData.orig ?? mesh.material) as THREE.MeshStandardMaterial;
      const ghost = mesh.userData.ghost as THREE.MeshStandardMaterial | undefined;
      if (ghost && orig?.color && ghost.color) {
        ghost.color.copy(orig.color);
        if (orig.emissive && ghost.emissive) {
          ghost.emissive.copy(orig.emissive);
          ghost.emissiveIntensity = orig.emissiveIntensity;
        }
      }
    });
    for (const l of this.lamps) {
      l.light0 = LAMP_LIGHT.light + (LAMP_LIGHT.dark - LAMP_LIGHT.light) * k;
      l.glow0 = GLOW.Lamp.light + (GLOW.Lamp.dark - GLOW.Lamp.light) * k;
    }
    const prevScreen = SCREEN_LIGHT.light + (SCREEN_LIGHT.dark - SCREEN_LIGHT.light) * prevK;
    const nextScreen = SCREEN_LIGHT.light + (SCREEN_LIGHT.dark - SCREEN_LIGHT.light) * k;
    if (prevScreen > 0 && nextScreen !== prevScreen) {
      const scale = nextScreen / prevScreen;
      for (const g of this.videoGlows) {
        g.base *= scale;
        g.to *= scale;
      }
      for (const d of this.displays) {
        if (d.glow) {
          d.glow.base *= scale;
          d.glow.to *= scale;
        }
      }
    }
    this.ghostUniform.value = k;
    if (this.ghostMat) {
      this.ghostMat.color.copy(srgb([0.86, 0.86, 0.85])).lerp(srgb([0.4, 0.405, 0.42]), k);
      for (const p of this.persons) {
        p.group.traverse((o) => {
          const see = (o as THREE.Mesh).userData?.see as THREE.MeshStandardMaterial[] | undefined;
          if (see) for (const x of see) if (x.color) x.color.copy(this.ghostMat!.color);
        });
      }
    }
  }

  // ---------------- scene ----------------

  private applyScene(spec: Spec) {
    this.finishBuild(false);
    for (const t of this.turntables) t.deck.dispose();
    this.turntables = [];
    const build = ++this.built;
    this.stopVideos();
    this.loads = [];
    this.shakers = [];
    this.lamps = [];
    this.videoGlows = [];
    const next = new THREE.Group();
    const flips: Flip[] = [], cycles: Cycle[] = [], displays: Display[] = [], staged: typeof this.staged = [];
    const persons: Person[] = [];
    const tinted: typeof this.tinted = [];
    const screens = new Map<string, THREE.Object3D>();
    const pending: Promise<void>[] = [];
    // People stay hidden until a room wakes, so the room doesn't wait for them (they're the heaviest downloads).
    const later: Promise<void>[] = [];

    const make = (it: Item, parent: THREE.Object3D, me: boolean, top: boolean) => {
      let obj: THREE.Object3D;
      const isMe = me || it.group === "Me" || !!it.id?.startsWith("me/");
      const mat = (name?: string, tint?: number[]) => this.material(name ?? "Clay", isMe ? tint : undefined);
      switch (it.kind) {
        case "box": {
          const size = (it.size ?? [0.1, 0.1, 0.1]) as [number, number, number];
          const geo = it.radius && it.radius > 0 ? roundedBox(size, it.corner && it.corner > 0 ? it.corner : it.radius, it.radius) : new THREE.BoxGeometry(...size);
          obj = new THREE.Mesh(geo, mat(it.material, it.tint));
          obj.userData.len = size[1];
          if (it.material === "Lamp") {
            const lamp = new THREE.PointLight(srgb(LAMP_LIGHT.color), this.dark ? LAMP_LIGHT.dark : LAMP_LIGHT.light, LAMP_LIGHT.range, 2);
            lamp.position.set(0, -0.08, 0);
            obj.add(lamp);
            const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
            this.lamps.push({ light: lamp, mat: m, light0: lamp.intensity, glow0: m.emissiveIntensity, t: 0, next: 1.5 + Math.random() * 3, burst: 0 });
          }
          break;
        }
        case "wall":
          obj = new THREE.Mesh(softWall(it.path ?? [0, 0, 1, 0], it.h || 1, it.t || 0.16), this.material(it.material ?? "WallWhite"));
          break;
        case "screen": {
          // A soft device: the image inset in a rounded body, its corners following the body's.
          obj = new THREE.Group();
          const w = it.w ?? 1, h = it.h ?? 1, border = it.border ?? 0.018, depth = it.t ?? 0.03;
          const bodyR = it.corner ?? Math.min(0.06, Math.min(w, h) * 0.08 + border);
          const face = new THREE.Mesh(roundedPanel(w, h, Math.max(0.002, bodyR - border)), new THREE.MeshBasicMaterial());
          face.name = "Screen";
          face.position.z = -depth / 2 - 0.0015;
          // The rounded box rounds its corners in the XZ plane, so build it lying down and stand it up: then the
          // body's corners and the image's corners share one centre.
          const body = new THREE.Mesh(roundedBox([w + 2 * border, depth, h + 2 * border], bodyR, Math.min(depth / 2, 0.01)), this.material(it.material ?? "Clay"));
          body.rotation.x = Math.PI / 2;
          obj.add(face, body);
          break;
        }
        case "lathe":
          obj = new THREE.Mesh(lathe(it.profile ?? [0, 0, 0.1, 0, 0.1, 0.1, 0, 0.1]), mat(it.material, it.tint));
          break;
        case "tube": {
          const tb = tube(it.path ?? [0, 0, 0, 0, 1, 0], it.t ?? 0.03);
          obj = tb.group;
          const tm = mat(it.material ?? "Satin", it.tint);
          for (const g of tb.geometries) obj.add(new THREE.Mesh(g, tm));
          break;
        }
        case "person": {
          // A real rigged mannequin, posed from the joints.
          obj = new THREE.Group();
          const holder = obj;
          const poses = it.poses ?? [];
          const secs = it.flip ?? 0;
          later.push(
            // body: one of the Renderpeople by name, or a model of its own (Hridae's, in a plain top).
            this.model(it.body ? (it.body.includes(":") ? it.body : `rp:${it.body}`) : personModel(it.id ?? "")).then((g) => {
              if (!g || build !== this.built) return;
              const rig = cloneRig(g.scene);
              // Visitors are ghosts; a person given a material (Hridae, in his room) is solid.
              const solid = it.material ? this.material(it.material) : null;
              rig.traverse((o) => {
                const m = o as THREE.Mesh;
                if (m.isMesh) m.material = solid ?? this.ghost();
              });
              const seed = [...(it.id ?? "")].reduce((h, c) => (h * 33 + c.charCodeAt(0)) % 1000, 5) / 1000;
              const hands = (it.hands ?? []) as HandPose[];
              const bot: Person = new BotPerson(rig, poses, secs, it.look ?? 0, [hands[0] ?? "relaxed", hands[1] ?? "relaxed"], seed, {
                palmsDown: it.palms === "floor",
                glance: !!it.glance,
                scan: !!it.scan,
                talk: it.talk,
              });
              if (it.head) {
                const hd = it.head;
                later.push(
                  this.model(hd.src).then((h) => {
                    if (!h || build !== this.built) return;
                    const head = h.scene.clone(true);
                    head.traverse((c) => {
                      if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = solid ?? this.ghost();
                    });
                    bot.wearHead(head, { scale: hd.scale, offset: hd.offset });
                    this.refade(holder);
                  }),
                );
              }
              // The mark a shade darker than the clay, so it reads at the room's distance as well as up close.
              if (it.emboss === "hw") bot.emboss(hwMark(this.material("ClayMid")), { left: 0.085, up: 0.035 });
              holder.add(bot.group);
              holder.updateMatrixWorld(true);
              for (const c of [...holder.children]) if (c.userData.attach) bot.carry(c);
              if (it.grip) this.holders.push({ bot, it, obj: holder });
              this.persons.push(bot);
              this.refade(holder);
              // Arriving after the reveal: get its shaders ready now, against the room's lights, so its first
              // appearance doesn't hitch.
              if (this.ready) this.renderer.compileAsync(bot.group, this.camera, this.scene).catch(() => {});
            }),
          );
          break;
        }
        case "splat": {
          // A real Gaussian splat (Content/...splat), Y-up, base at 0, one unit tall: scale it with `s`.
          obj = new THREE.Group();
          const holder = new THREE.Group();
          holder.scale.z = -1; // the splat is right-handed; undo the scene's mirror
          const splat = new SplatMesh({ url: `${this.assetBase}Esper/${it.src}` });
          splat.userData.splat = true;
          pending.push(splat.initialized.then(() => undefined).catch(() => undefined));
          holder.add(splat);
          obj.add(holder);
          break;
        }
        case "torus": {
          const R = it.radius ?? 0.2, tube = (it.t ?? 0.03) / 2;
          obj = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 16, 48), mat(it.material, it.tint));
          break;
        }
        case "model": {
          obj = new THREE.Group();
          const holder = obj;
          pending.push(
            this.model(it.src ?? "").then((g) => {
              if (!g || build !== this.built) return;
              // glTF is right-handed; Unity's importer flips X, so do the same to match the authored rotations.
              const flip = new THREE.Group();
              flip.scale.x = -1;
              const inst = g.scene.clone(true);
              inst.traverse((o) => {
                const m = o as THREE.Mesh;
                if (!m.isMesh) return;
                m.castShadow = !it.noShadows;
                m.receiveShadow = true;
                // No colour: white clay, but keep the model's own surface detail.
                const mats = Array.isArray(m.material) ? m.material : [m.material];
                const clay = mats.map((orig) => this.clayFor(orig as THREE.MeshStandardMaterial, it.material));
                m.material = Array.isArray(m.material) ? clay : clay[0];
              });
              flip.add(inst);
              if (it.height) {
                flip.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(flip);
                const size = box.getSize(new THREE.Vector3());
                const k = it.height / Math.max(1e-4, size.y);
                flip.scale.multiplyScalar(k);
                const c = box.getCenter(new THREE.Vector3());
                flip.position.set(-c.x * k, -box.min.y * k, -c.z * k);
              }
              // Parts set at an angle (a door swung open), in degrees about the part's own pivot. After fitting, so
              // an open door doesn't shift the fit.
              for (const [name, r] of Object.entries(it.nodes ?? {})) {
                const n = inst.getObjectByName(name);
                if (n) n.rotation.set((r[0] * Math.PI) / 180, (r[1] * Math.PI) / 180, (r[2] * Math.PI) / 180);
              }
              holder.add(flip);
              if (it.tint) this.tintable(holder, it.tint, this.tinted);
              if (it.shake) {
                const parts = Object.keys(it.nodes ?? {}).map((n) => inst.getObjectByName(n)).filter(Boolean) as THREE.Object3D[];
                this.shakers.push({ obj: holder, amp: it.shake, base: holder.position.clone(), parts, partY: parts.map((o) => o.rotation.y) });
              }
              this.refade(holder);
              if (it.display) this.attachDisplay(it, holder, displays);
            }),
          );
          break;
        }
        case "turntable": {
          // Modelled in code (three/turntable.ts); `src` is the record's label art.
          const deck = new Turntable((name) => this.material(name), this.texture(it.src ?? "Content/Albums/motm2_front.jpg"));
          this.turntables.push({ deck, station: stationOf.get(it.id) ?? it.station ?? "" });
          obj = deck.object;
          break;
        }
        default:
          obj = new THREE.Group();
      }
      obj.name = it.id?.split("/").pop() ?? it.kind;
      obj.userData.id = it.id;
      const p = it.p ?? [0, 0, 0], r = it.r ?? [0, 0, 0];
      obj.position.set(p[0], p[1], p[2]);
      obj.rotation.set(r[0] * D2R, r[1] * D2R, r[2] * D2R, "YXZ");
      if (it.s) it.s.length === 1 ? obj.scale.setScalar(it.s[0]) : obj.scale.set(it.s[0], it.s[1], it.s[2]);
      obj.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          o.castShadow = !it.noShadows;
          o.receiveShadow = true;
        }
      });
      if (it.hidden) obj.visible = false;
      if (it.attach) obj.userData.attach = it.attach;
      parent.add(obj);
      for (const c of it.children ?? []) make(c, obj, isMe, false);
      if (it.kind === "screen" && it.display) this.attachDisplay(it, obj, displays);
      if (typeof it.flip === "number" && it.flip > 0 && it.kind !== "person") flips.push(new Flip(obj, it.flip));
      // A built thing that rattles (the fridge): the whole body buzzes, its doors twitch on their hinges.
      if (it.shake && it.kind !== "model") {
        const parts = obj.children.filter((c) => c.name.startsWith("door"));
        this.shakers.push({ obj, amp: it.shake, base: obj.position.clone(), parts, partY: parts.map((o) => o.rotation.y) });
      }
      if (it.cycle && it.cycle > 0) cycles.push(new Cycle(obj, it.cycle));
      if (it.station) staged.push({ obj, station: it.station, when: it.when ?? "" });
      if (it.tint && it.kind !== "model") this.tintable(obj, it.tint, tinted);
      if (top) {
        obj.userData.room = stationOf.get(it.id) ?? it.station ?? "";
        screens.set(it.id, obj);
        // People only show while their own room is in front, so they never ghost; they fade on their own.
        if (it.when !== "active" && !it.solid) tops.push({ obj, station: stationOf.get(it.id) ?? "", path: it.kind === "wall" ? it.path : undefined });
      }
    };
    const tops: typeof this.tops = [];
    const stationOf = new Map<string, string>();
    for (const st of spec.stations) for (const id of (st as { items?: string[] }).items ?? []) stationOf.set(id, st.id);
    for (const it of spec.items) make(it, next, false, true);
    const resting = spec.items.filter((it) => it.on);

    // Stations: an invisible box per room to hover and click.
    const stations = new Map<string, { url: string; hit: THREE.Mesh; enter?: THREE.Vector3; screen?: string }>();
    const hitMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
    for (const st of spec.stations) {
      const b = st.bounds ?? [0, 1, 0, 1, 1, 1];
      const hit = new THREE.Mesh(new THREE.BoxGeometry(b[3], b[4], b[5]), hitMat);
      hit.position.set(b[0], b[1], b[2]);
      hit.userData.station = st.id;
      hit.userData.noHover = st.hover === false;
      next.add(hit);
      stations.set(st.id, { url: st.url ?? "", hit, enter: st.enter ? new THREE.Vector3(...(st.enter as [number, number, number])) : undefined, screen: st.screen });
    }

    this.root.remove(this.world);
    this.world = next;
    this.root.add(next);
    this.flips = flips;
    this.persons = persons; // rigs join as they load
    this.tinted = tinted;
    this.holders = [];
    this.items = new Map(spec.items.map((i) => [i.id, i]));
    this.cycles = cycles;
    this.displays = displays;
    this.staged = staged;
    this.stations = stations;
    this.screens = screens;
    this.tops = tops;
    this.stationBounds = new Map(spec.stations.map((st) => [st.id, st.bounds ?? [0, 0, 0, 0, 0, 0]]));
    this.board?.dispose();
    this.board = null;
    let cork: THREE.Object3D | null = null;
    next.traverse((o) => {
      if (o.userData.id === "taste/guestbook") cork = o;
    });
    if (cork) {
      this.board = new GuestbookBoard(cork, {
        dark: this.dark,
        anisotropy: Math.min(8, this.renderer.capabilities.getMaxAnisotropy()),
        onLaunch: () => this.emit("guestbook-launch"),
        onLand: () => this.emit("guestbook-land"),
        onPop: () => this.emit("guestbook-pop"),
      });
      this.board.lastViewport = this.canvas.clientHeight || 900;
      this.board.setNotes(this.guestbookNotes);
    }
    this.appears.clear();
    this.applyStations();
    if (this.focused) this.setFade(this.focused);
    // Nothing shows until the room is in: models, pictures and the splat, placed and compiled. People follow.
    let done = 0;
    const all = [...pending, ...this.loads];
    for (const p of all) p.then(() => this.emit("progress", String(++done / all.length))).catch(() => {});
    // On a slow connection, don't hold the room hostage to one straggler: show it after 15 s; late pieces fill in.
    const patience = new Promise<void>((r) => window.setTimeout(r, 15000));
    // Whenever everything has arrived (even after the reveal), set things down on what they rest on.
    Promise.all(all).then(() => {
      if (build === this.built) for (const it of resting) this.restOn(screens.get(it.id), screens.get(it.on!));
    });
    Promise.race([Promise.all(all), patience]).then(async () => {
      if (build !== this.built) return;
      for (const it of resting) this.restOn(screens.get(it.id), screens.get(it.on!));
      // Compile with everyone shown, so the people (hidden until a room wakes) don't hitch on their first hover.
      const hidden = this.staged.filter((st) => !st.obj.visible);
      for (const st of hidden) st.obj.visible = true;
      try {
        await this.renderer.compileAsync(this.scene, this.camera);
      } catch {}
      for (const st of hidden) st.obj.visible = false;
      if (build !== this.built) return;
      if (!this.ready && this.state === "overview" && !this.reducedMotion) {
        this.startBuild(spec, screens, stationOf);
        this.playIntro();
      }
      // Two frames on screen behind the cover, so the first thing seen is a finished picture.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (!this.ready) {
        this.ready = true;
        this.emit("ready");
        if (!this.building) this.showChrome();
      }
    });

    // Views.
    for (const v of spec.views) {
      const pos = new THREE.Vector3(...(v.p as [number, number, number]));
      const target = new THREE.Vector3(...(v.target as [number, number, number]));
      const fwd = target.clone().sub(pos).normalize();
      // Turns happen about what the view looks at.
      this.views.set(v.id, { pos, fwd, fov: v.fov, pivot: target });
    }

    // Lights and look.
    const sun = spec.lights.find((l) => l.id === "CityLight");
    if (sun) {
      this.sunAngles.strength = sun.intensity;
      if (sun.dir) {
        const d = new THREE.Vector3(...(sun.dir as [number, number, number])).normalize();
        this.sunAngles.height = Math.asin(-d.y) / D2R;
        this.sunAngles.yaw = Math.atan2(d.x, d.z) / D2R;
      }
      if (sun.color) this.sun.color = srgb(sun.color);
    }
    this.applySun();
    if (spec.look) this.applyLook(Object.entries(spec.look).map(([k, v]) => `${k}=${v}`).join(";"));

    this.emit("studio-scene", JSON.stringify({ objects: spec.items.map((i) => i.id), lights: [], views: spec.views.map((v) => v.id) }));
  }

  private clays = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  /** White clay that keeps a model's normal and roughness detail, so real models don't go flat. */
  private clayFor(orig: THREE.MeshStandardMaterial, name?: string) {
    const key = orig;
    let m = this.clays.get(key);
    if (!m) {
      const base = this.material(name ?? "Clay");
      m = base.clone();
      m.userData.matName = name ?? "Clay";
      if (orig?.normalMap) {
        m.normalMap = orig.normalMap;
        m.normalScale = orig.normalScale?.clone() ?? new THREE.Vector2(1, 1);
      }
      if (orig?.aoMap) m.aoMap = orig.aoMap;
      this.clays.set(key, m);
    }
    return m;
  }

  /** Sets an object down on the highest surface of another, right under it. */
  private restOn(obj?: THREE.Object3D, base?: THREE.Object3D) {
    if (!obj || !base) return;
    this.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const centre = box.getCenter(new THREE.Vector3());
    const ray = new THREE.Raycaster(new THREE.Vector3(centre.x, 10, centre.z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(base, true)[0];
    if (!hit) return;
    obj.position.y += hit.point.y - box.min.y + 0.001;
  }

  /** Something loaded after a fade started: give it the fade too. */
  private refade(o: THREE.Object3D) {
    let top: THREE.Object3D | null = o;
    while (top && top.parent !== this.world) top = top.parent;
    if (top && top.userData.fadeAt !== undefined && top.userData.fadeAt < 1) {
      const to = top.userData.fadeTo;
      top.userData.fadeAt = 1;
      top.userData.fadeTo = to;
    }
  }

  private materials = new Map<string, THREE.MeshStandardMaterial>();
  /** No colour anywhere for now: tints are ignored, everything takes its named neutral. */
  private material(name: string, _tint?: number[]) {
    const tint = undefined as number[] | undefined;
    const key = tint ? `${name}:${tint.join(",")}` : name;
    let m = this.materials.get(key);
    if (!m) {
      const fin = FINISH[name] ?? { roughness: 0.9, metalness: 0 };
      const pal = this.dark ? PALETTE_DARK : PALETTE;
      m = new THREE.MeshStandardMaterial({ color: srgb(tint ?? pal[name] ?? pal.Clay), ...fin });
      m.userData.matName = name;
      const glow = GLOW[name];
      if (glow) {
        m.color = srgb(this.dark ? [0.82, 0.83, 0.86] : glow.color);
        m.emissive = srgb(glow.color);
        m.emissiveIntensity = this.dark ? glow.dark : glow.light;
      }
      this.materials.set(key, m);
    }
    return m;
  }

  private url(src: string) {
    if (src.startsWith("ph:")) {
      const id = src.slice(3);
      return `${this.assetBase}ThirdParty/PolyHaven/Models/${id}/${id}_2k.gltf`;
    }
    if (src.startsWith("esper:")) return `${this.assetBase}Esper/Models/${src.slice(6)}.glb`;
    if (src.startsWith("kenney:")) return `${this.assetBase}ThirdParty/Kenney/${src.slice(7)}.glb`;
    if (src.startsWith("rp:")) return `${this.assetBase}ThirdParty/Renderpeople/${src.slice(3)}.glb`;
    return this.assetBase + src;
  }

  private model(src: string) {
    let p = this.models.get(src);
    if (!p) {
      p = this.loader.loadAsync(this.url(src)).catch(() => {
        console.warn(`[esper] missing model ${src}`);
        return null;
      });
      this.models.set(src, p);
    }
    return p;
  }

  private texture(src: string) {
    let p = this.textures.get(src);
    if (!p) {
      p = new THREE.TextureLoader()
        .loadAsync(`${this.assetBase}Esper/${src}`)
        .then((t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 4;
          return t;
        })
        .catch(() => null);
      this.textures.set(src, p);
    }
    this.loads.push(p);
    return p;
  }

  private attachDisplay(it: Item, obj: THREE.Object3D, out: Display[]) {
    const d = it.display!;
    const surface = d.surface ?? "Screen";
    let face: THREE.Mesh | null = null;
    obj.traverse((o) => {
      if (!face && (o as THREE.Mesh).isMesh && (o.name === surface || o.name.startsWith(surface))) face = o as THREE.Mesh;
    });
    if (!face) return;
    if (d.video) {
      this.attachVideo(it, face, d.video);
      return;
    }
    // Screens glow; prints (covers, photos) take the room's light.
    const mat = (d.lit ? new THREE.MeshStandardMaterial({ roughness: 0.6 }) : new THREE.MeshBasicMaterial({ toneMapped: false })) as unknown as THREE.MeshBasicMaterial;
    (face as THREE.Mesh).material = mat;
    (face as THREE.Mesh).castShadow = false;
    const b = d.floats?._Brightness ?? 1;
    const disp: Display = {
      mat, station: it.station, frames: [], seconds: d.seconds && d.seconds > 0 ? d.seconds : 2.5, idleB: b,
      activeB: d.activeBrightness && d.activeBrightness > 0 ? d.activeBrightness : b,
      aspect: it.kind === "screen" && it.h ? (it.w ?? 1) / it.h : 0, t: 0, i: 0,
      over: mat.clone(), shown: null, fade: 1, on: false, face: face as THREE.Mesh, sync: d.sync,
    };
    // The fade layer: the same shape, a hair in front (faces look down local -Z), drawn over the face.
    disp.over.transparent = true;
    disp.over.depthWrite = false;
    disp.over.opacity = 0;
    const veil = new THREE.Mesh((face as THREE.Mesh).geometry, disp.over);
    veil.name = "Veil";
    veil.position.z = -0.0006;
    veil.renderOrder = 1;
    (face as THREE.Mesh).add(veil);
    if (!d.lit && it.kind === "screen") disp.glow = this.screenGlow(face as THREE.Mesh, it.w ?? 1, it.h ?? 1);
    out.push(disp);
    if (d.src) this.texture(d.src).then((t) => t && ((disp.idle = this.fit(t, disp.aspect, d.align)), this.showDisplay(disp)));
    (d.active ?? []).forEach((src, i) => this.texture(src).then((t) => t && ((disp.frames[i] = this.fit(t, disp.aspect)), this.showDisplay(disp))));
  }

  private videoGlows: ScreenGlow[] = [];

  /** The panel goes black and the video plays inside it at its own shape: letterboxed, never cropped. */
  private attachVideo(it: Item, face: THREE.Mesh, src: string) {
    face.material = new THREE.MeshBasicMaterial({ color: 0x050505 });
    face.castShadow = false;
    const video = document.createElement("video");
    video.src = src.startsWith("/") ? src : `${this.assetBase}Esper/${src}`;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";
    this.videos.push(video);
    const w = it.w ?? 1, h = it.h ?? 1;
    const glow = this.screenGlow(face, w, h, video);
    if (glow) this.videoGlows.push(glow);
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    mat.color.setScalar(0.92);
    const place = () => {
      const va = video.videoWidth / Math.max(1, video.videoHeight) || 16 / 9;
      const vw = va > w / h ? w : h * va, vh = va > w / h ? w / va : h;
      const pic = new THREE.Mesh(roundedPanel(vw, vh, 0.0005), mat);
      pic.name = "Video";
      pic.position.z = -0.0008; // just in front of the black
      face.add(pic);
    };
    video.addEventListener("loadedmetadata", place, { once: true });
    video.play().catch(() => {
      // Autoplay can wait for the first touch; muted video usually starts straight away.
      const go = () => video.play().catch(() => {});
      window.addEventListener("pointerdown", go, { once: true });
    });
  }

  /** A soft light a little in front of a screen's face (faces look down local -Z), sized to the screen. */
  private screenGlow(face: THREE.Object3D, w: number, h: number, video?: HTMLVideoElement): ScreenGlow | undefined {
    const area = w * h;
    if (area < SCREEN_LIGHT.minArea) return undefined;
    const size = Math.sqrt(area);
    const light = new THREE.PointLight(0xffffff, 0, 1.0 + size * 2.2, 2);
    light.position.z = -(0.22 + size * 0.15);
    face.add(light);
    const base = (this.dark ? SCREEN_LIGHT.dark : SCREEN_LIGHT.light) * Math.min(1.5, Math.max(0.45, size * 1.5));
    return { light, base, to: video ? base : 0, color: new THREE.Color(1, 1, 1), toColor: new THREE.Color(0.9, 0.93, 1), video, t: 0 };
  }

  /** The average colour of a picture (sampled small and cached), softened toward white so the light stays gentle. */
  private pictureColors = new WeakMap<object, THREE.Color>();
  private pictureColor(src: CanvasImageSource | undefined | null): THREE.Color {
    const fallback = new THREE.Color(0.92, 0.94, 1);
    if (!src) return fallback;
    const cached = this.pictureColors.get(src as object);
    if (cached && !(src instanceof HTMLVideoElement)) return cached;
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 8;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return fallback;
      g.drawImage(src, 0, 0, 8, 8);
      const px = g.getImageData(0, 0, 8, 8).data;
      let r = 0, gr = 0, b = 0;
      for (let i = 0; i < px.length; i += 4) {
        r += px[i];
        gr += px[i + 1];
        b += px[i + 2];
      }
      const n = (px.length / 4) * 255;
      const col = new THREE.Color().setRGB(r / n, gr / n, b / n, THREE.SRGBColorSpace);
      // Keep the hue, lift it toward white, and normalise so a dark picture still lights a little.
      const max = Math.max(col.r, col.g, col.b, 1e-3);
      col.multiplyScalar(1 / max).lerp(new THREE.Color(1, 1, 1), 0.45);
      this.pictureColors.set(src as object, col);
      return col;
    } catch {
      return fallback;
    }
  }

  /** Cover-fits an image to a panel's shape: centred, or held to its top edge (`align: "top"`). */
  private fit(t: THREE.Texture, aspect: number, align?: string) {
    if (!aspect) return t;
    const img = t.image as { width: number; height: number };
    const ta = img.width / img.height;
    const c = t.clone();
    if (ta > aspect) {
      c.repeat.set(aspect / ta, 1);
      c.offset.set((1 - aspect / ta) / 2, 0);
    } else {
      c.repeat.set(1, ta / aspect);
      c.offset.set(0, align === "top" ? 1 - ta / aspect : (1 - ta / aspect) / 2);
    }
    c.needsUpdate = true;
    return c;
  }

  /**
   * Shows what a screen should show now: its slideshow while its room is in use, else its idle picture (or the
   * device's own white). Changes fade in over half a second on a layer in front; while loading they just appear.
   */
  private showDisplay(d: Display) {
    const on = !!d.station && d.station === this.activeStation;
    const frames = d.frames.filter(Boolean) as THREE.Texture[];
    const tex = (on && frames.length ? frames[d.i % frames.length] : d.idle) ?? null;
    const lit = (d.mat as THREE.Material).type === "MeshStandardMaterial";
    const b = lit ? 1 : Math.min(1, (on ? d.activeB : d.idleB) * 0.85);
    if (d.glow) {
      // A blank device (its own white) throws no light; a picture throws its colour.
      d.glow.to = tex ? d.glow.base * Math.max(0.5, b) : 0;
      if (tex) d.glow.toColor.copy(this.pictureColor(tex.image as CanvasImageSource));
    }
    if (tex === d.shown) {
      if (d.fade >= 1) d.mat.color.setScalar(b);
      d.over.color.setScalar(b);
      return;
    }
    // Still loading, or its room is ghosted (a full-strength fade would show through): change in place.
    if (!this.ready || d.face.material !== d.mat) {
      d.over.opacity = 0;
      this.setScreen(d.mat, tex, b, d.face);
      d.shown = tex;
      d.fade = 1;
      return;
    }
    if (d.fade < 1) this.setScreen(d.mat, d.shown, d.over.color.r, d.face); // a fade cut short: settle on where it was going
    this.setScreen(d.over, tex, b);
    d.over.opacity = 0;
    d.shown = tex;
    d.fade = 0;
  }

  private setScreen(m: THREE.MeshBasicMaterial, tex: THREE.Texture | null, b: number, face?: THREE.Mesh) {
    if (m.map !== tex) {
      if (!m.map !== !tex) m.needsUpdate = true; // with or without a map is a different shader
      m.map = tex;
    }
    m.color.setScalar(b);
    // While its room is ghosted the face draws a faded copy of this material: keep the copy showing the same picture.
    const ghost = face?.userData.ghost as THREE.MeshBasicMaterial | undefined;
    if (ghost && ghost !== m) {
      if (!ghost.map !== !tex) ghost.needsUpdate = true;
      ghost.map = tex;
      ghost.color.setScalar(b);
    }
  }

  private updateDisplays(dt: number) {
    const ease = 1 - Math.exp(-dt * 6);
    const settle = (g: ScreenGlow) => {
      g.color.lerp(g.toColor, ease);
      g.light.color.copy(g.color);
      g.light.intensity += (g.to - g.light.intensity) * ease;
    };
    for (const g of this.videoGlows) {
      // The projection: re-read the frame's colour a few times a second.
      if (g.video && g.video.readyState >= 2 && (g.t += dt) > 0.3) {
        g.t = 0;
        this.pictureColors.delete(g.video);
        g.toColor.copy(this.pictureColor(g.video));
      }
      settle(g);
    }
    for (const d of this.displays) {
      if (d.glow) settle(d.glow);
      const on = !!d.station && d.station === this.activeStation;
      if (on && d.sync) {
        // In step with the person: the picture for the pose they're nearest.
        const who = this.persons.find((p) => p.group.parent?.userData.id === d.sync!.to);
        const i = who ? d.sync.frames[who.nearestPose] ?? 0 : 0;
        if (i !== d.i) {
          d.i = i;
          this.showDisplay(d);
        }
      } else if (on && d.frames.length > 1 && (d.t += dt) >= d.seconds) {
        d.t = 0;
        d.i++;
        this.showDisplay(d);
      }
      if (d.fade >= 1) continue;
      // A synced screen keeps up with the body: a quicker crossfade.
      d.fade = Math.min(1, d.fade + dt / (d.sync ? 0.18 : 0.5));
      const k = d.fade * d.fade * (3 - 2 * d.fade);
      d.over.opacity = k;
      if (d.fade >= 1) {
        this.setScreen(d.mat, d.shown, d.over.color.r, d.face);
        d.over.opacity = 0;
      }
    }
  }

  /** Ghosts everything that isn't part of a room (its things, and walls that touch it). Each object eases on its
   *  own, so moving the pointer from one room to the next cross-fades. */
  private setFade(id: string | null, amount = 0.8, speed = 0.8) {
    this.fade.speed = speed;
    const b = id ? this.stationBounds.get(id) ?? [0, 0, 0, 0, 0, 0] : null;
    const pad = 0.35;
    const inside = (x: number, z: number) => !!b && Math.abs(x - b[0]) <= b[3] / 2 + pad && Math.abs(z - b[2]) <= b[5] / 2 + pad;
    for (const t of this.tops) {
      let keep = !id || t.obj.userData.id === "house/floor" || t.station === id;
      if (!keep && t.path) for (let i = 0; i < t.path.length && !keep; i += 2) keep = inside(t.path[i], t.path[i + 1]);
      t.obj.userData.fadeTo = keep ? 1 : 1 - amount;
      if (t.obj.userData.fadeAt === undefined) t.obj.userData.fadeAt = 1;
    }
  }

  private updateFade(dt: number) {
    const step = dt / this.fade.speed;
    for (const t of this.tops) {
      const o = t.obj.userData;
      const to = (o.fadeTo as number | undefined) ?? 1, at = (o.fadeAt as number | undefined) ?? 1;
      if (to === at) continue;
      const e = to > at ? Math.min(to, at + step) : Math.max(to, at - step);
      o.fadeAt = e;
      t.obj.traverse((obj) => {
        if (obj.userData.splat) {
          (obj as unknown as { opacity: number }).opacity = e;
          return;
        }
        const m = obj as THREE.Mesh;
        if (!m.isMesh || !m.material || m.name === "Veil") return; // a screen's fade layer keeps its own opacity
        if (e >= 1) {
          if (m.userData.orig) {
            m.material = m.userData.orig as THREE.Material;
            m.castShadow = m.userData.cast ?? true;
            delete m.userData.orig;
          }
          return;
        }
        if (!m.userData.orig) {
          const orig = m.material as THREE.Material;
          if (orig.visible === false) return;
          m.userData.orig = orig;
          m.userData.cast = m.castShadow;
          const ghost = (m.userData.ghost as THREE.Material | undefined) ?? orig.clone();
          ghost.transparent = true;
          m.userData.ghost = ghost;
          m.material = ghost;
          m.castShadow = false;
        }
        (m.material as THREE.Material).opacity = e;
      });
    }
  }

  private applyStations() {
    for (const s of this.staged) {
      const on = s.station === this.activeStation;
      const show = s.when === "" || (s.when === "active" ? on : !on);
      const to = show ? 1 : 0;
      const first = s.obj.userData.vis === undefined;
      if (s.when !== "active" || first) {
        s.obj.visible = show;
        s.obj.userData.vis = to;
        continue;
      }
      if (s.obj.userData.vis === to && !this.appears.has(s.obj)) continue;
      // On focus, once the camera is well on its way; on hover, straight away. Leaving is quicker.
      this.appears.set(s.obj, { to, wait: show ? this.popDelay : 0 });
      if (show && !s.obj.visible) {
        s.obj.visible = true;
        this.seeThrough(s.obj, s.obj.userData.vis as number);
      }
    }
    for (const d of this.displays) {
      const on = !!d.station && d.station === this.activeStation;
      if (on !== d.on) {
        d.on = on;
        d.i = 0;
        d.t = 0;
      }
      this.showDisplay(d);
    }
  }

  // ---------------- look ----------------

  private applyLook(commands: string) {
    for (const cmd of commands.split(";")) {
      const [k, raw] = cmd.split("=");
      const v = parseFloat(raw);
      if (!k || Number.isNaN(v)) continue;
      const key = k.trim();
      if (key === "exposure") this.renderer.toneMappingExposure = Math.pow(2, v);
      else if (key === "ambient") (this.ambient.level = v), this.applyAmbient();
      else if (key === "ambient.warm") (this.ambient.warm = v), this.applyAmbient();
      else if (key === "sun.yaw") (this.sunAngles.yaw = v), this.applySun();
      else if (key === "sun.height") (this.sunAngles.height = v), this.applySun();
      else if (key === "sun.warm") (this.sunAngles.warm = v), this.applySun();
      else if (key === "light.CityLight") (this.sunAngles.strength = v), this.applySun();
      else if (key === "sun.shadow") this.sun.shadow.intensity = Math.min(1, Math.max(0, v));
      else if (key === "ao") (this.gtao.blendIntensity = Math.min(1, v)), (this.gtao.enabled = v > 0.001);
      else if (key === "ao.radius") this.gtao.updateGtaoMaterial({ radius: v });
      else if (key === "lens") this.lens = v;
      else if (key === "orbit") this.orbit = v;
      else if (key === "cycle") this.cycles.forEach((c) => (c.seconds = v));
      // contrast, saturation, bloom, vignette, grain, style and pipe.* were Unity post effects: not here yet.
    }
  }

  private applyAmbient() {
    const { level, warm } = this.ambient;
    const ground = GROUND_COOL.map((c, i) => c + (GROUND_WARM[i] - c) * warm);
    this.hemi.color = srgb(SKY);
    this.hemi.groundColor = srgb(ground);
    this.hemi.intensity = level * BOUNCE_SCALE;
  }

  private applySun() {
    const { yaw, height, warm, strength } = this.sunAngles;
    // Unity: Euler(height, yaw, 0) * forward.
    const f = new THREE.Vector3(Math.sin(yaw * D2R) * Math.cos(height * D2R), -Math.sin(height * D2R), Math.cos(yaw * D2R) * Math.cos(height * D2R));
    const w = toWorld(f);
    this.sun.target.position.set(0, 0, 0);
    this.sun.position.copy(w.multiplyScalar(-45));
    this.sun.color = new THREE.Color(1, 1, 1).lerp(new THREE.Color(1, 0.93, 0.84), warm);
    this.sun.intensity = strength * SUN_SCALE;
  }

  // ---------------- camera ----------------

  /** The lens dial is for the isometric overview; close views keep their own lens. */
  private fovOf(r: Rest, id: string) {
    return id === "overview" && this.lens > 0.5 ? this.lens : r.fov;
  }

  /** A view's camera now: its rest pose turned about its pivot by the drag, slid by the frame offset. */
  private poseOf(id: string, turn: THREE.Vector2): Pose | null {
    const r = this.views.get(id);
    if (!r) return null;
    const fov = this.fovOf(r, id);
    const d0 = r.pos.distanceTo(r.pivot);
    const dist = (d0 * Math.tan((r.fov / 2) * D2R)) / Math.tan((fov / 2) * D2R);
    const flat = new THREE.Vector3(-r.fwd.x, 0, -r.fwd.z).normalize();
    const axis = new THREE.Vector3().crossVectors(UP, flat).normalize();
    const fwd = r.fwd.clone().applyAxisAngle(axis, turn.y * D2R).applyAxisAngle(UP, turn.x * D2R);
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x).normalize();
    // Close views are composed with room for the card already; only long-lens views slide.
    const slide = id === "overview" || fov > 15 ? 0 : (dist * Math.tan((fov / 2) * D2R) * Math.tan(this.frameOffset * D2R)) / Math.tan(18 * D2R);
    const target = r.pivot.clone().addScaledVector(right, slide);
    const pos = target.clone().addScaledVector(fwd, -dist);
    // On narrow portrait screens, the dossier card sits in the lower half of the viewport; tilt the aim point down while keeping the camera's elevated position so the 3D subject sits in the open upper half without walls occluding it.
    if (id !== "overview" && this.camera.aspect < 0.85) {
      const camUp = new THREE.Vector3().crossVectors(fwd, right).normalize();
      if (camUp.y < 0) camUp.negate();
      const framedFor = fov < 15 ? 0.82 : 1.3;
      const effFov = this.camera.aspect >= framedFor ? fov : Math.min(100, (2 * Math.atan(Math.tan((fov / 2) * D2R) * (framedFor / this.camera.aspect))) / D2R);
      const halfH = dist * Math.tan((effFov / 2) * D2R);
      target.addScaledVector(camUp, -0.28 * halfH);
    }
    return { pos, target, fov };
  }

  private liveId() {
    return this.state === "overview" || !this.focused ? "overview" : this.focused;
  }

  private startBlend(duration = 2.1) {
    if (this.current) this.blend = { from: { pos: this.current.pos.clone(), target: this.current.target.clone(), fov: this.current.fov }, t: 0, duration };
  }

  private updateCamera(dt: number) {
    if (this.state !== "enhance" && !this.intro) this.look.lerp(this.lookTarget, 1 - Math.exp(-dt * 10));
    let pose = this.moving ?? this.poseOf(this.liveId(), this.look);
    if (!pose) return;
    if (this.blend && !this.moving) {
      this.blend.t = Math.min(1, this.blend.t + dt / (this.reducedMotion ? 0.01 : this.blend.duration));
      const k = this.blend.t, e = k < 0.5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2;
      const f = this.blend.from;
      // Ease the framing in log space so a long zoom doesn't rush at either end.
      // What's in frame (distance x lens width) eases in log space and the lens eases with it, so moving between a
      // long isometric lens and a close one never backs away before it closes in.
      const fd = f.pos.distanceTo(f.target), td = pose.pos.distanceTo(pose.target);
      const half = (v: number) => Math.tan((v / 2) * D2R);
      const fs = fd * half(f.fov), ts = td * half(pose.fov);
      const fovE = f.fov + (pose.fov - f.fov) * e;
      const dist = Math.exp(Math.log(fs) + (Math.log(ts) - Math.log(fs)) * e) / half(fovE);
      const target = f.target.clone().lerp(pose.target, e);
      const dir = f.pos.clone().sub(f.target).normalize().lerp(pose.pos.clone().sub(pose.target).normalize(), e).normalize();
      const pos = target.clone().addScaledVector(dir, dist);
      // Room to room, rise over the walls on the way rather than through them.
      const hop = f.pos.distanceTo(pose.pos);
      if (fd < 20 && td < 20) pos.y += Math.sin(Math.PI * e) * Math.min(4, hop * 0.45);
      pose = { pos, target, fov: fovE };
      if (k >= 1) this.blend = null;
    }
    this.current = pose;
    const cam = this.camera;
    cam.position.copy(toWorld(pose.pos));
    cam.up.set(0, 1, 0);
    cam.lookAt(toWorld(pose.target));
    // Views are framed for a landscape screen. On a narrow one (a phone held upright) keep the same width in view,
    // so the house and each room's subject aren't cropped at the sides.
    // (The overview's long lens already leaves room around the house, so it holds the house's width from narrower.)
    const FRAMED_FOR = pose.fov < 15 ? 0.82 : 1.3;
    cam.fov = cam.aspect >= FRAMED_FOR ? pose.fov : Math.min(100, 2 * Math.atan(Math.tan((pose.fov / 2) * D2R) * (FRAMED_FOR / cam.aspect)) / D2R);
    const dist = pose.pos.distanceTo(pose.target);
    cam.near = Math.max(0.02, Math.min(dist * 0.05, dist - 30));
    cam.far = dist + 80;
    cam.updateProjectionMatrix();
  }

  private select(id: string) {
    if (!this.stations.has(id)) return;
    if (this.state === "focus" && this.focused === id) return;
    if (this.state !== "enhance") this.focus(id);
  }

  private focus(id: string, duration?: number) {
    this.finishBuild(false);
    if (this.intro) {
      this.intro = false;
      this.stepper = null;
    }
    this.uiHover = "";
    this.startBlend(duration);
    this.focused = id;
    this.state = "focus";
    this.lookTarget.set(0, 0);
    this.setHover("");
    this.setBoardHover(false);
    // The guestbook is a corner of About: the room stays lit and peopled while you read it.
    this.activeStation = id === "guestbook" ? "taste" : id;
    this.applyStations();
    this.setFade(id === "guestbook" ? "taste" : id);
    this.emit("focus", id);
  }

  private back() {
    if (this.board?.busy) return this.board.finish();
    if (this.state !== "focus") return;
    if (this.focused === "guestbook") return this.focus("taste", 1.4);
    this.setBoardHover(false);
    this.startBlend();
    this.state = "overview";
    this.focused = null;
    this.lookTarget.set(0, 0);
    this.activeStation = null;
    this.applyStations();
    this.setFade(null);
    this.emit("overview");
    if (this.pointer && !this.overUi && this.enabled) this.setHover(this.stationAt(this.pointer.x, this.pointer.y));
  }

  /** Going in: a dolly zoom into the device. The lens opens over the first half, then the camera closes in. */
  private enhance(id: string) {
    const st = this.stations.get(id);
    if (!st || this.state === "enhance" || !this.current) return;
    this.state = "enhance";
    this.emit("enhance-start", id);
    const from = { pos: this.current.pos.clone(), target: this.current.target.clone(), fov: this.current.fov };
    const screenObj = st.screen ? this.screens.get(st.screen) : undefined;
    const aim = new THREE.Vector3();
    if (screenObj) {
      const face = screenObj.getObjectByName("Screen") ?? screenObj;
      face.getWorldPosition(aim);
      this.root.worldToLocal(aim);
    } else aim.copy(st.hit.position);
    const to = st.enter ?? from.pos.clone().lerp(aim, 0.9);
    const toFov = 50;
    const half = (f: number) => Math.tan((f / 2) * D2R);
    const fromDir = from.target.clone().sub(from.pos).normalize();
    const toDir = aim.clone().sub(to).normalize();
    const s0 = from.pos.distanceTo(aim) * half(from.fov), s1 = to.distanceTo(aim) * half(toFov);
    const duration = this.reducedMotion ? 0.3 : 2.4;
    let t = 0;
    const step = (dt: number) => {
      t = Math.min(1, t + dt / duration);
      const e = t * t * t * (t * (t * 6 - 15) + 10);
      const lk = Math.min(1, t * 2), lensK = lk * lk * (3 - 2 * lk);
      const fov = from.fov + (toFov - from.fov) * lensK;
      const size = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * e);
      const dir = fromDir.clone().lerp(toDir, e).normalize();
      const dist = size / half(fov);
      this.moving = { pos: aim.clone().addScaledVector(dir, -dist), target: aim.clone(), fov };
      if (t >= 1) {
        this.stepper = null;
        this.emit("enhance", st.url);
        window.setTimeout(() => {
          this.moving = null;
          this.state = "focus";
        }, 2500);
      }
    };
    this.stepper = step;
  }
  private stepper: ((dt: number) => void) | null = null;

  // ---------------- the build ----------------

  /** The build's bright: white in the dark room; graphite on the light clay, where white wouldn't show. */
  private accent() {
    return this.dark ? srgb([1, 1, 1]) : srgb([0.12, 0.12, 0.13]);
  }

  /**
   * The first reveal: the house builds itself, in about three seconds.
   * - The plan sketches itself on the floor in half a second: the outline, then the partitions in one sweep round the
   *   house, each line led by a bright pen tip.
   * - The walls are the event, in two beats (the outline, then every partition together): each fades in as a
   *   hologram at full height and the clay rises into it on a soft spring, a bright print edge riding its top.
   *   Hologram and plan fade once they stand.
   * - The rooms are furnished one by one in the order of the bar: each thing drops in and settles with a small squash.
   * The clay only moves (transforms), so shadows and ambient occlusion follow it; the light-only layers are kept out
   * of the occlusion pass. Time advances at most a 30 fps step per frame, so a hitch slows it rather than skipping
   * ahead. People aren't part of it (they sleep until a room is picked). A press, or picking a room, finishes it.
   */
  private building: {
    t: number;
    end: number;
    chromeAt: number;
    fadeFrom: number;
    pieces: BuildPiece[];
    fx: THREE.Mesh[];
    geos: THREE.BufferGeometry[];
    plan: THREE.ShaderMaterial;
    holos: { mat: THREE.ShaderMaterial; at: number; rise: number; h: number }[];
    tune: BuildTune;
  } | null = null;
  /** What the first load's build was made from, so the tuning panel can replay it. */
  private lastBuild: { spec: Spec; tops: Map<string, THREE.Object3D>; stationOf: Map<string, string> } | null = null;
  /** Light-only meshes the ambient occlusion pass should not see. */
  private noAO: THREE.Object3D[] = [];
  private chromeShown = false;

  /** The interface (name, bar) comes in once the walls stand, so the house has the stage first. */
  private showChrome() {
    if (this.chromeShown) return;
    this.chromeShown = true;
    this.emit("chrome");
  }

  private startBuild(spec: Spec, tops: Map<string, THREE.Object3D>, stationOf: Map<string, string>) {
    this.finishBuild(false);
    this.lastBuild = { spec, tops, stationOf };
    const T = buildTune();
    this.scene.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const piece = (obj: THREE.Object3D, at: number, wall: boolean): BuildPiece => {
      // Grown and squashed about the bottom of its bounds (in the house's own space), not its origin: some things
      // (the obscura rail) are authored about the middle of the house.
      box.setFromObject(obj);
      const c = obj.position.clone();
      if (!box.isEmpty() && Number.isFinite(box.min.y)) {
        c.copy(this.root.worldToLocal(new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2)));
      }
      return { obj, at, wall, p0: obj.position.clone(), s0: obj.scale.clone(), c };
    };
    const pieces: BuildPiece[] = [];
    const fx: THREE.Mesh[] = [];
    const geos: THREE.BufferGeometry[] = [];
    const accent = this.accent();
    const ink = this.dark ? { c: srgb([0.8, 0.8, 0.8]), a: 0.5 * T.plan.opacity } : { c: srgb([0.3, 0.3, 0.3]), a: 0.45 * T.plan.opacity };
    const lightOnly = (mesh: THREE.Mesh, order: number) => {
      mesh.renderOrder = order;
      mesh.frustumCulled = false;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      this.world.add(mesh);
      fx.push(mesh);
    };

    // The plan: a ribbon along every wall. The outline (the house's outer walls) is drawn first, all at once; then
    // the partitions one after another, sweeping round the middle.
    const walls = spec.items.filter((it) => it.kind === "wall" && it.path && it.path.length >= 4 && tops.get(it.id));
    const angle = (path: number[]) => {
      let x = 0, z = 0;
      for (let i = 0; i < path.length; i += 2) {
        x += path[i];
        z += path[i + 1];
      }
      return Math.atan2(z, x);
    };
    const outline = walls.filter((w) => w.solid);
    const inner = walls.filter((w) => !w.solid).sort((a, b) => angle(a.path!) - angle(b.path!));
    const pos: number[] = [], along: number[] = [], start: number[] = [], dur: number[] = [], lens: number[] = [], index: number[] = [];
    const HALF = T.plan.width / 2, Y = 0.003;
    const holos: NonNullable<typeof this.building>["holos"] = [];
    let wallsDone = 0;
    [...outline, ...inner].forEach((it, n) => {
      const obj = tops.get(it.id)! as THREE.Mesh;
      obj.updateMatrix();
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i + 1 < it.path!.length; i += 2) pts.push(new THREE.Vector3(it.path![i], 0, it.path![i + 1]).applyMatrix4(obj.matrix));
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
      if (len < 1e-4) return;
      const isOutline = n < outline.length;
      const at = isOutline ? T.plan.outlineAt : T.plan.innerAt + (n - outline.length) * T.plan.innerGap;
      const d = Math.max(0.01, isOutline ? T.plan.outlineDuration : T.plan.innerDuration);
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const seg = Math.hypot(b.x - a.x, b.z - a.z);
        if (seg < 1e-5) continue;
        const nx = (-(b.z - a.z) / seg) * HALF, nz = ((b.x - a.x) / seg) * HALF;
        const base = pos.length / 3;
        pos.push(a.x + nx, Y, a.z + nz, a.x - nx, Y, a.z - nz, b.x + nx, Y, b.z + nz, b.x - nx, Y, b.z - nz);
        along.push(acc / len, acc / len, (acc + seg) / len, (acc + seg) / len);
        start.push(at, at, at, at);
        dur.push(d, d, d, d);
        lens.push(len, len, len, len);
        index.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        acc += seg;
      }
      // The wall: its hologram fades in, then the clay rises into it (never before its line is drawn).
      const rise = Math.max(at + d, isOutline ? T.walls.outlineAt : T.walls.innerAt);
      const holo = new THREE.ShaderMaterial({
        uniforms: {
          uRise: { value: 0 }, uAlpha: { value: 0 }, uT: { value: 0 }, uAccent: { value: accent },
          uRim: { value: T.hologram.rim }, uScan: { value: T.hologram.scanlines }, uEdge: { value: T.hologram.edgeGlow },
        },
        vertexShader: HOLO_VS,
        fragmentShader: HOLO_FS,
        transparent: true,
        depthWrite: false,
        blending: this.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
        // Pushed back a touch, so where the clay has risen it wins over its own hologram.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      const hm = new THREE.Mesh(obj.geometry, holo);
      hm.position.copy(obj.position);
      hm.quaternion.copy(obj.quaternion);
      hm.scale.copy(obj.scale);
      if (T.hologram.show) {
        lightOnly(hm, 2);
        holos.push({ mat: holo, at: rise - T.hologram.lead, rise, h: it.h || 1 });
      } else holo.dispose();
      pieces.push(piece(obj, rise, true));
      wallsDone = Math.max(wallsDone, rise + settleTime(T.walls.rise));
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aAlong", new THREE.Float32BufferAttribute(along, 1));
    geo.setAttribute("aStart", new THREE.Float32BufferAttribute(start, 1));
    geo.setAttribute("aDur", new THREE.Float32BufferAttribute(dur, 1));
    geo.setAttribute("aLen", new THREE.Float32BufferAttribute(lens, 1));
    geo.setIndex(index);
    geos.push(geo);
    const plan = new THREE.ShaderMaterial({
      uniforms: {
        uT: { value: 0 }, uFade: { value: 1 }, uInk: { value: ink.c }, uInkA: { value: ink.a }, uAccent: { value: accent },
        uTip: { value: Math.max(0.001, T.plan.tipLength) }, uTipGlow: { value: T.plan.tipGlow },
      },
      vertexShader: /* glsl */ `
        attribute float aAlong; attribute float aStart; attribute float aDur; attribute float aLen;
        uniform float uT;
        varying float vAlong; varying float vP; varying float vLen; varying float vDone; varying float vOn;
        void main() {
          vAlong = aAlong;
          vLen = aLen;
          float p = clamp((uT - aStart) / aDur, 0.0, 1.0);
          vOn = step(0.0001, p);
          // The pen eases off the mark and onto the end, like a hand.
          vP = 0.5 - 0.5 * cos(3.14159265 * p);
          vDone = uT - aStart - aDur;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform vec3 uAccent; uniform float uInkA; uniform float uFade; uniform float uTip; uniform float uTipGlow;
        varying float vAlong; varying float vP; varying float vLen; varying float vDone; varying float vOn;
        void main() {
          if (vOn < 0.5 || vAlong > vP) discard;
          // The pen tip: bright at the head, trailing off behind it, gone once the line is done.
          float head = exp(-((vP - vAlong) * vLen) / uTip) * (1.0 - clamp(vDone / 0.3, 0.0, 1.0));
          gl_FragColor = vec4(mix(uInk, uAccent * uTipGlow, head), mix(uInkA, 1.0, head) * uFade);
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    lightOnly(new THREE.Mesh(geo, plan), 3);
    this.noAO = [...fx];

    // The rooms, in the bar's order, each a beat after the last; inside a room, the floor-standing things first and
    // what rests on them after.
    const order = spec.stations.map((s) => s.id).filter((id) => id !== "guestbook");
    const rooms = new Map<string, Item[]>();
    for (const it of spec.items) {
      if (it.kind === "wall" || it.kind === "person" || it.id === "house/floor" || it.when === "active" || !tops.get(it.id)) continue;
      const room = stationOf.get(it.id) ?? it.station ?? "";
      rooms.set(room, [...(rooms.get(room) ?? []), it]);
    }
    const ranked = [...rooms.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    ranked.forEach((room, i) => {
      const list = rooms.get(room)!.sort((a, b) => (a.p?.[1] ?? 0) - (b.p?.[1] ?? 0) || (a.p?.[0] ?? 0) - (b.p?.[0] ?? 0));
      const gap = Math.min(T.furnish.itemGap, 0.42 / list.length);
      list.forEach((it, j) => pieces.push(piece(tops.get(it.id)!, T.furnish.at + i * T.furnish.roomGap + j * gap, false)));
    });

    const fadeFrom = wallsDone - 0.25;
    const landed = T.furnish.fallTime + 4.6 / Math.max(1, T.furnish.settle);
    const end = Math.max(fadeFrom + T.plan.fadeOut, ...pieces.map((p) => p.at + (p.wall ? settleTime(T.walls.rise) : landed)));
    // A moment of grace: the plan starts as the loading mark sinks into the ground.
    this.building = { t: -T.plan.delay, end, chromeAt: T.ui.interfaceAt, fadeFrom, pieces, fx, geos, plan, holos, tune: T };
    for (const p of pieces) this.placePiece(p, -1, T);
  }

  /** A piece of the build, `t` seconds after its turn came (negative: not yet). */
  private placePiece(p: BuildPiece, t: number, T: BuildTune) {
    let fx = 1, fy = 1, lift = 0;
    if (p.wall) {
      fy = Math.max(1e-4, progress(T.walls.rise, t));
    } else {
      const F = T.furnish, FALL = Math.max(0.01, F.fallTime), H = F.dropHeight;
      if (t <= 0) {
        fx = fy = 1e-4;
        lift = H;
      } else if (t < FALL) {
        // Falls in under gravity, growing to full size on the way.
        const u = t / FALL;
        lift = H * (1 - u * u);
        fx = fy = 0.45 + 0.55 * (1 - (1 - u) * (1 - u));
      } else {
        // Lands: a small squash that springs back and settles.
        const l = t - FALL, w = Math.exp(-F.settle * l) * Math.cos(F.bounce * l);
        fx = 1 + F.squash * 0.55 * w;
        fy = 1 - F.squash * w;
      }
    }
    const { obj, p0, s0, c } = p;
    obj.scale.set(s0.x * fx, s0.y * fy, s0.z * fx);
    obj.position.set(c.x + (p0.x - c.x) * fx, c.y + (p0.y - c.y) * fy + lift, c.z + (p0.z - c.z) * fx);
  }

  private updateBuild(dt: number) {
    const b = this.building;
    if (!b) return;
    b.t += Math.min(dt, 1 / 30);
    const t = b.t;
    const T = b.tune;
    for (const p of b.pieces) this.placePiece(p, t - p.at, T);
    const fade = 1 - smooth01((t - b.fadeFrom) / Math.max(0.01, T.plan.fadeOut));
    b.plan.uniforms.uT.value = t;
    b.plan.uniforms.uFade.value = fade;
    for (const h of b.holos) {
      // Fades in, holds while the clay rises into it, fades once it stands.
      const H = T.hologram;
      const shown = smooth01((t - h.at) / Math.max(0.01, H.fadeIn));
      const gone = smooth01((t - h.rise - settleTime(T.walls.rise) * 0.7) / Math.max(0.01, H.fadeOut));
      h.mat.uniforms.uAlpha.value = H.opacity * shown * (1 - gone);
      h.mat.uniforms.uRise.value = h.h * Math.max(0, progress(T.walls.rise, t - h.rise));
      h.mat.uniforms.uT.value = t;
    }
    if (t >= b.chromeAt) this.showChrome();
    if (t >= b.end) this.finishBuild();
  }

  /** Everything where it belongs, the build's layers gone; then whatever the pointer is already on lights up. */
  private finishBuild(catchUp = true) {
    const b = this.building;
    if (!b) return;
    this.building = null;
    for (const p of b.pieces) {
      p.obj.scale.copy(p.s0);
      p.obj.position.copy(p.p0);
    }
    // The holograms share their walls' geometry; only the build's own geometry is freed.
    for (const m of b.fx) {
      m.removeFromParent();
      (m.material as THREE.Material).dispose();
    }
    for (const g of b.geos) g.dispose();
    this.noAO = [];
    this.showChrome();
    if (!catchUp || this.state !== "overview") return;
    if (this.pointer && !this.overUi && this.enabled) this.setHover(this.stationAt(this.pointer.x, this.pointer.y));
    else if (this.uiHover) this.setHover(this.uiHover);
  }

  /** The tuning panel's replay: the first load's build and camera settle again, from the overview. */
  private replayBuild() {
    const last = this.lastBuild;
    if (!last || this.reducedMotion) return;
    if (this.state === "focus") this.back();
    this.finishBuild(false);
    this.blend = null;
    this.startBuild(last.spec, last.tops, last.stationOf);
    this.playIntro();
  }

  private playIntro(seconds?: number) {
    if (this.reducedMotion) return;
    this.intro = true;
    let t = 0;
    // A small settle while the house builds, not a tour: the camera barely moves.
    const C = buildTune().camera;
    const length = Math.max(0.05, seconds ?? C.duration);
    const start = new THREE.Vector2(C.settleX, C.settleY);
    this.look.copy(start);
    this.stepper = (dt) => {
      t = Math.min(1, t + dt / length);
      const e = 1 - Math.pow(1 - t, 3);
      this.look.copy(start).lerp(new THREE.Vector2(), e);
      if (t >= 1) {
        this.intro = false;
        this.stepper = null;
      }
    };
  }

  // ---------------- input ----------------

  // ---------------- guestbook ----------------

  /** A new note: the camera turns to the board while the paper flies in from where the composer folded it. */
  private guestbookPin(value: string) {
    if (!this.board) return;
    const { note, start } = JSON.parse(value) as { note: BoardNote; start: PinStart };
    this.guestbookNotes = [...this.guestbookNotes.filter((n) => n.id !== note.id), note];
    // The paper waits on the glass until the camera has settled on the board, so it leaves into a still room.
    let lead = 0.12;
    if (!(this.state === "focus" && this.focused === "guestbook")) {
      if (this.state === "enhance") return this.board.setNotes(this.guestbookNotes);
      this.focus("guestbook", 1.1);
      lead = 1.0;
    }
    this.board.pin(note, start, this.reducedMotion, lead, () => this.emit("guestbook-pinned", note.id));
  }

  private setBoardHover(on: boolean) {
    if (on === this.boardHover) return;
    this.boardHover = on;
    this.emit("board-hover", on ? "1" : "");
  }

  private ray(x: number, y: number) {
    const rect = this.canvas.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1), this.camera);
    return this.raycaster;
  }

  private stationAt(x: number, y: number) {
    // The Visitor Board is a place of its own, inside About: it wins over the room around it.
    if (this.board?.hit(this.ray(x, y))) return "guestbook";
    const hits = this.ray(x, y).intersectObjects([...this.stations.values()].map((s) => s.hit).filter((h) => !h.userData.noHover), false);
    return hits.length ? (hits[0].object.userData.station as string) : "";
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.finishBuild();
    this.pressing = true;
    this.dragged = false;
    this.pressAt.set(e.clientX, e.clientY);
    this.last.set(e.clientX, e.clientY);
  };

  /** The mouse's last spot over the room (touch has no hover, so it isn't kept). */
  private pointer: { x: number; y: number } | null = null;

  private onMove = (e: PointerEvent) => {
    this.pointer = e.pointerType === "mouse" && e.target === this.canvas ? { x: e.clientX, y: e.clientY } : null;
    if (this.pressing) {
      if (!this.dragged && this.pressAt.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 6) this.dragged = true;
      if (this.dragged && this.state !== "enhance") {
        if (this.intro) {
          this.intro = false;
          this.stepper = null;
          this.lookTarget.copy(this.look);
        }
        const k = 220 / Math.max(400, this.canvas.clientWidth);
        const range = this.state === "overview" ? this.orbit : this.orbit / 2;
        this.lookTarget.x = Math.max(-range, Math.min(range, this.lookTarget.x + (e.clientX - this.last.x) * k));
        this.lookTarget.y = Math.max(-10, Math.min(12, this.lookTarget.y - (e.clientY - this.last.y) * k));
      }
      this.last.set(e.clientX, e.clientY);
      return;
    }
    // While the house builds, nothing lights up under the pointer (finishBuild catches up with where it rests).
    if (this.building) return;
    if (this.state === "focus" && this.focused === "taste" && this.board) {
      this.setBoardHover(e.target === this.canvas && !this.overUi && this.board.hit(this.ray(e.clientX, e.clientY)));
    }
    if (e.target !== this.canvas || this.state !== "overview" || !this.enabled || this.overUi) {
      return this.setHover(this.state === "overview" ? this.uiHover : "");
    }
    this.uiHover = "";
    this.setHover(this.stationAt(e.clientX, e.clientY));
  };

  private onUp = (e: PointerEvent) => {
    if (!this.pressing) return;
    this.pressing = false;
    if (this.dragged || e.target !== this.canvas || this.overUi) return;
    if (!this.enabled) return this.studioPoint(e);
    // The figure outside: a tap moves it on.
    const figure = this.ray(e.clientX, e.clientY).intersectObjects(this.cycles.map((c) => c.obj), true);
    if (figure.length) {
      const c = this.cycles.find((cy) => figure[0].object === cy.obj || cy.obj.getObjectById(figure[0].object.id));
      if (c) return c.next();
    }
    // A click while a note is arriving skips to it pinned.
    if (this.board?.busy) return this.board.finish();
    if (this.state === "focus" && this.focused === "taste" && this.board?.hit(this.ray(e.clientX, e.clientY))) return this.focus("guestbook", 1.4);
    const id = this.stationAt(e.clientX, e.clientY);
    if (this.state === "overview") {
      if (id) this.focus(id);
    } else if (this.state === "focus") {
      // Up close, a click anywhere steps back out. The case study opens from the card.
      this.back();
    }
  };

  private onCancel = () => {
    this.pressing = false;
    this.dragged = false;
  };

  private onLeave = (e: PointerEvent) => {
    if (e.relatedTarget) return; // only when leaving the window itself
    this.pointer = null;
    if (this.state === "overview") this.setHover("");
  };

  private onContext = (e: Event) => {
    e.preventDefault();
    this.back();
  };

  private setHover(id: string) {
    if (id === this.hovered) return;
    this.hovered = id;
    this.emit("hover", id);
    // In the overview, the room under the pointer comes forward while the rest settle back.
    if (this.state === "overview") {
      const room = id === "guestbook" ? "taste" : id;
      this.setFade(room || null, 0.45, 0.3);
      // The room under the pointer comes to life: its people step in, its screens wake.
      this.activeStation = room || null;
      this.popDelay = 0;
      this.applyStations();
      this.popDelay = 0.3;
    }
  }

  /** Studio point-and-prompt: what's under the click, in scene.json's coordinates. */
  private studioPoint(e: PointerEvent) {
    if (this.tool !== "note") return;
    const hits = this.ray(e.clientX, e.clientY).intersectObjects(this.world.children, true).filter((h) => !(h.object as THREE.Mesh).userData.station);
    if (!hits.length) return;
    const h = hits[0];
    const p = this.root.worldToLocal(h.point.clone());
    const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
    n.z = -n.z;
    let o: THREE.Object3D | null = h.object;
    while (o && !o.userData.id) o = o.parent;
    const cam = this.current?.pos ?? new THREE.Vector3();
    const rect = this.canvas.getBoundingClientRect();
    this.emit("studio-point", JSON.stringify({
      p: [p.x, p.y, p.z], n: [n.x, n.y, n.z], path: (o?.userData.id as string) ?? "", cam: [cam.x, cam.y, cam.z],
      sx: (e.clientX - rect.left) / rect.width, sy: (e.clientY - rect.top) / rect.height,
    }));
  }

  // ---------------- frame ----------------

  private resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    // Render at most ~1440 lines tall; the page scales it up.
    const pr = Math.min(window.devicePixelRatio || 1, Math.max(1, 1440 / h));
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.board) this.board.lastViewport = h;
  }

  private frame = () => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, this.clock.getDelta());
    if (this.paused) return;
    this.stepper?.(dt);
    for (const f of this.flips) f.update(dt);
    // Reduced motion: everyone holds their pose (still shaped, hands and all) instead of moving.
    for (const p of this.persons) p.update(this.reducedMotion ? 0 : dt);
    this.board?.update(dt, this.camera);
    // A record plays while its room is the one being looked at (the Visitor Board is part of About).
    const here = this.state === "focus" && this.focused ? (this.focused === "guestbook" ? "taste" : this.focused) : "";
    for (const t of this.turntables) t.deck.update(dt, !!here && here === t.station, this.reducedMotion);
    for (const c of this.cycles) c.update(dt);
    this.updateDisplays(dt);
    this.updateTheme(dt);
    this.updateCamera(dt);
    this.updateFade(dt);
    this.updateTints(dt);
    if (this.holders.length) this.placeHands();
    this.updateShakers(dt);
    this.updateBuild(dt); // after the shakers, which also place what they rattle
    this.updateLamps(dt);
    for (const [obj, a] of this.appears) {
      if (a.wait > 0) {
        a.wait -= dt;
        this.seeThrough(obj, obj.userData.vis as number);
        continue;
      }
      const v0 = obj.userData.vis as number;
      const v = a.to > v0 ? Math.min(1, v0 + dt / 0.3) : Math.max(0, v0 - dt / 0.2);
      obj.userData.vis = v;
      this.seeThrough(obj, v);
      if (v === a.to) {
        this.appears.delete(obj);
        if (v === 0) obj.visible = false;
      }
    }
    this.composer.render();
  };

  /** Sets a whole object's opacity (eased), swapping in see-through copies of its materials while it's partial. */
  private seeThrough(obj: THREE.Object3D, v: number) {
    const k = v * v * (3 - 2 * v);
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.material) return;
      if (k >= 1) {
        if (m.userData.solid) {
          m.material = m.userData.solid as THREE.Material | THREE.Material[];
          m.castShadow = (m.userData.cast0 as boolean | undefined) ?? true;
          delete m.userData.solid;
        }
        return;
      }
      if (!m.userData.solid) {
        const solid = m.material;
        const list = Array.isArray(solid) ? solid : [solid];
        if (list.some((x) => x.visible === false)) return;
        m.userData.solid = solid;
        m.userData.cast0 = m.castShadow;
        const see = (m.userData.see as THREE.Material[] | undefined) ?? list.map((x) => {
          const c = x.clone();
          // clone() drops shader hooks: keep them, so a ghost fades in already a ghost.
          c.onBeforeCompile = x.onBeforeCompile;
          c.customProgramCacheKey = x.customProgramCacheKey;
          c.transparent = true;
          return c;
        });
        m.userData.see = see;
        m.material = Array.isArray(solid) ? see : see[0];
      }
      // The shadow joins once they're mostly there, so it doesn't arrive ahead of them.
      m.castShadow = k > 0.6 && (m.userData.cast0 as boolean);
      for (const x of m.userData.see as THREE.Material[]) x.opacity = k * ((x.userData.baseOpacity as number | undefined) ?? 1);
    });
  }
}
