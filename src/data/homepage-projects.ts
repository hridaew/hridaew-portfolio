export interface ProjectCardData {
  imageSrc: string;
  imageAlt: string;
  caption: string;
  /** Tailwind classes for sizing/positioning the image inside the 696×392 card */
  imageClassName: string;
  /** Optional note for future video replacement */
  videoNote?: string;
  /**
   * When set, primary media is this video (muted, autoplay, loop) instead of `imageSrc`.
   * `imageSrc` may still be used as the `poster` frame until playback starts.
   */
  videoSrc?: string;
}

export interface HomepageProject {
  slug: string;
  title: string;
  description: string;
  bgColor: string;
  orbColor1: string;
  orbColor2: string;
  cards: [ProjectCardData, ProjectCardData, ProjectCardData];
  /**
   * Optional short labels (e.g. recognition) shown as chips under the intro copy.
   * Use `title` on each chip for the full formal name when the label is abbreviated.
   */
  recognitionChips?: { label: string; title?: string }[];
}

export const homepageProjects: HomepageProject[] = [
  {
    slug: "domis",
    title: "Building Domis",
    description:
      "Designing a home maintenance app from scratch, leveraging AI to make the inventory and task tracking experience a joy rather than a pain.",
    bgColor: "#ff5a5b",
    orbColor1: "rgba(211,153,153,0.6)",
    orbColor2: "rgba(255,37,37,0.8)",
    cards: [
      {
        imageSrc: "/assets/home/domis-card1-tasks-composite.png",
        imageAlt:
          "Domis inspection report and Tasks Found screen, stacked vertically",
        caption:
          "Domis turns messy documents into actionable items for your home",
        imageClassName:
          "absolute bottom-0 left-1/2 -translate-x-1/2 max-h-[90%] max-w-full w-auto h-auto object-contain object-bottom drop-shadow-[0px_14px_32px_rgba(0,0,0,0.22)]",
      },
      {
        imageSrc: "/assets/home/domis-task-detail.png",
        imageAlt: "Domis task detail screen looping animation",
        caption: "Designed to log every detail while feeling light",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[151px] h-[327px] object-cover rounded-[20px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
        videoSrc: "/assets/home/domis-card2-anim.mp4",
      },
      {
        imageSrc: "/assets/home/domis-home-screen.png",
        imageAlt: "Domis AI personalization",
        caption:
          "Using AI for personalization, bypassing annoying tasks, and a bit of fun",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-[46px] w-[206px] h-[446px] object-cover rounded-[24px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
      },
    ],
  },
  {
    slug: "virdio",
    title: "Designing an AR fitness platform across every screen",
    description:
      "Turning Virdio\u2019s machine vision-based AR technology into a consumer facing fitness platform via lightweight mobile and desktop apps.",
    bgColor: "#171528",
    orbColor1: "rgba(204,186,255,0.6)",
    orbColor2: "rgba(27,25,33,0.8)",
    cards: [
      {
        imageSrc: "/assets/home/virdio-ar-desktop.png",
        imageAlt: "Virdio AR desktop hero video",
        caption: "Virdio hero video",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[491px] h-[276px] object-contain object-center rounded-xl shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
        videoSrc: "/assets/home/virdio-hero-crop.mp4",
      },
      {
        imageSrc: "/assets/home/virdio-ar-desktop.png",
        imageAlt: "Virdio AR desktop workout in context",
        caption: "Virdio AR exercise and mobile app",
        imageClassName:
          "absolute left-[88px] top-[63px] w-[438px] h-[246px] object-cover rounded-xl shadow-[0px_4px_40px_16px_rgba(0,0,0,0.15)]",
      },
      {
        imageSrc: "/assets/home/virdio-profile-stats.png",
        imageAlt: "Virdio user profile",
        caption: "User profile",
        imageClassName:
          "absolute left-[136px] top-[61px] w-[127px] h-[271px] object-cover rounded-xl shadow-[0px_4px_40px_16px_rgba(0,0,0,0.15)]",
      },
    ],
  },
  {
    slug: "obscura",
    title: "Making OBSCURA, a photographic exhibit with dynamic storytelling",
    description:
      "Taking 300+ unseen photos from WW2 and turning them into a VR-driven immersive experience for the visitors at the Museum of History and Industry.",
    bgColor: "#111111",
    orbColor1: "rgba(118,118,118,0.6)",
    orbColor2: "#111111",
    cards: [
      {
        imageSrc: "/assets/home/obscura-sbs-view.png",
        imageAlt: "OBSCURA side-by-side view looping video",
        caption:
          "OBSCURA is an asynchronous VR exhibit my team and I hosted at MOHAI",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[493px] h-[278px] object-cover rounded-xl shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
        videoSrc: "/assets/home/obscura-sbs-video.mp4",
      },
      {
        imageSrc: "/assets/home/obscura-exhibit-vr.png",
        imageAlt: "Exhibition visitor using VR",
        caption: "The project was exhibited on 9/13/2025 to a full audience",
        imageClassName:
          "absolute left-[105px] top-[66px] w-[235px] h-[261px] object-cover rounded-xl",
      },
      {
        imageSrc: "/assets/home/obscura-headset-user.png",
        imageAlt: "VR headset demonstration",
        caption: "Deployed/developed using a Meta Quest 3S",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 bottom-[-28px] w-[498px] h-[369px] object-cover",
      },
    ],
  },
  {
    slug: "memory-care",
    title: "Creating enriching experiences for people living with Alzheimer\u2019s",
    description:
      "R&D for the MCES, a multi-modal interactive installation by Maria Mortati aiming to provide life enrichment for people living with mid-to-late stage dementia.",
    bgColor: "#ff9f73",
    orbColor1: "rgba(255,118,6,0.5)",
    orbColor2: "#ff813a",
    recognitionChips: [
      {
        label: "CABHI — 2x award recipient",
        title:
          "CABHI (Centre for Aging + Brain Health Innovation) — 2x Award Recipient",
      },
      {
        label: "Fast Company 2022 World Changing Ideas finalist",
        title:
          "Finalist: Fast Company 2022 World Changing Ideas (Experimental Category)",
      },
      {
        label: "SCAN Foundation Innovation Award",
      },
    ],
    cards: [
      {
        imageSrc: "/assets/home/mces-facility.png",
        imageAlt: "MCES at SFCJL",
        caption: "The MCES currently lives at the SFCJL in San Francisco, CA",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[491px] h-[276px] object-cover rounded-xl shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
      },
      {
        imageSrc: "/assets/home/mces-cat-petting.png",
        imageAlt: "Haptic cat petting simulator",
        caption:
          "I built interactives like the haptic cat petting simulator",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[491px] h-[276px] object-cover rounded-xl shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
      },
      {
        imageSrc: "/assets/home/mces-library-dashboard.png",
        imageAlt: "Digital library for caregivers",
        caption:
          "I refined the design of an accompanying digital library for caregivers to facilitate with",
        imageClassName:
          "absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[491px] h-[276px] object-cover rounded-xl shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)]",
      },
    ],
  },
];

// Additional images for Virdio card 2 (multi-image layout)
export const virdioCard2ExtraImage = {
  src: "/assets/home/virdio-classes-list.png",
  alt: "Virdio classes list",
  className:
    "absolute left-[501px] top-[119px] w-[106px] h-[231px] object-cover rounded-xl shadow-[0px_4px_40px_16px_rgba(0,0,0,0.15)]",
};

// Additional images for Virdio card 3 (3-phone layout)
export const virdioCard3ExtraImages = [
  {
    src: "/assets/home/virdio-profile-achievements.png",
    alt: "Profile achievements",
    className:
      "absolute left-[279px] top-[47px] w-[138px] h-[299px] object-cover rounded-xl shadow-[0px_4px_40px_16px_rgba(0,0,0,0.15)]",
  },
  {
    src: "/assets/home/virdio-profile-classes.png",
    alt: "Profile past classes",
    className:
      "absolute left-[433px] top-[61px] w-[127px] h-[271px] object-cover rounded-xl shadow-[0px_4px_40px_16px_rgba(0,0,0,0.15)]",
  },
];

// Additional images for Obscura card 2 (dual exhibition photos side by side)
export const obscuraCard2ExtraImages = [
  {
    src: "/assets/home/obscura-exhibit-screen.png",
    alt: "Exhibition projector screen",
    className:
      "absolute left-[356px] top-[66px] w-[235px] h-[261px] object-cover rounded-xl",
  },
];
