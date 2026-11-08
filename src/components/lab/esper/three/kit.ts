import * as THREE from "three";

/**
 * Better shapes than boxes: turned profiles, smooth tubes, and people built from a pose (joint positions) with
 * tapered limbs, hands, feet, a head and hair. Everything is in the scene's own (Unity-style) numbers.
 */

/** A surface of revolution: profile as [radius, height] pairs, bottom to top. */
export function lathe(profile: number[], segments = 48) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < profile.length; i += 2) pts.push(new THREE.Vector2(profile[i], profile[i + 1]));
  const g = new THREE.LatheGeometry(pts, segments);
  g.computeVertexNormals();
  return g;
}

/** A smooth tube through points [x,y,z,...] of diameter d, with rounded ends. */
export function tube(path: number[], d: number, closed = false) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < path.length; i += 3) pts.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
  const r = d / 2;
  const group = new THREE.Group();
  if (pts.length < 2) return { group, geometries: [] as THREE.BufferGeometry[] };
  const curve = pts.length === 2 ? new THREE.LineCurve3(pts[0], pts[1]) : new THREE.CatmullRomCurve3(pts, closed, "centripetal", 0.5);
  const geoms: THREE.BufferGeometry[] = [new THREE.TubeGeometry(curve as THREE.Curve<THREE.Vector3>, Math.max(8, pts.length * 12), r, 14, closed)];
  if (!closed) {
    for (const p of [pts[0], pts[pts.length - 1]]) {
      const cap = new THREE.SphereGeometry(r, 14, 10);
      cap.translate(p.x, p.y, p.z);
      geoms.push(cap);
    }
  }
  return { group, geometries: geoms };
}

// ---------------- people ----------------

export type Joints = Record<string, number[]>;
