// Compresses ESPER's published models in place with Meshopt (EXT_meshopt_compression), for the live site.
// Unlike `gltf-transform meshopt`, nothing is pruned: the people's empty end bones (fingertips, head top) are what
// the hand and head solvers aim, so every node stays.
//
// Run by esper-unity/Tools/publish_web.py:  node scripts/compress-esper-models.mjs public/esper/assets
import { readdir } from "node:fs/promises";
import { stat } from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { quantize, reorder } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const root = process.argv[2];
if (!root) throw new Error("usage: node scripts/compress-esper-models.mjs <assets dir>");

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.toLowerCase().endsWith(".glb")) yield p;
  }
}

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
let before = 0, after = 0;
for await (const file of walk(root)) {
  const size = (await stat(file)).size;
  const doc = await io.read(file);
  if (doc.getRoot().listExtensionsUsed().some((x) => x.extensionName === "EXT_meshopt_compression")) continue;
  await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize());
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  await io.write(file, doc);
  const out = (await stat(file)).size;
  before += size;
  after += out;
  console.log(`${path.relative(root, file)}  ${(size / 1e3).toFixed(0)} KB -> ${(out / 1e3).toFixed(0)} KB`);
}
console.log(`models: ${(before / 1e6).toFixed(2)} MB -> ${(after / 1e6).toFixed(2)} MB`);
