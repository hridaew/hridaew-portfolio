import * as THREE from "three";
import { roundedBox } from "./geometry";

/**
 * The record player in About, modelled: plinth on feet, platter and mat, a 12" record (grooves, track gaps, the
 * album as its centre label), spindle, and a tonearm with pivot, counterweight, headshell and cartridge.
 *
 * When its room is the one in focus it plays: the platter spins up to 33⅓, the arm lifts, swings over and sets down
 * on the outer groove, and creeps inward while it plays. Leaving, the arm lifts back to its rest and the platter
 * spins down.
 *
 * Built in scene.json's numbers (metres, +y up, the front faces -z), origin at the middle of its base.
 */

const W = 0.45, D = 0.355; // plinth footprint
const FOOT = 0.012, BODY = 0.075;
const TOP = FOOT + BODY; // the top plate
const CENTER = new THREE.Vector2(-0.045, 0); // platter centre (x, z)
const PIVOT = new THREE.Vector2(0.165, 0.105); // tonearm pivot (x, z)
const ARM = 0.236; // pivot to stylus
const RPM = 100 / 3;
const SPIN = (RPM / 60) * Math.PI * 2; // rad/s
const GROOVE_OUT = 0.142, GROOVE_IN = 0.066; // where the stylus plays, metres from the centre
const PLAY_SECONDS = 420; // one side, more or less: how long the arm takes to creep across

type Mat = (name: string) => THREE.Material;

/** The record's face: black vinyl, fine grooves, a few quiet gaps between tracks, a smooth run-out near the label. */
function grooveTexture() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0d0d0e";
  ctx.fillRect(0, 0, S, S);
  const R = S / 2;
  const gaps = [0.62, 0.71, 0.79, 0.88];
  for (let r = 0.36; r < 0.985; r += 0.0028) {
    const gap = gaps.some((g) => Math.abs(r - g) < 0.006);
    ctx.strokeStyle = gap ? "rgba(255,255,255,0.02)" : `rgba(255,255,255,${0.06 + ((r * 997) % 1) * 0.05})`;
    ctx.lineWidth = gap ? 3 : 1;
    ctx.beginPath();
    ctx.arc(R, R, r * R, 0, Math.PI * 2);
    ctx.stroke();
  }
  // The pressed lip at the edge.
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(R, R, 0.992 * R, 0, Math.PI * 2);
  ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The arm's yaw that puts the stylus `r` metres from the platter centre (searched, it's one smooth curve). */
function yawFor(r: number) {
  let best = 0, err = Infinity;
  for (let a = 0; a <= 1.4; a += 0.0005) {
    const sx = PIVOT.x - ARM * Math.sin(a), sz = PIVOT.y - ARM * Math.cos(a);
    const e = Math.abs(Math.hypot(sx - CENTER.x, sz - CENTER.y) - r);
    if (e < err) {
      err = e;
      best = a;
    }
  }
  return best;
}

export class Turntable {
  readonly object = new THREE.Group();
  private spinner = new THREE.Group();
  private armYaw = new THREE.Group();
  private armLift = new THREE.Group();
  private led: THREE.MeshStandardMaterial;
  private speed = 0;
  private yaw = 0; // current arm yaw
  private lift = 0; // 0 down, 1 raised
  private playing = false;
  private played = 0; // seconds into the side
  private phase: "rest" | "lifting" | "swinging" | "lowering" | "playing" | "returning" = "rest";
  private t = 0;
  private from = 0;
  private yawRest = 0;
  private yawOuter = yawFor(GROOVE_OUT);
  private yawInner = yawFor(GROOVE_IN);
  private disposables: { dispose(): void }[] = [];

