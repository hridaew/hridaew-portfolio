"use client";

import { useEffect, useState } from "react";
import {
  OBSCURA_LIQUID_GLASS_MAP_PX,
  buildObscuraLiquidGlassMaps,
  type ObscuraLiquidGlassMaps,
} from "@/lib/obscuraLiquidGlass";

/** Stable id so every Obscura card can reference the same filter (single SVG in the tree). */
export const OBSCURA_LIQUID_GLASS_FILTER_ID = "obscura-home-liquid-glass-filter";

let cachedMaps: ObscuraLiquidGlassMaps | null = null;

function getOrBuildMaps(): ObscuraLiquidGlassMaps {
  if (!cachedMaps) {
    cachedMaps = buildObscuraLiquidGlassMaps();
  }
  return cachedMaps;
}

/**
 * One hidden SVG per page: displacement + specular maps and `feDisplacementMap` pipeline
 * from kube.io / winaviation liquid-glass-demo. Used with `backdrop-filter: url(#…)`.
 * @see https://kube.io/blog/liquid-glass-css-svg/
 */
export function ObscuraLiquidGlassFilterSvg() {
  const [maps, setMaps] = useState<ObscuraLiquidGlassMaps | null>(null);

  useEffect(() => {
    setMaps(getOrBuildMaps());
  }, []);

  if (!maps) return null;

  const { mapSize, displacementDataUrl, specularDataUrl, displacementScale } =
    maps;

  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 h-0 w-0 overflow-hidden"
    >
      <defs>
        <filter
          id={OBSCURA_LIQUID_GLASS_FILTER_ID}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.45"
            result="blurred"
          />
          <feImage
            href={displacementDataUrl}
            x="0"
            y="0"
            width={mapSize}
            height={mapSize}
            preserveAspectRatio="none"
            result="displacement_map"
          />
          <feDisplacementMap
            in="blurred"
            in2="displacement_map"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feColorMatrix
            in="displaced"
            type="saturate"
            values="1.22"
            result="displaced_saturated"
          />
          <feImage
            href={specularDataUrl}
            x="0"
            y="0"
            width={mapSize}
            height={mapSize}
            preserveAspectRatio="none"
            result="specular_layer"
          />
          <feComponentTransfer in="specular_layer" result="specular_faded">
            <feFuncA type="linear" slope="0.42" />
          </feComponentTransfer>
          <feBlend
            in="specular_faded"
            in2="displaced_saturated"
            mode="screen"
            result="liquid_glass_out"
          />
        </filter>
      </defs>
    </svg>
  );
}

/** Lens diameter in CSS px — must match displacement map size. */
export const OBSCURA_LIQUID_GLASS_LENS_PX = OBSCURA_LIQUID_GLASS_MAP_PX;
