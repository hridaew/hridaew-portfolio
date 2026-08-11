"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { type ObscuraLiquidGlassMaps } from "@/lib/obscuraLiquidGlass";
import { 
  getOrBuildMaps, 
  OBSCURA_LIQUID_GLASS_LENS_PX 
} from "../home/ObscuraLiquidGlassFilterSvg";

export function ThreeGlassLensFallback({
  x,
  y,
  mediaEl,
  imageSrc,
  containerSelector,
  isFixed,
  diameter = OBSCURA_LIQUID_GLASS_LENS_PX,
}: {
  x: number;
  y: number;
  mediaEl?: HTMLImageElement | HTMLVideoElement | null;
  imageSrc?: string;
  /** Pass a selector to traverse up from the container so we know the bounding rect */
  containerSelector?: string;
  /** If the lens is position:fixed directly to the browser viewport */
  isFixed?: boolean;
  /** Optional custom diameter (defaults to OBSCURA_LIQUID_GLASS_LENS_PX) */
  diameter?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerSizeRef = useRef({ w: 1, h: 1 });
  const [maps, setMaps] = useState<ObscuraLiquidGlassMaps | null>(null);

  useEffect(() => {
    setMaps(getOrBuildMaps());
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maps) return;
    if (!mediaEl && !imageSrc) return;

    if (!isFixed && containerSelector) {
      const container = canvas.closest(containerSelector);
      if (container) {
        const rect = (container as HTMLElement).getBoundingClientRect();
        containerSizeRef.current = { w: rect.width || 1, h: rect.height || 1 };
      }
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(diameter, diameter);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap to 2x for performance

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const texLoader = new THREE.TextureLoader();
    let bgTex: THREE.Texture;
    
    if (mediaEl instanceof HTMLVideoElement) {
      bgTex = new THREE.VideoTexture(mediaEl);
      bgTex.minFilter = THREE.LinearFilter;
      bgTex.magFilter = THREE.LinearFilter;
      bgTex.colorSpace = THREE.SRGBColorSpace;
    } else if (mediaEl instanceof HTMLImageElement) {
      bgTex = new THREE.Texture(mediaEl);
      bgTex.minFilter = THREE.LinearFilter;
      bgTex.magFilter = THREE.LinearFilter;
      bgTex.colorSpace = THREE.SRGBColorSpace;
      bgTex.needsUpdate = true;
    } else {
      // Load directly from imageSrc
      bgTex = texLoader.load(imageSrc!);
      bgTex.colorSpace = THREE.SRGBColorSpace;
    }

    const dispTex = texLoader.load(maps.displacementDataUrl);
    const specTex = texLoader.load(maps.specularDataUrl);

    const LENS_UV_DIAMETER = diameter;

    const uniforms = {
      tDiffuse: { value: bgTex },
      tDisp: { value: dispTex },
      tSpec: { value: specTex },
      uLensCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uLensSize: { value: new THREE.Vector2(0, 0) },
      uDispScale: { value: new THREE.Vector2(0, 0) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDisp;
        uniform sampler2D tSpec;
        uniform vec2 uLensCenter;
        uniform vec2 uLensSize;
        uniform vec2 uDispScale;

        void main() {
          vec4 dMap = texture2D(tDisp, vUv);
          // R and G represent dx and dy. Centered at 128/255 = 0.5
          float dX = (dMap.r - 0.5) * 2.0;
          float dY = (dMap.g - 0.5) * 2.0;

          // Our lens is centered at uLensCenter.
          // vUv ranges 0..1 inside the lens. 
          // Center of vUv is 0.5.
          vec2 offsetFromCenter = vUv - 0.5;
          vec2 bgUv = uLensCenter + offsetFromCenter * uLensSize;

          // Apply displacement over UV space. 
          bgUv.x += dX * uDispScale.x;
          bgUv.y += dY * uDispScale.y;

          // Clamp
          bgUv = clamp(bgUv, 0.0, 1.0);
          
          vec4 color = texture2D(tDiffuse, bgUv);

          // Approximate filter: saturate(1.22)
          float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = mix(vec3(luma), color.rgb, 1.22);

          // Specular overlay via screen blend.
          vec4 sMap = texture2D(tSpec, vUv);
          vec3 specularColor = sMap.rgb * sMap.a * 0.42;
          color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - specularColor);

          // Squirclize or circularize the lens masking (since plane is square)
          if (dot(offsetFromCenter, offsetFromCenter) > 0.25) {
             discard;
          }

          gl_FragColor = vec4(color.rgb, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let frameId = 0;
    const renderLoop = () => {
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    uniformSyncRef.current.updateShader = (xProp: number, yProp: number) => {
      let cw = containerSizeRef.current.w;
      let ch = containerSizeRef.current.h;
      
      if (isFixed) {
        cw = window.innerWidth;
        ch = window.innerHeight;
      }

      // Convert DOM position (x, y) to Three UV space (0 to 1 origin bottom-left)
      const normalizedX = xProp / cw;
      const normalizedY = 1.0 - (yProp / ch); // invert Y for webgl

      material.uniforms.uLensCenter.value.set(normalizedX, normalizedY);
      material.uniforms.uLensSize.value.set(diameter / cw, diameter / ch);
      
      // CSS feDisplacementMap scale maps pixel offset to UV space
      material.uniforms.uDispScale.value.set(maps.displacementScale / cw, maps.displacementScale / ch);
    };

    return () => {
      cancelAnimationFrame(frameId);
      bgTex.dispose();
      dispTex.dispose();
      specTex.dispose();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      uniformSyncRef.current.updateShader = undefined;
    };
  }, [mediaEl, imageSrc, maps, containerSelector, isFixed, diameter]);

  const uniformSyncRef = useRef<{ updateShader?: (x: number, y: number) => void }>({});

  useEffect(() => {
    if (uniformSyncRef.current.updateShader) {
      uniformSyncRef.current.updateShader(x, y);
    }
  }, [x, y]);

  return (
    <div
      className="pointer-events-none absolute z-[25] will-change-transform rounded-full shadow-[0_4px_12px_rgb(var(--ink-rgb)/0.1),0_16px_48px_rgb(var(--ink-rgb)/0.18)] border border-ink/[0.096] ring-1 ring-ink/[0.06]"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%) scale(1.14)",
        width: diameter,
        height: diameter,
      }}
      aria-hidden
    >
      <canvas ref={canvasRef} className="block w-full h-full rounded-full" />
    </div>
  );
}
