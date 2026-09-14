/**
 * Convert home-painting keyframes to webp and build brush / displace maps
 * from the original Mighty Hand acrylic.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/assets/home/painting");
const artifacts = "/opt/cursor/artifacts/assets";

const frames = [
  {
    input: path.join(outDir, "source.png"),
    output: "00-source.webp",
  },
  {
    input: path.join(artifacts, "painting-domis-hand-phone-v2.png"),
    output: "01-domis.webp",
  },
  {
    input: path.join(artifacts, "painting-morph-domis-virdio.png"),
    output: "02-morph-zoom-out.webp",
  },
  {
    input: path.join(artifacts, "painting-virdio-workout-cones-v2.png"),
    output: "03-virdio.webp",
  },
  {
    input: path.join(artifacts, "painting-morph-virdio-obscura.png"),
    output: "04-morph-turn.webp",
  },
  {
    input: path.join(artifacts, "painting-obscura-headset.png"),
    output: "05-obscura.webp",
  },
  {
    input: path.join(artifacts, "painting-morph-obscura-mces.png"),
    output: "06-morph-orbit.webp",
  },
  {
    input: path.join(artifacts, "painting-mces-tv.png"),
    output: "07-mces.webp",
  },
];

const WIDTH = 1200;
const HEIGHT = 1600;

async function toWebp(input, output) {
  await sharp(input)
    .rotate()
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(outDir, output));
}

async function highPassPng(input, output, size) {
  const { data, info } = await sharp(input)
    .resize(size, Math.round(size * (4 / 3)), { fit: "cover" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const blurBuf = await sharp(input)
    .resize(info.width, info.height, { fit: "cover" })
    .greyscale()
    .blur(2.6)
    .raw()
    .toBuffer();

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = Math.max(0, Math.min(255, data[i] - blurBuf[i] + 128));
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .png()
    .toFile(path.join(outDir, output));
}

async function displacePng(input, output, size) {
  await sharp(input)
    .resize(size, Math.round(size * (4 / 3)), { fit: "cover" })
    .greyscale()
    .blur(1.2)
    .normalise()
    .png()
    .toFile(path.join(outDir, output));
}

async function weavePng(input, output) {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 800;
  const h = meta.height ?? 1000;
  // Dark upper-left void: canvas weave without the figure.
  await sharp(input)
    .extract({
      left: 8,
      top: 8,
      width: Math.min(280, w - 16),
      height: Math.min(280, h - 16),
    })
    .resize(256, 256, { fit: "cover" })
    .png()
    .toFile(path.join(outDir, output));
}

fs.mkdirSync(outDir, { recursive: true });

for (const frame of frames) {
  if (!fs.existsSync(frame.input)) {
    throw new Error(`Missing painting frame: ${frame.input}`);
  }
  await toWebp(frame.input, frame.output);
  const stat = fs.statSync(path.join(outDir, frame.output));
  console.log(`wrote ${frame.output} (${Math.round(stat.size / 1024)}kb)`);
}

const source = path.join(outDir, "source.png");
await highPassPng(source, "brush-map.png", 768);
await displacePng(source, "displace-map.png", 768);
await weavePng(source, "weave.png");

for (const f of ["brush-map.png", "displace-map.png", "weave.png"]) {
  const webp = f.replace(".png", ".webp");
  await sharp(path.join(outDir, f))
    .resize(640, null, { withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(outDir, webp));
  fs.unlinkSync(path.join(outDir, f));
  console.log(`wrote ${webp}`);
}
