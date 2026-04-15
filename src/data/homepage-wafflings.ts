export interface WafflingData {
  title: string;
  imageSrc?: string;
  previewText: string;
  href?: string;
  /** 1 = full, 0.5 = dimmed, 0.25 = extra-faint */
  opacity: 1 | 0.5 | 0.25;
  isPlaceholder?: boolean;
  /** Use Figma Frame 16255 implementation (node 16535:642) */
  taperedRim?: boolean;
  /** Open in shared-layout modal instead of navigating (no `href`) */
  recipeModal?: boolean;
}

export const homepageWafflings: WafflingData[] = [
  {
    title: "Butter Chicken Recipe",
    imageSrc: "/assets/home/waffling-butterchicken.png",
    previewText:
      "A few people have asked me for my Butter Chicken Recipe and I don\u2019t know where else to put it, so why not here.\n\nBefore you read the ingredients you must realize this - the quality of butter chicken scales with how much butter you put in it, which is why this has enough butter to keep you lubed up for years.\n\nIngredients:",
    opacity: 1,
    taperedRim: true,
    recipeModal: true,
  },
  {
    title: "Experiment - Giving Claws to my Google Home",
    imageSrc: "/assets/home/waffling-google-home.png",
    previewText:
      "Smart speakers are incredible for setting timers and turning off lights, but they have zero object permanence. They are stateless. They answer, and they forget.\n\nFor this experiment, I\u2019m fixing that. I want to build a true, persistent home for my passing thoughts.",
    opacity: 0.5,
  },
  {
    title: "What does a Dynamic UI look like",
    previewText:
      "I generally dislike AI-generated videos, and I\u2019m even less of a fan of AI-generated UIs.\n\nYet, paradoxically, I believe there is tremendous promise hidden within these technologies.\n\nRight now, the industry is loud with alarmists claiming that \u201CHollywood is dead\u201D or \u201CUX Design is dead.\u201D But when you actually look at what these brave souls are producing, it\u2019s almost universally the same pile of AI-generated sloppenheimer.",
    opacity: 0.5,
  },
  {
    title: "Experiment - Facial Interaction?",
    imageSrc: "/assets/home/waffling-facial.png",
    previewText:
      "We\u2019ve all heard of spatial interaction, now get ready for facial interaction!\n\nThis new form of interaction uses your face to interact with the computer, isn\u2019t that amazing. It\u2019s unlike anything else we\u2019ve seen mate.",
    opacity: 0.5,
  },
  {
    title: "More to come...",
    previewText: "",
    opacity: 0.5,
    isPlaceholder: true,
  },
];
