// Regenerate One Splat objects: `npm run splats` (all) or `npm run splats -- domis virdio` (just those).
// Finds a Python 3 with numpy/scipy/pillow (see docs/home-variants/requirements.txt).
import { spawnSync } from "node:child_process";

const args = ["docs/home-variants/one-splat-gen.py", "public/variants/one-splat/media", ...process.argv.slice(2)];
for (const py of process.platform === "win32" ? ["py", "python", "python3"] : ["python3", "python"]) {
  const probe = spawnSync(py, ["--version"], { encoding: "utf8" });
  if (probe.status !== 0) continue;
  const run = spawnSync(py, args, { stdio: "inherit" });
  process.exit(run.status ?? 1);
}
console.error("Python 3 not found. Install it, then: pip install -r docs/home-variants/requirements.txt");
process.exit(1);
