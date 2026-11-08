import { homepageProjects } from "@/data/homepage-projects";
import {
  BUTTER_CHICKEN_INTRO_P1,
  ORCA_OPENING,
  RECORDER_CARD_CAPTION,
  SAVOR_OPENING,
} from "@/data/waffling-article-copy";

/**
 * What each corner of the room is. The words are the site's own: each project's description from the home page
 * cards, and each waffling's opening line, so the room and the writing never drift apart.
 */
const describe = (slug: string) => {
  const description = homepageProjects.find((p) => p.slug === slug)?.description;
  // Loud while developing; in production the window just goes without a summary rather than taking the room down.
  if (!description && process.env.NODE_ENV !== "production") throw new Error(`stations: no home page project "${slug}"`);
  return description;
};
// First sentence, curly apostrophes. No lookbehind: Safari before 16.4 can't parse it.
const opening = (text: string) => (text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text).replace(/'/g, "’");

export type Station = {
  id: string;
  title: string;
  /** A shorter label for the room bar on narrow phones. */
  short?: string;
  role?: string;
  period?: string;
  summary?: string;
  note?: string;
  href?: string;
  links?: { title: string; line: string; href: string }[];
  /** A few real photographs, people in them where there are any. Shown under the title. */
  images?: { src: string; alt: string; video?: string }[];
};

/** The Visitor Board in About: a place of its own (reached by clicking it in the room), with no pill in the bar. */
export const BOARD: Station = { id: "guestbook", title: "Visitor Board" };

export const STATIONS: Station[] = [
  {
    id: "domis",
    images: [
      { src: "/assets/domis/live/gemini-appliance-label.jpg", alt: "An appliance label, photographed for setup" },
      { src: "/assets/domis/scanner.png", alt: "Scanning an appliance into the home" },
      { src: "/assets/domis/2.png", alt: "An inspection report turned into tasks" },
      { src: "/assets/domis/hero-product.png", alt: "The home profile on web and phone" },
    ],
    title: "Domis",
    role: "Founding Product Designer",
    period: "2024–now",
    summary: describe("domis"),
    href: "/domis",
  },
  {
    id: "virdio",
    images: [
      { src: "/assets/virdio/promo-stills/living-room-squat.webp", alt: "A squat in a living room, tracked by the camera" },
      { src: "/assets/virdio/promo-stills/punching-combinations-living-room.webp", alt: "Punching combinations with live rep counts" },
      { src: "/assets/virdio/promo-stills/goblet-squat-rep-counter.webp", alt: "A goblet squat with the rep counter" },
      { src: "/assets/virdio/phone_setup_end.png", alt: "Room setup complete" },
    ],
    title: "Virdio",
    role: "Product Designer",
    period: "2021–2022",
    summary: describe("virdio"),
    href: "/virdio",
  },
  {
    id: "obscura",
    images: [
      { src: "/assets/obscura/exhibition_lah07hiyl9glxe2jbec80zastu.webp", alt: "A visitor looking through the viewer at MOHAI" },
      { src: "/assets/obscura/exhibition_xrzfa3phi0b8csowvt4ovbrjbi.webp", alt: "The audience watching the projection" },
      { src: "/assets/obscura/exhibition_lmwbwqiof2i79hqbywhhidrto1o.webp", alt: "Visitors around the projection screen" },
      { src: "/assets/obscura/exhibition_zfpsnuur6vt2yepotybrqfuwcia.webp", alt: "The opening talk" },
    ],
    title: "OBSCURA",
    role: "Lead Designer and Developer",
    period: "MOHAI, Seattle, 2025 · Potrero Hill Neighborhood House, San Francisco, 2026",
    summary: describe("obscura"),
    note: "Featured in The Potrero View, November 2026.",
    href: "/obscura",
  },
  {
    id: "memory-care",
    images: [
      { src: "/assets/memory-care/station_full.jpg", alt: "A resident driving at the station, plush cats beside him" },
      { src: "/assets/memory-care/resident_driving.png", alt: "A resident at the wheel from her wheelchair, feet on the footrest" },
      { src: "/assets/memory-care/context_wide.jpg", alt: "Holding one of the haptic plush cats" },
      { src: "/assets/memory-care/station_side.jpg", alt: "The station in the community room" },
    ],
    title: "Memory Care",
    short: "MCES",
    role: "Interaction Designer",
    period: "With Maria Mortati Experience Design",
    summary: describe("memory-care"),
    note: "Fast Company World Changing Ideas finalist, 2022.",
    href: "/memory-care",
  },
  {
    id: "wafflings",
    images: [
      { src: "/assets/savor/card-first.jpg", video: "/assets/savor/card.mp4", alt: "The Savor trailer: a phone video of a sculpture becomes a 3D Gaussian splat" },
      { src: "/assets/orca/throw-test.jpg", alt: "Throwing an orca plush at the screen" },
      { src: "/assets/orca/final-booth.jpg", alt: "The Saving Baby J booth" },
    ],
    title: "Wafflings",
    links: [
      { title: "Savor", line: opening(SAVOR_OPENING), href: "/waffling/savor" },
      { title: "Saving Baby J", line: opening(ORCA_OPENING), href: "/waffling/orca" },
      { title: "Recorder", line: opening(RECORDER_CARD_CAPTION), href: "/waffling/recorder" },
      { title: "Butter Chicken", line: opening(BUTTER_CHICKEN_INTRO_P1), href: "/butter-chicken" },
    ],
  },
  {
    id: "taste",
    // Off hours and About are one room: the bio card opens here (EsperInterface's AboutCard).
    title: "About me",
    short: "About",
    summary: "When I’m not designing, I’m painting, playing basketball, playing video games or watching Arsenal.",
  },
];
