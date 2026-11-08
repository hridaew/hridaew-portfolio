/** What each corner of the room is. Copy follows the site's own case study digest (llms-full.txt). */
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
    period: "2024 to now",
    summary:
      "Domis helps people keep track of a house: what it is, what it needs and what to do next. Setup is the hard part, so the work is about getting useful structure from the smallest thing a person will actually do.",
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
    period: "2021 to 2022",
    summary:
      "Hardware-free AR fitness across iOS, Android, web and TV, using the camera instead of gym equipment. Calibration had to feel like a warm-up rather than a scan, and the workout had to keep going when tracking failed.",
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
    summary:
      "An immersive exhibit built around more than 300 unseen photographs of post-war life in Japan. The viewer’s gaze curates which images appear, so every path through the archive is personal.",
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
    summary:
      "A multi-sensory station for people living with mid to late stage Alzheimer’s: a driving simulator, a haptic cat-petting interactive and a library for caregivers.",
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
      { title: "Saving Baby J", line: "An arcade game played by throwing orca plushies", href: "/waffling/orca" },
      { title: "Savor", line: "A phone video becomes a 3D Gaussian splat", href: "/waffling/savor" },
      { title: "Recorder", line: "A skeuomorphic voice recorder", href: "/waffling/recorder" },
      { title: "Butter chicken", line: "The recipe", href: "/butter-chicken" },
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
