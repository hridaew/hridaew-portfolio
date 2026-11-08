import * as THREE from "three";
import type { Joints } from "./kit";

/**
 * A real rigged person (the Mixamo X Bot) posed from the same joint data the scene uses: the hips are placed
 * and turned to face the way the shoulders do, then each bone is turned to point at the next joint (spine to
 * neck, neck to head, arm to elbow to wrist, leg to knee to ankle). With several poses it glides between them.
 *
 * The scene is built in mirrored (Unity-style) numbers; the rig lives under a holder that undoes the mirror,
 * so all of this is plain right-handed maths. Joint (x, y, z) is (x, y, -z) in holder space.
 */
/** The skeleton's own bone names for each part (the Mixamo bot, or a standard game rig like the CGTrader one). */
type Rig = {
  hips: string; foot: string; neck: string; shl: string; shr: string; breathe: string;
  /** Finger bones by finger, joint (1-3) and side, ending in the tip (joint 4). Absent: hands stay as they rest. */
  finger?: (f: Finger, i: number, side: "l" | "r") => string;
  /** Upper arm, forearm, hand per side: reached by two-bone IK so wrists land exactly where they're sent. */
  arms?: Record<"l" | "r", [string, string, string]>;
  /** Thigh, shin, foot per side: IK plants the feet where the pose puts the ankles, knees toward the pose's knees. */
  legs?: Record<"l" | "r", [string, string, string]>;
  chains: [string, string, string, string][] };
/** Renderpeople's rigged people (Unity export): hip, spine_01-03, neck, head, upperarm/lowerarm/hand, upperleg/lowerleg/foot. */
const RENDERPEOPLE: Rig = {
  hips: "hip",
  finger: (f, i, side) => (i > 3 ? `${f}_end_${side}` : `${f}_0${i}_${side}`),
  arms: { l: ["upperarm_l", "lowerarm_l", "hand_l"], r: ["upperarm_r", "lowerarm_r", "hand_r"] },
  legs: { l: ["upperleg_l", "lowerleg_l", "foot_l"], r: ["upperleg_r", "lowerleg_r", "foot_r"] },
  foot: "foot_l",
  neck: "neck",
  shl: "upperarm_l",
  shr: "upperarm_r",
  breathe: "spine_03",
  chains: [
    ["spine_01", "neck", "pelvis", "neck"],
    ["neck", "head_end", "neck", "headTop"],
    ["upperarm_l", "lowerarm_l", "shl", "ell"],
    ["lowerarm_l", "hand_l", "ell", "wrl"],
    ["upperarm_r", "lowerarm_r", "shr", "elr"],
    ["lowerarm_r", "hand_r", "elr", "wrr"],
    ["upperleg_l", "lowerleg_l", "hipl", "knl"],
    ["lowerleg_l", "foot_l", "knl", "anl"],
    ["upperleg_r", "lowerleg_r", "hipr", "knr"],
    ["lowerleg_r", "foot_r", "knr", "anr"],
  ],
};

type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";
const FINGERS: Finger[] = ["thumb", "index", "middle", "ring", "pinky"];

/**
 * Hand shapes: how far each finger joint (base, middle, tip) curls toward the palm, in radians. Fingers fan a
 * little: the outer ones curl more, as real hands do. The thumb has its own, smaller numbers.
 */
export type HandPose = "relaxed" | "grip" | "hold" | "rest" | "phone" | "wheel" | "viewer";
const HANDS: Record<HandPose, { fingers: number[]; thumb: number[] }> = {
  // Cradling a phone: the starting curl; the fingertips are then solved onto its edges (BotPerson.touch).
  phone: { fingers: [0.2, 0.6, 0.5], thumb: [0.3, 0.1, 0.05] },
  // A fist round the wheel's rim, the thumb wrapped over the front.
  wheel: { fingers: [1.15, 1.35, 1.0], thumb: [0.75, 0.6, 0.45] },
  // Steadying a viewer by its sides: fingers along the side and over the front edge, thumbs underneath.
  viewer: { fingers: [0.3, 0.55, 0.45], thumb: [0.55, 0.35, 0.25] },
  relaxed: { fingers: [0.32, 0.45, 0.32], thumb: [0.12, 0.18, 0.12] },
  grip: { fingers: [1.05, 1.25, 0.85], thumb: [0.45, 0.55, 0.4] },
  hold: { fingers: [0.55, 0.8, 0.55], thumb: [0.35, 0.3, 0.2] },
  rest: { fingers: [0.16, 0.24, 0.16], thumb: [0.08, 0.1, 0.08] },
};
/** How a phone sits in the hand (metres): the wrist's depth behind the back, how far in from the far edge the knuckles
 *  land, and how far below the centre. */