  constructor(mat: Mat, label: Promise<THREE.Texture | null>) {
    const keep = <T extends { dispose(): void }>(x: T) => (this.disposables.push(x), x);
    const plastic = mat("Graphite");
    const metal = mat("Satin");
    const vinyl = keep(new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: keep(grooveTexture()), roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25 }));
    const vinylEdge = keep(new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.4 }));
    const rubber = keep(new THREE.MeshStandardMaterial({ color: 0x1a1a1b, roughness: 0.95 }));
    const labelMat = keep(new THREE.MeshStandardMaterial({ color: 0x8c2a24, roughness: 0.7 }));
    label.then((tex) => {
      if (!tex) return;
      labelMat.map = tex;
      labelMat.color.set(0xffffff);
      labelMat.needsUpdate = true;
    });
    this.led = keep(new THREE.MeshStandardMaterial({ color: 0x3a1210, emissive: 0xff3b2f, emissiveIntensity: 0, roughness: 0.4 }));

    const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(keep(geo), m);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // Plinth on four feet.
    for (const [fx, fz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      add(this.object, new THREE.CylinderGeometry(0.022, 0.024, FOOT, 20), rubber, fx * (W / 2 - 0.045), FOOT / 2, fz * (D / 2 - 0.045));
    add(this.object, roundedBox([W, BODY, D], 0.014, 0.01), plastic, 0, FOOT + BODY / 2, 0);
    // A thin satin top plate, inset, the deck the parts sit on.
    add(this.object, roundedBox([W - 0.012, 0.003, D - 0.012], 0.01, 0.0015), metal, 0, TOP + 0.0005, 0);

    // The spinning stack: platter, mat, record, label, spindle.
    this.spinner.position.set(CENTER.x, TOP, CENTER.y);
    this.object.add(this.spinner);
    add(this.spinner, new THREE.CylinderGeometry(0.149, 0.149, 0.016, 72), metal, 0, 0.008 + 0.002, 0);
    add(this.spinner, new THREE.CylinderGeometry(0.145, 0.145, 0.003, 72), rubber, 0, 0.0195, 0);
    const recY = 0.0225;
    add(this.spinner, new THREE.CylinderGeometry(0.1505, 0.1505, 0.0018, 96, 1, true), vinylEdge, 0, recY, 0);
    const face = add(this.spinner, new THREE.CircleGeometry(0.1505, 96), vinyl, 0, recY + 0.0009, 0);
    face.rotation.x = -Math.PI / 2;
    const lab = add(this.spinner, new THREE.CircleGeometry(0.05, 64), labelMat, 0, recY + 0.0011, 0);
    lab.rotation.x = -Math.PI / 2;
    add(this.spinner, new THREE.CylinderGeometry(0.0035, 0.0035, 0.014, 16), metal, 0, recY + 0.006, 0);

    // Tonearm: base, pivot post, then the arm on a yaw (swing) and a lift (cue) hinge.
    const base = new THREE.Group();
    base.position.set(PIVOT.x, TOP, PIVOT.y);
    this.object.add(base);
    add(base, new THREE.CylinderGeometry(0.03, 0.032, 0.012, 40), metal, 0, 0.006, 0);
    add(base, new THREE.CylinderGeometry(0.011, 0.012, 0.03, 24), metal, 0, 0.012 + 0.015, 0);
    this.armYaw.position.set(0, 0.044, 0);
    base.add(this.armYaw);
    this.armYaw.add(this.armLift);
    // Arm tube toward the front (-z), dipping a touch to the headshell.
    const tube = add(this.armLift, new THREE.CylinderGeometry(0.0035, 0.0035, ARM - 0.03, 16), metal, 0, 0, -(ARM - 0.03) / 2);
    tube.rotation.x = Math.PI / 2;
    const shell = add(this.armLift, new THREE.BoxGeometry(0.016, 0.004, 0.034), metal, 0, -0.004, -(ARM - 0.012));
    shell.rotation.x = -0.12;
    add(this.armLift, new THREE.BoxGeometry(0.011, 0.012, 0.016), plastic, 0, -0.012, -ARM); // cartridge
    add(this.armLift, new THREE.BoxGeometry(0.004, 0.004, 0.012), metal, 0.009, -0.002, -(ARM - 0.03)); // finger lift
    // Counterweight behind the pivot.
    const cw = add(this.armLift, new THREE.CylinderGeometry(0.016, 0.016, 0.03, 32), metal, 0, 0, 0.045);
    cw.rotation.x = Math.PI / 2;
    const stub = add(this.armLift, new THREE.CylinderGeometry(0.0035, 0.0035, 0.06, 12), metal, 0, 0, 0.03);
    stub.rotation.x = Math.PI / 2;
    // The arm rest it parks on, just in front of the pivot.
    add(this.object, new THREE.CylinderGeometry(0.004, 0.005, 0.039, 12), metal, PIVOT.x, TOP + 0.0195, PIVOT.y - 0.13);

    // Start button and the speed light, front left.
    add(this.object, new THREE.CylinderGeometry(0.012, 0.012, 0.005, 24), metal, -W / 2 + 0.04, TOP + 0.0025, -D / 2 + 0.035);
    add(this.object, new THREE.SphereGeometry(0.0028, 12, 8), this.led, -W / 2 + 0.07, TOP + 0.002, -D / 2 + 0.035);

    this.object.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.yaw = this.yawRest;
    this.apply();
  }

  /** `on`: its room is in focus. `still`: reduced motion (the record sits, the arm is set on it). */
  update(dt: number, on: boolean, still: boolean) {
    if (on !== this.playing) {
      this.playing = on;
      this.t = 0;
      this.from = this.yaw;
      this.phase = on ? "lifting" : "returning";
      if (still) {
        this.phase = on ? "playing" : "rest";
        this.yaw = on ? this.playYaw() : this.yawRest;
        this.lift = 0;
      }
    }
    // The platter has weight: it spins up and down over about half a second.
    const target = on && !still ? SPIN : 0;
    this.speed += (target - this.speed) * (1 - Math.exp(-dt / 0.45));
    this.spinner.rotation.y += this.speed * dt;
    this.led.emissiveIntensity = on ? 1.4 : 0;

    this.t += dt;
    switch (this.phase) {
      case "lifting": // the cue lever raises the arm off its rest
        this.lift = Math.min(1, this.t / 0.25);
        if (this.t >= 0.35) this.next("swinging");
        break;
      case "swinging": {
        const k = Math.min(1, this.t / 0.9);
        this.yaw = this.from + (this.playYaw() - this.from) * easeInOut(k);
        if (k >= 1) this.next("lowering");
        break;
      }
      case "lowering":
        this.lift = Math.max(0, 1 - this.t / 0.45);
        if (this.lift <= 0) this.next("playing");
        break;
      case "playing":
        this.played = Math.min(PLAY_SECONDS, this.played + dt);
        this.yaw = this.playYaw();
        break;
      case "returning": {
        // Up, back to the rest, down.
        this.lift = Math.min(1, this.t / 0.2);
        const k = Math.min(1, Math.max(0, (this.t - 0.2) / 0.8));
        this.yaw = this.from + (this.yawRest - this.from) * easeInOut(k);
        if (k >= 1) {
          this.lift = Math.max(0, 1 - (this.t - 1.0) / 0.3);
          if (this.lift <= 0) this.next("rest");
        }
        break;
      }
    }
    this.apply();
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }

  private next(phase: Turntable["phase"]) {
    this.phase = phase;
    this.t = 0;
    this.from = this.yaw;
  }

  private playYaw() {
    return this.yawOuter + (this.yawInner - this.yawOuter) * (this.played / PLAY_SECONDS);
  }

  private apply() {
    this.armYaw.rotation.y = this.yaw;
    // Raised: the headshell clears the record by a few millimetres. Down: the stylus rests in the groove.
    this.armLift.rotation.x = -0.012 + this.lift * 0.05;
  }
}
