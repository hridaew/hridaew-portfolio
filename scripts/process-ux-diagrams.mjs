/**
 * Domis UX diagrams: keep the Figma export as-is (flat pastels, black labels),
 * flatten start/stop, and soften No chips to a pale red with black text.
 */
import fs from "fs";
import path from "path";

const ROOT = "e:/Documents/port-update/hridaew-portfolio";
const OUT_DIR = path.join(ROOT, "public/assets/domis/diagrams");
const START_STOP_FILL = "#FFFFFF";
/** Pale No / fail red — light enough for black labels. */
const NO_PALE = "#F2B8B0";

const JOBS = [
  {
    src: "E:/Downloads/Address intelligence svg.svg",
    dest: path.join(OUT_DIR, "address-intelligence-lanes.svg"),
  },
  {
    src: "E:/Downloads/appliance intelligence svg.svg",
    dest: path.join(OUT_DIR, "appliance-task-flow.svg"),
  },
];

function unwrapFilterGroups(svg) {
  return svg.replace(
    /<g\s+filter="url\(#[^"]+\)">\s*(<(?:rect|path)\b[^>]*\/>)\s*<\/g>/g,
    "$1",
  );
}

function removeFilterDefs(svg) {
  let out = svg.replace(/<filter\b[\s\S]*?<\/filter>/g, "");
  out = out.replace(/<defs>\s*<\/defs>/g, "");
  return out;
}

/**
 * Start/stop are the dark #323232 pills. In the Figma export their white
 * label glyph path sits immediately after the shell rect.
 */
function flattenStartStop(svg) {
  let shells = 0;
  let labels = 0;

  const out = svg.replace(
    /<rect\b([^>]*fill="#323232"[^>]*)\/>\s*(<path\b[^>]*fill="white"[^>]*\/>)/gi,
    (_full, rectAttrs, pathTag) => {
      shells++;
      labels++;
      const rect = `<rect${rectAttrs.replace(
        /fill="#323232"/i,
        `fill="${START_STOP_FILL}"`,
      )}/>`;
      const label = pathTag.replace(/fill="white"/i, 'fill="black"');
      return `${rect}${label}`;
    },
  );

  const leftover = out.replace(
    /<rect\b([^>]*fill="#323232"[^>]*)\/>/gi,
    (_full, attrs) => {
      shells++;
      return `<rect${attrs.replace(/fill="#323232"/i, `fill="${START_STOP_FILL}"`)}/>`;
    },
  );

  return { svg: leftover, shells, labels };
}

/** Pale No chips/connectors; force chip labels to black. */
function softenNo(svg) {
  let chips = 0;
  // Chip rect + following glyph path → pale fill + black label
  let out = svg.replace(
    /<rect\b([^>]*fill="#F24822"[^>]*)\/>\s*(<path\b[^>]*\/>)/gi,
    (_full, rectAttrs, pathTag) => {
      chips++;
      const rect = `<rect${rectAttrs.replace(/fill="#F24822"/i, `fill="${NO_PALE}"`)}/>`;
      const label = pathTag
        .replace(/fill="white"/i, 'fill="black"')
        .replace(/fill="White"/i, 'fill="black"');
      // Ensure an explicit black fill if somehow missing
      const withFill = /fill="/i.test(label)
        ? label
        : label.replace(/<path\b/i, '<path fill="black"');
      return `${rect}${withFill}`;
    },
  );

  // Remaining No connector paths / any leftover hot red
  out = out
    .replaceAll("#F24822", NO_PALE)
    .replaceAll("#f24822", NO_PALE);

  return { svg: out, chips };
}

/** Mute the light Figma greys so connectors sit quieter on the dark board. */
function darkenConnectors(svg) {
  return svg
    .replaceAll("#D9D9D9", "#8E8E98")
    .replaceAll("#d9d9d9", "#8E8E98")
    .replaceAll("#A5A5A5", "#6E6E78")
    .replaceAll("#a5a5a5", "#6E6E78");
}

function processOne(src, dest) {
  let svg = fs.readFileSync(src, "utf8");
  svg = unwrapFilterGroups(svg);
  svg = removeFilterDefs(svg);
  const { svg: flat, shells, labels } = flattenStartStop(svg);
  const { svg: nos, chips } = softenNo(flat);
  svg = darkenConnectors(nos);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, svg, "utf8");

  console.log(path.basename(dest), {
    shells,
    labels,
    noChips: chips,
    connectors: (svg.match(/#8E8E98/gi) || []).length,
    hotRedLeft: (svg.match(/#F24822/gi) || []).length,
    paleNo: (svg.match(new RegExp(NO_PALE, "gi")) || []).length,
  });
}

for (const job of JOBS) {
  processOne(job.src, job.dest);
}