const PHONE = { back: 0.03, inset: 0.03, low: 0.07 };const FAN: Record<Finger, number> = { thumb: 1, index: 0.82, middle: 1, ring: 1.1, pinky: 1.22 };

/** A held slab (a phone), rig space: its centre, its up, its width direction (toward the hand's thumb side), the
 *  way its screen faces, and its size. Fingertips are solved onto it each frame. */
type Slab = { c: THREE.Vector3; U: THREE.Vector3; S: THREE.Vector3; O: THREE.Vector3; w: number; h: number; t: number };

/** Where a hand goes and how it's turned, in the rig's own space: the wrist, where the fingers point, where the palm faces. */
export type Grip = { wrist: THREE.Vector3; fingers: THREE.Vector3; palm: THREE.Vector3; shape: HandPose; slab?: Slab };

export class BotPerson {
  group = new THREE.Group();
  private holder = new THREE.Group();
  private model: THREE.Object3D;
  private bones = new Map<string, THREE.Object3D>();
  private rest = new Map<THREE.Object3D, THREE.Quaternion>();
  private restPos = new THREE.Vector3();
  private t = 0;
  private j: Joints = {};
  private rig: Rig = RENDERPEOPLE;
  private restFrame = new THREE.Quaternion();

  /** Each finger bone, with the axis (in its own space) that curls it toward the palm. */
  private knuckles: { bone: THREE.Object3D; axis: THREE.Vector3; f: Finger; i: number; side: "l" | "r"; curl: number }[] = [];
  /** Hands sent to something they hold; the rest follow the pose's wrists. */
  private grips: Partial<Record<"l" | "r", Grip>> = {};
  /** Per side: arm bone lengths, and the hand's own finger and palm directions (in its own space). */
  private armLen: Partial<Record<"l" | "r", [number, number]>> = {};
  private legLen: Partial<Record<"l" | "r", [number, number]>> = {};
  /** Each foot's orientation at rest (rig space), kept flat and turned with the body when planted. */
  private footRest: Partial<Record<"l" | "r", THREE.Quaternion>> = {};
  /** This frame's turn of the whole body from its rest facing. */
  private turnQ = new THREE.Quaternion();
  private handFrame: Partial<Record<"l" | "r", { f: THREE.Vector3; n: THREE.Vector3 }>> = {};
  /** Every person keeps their own time, so a room never breathes in unison. */
  private seed: number;

  constructor(
    model: THREE.Object3D,
    private poses: Joints[],
    /** Seconds per step between poses: one number for all, or one per step (a rep with its own rhythm). */
    private seconds: number | number[],
    private look = 0,
    private hands: [HandPose, HandPose] = ["relaxed", "relaxed"],
    seed = 0,
    /** palmsDown: hands flat on the floor, fingers toward the head (a push-up). glance: looks from what they hold up
     *  to what's in front of them and back (the Domis scan). */
    private habits: { palmsDown?: boolean; glance?: boolean; scan?: boolean } = {},
  ) {
    this.seed = seed;
    this.model = model;
    this.holder.scale.z = -1;
    this.group.add(this.holder);
    this.holder.add(model);
    model.traverse((o) => {
      if ((o as THREE.Bone).isBone) this.bones.set(o.name.replace(/:/g, ""), o);
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
      }
    });
    
