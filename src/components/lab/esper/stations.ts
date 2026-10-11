/** What each corner of the room is. Copy follows the site's own case study digest (llms-full.txt). */
export type Station = {
  id: string;
  title: string;
  role?: string;
  period?: string;
  summary: string;
  note?: string;
  href?: string;
  links?: { title: string; line: string; href: string }[];
};

export const STATIONS: Station[] = [
  {
    id: "domis",
    title: "Domis",
    role: "Founding Product Designer",
    period: "2024 to now",
    summary:
      "Domis helps people keep track of a house: what it is, what it needs and what to do next. Setup is the hard part, so the work is about getting useful structure from the smallest thing a person will actually do.",
    note: "Type an address, photograph a nameplate, drop in an inspection report.",
    href: "/domis",
  },
  {
    id: "virdio",
    title: "Virdio",
    role: "Product Designer",
    period: "2021 to 2022",
    summary:
      "Hardware-free AR fitness across iOS, Android, web and TV, using the camera instead of gym equipment. Calibration had to feel like a warm-up rather than a scan, and the workout had to keep going when tracking failed.",
    href: "/virdio",
  },
  {
    id: "obscura",
    title: "OBSCURA",
    role: "Interaction design, prototyping, Unity",
    period: "MOHAI, Seattle, 2025",
    summary:
      "An immersive exhibit built around more than 300 unseen photographs of post-war life in Japan. The viewer’s gaze curates which images appear, so every path through the archive is personal.",
    href: "/obscura",
  },
  {
    id: "memory-care",
    title: "Memory Care",
    role: "Interaction Designer",
    period: "With Maria Mortati Experience Design",
    summary:
      "A multi-sensory station for people living with mid to late stage Alzheimer’s: a driving simulator, a haptic cat-petting interactive and a library for caregivers.",
    note: "Fast Company World Changing Ideas finalist, 2022.",
    href: "/memory-care",
  },
  {
    id: "wafflings",
    title: "Wafflings",
    summary: "Smaller builds, made to find out how something feels.",
    links: [
      { title: "Saving Baby J", line: "An arcade game played by throwing orca plushies", href: "/waffling/orca" },
      { title: "Savor", line: "A phone video becomes a 3D Gaussian splat", href: "/waffling/savor" },
      { title: "Recorder", line: "A skeuomorphic voice recorder", href: "/waffling/recorder" },
      { title: "Butter chicken", line: "The recipe", href: "/butter-chicken" },
    ],
  },
  {
    id: "taste",
    title: "Off hours",
    summary: "When I’m not designing, I’m painting, playing basketball, playing video games or watching Arsenal.",
    note: "On the wall: Man on the Moon II, Let God Sort Em Out, Reanimation, Cyberpunk 2077, Half-Life 2, Dishonored.",
  },
];
