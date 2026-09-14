"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { MIGHTY_HAND_SRC } from "@/data/home-painting-storyboard";

const VERT = /* glsl */ `
uniform sampler2D tMap;
uniform float uAmp;
varying vec2 vUv;

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vUv = uv;
  float h = luma(texture2D(tMap, uv).rgb);
  vec3 pos = position;
  pos.z += (h - 0.28) * uAmp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D tMap;
uniform float uTime;
uniform float uZoom;
uniform float uVignette;
uniform float uLight;
uniform vec2 uMouse;
varying vec2 vUv;

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 uv = (vUv - 0.5) / uZoom + 0.5;
  vec4 tex = texture2D(tMap, uv);
  vec3 color = tex.rgb;

  float eps = 0.003;
  float hC = luma(texture2D(tMap, uv).rgb);
  float hX = luma(texture2D(tMap, uv + vec2(eps, 0.0)).rgb);
  float hY = luma(texture2D(tMap, uv + vec2(0.0, eps)).rgb);
  vec3 nor = normalize(vec3(hC - hX, hC - hY, 0.42));
  vec3 lightDir = normalize(vec3(uMouse.x * 0.9, uMouse.y * 0.55, 1.0));
  float ndl = mix(1.0, max(dot(nor, lightDir), 0.0), uLight);
  float spec = pow(max(dot(nor, normalize(lightDir + vec3(0.0, 0.0, 1.0))), 0.0), 36.0);
  color *= mix(0.82, 1.08, ndl);
  color += spec * uLight * 0.16 * vec3(0.96, 0.86, 0.68);

  float vig = smoothstep(1.15, 0.28, length(vUv - 0.5));
  color *= mix(1.0 - uVignette, 1.0, vig);

  gl_FragColor = vec4(color, 1.0);
}
`;

function coverScale(
  camera: THREE.PerspectiveCamera,
  viewAspect: number,
  planeW: number,
  planeH: number,
) {
  const dist = camera.position.z;
  const vFov = (camera.fov * Math.PI) / 180;
  const visibleH = 2 * Math.tan(vFov / 2) * dist;
  const visibleW = visibleH * viewAspect;
  return Math.max(visibleW / planeW, visibleH / planeH) * 1.02;
}

export type LivingPaintingParams = {
  displace: number;
  zoom: number;
  vignette: number;
  light: number;
  tilt: number;
  follow: number;
  idle: boolean;
  idleAmount: number;
  idleSpeed: number;
};

export function LivingPaintingCanvas({
  paramsRef,
  reduceMotion,
}: {
  paramsRef: RefObject<LivingPaintingParams>;
  reduceMotion: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || reduceMotion) return;

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      mouse.ty = -(((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1);
    };
    const onLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    const boot = async () => {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
        });
      } catch {
        return;
      }

      renderer.setClearColor(0x120a1c, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
      camera.position.z = 6.1;
      const group = new THREE.Group();
      scene.add(group);

      const tex = await new Promise<THREE.Texture>((resolve, reject) => {
        new THREE.TextureLoader().load(
          MIGHTY_HAND_SRC,
          resolve,
          undefined,
          reject,
        );
      });
      if (disposed) {
        tex.dispose();
        renderer.dispose();
        return;
      }

      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 1;

      const uniforms = {
        tMap: { value: tex },
        uAmp: { value: 0.2 },
        uTime: { value: 0 },
        uZoom: { value: 1.03 },
        uVignette: { value: 0.14 },
        uLight: { value: 0.28 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      };

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 4, 80, 108), mat);
      group.add(mesh);

      const resize = () => {
        const w = wrap.clientWidth || 1;
        const h = wrap.clientHeight || 1;
        renderer!.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const s = coverScale(camera, w / h, 3, 4);
        mesh.scale.set(s, s, 1);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(wrap);
      resize();

      const t0 = performance.now();
      const tick = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const p = paramsRef.current;
        const t = (now - t0) / 1000;
        const breathe = p.idle
          ? 0.5 + 0.5 * Math.sin(t * p.idleSpeed * Math.PI * 2)
          : 0;
        uniforms.uAmp.value = p.displace * (1 + 0.08 * breathe * p.idleAmount);
        uniforms.uZoom.value = p.zoom;
        uniforms.uVignette.value = p.vignette;
        uniforms.uLight.value = p.light * (1 + 0.18 * breathe * p.idleAmount);
        uniforms.uTime.value = t;

        const follow = p.follow;
        mouse.x += (mouse.tx - mouse.x) * follow;
        mouse.y += (mouse.ty - mouse.y) * follow;
        uniforms.uMouse.value.set(mouse.x, mouse.y);

        const tilt = p.tilt;
        group.rotation.y += (mouse.x * tilt - group.rotation.y) * follow;
        group.rotation.x += (-mouse.y * tilt * 0.7 - group.rotation.x) * follow;

        renderer!.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      (
        wrap as HTMLDivElement & { __cleanup?: () => void }
      ).__cleanup = () => {
        ro.disconnect();
        tex.dispose();
        mat.dispose();
        mesh.geometry.dispose();
      };
    };

    void boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      (wrap as HTMLDivElement & { __cleanup?: () => void }).__cleanup?.();
      renderer?.dispose();
    };
  }, [paramsRef, reduceMotion]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      style={{ touchAction: "pan-y" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MIGHTY_HAND_SRC}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
        decoding="async"
      />
      {!reduceMotion ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
