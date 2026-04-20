import { SKETCH_ORB_IMAGES } from "@/data/sketch-orb-images";

/** Index deck (without replacement) until empty, then reshuffle — spreads repeats across the full set. */
let deck: number[] = [];
let lastPicked: string | null = null;

function shuffleDeckIndices(): number[] {
  const n = SKETCH_ORB_IMAGES.length;
  const idxs = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  if (
    lastPicked &&
    n > 1 &&
    SKETCH_ORB_IMAGES[idxs[n - 1]!] === lastPicked
  ) {
    const swap = Math.floor(Math.random() * (n - 1));
    [idxs[n - 1], idxs[swap]] = [idxs[swap]!, idxs[n - 1]!];
  }
  return idxs;
}

/** Next orb image URL: shuffled bag (no repeat until all sketches have been used). */
export function pickNextSketchOrbImage(): string {
  if (deck.length === 0) {
    deck = shuffleDeckIndices();
  }
  const idx = deck.pop();
  if (idx === undefined) {
    return SKETCH_ORB_IMAGES[0] ?? "";
  }
  const url = SKETCH_ORB_IMAGES[idx] ?? SKETCH_ORB_IMAGES[0] ?? "";
  lastPicked = url;
  return url;
}
