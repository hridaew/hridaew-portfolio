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
  tags: ["Immersive Exhibit", "VR"],
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

    // ===== Lead =====
    {
      id: "obs-prompt",
      type: "text",
      variant: "lead",
      content:
        "The Museum of History and Industry handed us a box of unexposed film \u2014 hundreds of photographs taken by a Signal Corps soldier in 1946 Japan, never developed, never seen. The brief was three words: create something boundary-pushing. We made something that asks: when you look at a photograph, who is really doing the looking?",
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
      id: "obs-intent-1-img",
      type: "image",
      src: "",
      alt: "The viewer experience inside the Portola Obscura booth",
      layout: "breakout",
      aspectRatio: "16/10",
    },
    {
      id: "obs-intent-2",
      type: "text",
      label: "Build Anticipation",
      content:
        "The \u201CAudience View\u201D offered a low-pressure way to engage before entering. People could wonder, \u201CWhy are they focused on the clothing instead of the temple?\u201D. This turned waiting into an active, social event.",
    },
    {
      id: "obs-intent-2-img",
      type: "image",
      src: "",
      alt: "The audience watching the projected gaze view outside the booth",
      layout: "breakout",
      aspectRatio: "16/10",
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
    {
      id: "obs-intent-4-img",
      type: "image",
      src: "",
      alt: "A focused, large-scale photograph displayed within the exhibit",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // ===== The Blueprint =====
    {
      id: "obs-blueprint-section",
      type: "section",
      title: "The Blueprint: Making Meaning",
      subtitle: "Designing for Connection, Intent, and Curiosity.",
    },

    // --- 1. Research ---
    {
      id: "obs-research-intro",
      type: "text",
      label: "Research: Finding the Human Narrative",
      content:
        "We began with a blurry image of what to make. To find clarity, we moved away from abstract theory and went directly to the source. We interviewed Subject Matter Experts in museology and history, but most importantly, we conducted deep-dive interviews with younger Asian Americans to understand how they engage with historical imagery in the digital age. Three themes emerged:",
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
      id: "obs-research-synthesis",
      type: "text",
      content:
        "Connection: people encounter historical imagery through the lens of personal family memory, not historical distance. The Mystery of Intent: viewers project questions onto images when context is absent \u2014 the gap is the engagement. Scroll Fatigue: the speed and flattening of modern image consumption had made people hungry for slowness and weight, even if they couldn\u2019t name it. These three themes became the design pillars of the exhibit.",
    },

    // --- 2. Process ---
    {
      id: "obs-process-text",
      type: "text",
      label: "Process: Testing in Physical Space",
      content:
        "We role-played with low-fidelity prototypes to test the physical space, creating a cardboard \u201CPortola Obscura\u201D booth to test light and shadow.",
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

    // --- 3. Ideation ---
    {
      id: "obs-ideation",
      type: "text",
      label: "Ideation: Finding the North Star",
      content:
        "Eighty concepts. Five words: Introspective, Connected, Reflective, Transient, and Enduring. These adjectives became the filter for every design decision from there forward. A digital souvenir failed (not Enduring). A looping, resettable experience failed (not Transient). A purely private, solo booth failed (not Connected). The final design was tested against all five before it was built.",
    },
    {
      id: "obs-sketches-img",
      type: "image",
      src: "",
      alt: "Early concept sketches and ideation artifacts",
      caption: "Early sketches exploring the exhibit\u2019s spatial layout and interaction model.",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // --- 4. Storyboarding ---
    {
      id: "obs-storyboard-text",
      type: "text",
      label: "Storyboarding the Invisible",
      content:
        "Because we were creating an asynchronous experience dictated by attention, standard wireframes failed. I used high-fidelity storyboarding to map the emotional journey: the moment a visitor first sees the audience projection and grows curious, the transition from spectator to participant as they enter the booth, the private act of looking, and the \u201CSouvenir Moment\u201D at the exit \u2014 where a printed photo-strip gives them something physical to carry out and compare with others.",
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

    // ===== Prototyping & The Pivot =====
    {
      id: "obs-proto-section",
      type: "section",
      title: "Prototyping & The Pivot",
    },
    {
      id: "obs-eyetracking-intro",
      type: "text",
      label: "The Original Vision: Eye Tracking",
      content:
        "We wanted to capture how the subconscious mind looks at images \u2014 the involuntary flickers of attention that might surprise even the viewer themselves. To validate this, we ran tests with a Tobii eye tracker in our studio. The results confirmed the premise: participants were genuinely surprised by where their eyes lingered, often focusing on details they hadn\u2019t consciously noticed.",
    },
    {
      id: "obs-tobii-img",
      type: "image",
      src: "",
      alt: "Testing eye tracking with a Tobii bar in the studio",
      caption: "Studio testing with a Tobii eye tracker confirmed that subconscious gaze patterns surprised participants.",
      layout: "breakout",
      aspectRatio: "16/10",
    },
    {
      id: "obs-problem",
      type: "text",
      label: "The Problem",
      content:
        "When we explored how to implement eye tracking inside a VR headset apparatus for the exhibit, an advisor from Meta Reality Labs informed us that displaying raw eye-tracking data to a public audience without explicit informed consent from every viewer violated privacy protocols. The core mechanic of the exhibit was gone.",
    },
    {
      id: "obs-pivot-solution",
      type: "text",
      label: "The Solution",
      content:
        "We pivoted to head tracking. Less precise \u2014 but fundamentally different in character. Where eye tracking captured involuntary, subconscious attention, head tracking required the viewer to be intentional. To look at something, you had to physically turn toward it. To accommodate this shift, we drastically increased the size of the images in the VR view, forcing users to move their heads deliberately to take in the full photograph. The constraint made the design more honest: intent became visible, physical, and performative for the audience outside.",
    },
    {
      id: "obs-tracking-comparison-img",
      type: "image",
      src: "",
      alt: "Sketches comparing eye tracking versus head tracking interaction models",
      caption: "Eye tracking captures involuntary attention. Head tracking requires intentional movement \u2014 a fundamentally different kind of looking.",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // ===== Reflection =====
    {
      id: "obs-reflection",
      type: "reflection",
      title: "Reflection",
      outcome:
        "The exhibit launched at MOHAI on September 13, 2025. The queue for the booth lasted the full duration of the event, and the atmosphere was lively \u2014 but what surprised me most was the audience outside. The projected gaze view, originally designed as a waiting mechanism, became its own destination. Groups stood watching, narrating what the person inside was doing, debating why they kept returning to the same face.",
      keyLesson:
        "If I built it again \u2014 which I intend to, at a larger scale \u2014 I would pay far more attention to the pathfinding and spatial choreography of the audience experience. Exhibition design lives in the transitions: how people approach, how they wait, how they move through, how they leave. I\u2019d like to design the external apparatus with the same care as the internal experience, and explore how the physical space can facilitate more discussion and interaction between visitors before and after they step inside. The project proved that we could bridge the gap between a soldier\u2019s 1946 reality and a modern audience\u2019s digital curiosity, simply by asking them to look closer.",
    },
  ],
};
