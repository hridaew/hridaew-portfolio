"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  PAINTING_BRUSH_MAPS,
  PAINTING_GRAIN_MAP,
  PAINTING_SEQUENCE,
} from "@/data/home-painting-sequence";
import { playheadToFrameIndex, playheadToPair } from "./usePaintingSequenceDials";

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
uniform sampler2D tGrain;
uniform float uMix;
uniform float uDissolve;
varying vec2 vUv;

void main() {
  vec3 a = texture2D(tFrom, vUv).rgb;
  vec3 b = texture2D(tTo, vUv).rgb;
  float fig = texture2D(tBrush, vUv).r;
  float fig2 = texture2D(tBrush, vUv.yx * 1.65 + vec2(0.12, 0.07)).r;
  float grain = texture2D(tGrain, vUv * 2.15 + vec2(0.08, 0.19)).r;
  float n = mix(mix(fig, fig2, 0.28), grain, 0.34);
  float w = max(0.02, uDissolve);
  float p = mix(-w, 1.0 + w, uMix);
  float m = smoothstep(n - w, n + w, p);
  gl_FragColor = vec4(mix(a, b, m), 1.0);
}
`;

function loadTex(
  loader: THREE.TextureLoader,
  url: string,
  colorSpace: THREE.ColorSpace,
  wrap: THREE.Wrapping = THREE.ClampToEdgeWrapping,
) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = colorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = wrap;
        tex.wrapT = wrap;
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
  playhead: number;
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

    const syncImg = (playhead: number) => {
      if (!img) return;
      const idx = playheadToFrameIndex(playhead, PAINTING_SEQUENCE.length);
      const src = PAINTING_SEQUENCE[idx].src;
      if (!img.getAttribute("src")?.endsWith(src)) img.src = src;
    };

    if (reduceMotion) {
      const tick = () => syncImg(paramsRef.current.playhead);
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
      const [frames, brushes, grain] = await Promise.all([
        Promise.all(
          PAINTING_SEQUENCE.map((frame) =>
            loadTex(loader, frame.src, THREE.SRGBColorSpace),
          ),
        ),
        Promise.all(
          PAINTING_BRUSH_MAPS.map((url) =>
            loadTex(loader, url, THREE.NoColorSpace, THREE.RepeatWrapping),
          ),
        ),
        loadTex(
          loader,
          PAINTING_GRAIN_MAP,
          THREE.NoColorSpace,
          THREE.RepeatWrapping,
        ),
      ]);
      if (disposed) {
        frames.forEach((t) => t.dispose());
        brushes.forEach((t) => t.dispose());
        grain.dispose();
        renderer.dispose();
        return;
      }

      const uniforms = {
        tFrom: { value: frames[0] },
        tTo: { value: frames[Math.min(1, frames.length - 1)] },
        tBrush: { value: brushes[0] },
        tGrain: { value: grain },
        uMix: { value: 0 },
        uDissolve: { value: 0.16 },
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

      if (img) img.style.opacity = "0";

      const tick = () => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const p = paramsRef.current;
        const { fromIndex, mix } = playheadToPair(
          p.playhead,
          PAINTING_SEQUENCE.length,
        );
        uniforms.tFrom.value = frames[fromIndex];
        uniforms.tTo.value = frames[fromIndex + 1];
        uniforms.tBrush.value = brushes[Math.min(fromIndex, brushes.length - 1)];
        uniforms.uMix.value = mix;
        uniforms.uDissolve.value = p.dissolve;
        renderer!.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      (wrap as HTMLDivElement & { __cleanup?: () => void }).__cleanup = () => {
        ro.disconnect();
        frames.forEach((t) => t.dispose());
        brushes.forEach((t) => t.dispose());
        grain.dispose();
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
