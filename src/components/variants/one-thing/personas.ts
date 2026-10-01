import { CV_HREF } from "@/lib/site-identity";

export type ItemId =
  | "domis"
  | "virdio"
  | "obscura"
  | "memory-care"
  | "savor"
  | "orca"
  | "recorder"
  | "butter-chicken";

export type PersonaId = "hiring" | "ai" | "spatial" | "physical" | "browsing";

export interface Persona {
  id: PersonaId;
  chip: string;
  headline: string;
  sub: string;
  order: ItemId[];
  why: Partial<Record<ItemId, string>>;
  proof: { value: string; label: string; src: string }[];
  tools: string[];
  cta: { label: string; href: string; external?: boolean };
}

/** No answer yet: the neutral front door. */
export const DEFAULT_VIEW: Omit<Persona, "id" | "chip"> = {
  headline: "I design products that learn from the smallest action you take.",
  sub: "So this page does too. Tell it one thing about you, and it will rearrange itself.",
  order: ["domis", "virdio", "obscura", "memory-care", "savor", "orca", "recorder", "butter-chicken"],
  why: {},
  proof: [
    { value: "60%", label: "lift in new-user engagement from the Domis home avatar", src: "Domis" },
    { value: "98%", label: "positive evaluations across 200+ test sessions", src: "Memory Care" },
    { value: "300+", label: "unseen photographs, curated live by where you look", src: "OBSCURA" },
  ],
  tools: ["Pencil", "Paper", "Figma", "Cursor", "Claude Code", "Xcode", "Origami", "ProtoPie"],
  cta: { label: "Grab my CV", href: CV_HREF, external: true },
};

