/**
 * Canonical identity + public URLs for crawlers, JSON-LD, and llms.txt.
 * Keep this aligned with the visible homepage / case-study copy.
 */

export const SITE_ORIGIN = "https://hridaew.com";

export const CV_HREF =
  "https://drive.google.com/file/d/1f11tgSCoo4GY0DuVhdmOVG17lPRpGb3Z/view?usp=sharing";

export const LINKEDIN_HREF = "https://www.linkedin.com/in/hridae";
export const GITHUB_HREF = "https://github.com/hridaew";

export const PERSON = {
  name: "Hridae Walia",
  givenName: "Hridae",
  familyName: "Walia",
  pronunciation: "ri-they waliaa",
  jobTitle: "Product Designer",
  currentRole: "Founding Product Designer",
  description:
    "Product Designer with 6 years of experience delivering end-to-end, research-led products at scale. Expert in designing and prototyping high-craft experiences across mobile, web, tangible, and AR/VR platforms.",
  shortDescription:
    "Product Designer with 6 years of experience delivering end-to-end, research-led products at scale.",
  email: "hridaew@gmail.com",
  url: SITE_ORIGIN,
  image: `${SITE_ORIGIN}/social-open-graph.png`,
  sameAs: [LINKEDIN_HREF, GITHUB_HREF] as const,
  worksFor: {
    name: "Domis",
    url: "https://getdomis.com",
    jobTitle: "Founding Product Designer",
  },
  alumniOf: [
    {
      name: "University of Washington",
      department: "Master of Human Computer Interaction + Design (MHCI+D)",
      url: "https://mhcid.washington.edu",
      year: "2024",
    },
    {
      name: "California College of the Arts",
      department: "BFA Interaction Design",
      url: "https://cca.edu/design/ixd/",
      year: "2020",
    },
  ],
} as const;

export const PERSON_BIO = [
  "I'm a Product Designer obsessed with making, and I have 6 years of experience designing for interaction models that barely exist yet. I focus on the user and learn by making, whether on the canvas, in code, or the physical world.",
  "I've designed features that help people understand their homes at Domis, AR fitness for any space at Virdio, an interactive exhibition at MOHAI, and tangible, accessible experiences for people living with Alzheimer's at the San Francisco Campus for Jewish Living.",
] as const;

export type PublicPage = {
  path: string;
  title: string;
  description: string;
  /** Include in sitemap.xml */
  sitemap: boolean;
};

export const CASE_STUDIES: PublicPage[] = [
  {
    path: "/domis",
    title: "Domis",
    description:
      "Founding Product Designer at Domis, a home maintenance platform that helps people understand their house and take care of it without the busywork getting in the way — including learning a home from an address, a photo, and an inspection report.",
    sitemap: true,
  },
  {
    path: "/virdio",
    title: "Virdio",
    description:
      "Product design for Virdio, a hardware-free AR fitness platform across iOS, Android, Web, and TV (2021–2022). Turning machine-vision overlays into a consumer workout product.",
    sitemap: true,
  },
  {
    path: "/obscura",
    title: "OBSCURA",
    description:
      "Immersive photographic documentary at MOHAI (Museum of History & Industry, Seattle). A spatial computing exhibit where the viewer's gaze dynamically curates unseen post-WWII photographs from Japan. Interaction design, prototyping, and Unity development.",
    sitemap: true,
  },
  {
    path: "/memory-care",
    title: "Memory Care Experience Station",
    description:
      "Interaction design and physical prototyping for the Memory Care Experience Station with Maria Mortati Experience Design — a multi-sensory installation for people living with mid-to-late stage Alzheimer's. Fast Company 2022 World Changing Ideas finalist.",
    sitemap: true,
  },
];

export const OTHER_PAGES: PublicPage[] = [
  {
    path: "/",
    title: `${PERSON.name} — ${PERSON.jobTitle}`,
    description: PERSON.description,
    sitemap: true,
  },
  {
    path: "/obscura/thoughts",
    title: "OBSCURA visitor thoughts",
    description:
      "Leave a thought, feedback, or review from the OBSCURA exhibition at MOHAI.",
    sitemap: true,
  },
  {
    path: "/waffling/savor",
    title: "Savor: Video to 3D model tool",
    description:
      "Savor turns an ordinary video of an object into a 3D Gaussian splat: a photoreal capture you can orbit and zoom on screen.",
    sitemap: true,
  },
  {
    path: "/waffling/orca",
    title: "Saving Baby J - An arcade game",
    description:
      "Walk-up arcade game with a science museum vibe for the Puget Sound. Throw orca plushies at a projected hit board to free Baby J.",
    sitemap: true,
  },
  {
    path: "/waffling/recorder",
    title: "Recorder-Proto",
    description:
      "A skeuomorphic mobile voice recorder prototype — turntable scrub, audio-reactive center, cassette-eject SFX.",
    sitemap: true,
  },
  {
    path: "/butter-chicken",
    title: "Butter Chicken Recipe",
    description:
      "A vibes-based butter chicken recipe — the ingredients are correct, the amounts may vary, and taste scales linearly with butter.",
    sitemap: true,
  },
];

export const ALL_SITEMAP_PAGES: PublicPage[] = [
  OTHER_PAGES[0],
  ...CASE_STUDIES,
  ...OTHER_PAGES.slice(1),
];

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
}
