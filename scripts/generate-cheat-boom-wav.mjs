/**
 * One-off: writes public/assets/cheat-codes/boom.wav (short explosion-ish burst).
 * Run: node scripts/generate-cheat-boom-wav.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../public/assets/cheat-codes/boom.wav");

const sampleRate = 22050;
const durationSec = 0.42;
const numSamples = Math.floor(sampleRate * durationSec);
const numChannels = 1;
const bitsPerSample = 16;
const blockAlign = (numChannels * bitsPerSample) / 8;
const byteRate = sampleRate * blockAlign;
const dataSize = numSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataSize);

let o = 0;
buffer.write("RIFF", o);
o += 4;
buffer.writeUInt32LE(36 + dataSize, o);
o += 4;
buffer.write("WAVE", o);
o += 4;
buffer.write("fmt ", o);
o += 4;
buffer.writeUInt32LE(16, o);
o += 4;
buffer.writeUInt16LE(1, o);
o += 2;
buffer.writeUInt16LE(numChannels, o);
o += 2;
buffer.writeUInt32LE(sampleRate, o);
o += 4;
buffer.writeUInt32LE(byteRate, o);
o += 4;
buffer.writeUInt16LE(blockAlign, o);
o += 2;
buffer.writeUInt16LE(bitsPerSample, o);
o += 2;
buffer.write("data", o);
o += 4;
buffer.writeUInt32LE(dataSize, o);
o += 4;

let prev = 0;
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const env = Math.pow(1 - i / numSamples, 1.4);
  const white = Math.random() * 2 - 1;
  prev = (prev + white * 0.85) * 0.92;
  const tone = Math.sin(2 * Math.PI * (120 + 180 * (1 - t / durationSec)) * t) * 0.35;
  const s = (prev * 0.55 + tone) * env;
  const v = Math.max(-1, Math.min(1, s)) * 0.95;
  buffer.writeInt16LE(Math.round(v * 32767), o);
  o += 2;
}

fs.writeFileSync(outPath, buffer);
console.log("Wrote", outPath, buffer.length, "bytes");
