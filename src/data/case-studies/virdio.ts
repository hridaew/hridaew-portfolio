import { type CaseStudy } from "@/types/case-study";

export const virdio: CaseStudy = {
  slug: "virdio",
  title: "Virdio",
  subtitle: "Democratizing AR Fitness",
  description: "Designing a hardware-free, cross-platform workout ecosystem (iOS, Android, Web, TV).",
  image: "/images/virdio.png",
  rotation: 2.2,
  yOffset: -5,
  tags: ["Consumer App", "Multiplatform", "AR"],
  href: "/virdio",
  content: [
    // ===== Hero =====
    {
      id: "virdio-hero",
      type: "hero",
      title: "Virdio",
      subtitle: "Designing a hardware-free, cross-platform workout ecosystem (iOS, Android, Web, TV).",
      description: "",
      image: "/images/virdio.png",
      metadata: {
        role: "Sole Product Designer",
        timeline: "2021\u20132022",
        platforms: "iOS, Android, Web, TV",
      },
    },

    // ===== Challenge intro =====
    {
      id: "virdio-challenge",
      type: "text",
      variant: "lead",
      content:
        "Virdio aimed to democratize home fitness by replacing expensive gym hardware with computer vision. My challenge was to design their consumer apps and reactive AR experiences that provided real-time feedback on form, while ensuring the system worked seamlessly across 5 different platforms and \u201Cmessy\u201D real-world living rooms.",
    },

    // ===== Video placeholder =====
    {
      id: "virdio-promo-video",
      type: "video",
      src: "",
      caption: "Virdio promotional video",
      layout: "breakout",
    },

    // ===== Section 01: Reducing Cognitive Load =====
    {
      id: "virdio-s1",
      type: "section",
      number: "01",
      title: "Reducing Cognitive Load in Setup",
      subtitle: "Ensuring a quality experience for non-technical users across a variety of home setups.",
    },
    {
      id: "virdio-s1-constraint",
      type: "text",
      label: "The Constraint",
      content:
        "Computer vision requires a precise 4-point floor map to function. The backend technology was robust enough to handle \u201Cmessy\u201D data, but we needed a way for non-technical users to provide that data without feeling like they were performing a technical calibration.",
    },
    {
      id: "virdio-s1-solution",
      type: "text",
      label: "The Solution",
      content:
        'I abstracted the technical coordinate mapping into a game of \u201CReach the Cone\u201D.',
    },
    {
      id: "virdio-s1-img1",
      type: "image",
      src: "",
      alt: "Calibration UI \u2014 Reach the Cone interaction",
      caption: "The \u201CCone\u201D calibration interface abstracted technical coordinate mapping into a physical warm-up.",
      layout: "breakout",
      aspectRatio: "16/9",
    },
    {
      id: "virdio-s1-detail1",
      type: "text",
      label: "Mental Model Shift",
      content:
        "Instead of asking users to \u201Cscan 4 meters,\u201D I placed virtual traffic cones in the app and asked users to walk to them. \u201CCones\u201D are a universally understood symbol for \u201Cboundary.\u201D",
    },
    {
      id: "virdio-s1-detail2",
      type: "text",
      label: "Designing for Tolerance",
      content:
        "Real living rooms have couches and coffee tables. I designed the system to be \u201Cfuzzy.\u201D If a user couldn\u2019t reach the exact spot due to furniture, the system accepted their closest attempt after it no longer detected movement.",
    },
    {
      id: "virdio-s1-detail3",
      type: "text",
      label: "Feedback Loop",
      content:
        "We used a multi-sensory confirmation loop (Visual \u201CPulse\u201D + Audio \u201CDing\u201D) so users knew the point was registered without looking back at the screen.",
    },
    {
      id: "virdio-s1-storyboard",
      type: "image",
      src: "",
      alt: "The \u201CCone\u201D Storyboard \u2014 early sketches",
      caption: "Early sketches focused on finding a metaphor that made calibration feel like a physical warm-up.",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // ===== Section 02: Designing for Resilience =====
    {
      id: "virdio-s2",
      type: "section",
      number: "02",
      title: "Designing for Resilience",
      subtitle: "Handling the \u201CUnhappy Path\u201D in a live, un-pausable environment.",
    },
    {
      id: "virdio-s2-constraint",
      type: "text",
      label: "The Constraint",
      content:
        "Virdio classes are live and un-pausable. If the AR tracking fails (e.g., a dog walks in frame, lighting changes), we cannot stop the video or throw a blocking modal in front of a user who is mid-workout.",
    },
    {
      id: "virdio-s2-solution",
      type: "text",
      label: "The Solution",
      content:
        "I prioritized the user\u2019s momentum over the technology\u2019s perfection.",
    },
    {
      id: "virdio-s2-detail1",
      type: "text",
      label: "Non-Blocking Failure State",
      content:
        "When tracking is lost, the AR layer silently fades away, but the class video continues uninterrupted.",
    },
    {
      id: "virdio-s2-detail2",
      type: "text",
      label: "No-Blame UI",
      content:
        "The error message is passive (\u201CTracking Paused\u201D) rather than active (\u201CPlease Fix This\u201D). It frames the issue as a system state, not a user error, preventing frustration.",
    },
    {
      id: "virdio-s2-detail3",
      type: "text",
      label: "Graceful Recovery",
      content:
        "Users can choose to ignore the error and finish the class in \u201CVideo Only\u201D mode, or tap a single \u201CRecalibrate\u201D button during a rest break to restore AR.",
    },
    {
      id: "virdio-s2-flowchart",
      type: "image",
      src: "",
      alt: "The \u2018Tracking Lost\u2019 Flowchart",
      caption: "Error handling logic ensured that technical failures never interrupted the user\u2019s physical momentum.",
      layout: "breakout",
      aspectRatio: "16/10",
    },

    // ===== Section 03: Context-Aware Scaling =====
    {
      id: "virdio-s3",
      type: "section",
      number: "03",
      title: "Context-Aware Scaling",
      subtitle: "One library, multiple contexts.",
    },
    {
      id: "virdio-s3-constraint",
      type: "text",
      label: "The Constraint",
      content:
        "As a solo designer supporting Mobile, Web, and TV simultaneously, I could not design every screen twice. I needed a scalable system that adapted to the \u201Cthumb-first\u201D constraints of mobile and the \u201Cinformation-dense\u201D capabilities of desktop.",
    },
    {
      id: "virdio-s3-solution",
      type: "text",
      label: "The Solution",
      content:
        "I built a token-based Design System that handled complexity automatically.",
    },
    {
      id: "virdio-s3-detail1",
      type: "text",
      label: "Adaptive Components",
      content:
        "We used a single component library where variants were tokenized for platform norms. A Class View on mobile was extremely focused; on Desktop, the same component expanded to show \u201CNext Activity\u201D previews and music controls.",
    },
    {
      id: "virdio-s3-detail2",
      type: "text",
      label: "Contextual Density",
      content:
        "I utilized the extra real estate on Desktop to reduce friction. While mobile required a separate screen for booking, the Desktop Sidebar Calendar allowed users to browse classes and check their schedule simultaneously.",
    },
    {
      id: "virdio-s3-detail3",
      type: "text",
      label: "Thematic Logic",
      content:
        "I established a strict mode logic\u2014Light Mode for administrative tasks (Booking, Browsing) and Dark Mode for the immersive workout experience. This helped users subconsciously switch modes between \u201CPlanning\u201D and \u201CDoing.\u201D",
    },
    {
      id: "virdio-s3-components",
      type: "image",
      src: "",
      alt: "Figma Component Library \u2014 Mobile vs Desktop Spec",
      caption: "Efficiency at Scale: A single component library with platform-specific variants allowed me to maintain design parity across 5 platforms.",
      layout: "full-width",
      aspectRatio: "16/9",
    },

    // ===== Reflections & Impact =====
    {
      id: "virdio-reflection",
      type: "reflection",
      title: "Reflections & Impact",
      outcome:
        "We successfully shipped a cohesive, end-to-end AR fitness platform to all the App Stores, proving that hardware-free tracking was viable on consumer devices \u2013 and paving the way for Virdio\u2019s pivot into the physical therapy space where they currently operate.",
      keyLesson:
        "Technological capability does not equal user utility. If I were to redo this, I would prioritize a Desktop-First approach for AR workouts to ensure a high quality experience to start with, then thoughtfully build out the mobile AR approach as that is not as well-suited for this kind of AR interaction.",
    },

    // ===== Stats =====
    {
      id: "virdio-stats",
      type: "stats",
      variant: "gradient",
      stats: [
        { value: "3", label: "Platforms shipped (iOS, Android, Web)" },
        { value: "1", label: "Unified design system" },
        { value: "0", label: "External hardware dependencies" },
      ],
    },
  ],
};
