import { type CaseStudy } from "@/types/case-study";

export const obscura: CaseStudy = {
  slug: "obscura",
  title: "OBSCURA",
  subtitle: "Immersive photographic documentary",
  description: "Leading, designing, and developing an immersive museum exhibit at MOHAI.",
  image: "/images/obscura.png",
  href: "/obscura",
  rotation: -1.8,
  yOffset: 12,
  content: [
    // ===== Hero =====
    {
      id: "obs-hero",
      type: "hero",
      title: "OBSCURA",
      subtitle: "A Dynamically Curated Immersive Exhibit",
      description: "My role in leading, designing, and developing an immersive museum exhibit at the Museum of History and Industry.",
      image: "/images/obscura.png",
      metadata: {
        role: "Project Lead, Design, Prototyping, Unity Dev \u2022 Key Tech: Unity, Head Tracking, Claude Code",
        timeline: "Exhibited September 2025",
        location: "MOHAI (Museum of History & Industry), Seattle",
      },
    },

    // ===== Prompt =====
    {
      id: "obs-prompt",
      type: "text",
      variant: "lead",
      content:
        "The Museum of History and Industry (MOHAI) approached our team with a hidden archive: hundreds of unexposed 35mm photos taken by Wayne Wong, a Signal Corps soldier rebuilding Japan in 1946. The brief was ambiguous: take these images and \u201Ccreate something boundary-pushing.\u201D",
    },

    // ===== Experience Overview =====
    {
      id: "obs-overview-section",
      type: "section",
      title: "Experience Overview",
      subtitle: "How the system works.",
    },
    {
      id: "obs-overview-text",
      type: "text",
      content:
        "Obscura is a gaze-driven documentary system consisting of two simultaneous experiences.",
    },
    {
      id: "obs-viewer",
      type: "text",
      label: "1. The Immersed Viewer (The Curator)",
      content:
        "A user enters the \u201CPortola Obscura\u201D booth and looks through a viewfinder. As they scan Wayne\u2019s photos, the system tracks their gaze. If they dwell on a face, the documentary branches into a narrative about people. If they focus on a building, it shifts to Environments. The experience curates itself in real-time based on their subconscious interest.",
    },
    {
      id: "obs-audience",
      type: "text",
      label: "2. The Audience (The Spectator)",
      content:
        "Outside the booth, an audience watches a large projection of the viewer\u2019s journey. A gaze reticle overlay shows exactly what the viewer is looking at, turning the act of \u201Clooking\u201D into a public performance.",
    },
    {
      id: "obs-video",
      type: "video",
      src: "",
      caption: "Split screen: What the VR Viewer sees (First Person View) alongside what the Audience sees (Projected View with Gaze Reticle).",
      layout: "breakout",
    },

    // ===== Intent =====
    {
      id: "obs-intent-section",
      type: "section",
      title: "Intent",
      subtitle: "We wanted to explore new ways to present images as an orchestrated experience.",
    },
    {
      id: "obs-intent-1",
      type: "text",
      label: "Speak to the Audience While Respecting the Artist",
      content:
        "Wayne took hundreds of photos but didn\u2019t talk about his intent. The exhibit allows users to view his photos, tracking what parts they dwell on. An external audience views through the first viewer\u2019s eyes, collectively defining the role of intent.",
    },
    {
      id: "obs-intent-2",
      type: "text",
      label: "Build Anticipation",
      content:
        "The \u201CAudience View\u201D offered a low-pressure way to engage before entering. People could wonder, \u201CWhy are they focused on the clothing instead of the temple?\u201D. This turned waiting into an active, social event.",
    },
    {
      id: "obs-intent-3",
      type: "text",
      label: "Give People Something to Talk About",
      content:
        "Recognizing the value of conversation before and after an experience, I designed a photo-strip souvenir. This strip visualizes which parts of an image participants looked at most.",
    },
    {
      id: "obs-souvenir-img",
      type: "image",
      src: "",
      alt: "The Photo-Strip Souvenir",
      caption: "A generated souvenir given to users based on which \u201CPath\u201D (Faces, Scenery, Clothing) they dwelled on most.",
      layout: "breakout",
      aspectRatio: "16/10",
    },
    {
      id: "obs-intent-4",
      type: "text",
      label: "Create Space for Meaningful Engagement",
      content:
        "Today\u2019s image engagement, largely through social media, often overlooks the significance of what we see. Wayne\u2019s photos, from a time when images held gravity, regain that importance in this exhibit. By presenting the large, focused photos individually, the exhibit creates an intimate setting for detailed investigation.",
    },

    // ===== Blueprint =====
    {
      id: "obs-blueprint-section",
      type: "section",
      title: "The Blueprint: Making Meaning",
      subtitle: "Designing for Connection, Intent, and Curiosity.",
    },
    {
      id: "obs-research-intro",
      type: "text",
      label: "Research: Finding the Human Narrative",
      content:
        "We began with a blurry image of what to make. To find clarity, we moved away from abstract theory and went directly to the source. We interviewed Subject Matter Experts in museology and history, but most importantly, we conducted deep-dive interviews with younger Asian Americans to understand how they engage with historical imagery in the digital age. We uncovered three critical themes that defined the exhibit:",
    },
    {
      id: "obs-theme-1",
      type: "quote",
      variant: "inline",
      content:
        "Looking at old family photos can be very emotional. I\u2019m the youngest of a very big family. So there\u2019s a lot of family history that I have no experience of, so getting to engage with photos from that time is really meaningful.",
      attribution: "Interview Participant \u2014 On Connection & Family History",
    },
    {
      id: "obs-theme-2",
      type: "quote",
      variant: "inline",
      content:
        "He took many pictures of kids. I wonder how he got to know them? Did he ask if he could take the picture? Especially the kids\u2026 Did he know them?",
      attribution: "Interview Participant \u2014 On The Mystery of Intent",
    },
    {
      id: "obs-theme-3",
      type: "quote",
      variant: "inline",
      content:
        "It\u2019s a really disorienting thing where you\u2019re scrolling, and you\u2019re watching something that\u2019s funny, and then you\u2019re looking at a recipe, and the next picture is of an atrocity.",
      attribution: "Interview Participant \u2014 On Modern Media Fatigue",
    },
    {
      id: "obs-ideation",
      type: "text",
      label: "Ideation: Finding the North Star",
      content:
        "We generated over 80 concepts, explicitly filtering out trends like NFTs or AI-modification to focus on the core value of the archive. We aligned on five \u201CNorth Star\u201D adjectives: Introspective, Connected, Reflective, Transient, and Enduring.",
    },
    {
      id: "obs-storyboard-text",
      type: "text",
      label: "Storyboarding the Invisible",
      content:
        "Because we were creating an asynchronous experience dictated by attention, standard wireframes failed. I used high-fidelity storyboarding to map the emotional journey, identifying key opportunities like the \u201CSouvenir Moment\u201D at the exit.",
    },
    {
      id: "obs-storyboard-img",
      type: "image",
      src: "",
      alt: "Storyboard Scans",
      caption: "Hand-drawn storyboards mapping the transition from the \u201CImmersed Self\u201D to the \u201CAudience Self.\u201D",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // ===== Prototyping & Pivot =====
    {
      id: "obs-proto-section",
      type: "section",
      title: "Prototyping & The Pivot",
    },
    {
      id: "obs-proto-text",
      type: "text",
      content:
        "We role-played with low-fidelity prototypes to test the physical space, creating a cardboard \u201CPortola Obscura\u201D booth to test light and shadow.",
    },
    {
      id: "obs-problem",
      type: "text",
      label: "The Problem",
      content:
        "Our initial concept relied on Eye Tracking (using a Tobii bar) for precision. However, consultations with Meta Reality Labs revealed that displaying raw eye-tracking data to a public audience violated privacy protocols.",
    },
    {
      id: "obs-pivot-solution",
      type: "text",
      label: "The Solution",
      content:
        "We pivoted to Head Tracking. This technical constraint became a design feature: by scaling the images up in the virtual space, we forced users to physically turn their heads, making their intent visible and performative for the audience outside.",
    },
    {
      id: "obs-proto-img",
      type: "image",
      src: "",
      alt: "Low-fidelity prototype of the Portola Obscura booth",
      caption: "Cardboard prototyping the booth to test light, shadow, and physical flow before Unity development.",
      layout: "breakout",
      aspectRatio: "4/3",
    },

    // ===== Reflection =====
    {
      id: "obs-reflection",
      type: "reflection",
      title: "Reflection",
      outcome:
        "The exhibit launched at MOHAI on September 13, 2025. The dynamic nature of the \u201CAudience View\u201D successfully built anticipation, creating a queue that lasted the entire duration of the event.",
      keyLesson:
        "The project proved that we could bridge the gap between a soldier\u2019s 1946 reality and a modern audience\u2019s digital curiosity, simply by asking them to look closer.",
    },

    // ===== Stats =====
    {
      id: "obs-stats",
      type: "stats",
      variant: "dark",
      stats: [
        { value: "200+", label: "Visitors experienced the installation" },
        { value: "4.7", label: "Average experience rating" },
        { value: "3", label: "Award nominations" },
      ],
    },
  ],
};
