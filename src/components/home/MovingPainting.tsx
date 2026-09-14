"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { PAINTING_FRAMES, PAINTING_MAPS, paintingProgressToFrame } from "@/data/home-painting-sequence";

const VERT = /* glsl */ `
uniform sampler2D tDisplace;
uniform float uAmp;
varying vec2 vUv;

void main() {
  vUv = uv;
  float h = texture2D(tDisplace, uv).r;
  vec3 pos = position;
  pos.z += (h - 0.42) * uAmp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform sampler2D tBrush;
uniform sampler2D tDisplace;
uniform sampler2D tWeave;
uniform float uMix;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIdle;
uniform float uReady;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv += uIdle * 0.0016 * vec2(
    sin(uTime * 0.33 + vUv.y * 7.5),
    cos(uTime * 0.27 + vUv.x * 6.5)
  );

  vec4 a = texture2D(tFrom, uv);
  vec4 b = texture2D(tTo, uv);

  float n = texture2D(tBrush, uv).r;
  float w = 0.16;
  float p = mix(-w, 1.0 + w, uMix);
  float m = smoothstep(n - w, n + w, p);

  vec3 color = mix(a.rgb, b.rgb, m);

  float eps = 0.0035;
  float hC = texture2D(tDisplace, uv).r;
  float hX = texture2D(tDisplace, uv + vec2(eps, 0.0)).r;
  float hY = texture2D(tDisplace, uv + vec2(0.0, eps)).r;
  vec3 nor = normalize(vec3(hC - hX, hC - hY, 0.38));
  vec3 lightDir = normalize(vec3(uMouse.x * 0.85, uMouse.y * 0.55, 1.0));
  float ndl = 0.8 + 0.2 * max(dot(nor, lightDir), 0.0);
  float spec = pow(max(dot(nor, normalize(lightDir + vec3(0.0, 0.0, 1.0))), 0.0), 32.0) * 0.1;
  color *= ndl;
  color += spec * vec3(0.96, 0.86, 0.68);

  float weave = texture2D(tWeave, uv * 2.8).r;
  color *= mix(1.0, weave * 1.1, 0.14);

  float vig = smoothstep(1.2, 0.32, length(vUv - 0.5));
  color *= mix(0.9, 1.0, vig);

  gl_FragColor = vec4(color, uReady);
}
`;

function loadTexture(
  loader: THREE.TextureLoader,
  url: string,
  colorSpace: THREE.ColorSpace,
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = colorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.anisotropy = 1;
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
  return Math.max(visibleW / planeW, visibleH / planeH) * 1.06;
}

export function MovingPainting({
  progressRef,
  reduceMotion,
  className,
}: {
  progressRef: RefObject<number>;
  reduceMotion: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const fallback = imgRef.current;
    const setFallbackFrame = (index: number) => {
      if (!fallback) return;
      const i = Math.max(
        0,
        Math.min(PAINTING_FRAMES.length - 1, Math.round(index)),
      );
      const next = PAINTING_FRAMES[i].src;
      if (!fallback.src.endsWith(next)) {
        fallback.src = next;
      }
    };

    if (reduceMotion) {
      canvas.style.opacity = "0";
      const tick = () => {
        setFallbackFrame(paintingProgressToFrame(progressRef.current));
      };
      const id = window.setInterval(tick, 120);
      tick();
      return () => window.clearInterval(id);
    }

    let disposed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      const ny = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
      mouse.tx = Math.max(-1, Math.min(1, nx));
      mouse.ty = Math.max(-1, Math.min(1, -ny));
    };
    const onPointerLeave = () => {
      mouse.tx = 0;
      mouse.ty = 0;
    };

    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);

    const boot = async () => {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
        });
      } catch {
        canvas.style.opacity = "0";
        return;
      }
      renderer.setClearColor(0x120a1c, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
      camera.position.z = 6.2;

      const group = new THREE.Group();
      scene.add(group);

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");

      const [frames, brush, displace, weave] = await Promise.all([
        Promise.all(
          PAINTING_FRAMES.map((f) =>
            loadTexture(loader, f.src, THREE.SRGBColorSpace),
          ),
        ),
        loadTexture(loader, PAINTING_MAPS.brush, THREE.NoColorSpace),
        loadTexture(loader, PAINTING_MAPS.displace, THREE.NoColorSpace),
        loadTexture(loader, PAINTING_MAPS.weave, THREE.NoColorSpace),
      ]);

      if (disposed) {
        frames.forEach((t) => t.dispose());
        brush.dispose();
        displace.dispose();
        weave.dispose();
        renderer.dispose();
        return;
      }

      weave.wrapS = THREE.RepeatWrapping;
      weave.wrapT = THREE.RepeatWrapping;

      const uniforms = {
        tFrom: { value: frames[0] },
        tTo: { value: frames[0] },
        tBrush: { value: brush },
        tDisplace: { value: displace },
        tWeave: { value: weave },
        uMix: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIdle: { value: 1 },
        uReady: { value: 0 },
        uAmp: { value: 0.2 },
      };

      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
      });

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 4, 72, 96),
        mat,
      );
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

      const maxFrame = frames.length - 1;
      let lastI0 = -1;
      let lastI1 = -1;
      const t0 = performance.now();

      const tick = (now: number) => {
        if (disposed) return;
        raf = requestAnimationFrame(tick);

        const t = (now - t0) / 1000;
        const frameFloat = paintingProgressToFrame(progressRef.current);
        const i0 = Math.min(maxFrame, Math.floor(frameFloat));
        const i1 = Math.min(maxFrame, i0 + 1);
        const mix = frameFloat - i0;

        if (i0 !== lastI0) {
          uniforms.tFrom.value = frames[i0];
          lastI0 = i0;
        }
        if (i1 !== lastI1) {
          uniforms.tTo.value = frames[i1];
          lastI1 = i1;
        }
        uniforms.uMix.value = mix;
        uniforms.uTime.value = t;
        uniforms.uIdle.value = 1;
        uniforms.uAmp.value = 0.18 + 0.03 * Math.sin(t * 0.45);
        uniforms.uReady.value = Math.min(1, uniforms.uReady.value + 0.045);

        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;
        uniforms.uMouse.value.set(mouse.x, mouse.y);
        group.rotation.y += (mouse.x * 0.08 - group.rotation.y) * 0.07;
        group.rotation.x += (-mouse.y * 0.05 - group.rotation.x) * 0.07;

        renderer!.render(scene, camera);

        if (uniforms.uReady.value > 0.9 && fallback) {
          fallback.style.opacity = "0";
        }
      };

      raf = requestAnimationFrame(tick);
      canvas.style.opacity = "1";

      (wrap as HTMLDivElement & { __paintingCleanup?: () => void }).__paintingCleanup =
        () => {
          ro.disconnect();
          frames.forEach((tex) => tex.dispose());
          brush.dispose();
          displace.dispose();
          weave.dispose();
          mat.dispose();
          mesh.geometry.dispose();
        };
    };

    void boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      const extra = (
        wrap as HTMLDivElement & { __paintingCleanup?: () => void }
      ).__paintingCleanup;
      extra?.();
      renderer?.dispose();
    };
  }, [progressRef, reduceMotion]);

  return (
    <div ref={wrapRef} className={className} style={{ touchAction: "pan-y" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={PAINTING_FRAMES[0].src}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: reduceMotion ? 0 : 1 }}
        aria-hidden
      />
    </div>
  );
}
