"use client";

import { DialRoot, useDialKit } from "dialkit";
import "dialkit/styles.css";
import { useEffect } from "react";
import { BUILD_TUNE } from "./three/buildTune";

const L = BUILD_TUNE.loader, P = BUILD_TUNE.plan, W = BUILD_TUNE.walls, H = BUILD_TUNE.hologram;
const F = BUILD_TUNE.furnish, C = BUILD_TUNE.camera, U = BUILD_TUNE.ui;

/**
 * Development only (EsperRoom loads it outside production): a DialKit panel for the first load. The room reads the
 * values when its build starts (window.__esperBuild, see three/buildTune.ts), so "Replay build" shows a change at once;
 * the loading mark's timings are CSS variables, seen on "Reload page". Values persist across reloads; Copy in the
 * panel puts them all on the clipboard.
 */
export default function BuildDials({ onReplay }: { onReplay: () => void }) {
  const values = useDialKit(
    "Opening",
    {
      replay: { type: "action", label: "Replay build" },
      reload: { type: "action", label: "Reload page (with loader)" },
      loader: {
        _collapsed: true,
        barRise: [L.barRise, 100, 1500, 10],
        barStagger: [L.barStagger, 0, 250, 5],
        fillGlide: [L.fillGlide, 100, 2500, 10],
        exitDelay: [L.exitDelay, 0, 1200, 10],
        exitDuration: [L.exitDuration, 50, 1200, 10],
        exitStagger: [L.exitStagger, 0, 200, 5],
        roomFadeIn: [L.roomFadeIn, 0, 2500, 10],
      },
      plan: {
        delay: [P.delay, 0, 2, 0.01],
        outlineAt: [P.outlineAt, 0, 2, 0.01],
        outlineDuration: [P.outlineDuration, 0.02, 2, 0.01],
        innerAt: [P.innerAt, 0, 2, 0.01],
        innerGap: [P.innerGap, 0, 0.3, 0.002],
        innerDuration: [P.innerDuration, 0.02, 2, 0.01],
        width: [P.width, 0.004, 0.1, 0.002],
        opacity: [P.opacity, 0, 2, 0.05],
        tipLength: [P.tipLength, 0.02, 2, 0.02],
        tipGlow: [P.tipGlow, 0, 4, 0.05],
        fadeOut: [P.fadeOut, 0.05, 2, 0.05],
      },
      walls: {
        outlineAt: [W.outlineAt, 0, 3, 0.01],
        innerAt: [W.innerAt, 0, 3, 0.01],
        rise: { type: "spring", visualDuration: 0.4, bounce: 0.3 },
      },
      hologram: {
        show: H.show,
        lead: [H.lead, 0, 1.5, 0.01],
        fadeIn: [H.fadeIn, 0.01, 1.5, 0.01],
        fadeOut: [H.fadeOut, 0.01, 1.5, 0.01],
        opacity: [H.opacity, 0, 2, 0.05],
        rim: [H.rim, 0, 1.5, 0.02],
        scanlines: [H.scanlines, 0, 0.5, 0.01],
        edgeGlow: [H.edgeGlow, 0, 5, 0.1],
      },
      furnish: {
        at: [F.at, 0, 4, 0.01],
        roomGap: [F.roomGap, 0, 1, 0.01],
        itemGap: [F.itemGap, 0, 0.2, 0.005],
        dropHeight: [F.dropHeight, 0, 2, 0.02],
        fallTime: [F.fallTime, 0.05, 1.5, 0.01],
        squash: [F.squash, 0, 0.4, 0.01],
        bounce: [F.bounce, 2, 60, 0.5],
        settle: [F.settle, 1, 40, 0.5],
      },
      camera: {
        settleX: [C.settleX, -30, 30, 0.1],
        settleY: [C.settleY, -15, 15, 0.1],
        duration: [C.duration, 0.1, 8, 0.05],
      },
      ui: {
        interfaceAt: [U.interfaceAt, 0, 5, 0.05],
      },
    },
    {
      id: "esper-opening",
      persist: true,
      onAction: (action) => {
        if (action === "replay") onReplay();
        else if (action === "reload") window.location.reload();
      },
    },
  );

  useEffect(() => {
    (window as unknown as { __esperBuild?: unknown }).__esperBuild = values;
    const v = values.loader;
    const css = document.documentElement.style;
    css.setProperty("--esper-bar-rise", `${v.barRise}ms`);
    css.setProperty("--esper-bar-stagger", `${v.barStagger}ms`);
    css.setProperty("--esper-fill-glide", `${v.fillGlide}ms`);
    css.setProperty("--esper-exit-delay", `${v.exitDelay}ms`);
    css.setProperty("--esper-exit-duration", `${v.exitDuration}ms`);
    css.setProperty("--esper-exit-stagger", `${v.exitStagger}ms`);
    css.setProperty("--esper-room-fade", `${v.roomFadeIn}ms`);
    // The mark's container fades once the last of its six bars has sunk.
    css.setProperty("--esper-logo-gone", `${v.exitDelay + 5 * v.exitStagger + v.exitDuration}ms`);
  }, [values]);

  return <DialRoot position="bottom-right" theme="dark" />;
}
