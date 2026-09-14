"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  PAINTING_BRUSH_MAP,
  PAINTING_SEQUENCE,
} from "@/data/home-painting-sequence";

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform sampler2D tBrush;
uniform float uMix;
uniform float uDissolve;
varying vec2 vUv;

void main() {
  vec3 a = texture2D(tFrom, vUv).rgb;
  vec3 b = texture2D(tTo, vUv).rgb;
  float n = texture2D(tBrush, vUv).r;
  float w = uDissolve;
  float p = mix(-w, 1.0 + w, uMix);
  float m = smoothstep(n - w, n + w, p);
  gl_FragColor = vec4(mix(a, b, m), 1.0);
}
`;

function loadTex(
  loader: THREE.TextureLoader,
  url: string,
  colorSpace: THREE.ColorSpace,
) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = colorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        resolve(tex);
      },
      undefined,
      reject,
    );
  });
}

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

export type SequenceParams = {
  mix: number;
  dissolve: number;
};

export function PaintingSequenceCanvas({
  paramsRef,
  reduceMotion,
}: {
  paramsRef: RefObject<SequenceParams>;
  reduceMotion: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!wrap || !canvas) return;

    if (reduceMotion) {
      const tick = () => {
        if (!img) return;
        const src =
          paramsRef.current.mix < 0.5
            ? PAINTING_SEQUENCE[0].src
            : PAINTING_SEQUENCE[1].src;
        if (!img.src.endsWith(src)) img.src = src;
      };
      const id = window.setInterval(tick, 120);
      tick();
      return () => window.clearInterval(id);
    }

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;

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

      const loader = new THREE.TextureLoader();
      const [from, to, brush] = await Promise.all([
        loadTex(loader, PAINTING_SEQUENCE[0].src, THREE.SRGBColorSpace),
        loadTex(loader, PAINTING_SEQUENCE[1].src, THREE.SRGBColorSpace),
        loadTex(loader, PAINTING_BRUSH_MAP, THREE.NoColorSpace),
      ]);
      if (disposed) {
        from.dispose();
        to.dispose();
        brush.dispose();
        renderer.dispose();
        return;
      }

      const uniforms = {
        tFrom: { value: from },
        tTo: { value: to },
        tBrush: { value: brush },
        uMix: { value: 0 },
        uDissolve: { value: 0.18 },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), mat);
      scene.add(mesh);

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

      const tick = () => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const p = paramsRef.current;
        uniforms.uMix.value = p.mix;
        uniforms.uDissolve.value = p.dissolve;
        renderer!.render(scene, camera);
        if (img && uniforms.uMix.value > 0.02) img.style.opacity = "0";
      };
      raf = requestAnimationFrame(tick);

      (wrap as HTMLDivElement & { __cleanup?: () => void }).__cleanup = () => {
        ro.disconnect();
        from.dispose();
        to.dispose();
        brush.dispose();
        mat.dispose();
        mesh.geometry.dispose();
      };
    };

    void boot();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      (wrap as HTMLDivElement & { __cleanup?: () => void }).__cleanup?.();
      renderer?.dispose();
    };
  }, [paramsRef, reduceMotion]);

  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ touchAction: "pan-y" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={PAINTING_SEQUENCE[0].src}
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