    // Size it so its hips sit at the pose's pelvis height (about 0.95 m).
    model.updateMatrixWorld(true);
    // Measured on the bones (a skinned mesh's bounds can miss the armature's own scale): hip to ankle.
    const hips = this.bone(this.rig.hips), foot = this.bone(this.rig.foot);
    // Rigs rest in all sorts of orientations; only lengths are trusted here, and the facing is measured below.
    const at = (o: THREE.Object3D | null) => (o ? o.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3());
    model.scale.multiplyScalar(0.88 / Math.max(1e-6, at(hips).distanceTo(at(foot))));
    model.updateMatrixWorld(true);
    this.restPos.copy(model.position);
    for (const b of this.bones.values()) this.rest.set(b, b.quaternion.clone());
    // The rest pose's own frame (left, up, forward), from its bones, so the hips can be turned from there.
    this.group.updateWorldMatrix(true, true);
    const P = (n: string) => { const b = this.bone(n); return b ? this.local(b).pos : new THREE.Vector3(); };
    const up = P(this.rig.neck).sub(P(this.rig.hips)).normalize();
    const right = P(this.rig.shr).sub(P(this.rig.shl)).normalize();
    const fwd = new THREE.Vector3().crossVectors(up, right).normalize();
    const left = new THREE.Vector3().crossVectors(up, fwd).normalize();
    this.restFrame = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(left, up, fwd));
    this.measureHands();
    this.pose(0);
  }

  /**
   * At rest the palms face down (a T or A pose). Each finger joint's curl axis is the finger's direction crossed
   * with the palm normal, so turning about it brings the fingertip toward the palm. Kept in the bone's own space.
   */
  private measureHands() {
    for (const side of ["l", "r"] as const) {
      const leg = this.rig.legs?.[side];
      const bs = leg?.map((n) => this.bone(n));
      if (!leg || !bs || bs.some((b) => !b)) continue;
      const [u, l, f] = bs.map((b) => this.local(b!).pos);
      this.legLen[side] = [u.distanceTo(l), l.distanceTo(f)];
      this.footRest[side] = this.local(bs[2]!).quat;
    }
    const name = this.rig.finger;
    if (!name) return;
    const P = (n: string) => {
      const b = this.bone(n);
      return b ? this.local(b).pos : null;
    };
    for (const side of ["l", "r"] as const) {
      const i1 = P(name("index", 1, side)), i2 = P(name("index", 2, side)), p1 = P(name("pinky", 1, side));
      if (!i1 || !i2 || !p1) continue;
      const n = new THREE.Vector3().crossVectors(i2.clone().sub(i1), p1.clone().sub(i1)).normalize();
      if (n.y > 0) n.negate();
      const arm = this.rig.arms?.[side];
      const m1 = P(name("middle", 1, side));
      if (arm && m1) {
        const [u, l, h] = arm.map((b) => P(b)!);
        this.armLen[side] = [u.distanceTo(l), l.distanceTo(h)];
        const inv = this.local(this.bone(arm[2])!).quat.invert();
        this.handFrame[side] = { f: m1.clone().sub(h).normalize().applyQuaternion(inv), n: n.clone().applyQuaternion(inv) };
      }
      for (const f of FINGERS)
        for (let i = 1; i <= 3; i++) {
          const bone = this.bone(name(f, i, side)), a = P(name(f, i, side)), b = P(name(f, i + 1, side));
          if (!bone || !a || !b) continue;
          const axisH = new THREE.Vector3().crossVectors(b.clone().sub(a).normalize(), n).normalize();
          const axis = axisH.applyQuaternion(this.local(bone).quat.invert());
          this.knuckles.push({ bone, axis, f, i, side, curl: 0 });
        }
    }
  }

  /** Curls the fingers into each hand's shape, with a faint drift so hands are never quite still. */
  private shapeHands() {
    const t = this.t + this.seed * 7;
    for (const k of this.knuckles) {
      const shape = HANDS[this.grips[k.side]?.shape ?? this.hands[k.side === "l" ? 0 : 1]];
      const base = (k.f === "thumb" ? shape.thumb : shape.fingers)[k.i - 1] * (k.f === "thumb" ? 1 : FAN[k.f]);
      const drift = 0.035 * Math.sin(t * 0.55 + k.i * 0.7 + FINGERS.indexOf(k.f) * 1.3 + (k.side === "l" ? 0 : 2));
      k.curl = base + drift;
      k.bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(k.axis, k.curl));
    }
  }

  private bone(n: string) {
    return this.bones.get(n) ?? null;
  }

  update(dt: number) {
    this.t += dt;
    this.pose(this.t);
    this.shapeHands();
    if (this.look) this.lookAround();
    if (this.habits.glance) this.glanceUp();
    if (this.habits.scan) this.scan();
    this.touch();
  }

  /** Sends a hand to something it holds (null lets it go back to the pose). */
  grip(side: "l" | "r", g: Grip | null) {
    if (g) this.grips[side] = g;
    else delete this.grips[side];
  }

  /** A point and direction from the scene into the rig's own space. */
  toRig(p: THREE.Vector3) {
    this.group.updateWorldMatrix(true, false);
    return this.holder.worldToLocal(p.clone());
  }
  dirToRig(at: THREE.Vector3, d: THREE.Vector3) {
    return this.toRig(at.clone().add(d)).sub(this.toRig(at)).normalize();
  }

  /** The body's own frame now (rig space): right, up, forward, and the head. */
  private frame() {
    const shl = this.J("shl")!, shr = this.J("shr")!, pelvis = this.J("pelvis")!, neck = this.J("neck")!;
    const right = shr.clone().sub(shl).normalize();
    const up = neck.clone().sub(pelvis).normalize();
    return { right, up, fwd: new THREE.Vector3().crossVectors(up, right).normalize(), head: this.J("headBase") ?? neck };
  }
  /** `v` with its part along `n` removed, normalised. */
  private flat(v: THREE.Vector3, n: THREE.Vector3) {
    return v.clone().sub(n.clone().multiplyScalar(v.dot(n))).normalize();
  }

  /**
   * A phone held in the right hand, screen to the face: the palm against its back, low down, fingers running up
   * and across to hook the far edge, the thumb along the near one. Arguments are in scene space.
   */
  holdPhone(centre: THREE.Vector3, up: THREE.Vector3, out: THREE.Vector3, size: { w: number; h: number; t: number }) {
    const c = this.toRig(centre), U = this.dirToRig(centre, up), O = this.dirToRig(centre, out);
    const f = this.frame();
    if (O.dot(f.head.clone().sub(c)) < 0) O.negate(); // the screen faces the holder
    // Fingers run mostly across the back; the heel of the hand sits past the near edge so the knuckles land at the
    // far edge and the curled fingers hook round it.
    const L = this.flat(f.right.clone().negate(), O);
    const F = L.clone().multiplyScalar(0.85).add(U.clone().multiplyScalar(0.5)).normalize();
    // This body's own palm (wrist to the middle knuckle), so a smaller hand still lands its knuckles on the back.
    const hand = this.bone(this.rig.arms?.r[2] ?? ""), knuckle = this.bone(this.rig.finger?.("middle", 1, "r") ?? "");
    const palm = hand && knuckle ? this.local(hand).pos.distanceTo(this.local(knuckle).pos) : 0.08;
    const wrist = c.clone()
      .sub(O.clone().multiplyScalar(size.t / 2 + PHONE.back))
      .add(L.clone().multiplyScalar(size.w / 2 - PHONE.inset - palm * 0.85))
      .sub(U.clone().multiplyScalar(PHONE.low));
    this.grip("r", { wrist, fingers: F, palm: O, shape: "phone", slab: { c, U, S: L.clone().negate(), O, ...size } });
  }

  /**
   * Fingertips onto what the hand holds, solved every frame from wherever the knuckles are: each finger bends only
   * about its own knuckle axis (no twisting) until its tip rests on the far edge, level with its knuckle; the thumb
   * goes round the near edge and settles just over the screen.
   */
  private touch() {
    const name = this.rig.finger;
    if (!name) return;
    for (const side of ["l", "r"] as const) {
      const slab = this.grips[side]?.slab;
      if (!slab) continue;
      const { c, U, S, O, w, h, t } = slab;
      const at = (s: number, u: number, o: number) =>
        c.clone().add(S.clone().multiplyScalar(s)).add(U.clone().multiplyScalar(u)).add(O.clone().multiplyScalar(o));
      const u = (p: THREE.Vector3) => p.clone().sub(c).dot(U);
      const clampU = (v: number) => Math.min(h / 2 - 0.012, Math.max(-h / 2 + 0.008, v));
      const pos = (n: string) => { const b = this.bone(n); return b ? this.local(b).pos : null; };
      this.bone(this.rig.arms?.[side][2] ?? "")?.updateMatrixWorld(true);
      for (const f of FINGERS) {
        const chain = [1, 2, 3].map((i) => this.knuckles.find((k) => k.side === side && k.f === f && k.i === i));
        const tip = this.bone(name(f, 4, side)), root = pos(name(f, 1, side));
        if (chain.some((k) => !k) || !tip || !root) continue;
        if (f === "thumb") {
          // Tucked behind: the thumb lies along the back, out of sight, nowhere near the glass.
          const ru = u(root);
          const behind = -t / 2 - 0.017;
          this.ccd([chain[0]!], this.bone(name(f, 2, side))!, at(w / 2 - 0.004, clampU(ru + 0.022), behind), false);
          this.ccd([chain[2]!, chain[1]!], tip, at(w / 2 - 0.01, clampU(ru + 0.06), behind), false);
        } else {
          // The pad against the far edge, a touch round onto the front.
          this.ccd([chain[2]!, chain[1]!, chain[0]!], tip, at(-w / 2 - 0.005, clampU(u(root) + 0.004), 0.002), true);
        }
      }
    }
  }

  /**
   * Cyclic coordinate descent: each joint in turn, tip-most first, turns to bring `tip` toward `target`. Hinged
   * joints turn only about their curl axis and stay within a real finger's range; free ones (the thumb) turn any way.
   */
  private ccd(chain: { bone: THREE.Object3D; axis: THREE.Vector3; curl: number }[], tip: THREE.Object3D, target: THREE.Vector3, hinge: boolean) {
    for (let it = 0; it < 8; it++) {
      for (const k of chain) {
        const p = this.local(k.bone).pos, e = this.local(tip).pos;
        const a = e.sub(p), b = target.clone().sub(p);
        if (hinge) {
          const ax = k.axis.clone().applyQuaternion(this.local(k.bone).quat).normalize();
          a.sub(ax.clone().multiplyScalar(a.dot(ax)));
          b.sub(ax.clone().multiplyScalar(b.dot(ax)));
          if (a.lengthSq() < 1e-10 || b.lengthSq() < 1e-10) continue;
          let ang = Math.atan2(ax.dot(new THREE.Vector3().crossVectors(a, b)), a.dot(b));
          // Keep the joint between slightly straight and fully curled.
          ang = Math.min(1.75 - k.curl, Math.max(-0.15 - k.curl, ang));
          k.curl += ang;
          k.bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(k.axis, ang));
        } else {
          if (a.lengthSq() < 1e-10 || b.lengthSq() < 1e-10) continue;
          const dq = new THREE.Quaternion().setFromUnitVectors(a.normalize(), b.normalize());
          this.setLocalQuat(k.bone, dq.multiply(this.local(k.bone).quat));
          continue;
        }
        k.bone.updateMatrixWorld(true);
      }
    }
  }

  /** Both hands on a steering wheel at ten and two: fists round the rim, palms toward the hub. Scene space. */
  holdWheel(centre: THREE.Vector3, normal: THREE.Vector3, radius: number) {
    const c = this.toRig(centre), n = this.dirToRig(centre, normal);
    const f = this.frame();
    if (n.dot(f.head.clone().sub(c)) < 0) n.negate(); // faces the driver
    const up = this.flat(new THREE.Vector3(0, 1, 0), n), right = this.flat(f.right, n);
    const R = this.toRig(centre.clone().add(new THREE.Vector3(radius, 0, 0))).distanceTo(c);
    for (const [side, th] of [["l", -1], ["r", 1]] as const) {
      const a = th * (98 * Math.PI) / 180;
      const p = c.clone().add(right.clone().multiplyScalar(R * Math.sin(a))).add(up.clone().multiplyScalar(R * Math.cos(a)));
      const radial = p.clone().sub(c).normalize();
      const F = n.clone().negate();
      const N = radial.clone().negate();
      const wrist = p.clone().sub(F.clone().multiplyScalar(0.07)).sub(N.clone().multiplyScalar(0.03));
      this.grip(side, { wrist, fingers: F, palm: N, shape: "wheel" });
    }
  }

  /** A viewer held to the eyes with both hands on its sides, fingers along them, thumbs beneath. Scene space. */
  holdViewer(centre: THREE.Vector3, width: number) {
    const c = this.toRig(centre);
    const f = this.frame();
    const half = this.toRig(centre.clone().add(new THREE.Vector3(width / 2, 0, 0))).distanceTo(c);
    for (const [side, sgn] of [["l", -1], ["r", 1]] as const) {
      const out = f.right.clone().multiplyScalar(sgn);
      const p = c.clone().add(out.clone().multiplyScalar(half));
      const N = out.clone().negate();
      const F = f.fwd.clone().multiplyScalar(0.8).add(f.up.clone().multiplyScalar(0.45)).normalize();
      const wrist = p.clone().sub(N.clone().multiplyScalar(0.024)).sub(F.clone().multiplyScalar(0.07));
      this.grip(side, { wrist, fingers: F, palm: N, shape: "viewer" });
    }
  }

  /** Something held to the body (a viewer at the eyes) rides on the chest, so it turns with them. */
  carry(o: THREE.Object3D) {
    const chest = this.bone(this.rig.breathe);
    if (!chest) return;
    this.group.updateWorldMatrix(true, true);
    chest.attach(o);
  }

  /** Looking around: the upper body (arms, head and whatever they hold) turns slowly, unevenly, and comes back. */
  private lookAround() {
    const chest = this.bone(this.rig.breathe);
    if (!chest?.parent) return;
    const t = this.t;
    const a = ((this.look * Math.PI) / 180) * (0.72 * Math.sin(t * 0.38) + 0.28 * Math.sin(t * 0.91 + 1.3));
    const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(this.local(chest.parent).quat.invert());
    chest.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, a));
  }

  /** Standing or sitting still, a person isn't frozen: a slow breath lifts the chest a little. */
  private breathe() {
    const spine = this.bone(this.rig.breathe), l = this.J("shl"), r = this.J("shr");
    if (!spine?.parent || !l || !r) return;
    // About the body's side-to-side axis, so the chest lifts and settles.
    const axis = r.sub(l).normalize().applyQuaternion(this.local(spine.parent).quat.invert());
    const a = Math.sin((this.t + this.seed * 5) * 1.2) * 0.014;
    spine.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, -a));
    spine.updateMatrixWorld(true);
  }

  /** Which key pose the body is closest to right now (it has passed halfway to the next): what a screen syncs to. */
  get nearestPose() {
    return this.nearest;
  }
  private nearest = 0;

  private pose(t: number) {
    const n = this.poses.length;
    if (!n) return;
    let f = 0, a = this.poses[0], b = a;
    this.nearest = 0;
    const steps = Array.isArray(this.seconds) ? this.seconds : Array(n).fill(this.seconds);
    const cycle = steps.slice(0, n).reduce((s, v) => s + (v || 0), 0);
    if (n > 1 && cycle > 0) {
      let at = t % cycle, k = 0;
      while (k < n - 1 && at >= steps[k]) at -= steps[k++];
      a = this.poses[k];
      b = this.poses[(k + 1) % n];
      f = Math.min(1, at / Math.max(1e-4, steps[k]));
      this.nearest = f < 0.5 ? k : (k + 1) % n;
      f = f * f * (3 - 2 * f);
    }
    for (const key in a) {
      const p = a[key], q = b[key] ?? p;
      this.j[key] = [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, -(p[2] + (q[2] - p[2]) * f)];
    }
    this.idle();
    this.solve();
  }

  /**
   * The small motions of someone holding a pose: weight drifting from foot to foot (only when standing), the head
   * settling and turning a touch, shoulders rising with the breath. Slow, uneven, and different for everyone.
   */
  private idle() {
    const t = this.t + this.seed * 11;
    const pelvis = this.J("pelvis"), neck = this.J("neck"), shl = this.J("shl"), shr = this.J("shr"), hip = this.J("hipl"), knee = this.J("knl");
    if (!pelvis || !neck || !shl || !shr) return;
    const right = shr.clone().sub(shl).normalize();
    const up = neck.clone().sub(pelvis).normalize();
    const fwd = new THREE.Vector3().crossVectors(up, right).normalize();
    const standing = hip && knee ? Math.max(0, -knee.clone().sub(hip).normalize().y) : 0;
    const add = (k: string, v: THREE.Vector3) => {
      const p = this.j[k];
      if (p) this.j[k] = [p[0] + v.x, p[1] + v.y, p[2] + v.z];
    };
    const sway = right.clone().multiplyScalar(0.014 * standing * (0.7 * Math.sin(t * 0.42) + 0.3 * Math.sin(t * 0.97 + 1.7)));
    const carried: [string, number][] = [["pelvis", 1], ["hipl", 1], ["hipr", 1], ["neck", 0.55], ["shl", 0.55], ["shr", 0.55], ["headBase", 0.5], ["headTop", 0.5], ["ell", 0.4], ["elr", 0.4]];
    for (const [k, w] of carried) add(k, sway.clone().multiplyScalar(w));
    const breath = 0.005 * Math.sin(t * 1.2);
    for (const k of ["shl", "shr", "neck", "headBase", "headTop"]) add(k, new THREE.Vector3(0, breath, 0));
    // The head: a slow turn and a slower nod, a few degrees.
    add("headTop", right.clone().multiplyScalar(0.022 * Math.sin(t * 0.29 + 0.6)).add(fwd.clone().multiplyScalar(0.012 * Math.sin(t * 0.21 + 2.1))));
  }

  private J(k: string) {
    const p = this.j[k];
    return p ? new THREE.Vector3(p[0], p[1], p[2]) : null;
  }

  /** A transform relative to the holder (the rig's own right-handed space). */
  private local(o: THREE.Object3D) {
    const m = new THREE.Matrix4().copy(this.holder.matrixWorld).invert().multiply(o.matrixWorld);
    const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scl = new THREE.Vector3();
    m.decompose(pos, quat, scl);
    return { pos, quat };
  }

  private setLocalQuat(o: THREE.Object3D, q: THREE.Quaternion) {
    const parent = o.parent ? this.local(o.parent).quat : new THREE.Quaternion();
    o.quaternion.copy(parent.invert().multiply(q));
    o.updateMatrixWorld(true);
  }

  private solve() {
    for (const [bone, q] of this.rest) bone.quaternion.copy(q);
    this.model.position.copy(this.restPos);
    this.group.updateWorldMatrix(true, true);

    const hips = this.bone(this.rig.hips);
    const pelvis = this.J("pelvis"), neck = this.J("neck"), shl = this.J("shl"), shr = this.J("shr");
    if (!hips || !pelvis || !neck || !shl || !shr) return;

    // Facing: the rig rests facing +Z with its left along +X.
    const up = neck.clone().sub(pelvis).normalize();
    const right = shr.clone().sub(shl).normalize();
    const fwd = new THREE.Vector3().crossVectors(up, right).normalize();
    const left = new THREE.Vector3().crossVectors(up, fwd).normalize();
    const want = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(left, up, fwd));
    const turn = want.multiply(this.restFrame.clone().invert());
    this.turnQ.copy(turn);
    this.setLocalQuat(hips, turn.multiply(this.local(hips).quat));

    // Hips onto the pelvis.
    const at = this.local(hips).pos;
    this.model.position.add(pelvis.clone().sub(at));
    this.model.updateMatrixWorld(true);

    const armBones = new Set(Object.values(this.rig.arms ?? {}).flatMap((a) => a.slice(0, 2)));
    const legBones = new Set(Object.values(this.rig.legs ?? {}).flatMap((a) => a.slice(0, 2)));
    for (const [bn, cn, ja, jb] of this.rig.chains) {
      if (this.armLen.l && armBones.has(bn)) continue;
      if (this.legLen.l && legBones.has(bn)) continue;
      const bone = this.bone(bn), child = this.bone(cn), a = this.J(ja), b = this.J(jb);
      if (!bone || !child || !a || !b) continue;
      const pb = this.local(bone).pos, pc = this.local(child).pos;
      const cur = pc.sub(pb).normalize();
      const want = b.clone().sub(a).normalize();
      const dq = new THREE.Quaternion().setFromUnitVectors(cur, want);
      this.setLocalQuat(bone, dq.multiply(this.local(bone).quat));
    }
    for (const side of ["l", "r"] as const) this.plant(side);
    this.breathe();
    for (const side of ["l", "r"] as const) this.reach(side);
  }

  /** Feet on the ankles' marks (so a squat stays on the floor), knees toward the pose's knees, soles kept flat. */
  private plant(side: "l" | "r") {
    const leg = this.rig.legs?.[side], len = this.legLen[side], rest = this.footRest[side];
    const target = this.J(side === "l" ? "anl" : "anr"), pole = this.J(side === "l" ? "knl" : "knr");
    if (!leg || !len || !rest || !target || !pole) return;
    const [ub, lb, fb] = leg.map((n) => this.bone(n));
    if (!ub || !lb || !fb) return;
    this.twoBone(ub, lb, fb, len, target, pole);
    this.setLocalQuat(fb, this.turnQ.clone().multiply(rest));
  }

  /** Two-bone IK in rig space: the end goes to `target` (or as near as the bones reach), the middle bends toward `pole`. */
  private twoBone(ub: THREE.Object3D, lb: THREE.Object3D, eb: THREE.Object3D, [L1, L2]: [number, number], target: THREE.Vector3, pole: THREE.Vector3) {
    const s = this.local(ub).pos;
    const dir = target.clone().sub(s);
    const d = Math.min(L1 + L2 - 1e-3, Math.max(Math.abs(L1 - L2) + 1e-3, dir.length()));
    dir.normalize();
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const pv = pole.clone().sub(s);
    const perp = pv.sub(dir.clone().multiplyScalar(pv.dot(dir)));
    if (perp.lengthSq() < 1e-8) perp.set(0, -1, 0);
    perp.normalize();
    const mid = s.clone().add(dir.clone().multiplyScalar(a)).add(perp.multiplyScalar(h));
    const end = s.clone().add(dir.clone().multiplyScalar(d));
    this.aim(ub, lb, mid.clone().sub(s));
    this.aim(lb, eb, end.clone().sub(mid));
  }

  /** Aims a bone so its child lies along `to` from it. */
  private aim(bone: THREE.Object3D, child: THREE.Object3D, to: THREE.Vector3) {
    const cur = this.local(child).pos.sub(this.local(bone).pos).normalize();
    const dq = new THREE.Quaternion().setFromUnitVectors(cur, to.clone().normalize());
    this.setLocalQuat(bone, dq.multiply(this.local(bone).quat));
  }

  /**
   * Two-bone IK: the wrist goes exactly to its target (the grip's, or the pose's), the elbow bends toward the pose's
   * elbow. Then, holding something, the hand turns so its fingers and palm face the way the grip says.
   */
  private reach(side: "l" | "r") {
    const arm = this.rig.arms?.[side], len = this.armLen[side];
    if (!arm || !len) return;
    const [ub, lb, hb] = arm.map((n) => this.bone(n));
    const g = this.grips[side];
    const target = g?.wrist.clone() ?? this.J(side === "l" ? "wrl" : "wrr");
    const pole = this.J(side === "l" ? "ell" : "elr");
    if (!ub || !lb || !hb || !target || !pole) return;
    this.twoBone(ub, lb, hb, len, target, pole);
    const hf = this.handFrame[side];
    if (!hf) return;
    if (!g && this.habits.palmsDown) {
      // Flat on the floor: palm down, fingers pointing the way the head is (flattened onto the floor).
      const head = this.J("neck")!.sub(this.J("pelvis")!);
      head.y = 0;
      if (head.lengthSq() < 1e-6) return;
      const q = this.handBasis(head, new THREE.Vector3(0, -1, 0), hf);
      this.setLocalQuat(hb, q);
      return;
    }
    if (!g) return;
    this.setLocalQuat(hb, this.handBasis(g.fingers, g.palm, hf));
  }

  /** The hand's rotation (rig space) that points its fingers along `fingers` with its palm facing `palm`. */
  private handBasis(fingers: THREE.Vector3, palm: THREE.Vector3, hf: { f: THREE.Vector3; n: THREE.Vector3 }) {
    const basis = (f: THREE.Vector3, n: THREE.Vector3) => {
      const F = f.clone().normalize();
      const N = n.clone().sub(F.clone().multiplyScalar(n.dot(F))).normalize();
      return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(F, N, new THREE.Vector3().crossVectors(F, N)));
    };
    return basis(fingers, palm).multiply(basis(hf.f, hf.n).invert());
  }

  /**
   * Watching a screen: the head drifts across it and back, a few degrees each way, never quite repeating; the arms
   * and hands stay where they are (only the head turns).
   */
  private scan() {
    const head = this.bone("head") ?? this.bone(this.rig.neck);
    const l = this.J("shl"), r = this.J("shr");
    if (!head?.parent || !l || !r) return;
    const t = this.t + this.seed * 17;
    const yaw = 0.11 * Math.sin(t * 0.31) + 0.05 * Math.sin(t * 0.73 + 1.1);
    const pitch = 0.035 * Math.sin(t * 0.47 + 0.4);
    const inv = this.local(head.parent).quat.invert();
    const upAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(inv);
    const sideAxis = r.sub(l).normalize().applyQuaternion(inv);
    head.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(upAxis, yaw));
    head.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(sideAxis, pitch));
    head.updateMatrixWorld(true);
  }

  /**
   * Every few seconds the head lifts from what they hold to what's in front of them (the fridge's nameplate), stays
   * a moment, and comes back. A held, eased look rather than a wobble.
   */
  private glanceUp() {
    const head = this.bone("head") ?? this.bone(this.rig.neck);
    const l = this.J("shl"), r = this.J("shr");
    if (!head?.parent || !l || !r) return;
    const period = 6.5, p = ((this.t + this.seed * 13) % period) / period;
    // Up between 55% and 85% of the cycle, easing in and out over about half a second each way.
    const ramp = (x: number) => Math.min(1, Math.max(0, x));
    const up = ramp((p - 0.55) / 0.08) * ramp((0.85 - p) / 0.08);
    const w = up * up * (3 - 2 * up);
    const side = r.sub(l).normalize();
    const axis = side.applyQuaternion(this.local(head.parent).quat.invert());
    head.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, -0.32 * w));
    // ...with a small turn toward the fridge's top corner while up.
    const upAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(this.local(head.parent).quat.invert());
    head.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(upAxis, 0.12 * w));
    head.updateMatrixWorld(true);
  }
}
