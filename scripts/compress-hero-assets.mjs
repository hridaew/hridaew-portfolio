/**
 * One-off / repeat: WebP compress hero-card-expanded PNGs + hero avatar.
 * Run from repo root: node scripts/compress-hero-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function toWebp(inPath, outPath, { maxPx, quality }) {
  const buf = await sharp(inPath)
    .resize(maxPx, maxPx, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toBuffer();
  fs.writeFileSync(outPath, buf);
  const before = fs.statSync(inPath).size;
  const after = buf.length;
  console.log(
    path.relative(root, inPath),
    `${(before / 1024 / 1024).toFixed(2)} MB ->`,
    `${(after / 1024 / 1024).toFixed(2)} MB`,
    `(${path.relative(root, outPath)})`,
  );
}

const expandedDir = path.join(root, "public/assets/home/hero-card-expanded");
for (const name of fs.readdirSync(expandedDir)) {
  if (!name.endsWith(".png")) continue;
  const inPath = path.join(expandedDir, name);
  const outPath = path.join(expandedDir, name.replace(/\.png$/i, ".webp"));
  await toWebp(inPath, outPath, { maxPx: 2400, quality: 86 });
}

const avatarIn = path.join(root, "public/assets/home/hero-avatar.png");
const avatarOut = path.join(root, "public/assets/home/hero-avatar.webp");
if (fs.existsSync(avatarIn)) {
  const meta = await sharp(avatarIn).metadata();
  if (meta.format === "gif" && (meta.pages ?? 1) > 1) {
    await sharp(avatarIn, { animated: true, limitInputPixels: false })
      .webp({ quality: 82, effort: 4, loop: meta.loop ?? 0 })
      .toFile(avatarOut);
    console.log(
      path.relative(root, avatarIn),
      "animated GIF ->",
      `${(fs.statSync(avatarOut).size / 1024 / 1024).toFixed(2)} MB`,
      `(${path.relative(root, avatarOut)})`,
    );
  } else {
    await toWebp(avatarIn, avatarOut, { maxPx: 960, quality: 88 });
  }
}

console.log("Done. Remove redundant .png originals in hero-card-expanded if desired.");
