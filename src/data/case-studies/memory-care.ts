import { type CaseStudy } from "@/types/case-study";

export const memoryCare: CaseStudy = {
  slug: "memory-care",
  title: "Memory Care Experience Station",
  subtitle: "Multi-sensory dementia care station",
  description: "A multi-sensory pilot program enabling immersive engagement for residents with sensory deprivation.",
  image: "/images/memory-care.png",
  href: "/memory-care",
  rotation: 4.1,
  yOffset: 3,
  content: [
    // ===== Hero =====
    {
      id: "mc-hero",
      type: "hero",
      title: "Memory Care Experience Station",
      subtitle: "A multi-sensory pilot program enabling immersive engagement for residents with sensory deprivation.",
      description: "",
      image: "/images/memory-care.png",
      metadata: {
        role: "Interaction Designer (Physical Prototyping & UI)",
        timeline: "18 Months (Pilot Program)",
        team: "Maria Mortati (Principal), Scott Minneman (Tech Arch), SFCJL Staff",
      },
      recognition: "Fast Company \u201CWorld Changing Ideas\u201D Finalist (2022)",
    },

    // ===== Challenge intro =====
    {
      id: "mc-challenge",
      type: "text",
      variant: "lead",
      content:
        "Residents with mid-to-late stage dementia often face sensory deprivation and profound isolation. The San Francisco Campus for Jewish Living (SFCJL) sought to create an \u201CExperience Station\u201D to provide meaningful stimulation. While stakeholders initially explored Virtual Reality, our research indicated that headsets could cause confusion or fear in this demographic. We followed a \u201CTangible Immersion\u201D strategy \u2014 creating a station that served as a window to the world, grounded in multisensory stimulation.",
    },

    // ===== Section 01: Prototyping Connection =====
    {
      id: "mc-s1",
      type: "section",
      number: "01",
      title: "Prototyping Connection",
      subtitle: "Bridging the digital-physical gap with \u201Chacked\u201D hardware.",
    },
    {
      id: "mc-s1-insight",
      type: "text",
      label: "The Insight",
      content:
        "Existing content was static and passive. We hypothesized that adding a tactile dimension \u2013 giving residents something to hold \u2013 would increase emotional grounding and immersion.",
    },
    {
      id: "mc-s1-prototype",
      type: "text",
      label: "The Prototype: The Cat Petting Experience",
      content:
        "I \u201Chacked\u201D three plush cats, embedding them with pressure sensors and haptic vibration motors wired to an Arduino. Petting the toy triggered a \u201Cpurr\u201D vibration and played a synchronized video of that cat on the screen.",
    },
    {
      id: "mc-s1-img",
      type: "image",
      src: "",
      alt: "The Haptic Cat Prototype",
      caption: "Using Arduino and haptic motors to simulate a \u201Cpurr,\u201D creating a sensory bridge between the resident and the screen.",
      layout: "breakout",
      aspectRatio: "16/10",
    },
    {
      id: "mc-s1-validation",
      type: "text",
      label: "The Validation",
      content:
        "Early testing revealed a strong emotional response; residents instinctively tried to pick up and hold the animals. This validated the need for \u201CTangible Companionship\u201D and informed future iterations to be wireless and robust for daily facility use.",
    },

    // ===== Section 02: Redefining Accessibility =====
    {
      id: "mc-s2",
      type: "section",
      number: "02",
      title: "Redefining Accessibility",
      subtitle: "Decoupling technology from furniture to ensure universal access.",
    },
    {
      id: "mc-s2-constraint",
      type: "text",
      label: "The Constraint",
      content:
        "Haptic feedback is critical for sensory stimulation. However, the existing prototype was a platform placed under a chair, which was inaccessible to the majority of our residents who use wheelchairs.",
    },
    {
      id: "mc-s2-solution",
      type: "text",
      label: "The Solution: The Haptic Footrest",
      content:
        "I iterated on the hardware at home, aiming to further mobilize the haptics so they wouldn\u2019t need to take up so much space, and be able to be used by wheelchair users. I used an existing foot rest since it was something that could adapt to different people and be moved with ease, and attached a strong haptic emitter to the back of it, enabling the experience of haptics without compromising on accessibility and quality.",
    },
    {
      id: "mc-s2-application",
      type: "text",
      label: "The Application: Restoring Agency",
      content:
        "We paired this hardware with a Driving Simulator. I thought it would be great to give the residents a sense of control, by having them play a realistic driving game paired with a Logitech steering wheel with force feedback.",
    },
    {
      id: "mc-s2-pivot",
      type: "text",
      label: "The Pivot",
      content:
        "Initial tests with a video game (Assetto Corsa) failed because the mechanics of driving caused anxiety, and the configuration of the game was cumbersome and out of control.",
    },
    {
      id: "mc-s2-fix",
      type: "text",
      label: "The Fix",
      content:
        "I pivoted to \u201CSimulated Agency.\u201D We synced high-quality POV driving footage that the station already used, with the Logitech force-feedback wheel and my haptic footrest.",
    },
    {
      id: "mc-s2-result",
      type: "text",
      label: "The Result",
      content:
        "Residents got the tactile satisfaction of steering and \u201Cfeeling\u201D the road rumble through their feet, without the risk of failure.",
    },
    {
      id: "mc-s2-img",
      type: "image",
      src: "",
      alt: "The Haptic Footrest & Driving Setup",
      caption: "By changing the form factor from a Floor panel to a Footrest, we ensured 100% of residents could access the experience without leaving their wheelchairs.",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // ===== Section 03: The Caregiver Interface =====
    {
      id: "mc-s3",
      type: "section",
      number: "03",
      title: "The Caregiver Interface",
      subtitle: "Transforming medical metadata into a session tool.",
    },
    {
      id: "mc-s3-barrier",
      type: "text",
      label: "The Operational Barrier",
      content:
        "The station is controlled by facility staff who are often stretched thin. If the digital interface was difficult to configure, the physical station would sit unused. Feedback indicated the original system felt like a static medical database, lacking the flexibility needed for improvised care sessions.",
    },
    {
      id: "mc-s3-evolution",
      type: "text",
      label: "The UI Evolution",
      content:
        "I redesigned the web-based library to function as a dynamic session tool rather than a repository.",
    },
    {
      id: "mc-s3-detail1",
      type: "text",
      label: "Reducing Cognitive Load",
      content:
        "I removed extraneous widgets and filtered the Information Architecture to prioritize \u201CEngagement Tips\u201D and simple session controls.",
    },
    {
      id: "mc-s3-detail2",
      type: "text",
      label: "Personalization",
      content:
        "I introduced \u201CQuick Add\u201D features for improvised content (e.g., specific YouTube requests) and \u201CFavorite Playlists\u201D based on resident history.",
    },
    {
      id: "mc-s3-detail3",
      type: "text",
      label: "Contextual Notes",
      content:
        "I replaced buried metadata with prominent staff notes, ensuring critical preferences (e.g., \u201CFrank loves Jazz\u201D) were visible at a glance.",
    },
    {
      id: "mc-s3-img",
      type: "image",
      src: "",
      alt: "The Web Dashboard UI",
      caption: "The redesigned interface prioritizes \u201CSession Flow\u201D over \u201CData Entry,\u201D empowering staff to personalize experiences in seconds.",
      layout: "full-width",
      aspectRatio: "16/9",
    },

    // ===== Impact & Recognition =====
    {
      id: "mc-stats",
      type: "stats",
      variant: "gradient",
      stats: [
        { value: "194+", label: "Recorded sessions at SFCJL" },
        { value: "95%", label: "Positive sentiment (33% Very Positive, 62% Positive)" },
        { value: "2", label: "Major award recognitions" },
      ],
    },

    // ===== Testimonials =====
    {
      id: "mc-testimonial-1",
      type: "testimonial",
      quote:
        "The Experience Station helps bring residents back online. It soothes the parasympathetic nervous system and helps mitigate distressing behaviors.",
      role: "Manager of Life Enrichment, SFCJL",
    },
    {
      id: "mc-testimonial-2",
      type: "testimonial",
      quote:
        "The Experience Station is a way to bridge connections, foster relationships for new staff to home in on residents. As well as facilitation for family members with their desire for connection.",
      role: "Life Enrichment Coordinator, SFCJL",
    },

    // ===== Awards =====
    {
      id: "mc-awards",
      type: "callout",
      variant: "awards",
      items: [
        "\u2605 Finalist: Fast Company 2022 World Changing Ideas (Experimental Category)",
        "\u2605 Honorable Mention: SCAN Foundation Innovation Award",
      ],
    },

    // ===== Side Note =====
    {
      id: "mc-side-note",
      type: "callout",
      variant: "info",
      items: [
        "Side Note: The haptic footrest prototype was so engaging to use for media consumption that I actually built a second unit to keep for myself!",
      ],
    },

    // ===== Reflection =====
    {
      id: "mc-reflection",
      type: "reflection",
      title: "Reflection",
      outcome:
        "I love to work in a hands-on capacity \u2014 screens, toys, games, physical form, all of it. This was a unique chance to stretch my skills and have the independence to create impactful experiences from scratch, as challenging as that was. This project came with a lot of special considerations for our users, and it changed my perspective as a designer to try to always consider the needs of all populations, not just the most common.",
      keyLesson:
        "This project came with a lot of special considerations for our users, and it changed my perspective as a designer to try to always consider the needs of all populations, not just the most common.",
    },
  ],
};
