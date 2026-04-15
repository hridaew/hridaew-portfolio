/**
 * Enforces semantic typography: use type-* utilities from globals.css,
 * not Tailwind font-size scale or arbitrary font-size/leading/tracking.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src");

const SCALE_RE =
  /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/;
const ARBITRARY_TEXT_RE = /text-\[(?!var\(--|#[0-9a-fA-F]{3,8}\])[^\]]+\]/;
const LEADING_ARBITRARY_RE = /leading-\[/;
const TRACKING_ARBITRARY_RE = /tracking-\[/;
const LEGACY_FONT_VAR_RE = /font-\[family-name:var\(--font-/;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(p);
  }
  return acc;
}

const errors = [];

for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (SCALE_RE.test(line)) {
      errors.push(`${path.relative(process.cwd(), file)}:${i + 1}: disallowed Tailwind text scale`);
    }
    if (ARBITRARY_TEXT_RE.test(line)) {
      errors.push(`${path.relative(process.cwd(), file)}:${i + 1}: disallowed arbitrary text-[…] (use type-* or text-[var(--…)] / text-[#…] for colors only)`);
    }
    if (LEADING_ARBITRARY_RE.test(line)) {
      errors.push(`${path.relative(process.cwd(), file)}:${i + 1}: disallowed leading-[…]`);
    }
    if (TRACKING_ARBITRARY_RE.test(line)) {
      errors.push(`${path.relative(process.cwd(), file)}:${i + 1}: disallowed tracking-[…]`);
    }
    if (LEGACY_FONT_VAR_RE.test(line)) {
      errors.push(`${path.relative(process.cwd(), file)}:${i + 1}: disallowed font-[family-name:var(--font-…)]`);
    }
  });
}

if (errors.length) {
  console.error("Typography lint failed:\n\n" + errors.join("\n"));
  process.exit(1);
}

console.log("Typography lint OK.");