export const PERSONAS: Persona[] = [
  {
    id: "hiring",
    chip: "I’m hiring a product designer",
    headline: "Six years shipping 0→1 products, from research to production.",
    sub: "Founding designer at Domis. Before that: AR fitness across four platforms, a sold-out museum exhibit, and award-winning work in memory care.",
    order: ["domis", "virdio", "obscura", "memory-care", "savor", "recorder", "orca", "butter-chicken"],
    why: {
      domis: "Founding designer since November 2024. I took an AI onboarding flow from prototype to production on iOS.",
      virdio: "Built a design-token system that cut handoff time by 50% across iOS, Android, Web, and TV.",
      obscura: "Led design and development of a sold-out exhibit at MOHAI, from sketches to Unity.",
      "memory-care": "R&D lead for 10+ experiences. 98% positive evaluations across 200+ test sessions.",
      savor: "I prototype in code. This one is Mac-native: Metal, Vision, and RealityKit.",
      recorder: "Motion and sound details, prototyped until they feel right.",
      orca: "Tried two controllers and Wizard-of-Oz tested both. The throw won.",
      "butter-chicken": "Proof I’ll write a spec for anything.",
    },
    proof: [
      { value: "60%", label: "lift in new-user engagement from the 3D home avatar I built and shipped", src: "Domis" },
      { value: "50%", label: "less handoff time with a token system across four platforms", src: "Virdio" },
      { value: "98%", label: "positive evaluations across 200+ test sessions", src: "Memory Care" },
    ],
    tools: ["Figma", "Origami", "ProtoPie", "React", "SwiftUI", "Claude Code"],
    cta: { label: "Grab my CV", href: CV_HREF, external: true },
  },
  {
    id: "ai",
    chip: "I’m building with AI",
    headline: "I design AI products where the model does the busywork and people keep the judgment.",
    sub: "At Domis, the AI reads the inspection report, researches the appliance, and fills in the house from an address. People confirm what’s right.",
    order: ["domis", "savor", "virdio", "obscura", "memory-care", "recorder", "orca", "butter-chicken"],
    why: {
      domis: "An agentic, multimodal appliance scanner, and onboarding that turns a messy inspection PDF into tasks.",
      savor: "A phone video in, a 3D Gaussian splat out. Trains on-device in Metal; nothing goes to a cloud.",
      virdio: "Machine vision as a consumer product, designed for the moments tracking fails.",
      obscura: "Real-time gaze tracking decides what each visitor sees next.",
      "memory-care": "Sensor input mapped to gentle, predictable responses: pet the cat, it purrs.",
    },
    proof: [
      { value: "60%", label: "lift in new-user engagement from the AI-generated home avatar", src: "Domis" },
      { value: "1 photo", label: "of a nameplate becomes a researched guide: manuals, repairs, warranty", src: "Domis" },
      { value: "0", label: "cloud calls in Savor: frames, training, and viewer all run locally", src: "Savor" },
    ],
    tools: ["Claude Code", "Cursor", "Multimodal LLM APIs", "Stable Diffusion", "SwiftUI", "Figma"],
    cta: { label: "See how Domis learns a house", href: "/domis" },
  },
  {
    id: "spatial",
    chip: "I’m into spatial & XR",
    headline: "I design for headsets, rooms, and anything with a camera pointed at it.",
    sub: "VR in a museum, AR in your living room, and a 3D avatar of your house.",
    order: ["obscura", "virdio", "domis", "savor", "memory-care", "orca", "recorder", "butter-chicken"],
    why: {
      obscura: "Meta Quest 3S, Unity, and an asynchronous link to an audience display: one visitor’s gaze becomes everyone’s story.",
      virdio: "Real-time camera-tracking overlays, and calibration that feels like a warm-up instead of a scan.",
      domis: "A personalized 3D avatar of your home, generated from a photo.",
      savor: "Gaussian splats from a phone video, viewed in RealityKit.",
      "memory-care": "Room-scale: a driving simulator, a haptic footrest, and a cat on your lap.",
      orca: "Projection, a hit board, and a booth people walk up to.",
    },
    proof: [
      { value: "300+", label: "unseen photographs, curated live by where you look", src: "OBSCURA" },
      { value: "Sold out", label: "at MOHAI, 13 September 2025", src: "OBSCURA" },
      { value: "4", label: "platforms for one AR workout: iOS, Android, Web, and TV", src: "Virdio" },
    ],
    tools: ["Unity", "ARKit", "RealityKit", "visionOS", "Android XR", "Shaders"],
    cta: { label: "Step inside OBSCURA", href: "/obscura" },
  },
  {
    id: "physical",
    chip: "I make physical things",
    headline: "Some of my best interfaces have fur, a steering wheel, or a throwing arm.",
    sub: "When a screen is the wrong answer, I build the thing instead, and test it with the people who’ll use it.",
    order: ["memory-care", "orca", "obscura", "recorder", "virdio", "domis", "savor", "butter-chicken"],
    why: {
      "memory-care": "Plush cats wired with pressure sensors and haptic motors. Residents instinctively picked them up and held them.",
      orca: "Two controllers, both Wizard-of-Oz tested. Throwing a plushie won. Nobody needed a tutorial.",
      obscura: "Curtains, a headset, and a screen for the people waiting outside.",
      recorder: "Skeuomorphic on purpose: a turntable scrub and a cassette-eject sound.",
      virdio: "Your body is the controller.",
      domis: "Point your phone at an appliance’s nameplate; get its manual, repairs, and warranty.",
      "butter-chicken": "The most physical thing I make.",
    },
    proof: [
      { value: "98%", label: "positive evaluations across 200+ test sessions", src: "Memory Care" },
      { value: "100%", label: "of residents could reach the haptics without leaving their wheelchairs", src: "Memory Care" },
      { value: "Finalist", label: "Fast Company World Changing Ideas, 2022", src: "Memory Care" },
    ],
    tools: ["Arduino", "Sensors & haptics", "Cardboard", "Unity", "ProtoPie", "Pencil"],
    cta: { label: "Meet the haptic cat", href: "/memory-care" },
  },
  {
    id: "browsing",
    chip: "Just looking around",
    headline: "Welcome in. Start with the fun stuff.",
    sub: "The serious work is right below. Up top: a 3D scanner, an orca arcade game, and a recipe where only one ingredient matters.",
    order: ["savor", "orca", "butter-chicken", "recorder", "obscura", "domis", "virdio", "memory-care"],
    why: {
      savor: "Walk a slow circle around a sculpture; orbit it in 3D a minute later.",
      orca: "Throw plushies at the screen. Free Baby J.",
      "butter-chicken": "Taste scales linearly with butter.",
      recorder: "Scrub your voice memos like a record.",
    },
    proof: [
      { value: "4", label: "side builds, each one a reason to learn something new", src: "Wafflings" },
      { value: "300+", label: "unseen photographs, curated live by where you look", src: "OBSCURA" },
      { value: "1", label: "ingredient that matters (it’s butter)", src: "Butter Chicken" },
    ],
    tools: ["Pencil", "Paper", "Figma", "Claude Code", "Xcode", "Origami"],
    cta: { label: "Try the butter chicken", href: "/butter-chicken" },
  },
];

export const THINKING_STEPS = [
  "Reading your answer",
  "Re-ranking 8 projects",
  "Pulling the proof that matters to you",
] as const;
