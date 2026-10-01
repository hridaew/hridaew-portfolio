export interface HomeVariant {
  n: number;
  slug: string;
  href: string;
  name: string;
  /** One-line pitch for the index page. */
  pitch: string;
  /** Which piece of Hridae's work the mechanic is borrowed from. */
  borrowedFrom: string;
  tone: "light" | "dark";
}

export const HOME_VARIANTS: HomeVariant[] = [
  {
    n: 1,
    slug: "ledger",
    href: "/variants/ledger",
    name: "Ledger",
    pitch:
      "An editorial index. Big type, the work as a numbered ledger, and media that follows your cursor.",
    borrowedFrom: "Swiss print and a recruiter’s 30-second scan",
    tone: "light",
  },
  {
    n: 2,
    slug: "gaze",
    href: "/variants/gaze",
    name: "Gaze",
    pitch:
      "A darkroom. Where you look decides what develops, and the page remembers the path you took.",
    borrowedFrom: "OBSCURA, where the visitor’s gaze curates the archive",
    tone: "dark",
  },
  {
    n: 3,
    slug: "depth",
    href: "/variants/depth",
    name: "Depth",
    pitch:
      "Scroll to fly forward through six years of work: from the screen, into the room, into a headset, into your hands.",
    borrowedFrom: "Designing across glass, AR, VR, and tangible",
    tone: "dark",
  },
  {
    n: 4,
    slug: "workbench",
    href: "/variants/workbench",
    name: "Workbench",
    pitch:
      "A cutting mat covered in things I made. Pick them up, throw them around, open the ones you like.",
    borrowedFrom: "Learning by making, in the physical world",
    tone: "dark",
  },
  {
    n: 5,
    slug: "one-thing",
    href: "/variants/one-thing",
    name: "One Thing",
    pitch:
      "Tell the page one thing about you and it rearranges itself: order, proof, and copy, tuned to why you came.",
    borrowedFrom: "Domis, making the most of the smallest action a user takes",
    tone: "light",
  },
];
