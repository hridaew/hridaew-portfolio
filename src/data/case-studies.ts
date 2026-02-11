export interface Struggle {
  title: string;
  description: string;
}

export interface Success {
  title: string;
  description: string;
}

export interface Learning {
  title: string;
  description: string;
}

export interface Testimonial {
  role: string;
  quote: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  role: string;
  timeline: string;
  team?: string;
  platforms?: string;
  // Card rotation & offset for the gallery
  rotation: number;
  yOffset: number;
  // Detailed content
  outcome?: string;
  problem?: string;
  context?: string;
  scope?: string;
  // Challenge fields (Domis)
  challenge?: string;
  solution?: string;
  impact?: string;
  // Virdio-specific
  keyStat?: string;
  challenges?: {
    number: string;
    title: string;
    subtitle: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
  keyLesson?: string;
  // Process sections
  research?: string;
  ideation?: string;
  prototyping?: string;
  implementation?: string;
  exhibition?: string;
  databaseResearch?: string;
  interactionDesign?: string;
  softwareOverhaul?: string;
  testing?: string;
  // Shared sections
  struggles?: Struggle[];
  successes?: Success[];
  finalResult?: string[];
  nextSteps?: string;
  learnings?: Learning[];
  testimonials?: Testimonial[];
  // Impact stats
  stats: { value: string; label: string }[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "domis",
    title: "Domis",
    subtitle: "AI-powered home automation platform",
    description: "Leading design for next-generation AI-powered productivity tools",
    image: "/images/domis.png",
    role: "Lead Product Designer",
    timeline: "8 months, 2024",
    team: "2 Designers, 4 Engineers, 1 PM",
    rotation: -3.5,
    yOffset: 8,
    challenge: "Creating intuitive interfaces for complex AI functionality while maintaining user trust and transparency.",
    solution: "Developed a design system that balances automation with user control, incorporating progressive disclosure and explainable AI patterns.",
    impact: "40% increase in user engagement and 25% reduction in support tickets.",
    stats: [
      { value: "40%", label: "Increase in user engagement" },
      { value: "25%", label: "Reduction in support tickets" },
      { value: "4.8", label: "App store rating" },
    ],
  },
  {
    slug: "virdio",
    title: "Virdio",
    subtitle: "Democratizing AR Fitness",
    description: "Designing a hardware-free, cross-platform workout ecosystem (iOS, Android, Web, TV)",
    image: "/images/virdio.png",
    role: "Sole Product Designer",
    timeline: "2021–2022",
    platforms: "iOS, Android, Web, TV",
    rotation: 2.2,
    yOffset: -5,
    keyStat: "0 Hardware Required (Camera Only)",
    outcome: "Shipped a fully functional design system and end-to-end product to QA before the project was sunset due to funding.",
    keyLesson: "Technological capability does not equal user utility. If I were to redo this, I would focus on a Web-First approach to reduce the friction of app installation for first-time users.",
    challenges: [
      {
        number: "01",
        title: 'The "Invisible" Calibration',
        subtitle: "Making complex computer vision setup feel like a warm-up.",
        situation: 'AR requires precise floor mapping (4 distinct points) and a level camera to track body movement accurately. Standard "scan the floor" interactions are tedious and technical.',
        task: "Design a calibration flow using a standard laptop camera that is accurate enough for CV tracking but simple enough for a non-technical user in a living room.",
        action: 'I gamified the calibration. Instead of asking for measurements, I designed a "Walk the Corners" interaction. Users placed virtual "traffic cones" by walking to the boundaries of their space.',
        result: 'Turned a high-friction technical requirement into a physical "warm-up" game, ensuring accurate tracking without cognitive load.',
      },
      {
        number: "02",
        title: "Designing for Failure",
        subtitle: "The reality of AR is that tracking will break. The goal is to keep the user moving.",
        situation: "In a home environment, lighting changes, pets walk by, and users step out of frame. When tracking breaks, the workout cannot stop.",
        task: "Create an error-handling flow that informs the user of the issue without shaming them or interrupting their sweat session.",
        action: 'I designed a "Non-Blocking" failure state.',
        result: "Minimized workout abandonment. Users remained engaged with the content even when the technology failed.",
      },
      {
        number: "03",
        title: 'Scaling from 7" to 65"',
        subtitle: "One design system, two very different context loops.",
        situation: "The app needed to run on Mobile (small screen, unstable positioning) and TV/Desktop (large screen, stable positioning).",
        task: "Create a unified design system that respects the constraints of mobile while leveraging the immersion of TV.",
        action: "I designed an asymmetric experience.",
        result: 'A cohesive ecosystem where the phone acts as the "booker and tracker," and the big screen acts as the "gym."',
      },
    ],
    stats: [
      { value: "3", label: "Platforms shipped (iOS, Android, Web)" },
      { value: "1", label: "Unified design system" },
      { value: "0", label: "External hardware dependencies" },
    ],
  },
  {
    slug: "obscura",
    title: "OBSCURA",
    subtitle: "Immersive photographic documentary",
    description: "A boundary-pushing immersive installation at MOHAI",
    image: "/images/obscura.png",
    role: "Lead Product Designer",
    timeline: "8 months, 2024",
    team: "2 Designers, 4 Engineers, 1 PM",
    rotation: -1.8,
    yOffset: 12,
    outcome: "Successfully launched a sold-out, dynamically curated photographic documentary at MOHAI on September 13, 2025. The exhibit personalized a collection of over 300 historical images for each visitor, resulting in high engagement and hours-long wait times.",
    problem: "How do we engage modern audiences—fatigued by the rapid-fire consumption of digital imagery—with a static collection of context-less analog photos from 1946 Japan?",
    context: "A collaboration between the University of Washington MHCI+D program, the Wong family, and MOHAI to honor the legacy of Chinese American soldier and photographer Wayne Wong.",
    scope: "A one-year timeline to transform a discovered \"footlocker\" of history into a boundary-pushing immersive installation.",
    research: "Conducted SME interviews (museology, photography, history) and community walkthroughs with younger Asian Americans to identify resonant themes.",
    ideation: 'Explored 100+ concepts, using "anti-goals" (like avoiding NFTs) to sharpen the vision for meaningful engagement.',
    prototyping: 'Developed low-fidelity "role-play" setups to map the physical space before building a "vertical slice" Unity demo for stakeholders.',
    implementation: "Built a custom Unity program utilizing head-tracking and branching narrative logic to curate images in real-time.",
    exhibition: "Designed a dual-view experience (immersed viewer vs. audience) supplemented by physical takeaways.",
    struggles: [
      {
        title: "Privacy Guardrails",
        description: "Original plans for eye-tracking were sidelined after learning from Meta Reality Labs that raw gaze data is highly protected and restricted for public audience displays.",
      },
      {
        title: "Technical Constraints",
        description: "Building a \"bulletproof,\" looping public exhibit required advanced Unity skills and engineering resources that the project budget couldn't originally afford.",
      },
    ],
    successes: [
      {
        title: "The Pivot",
        description: "Shifted from eye-tracking to a head-tracking model. By enlarging the images, we encouraged intentional physical movement, making the interaction more conscious for the user and easier to display for the audience.",
      },
      {
        title: "AI-Augmented Engineering",
        description: "Leveraged LLMs (Claude and Gemini) to assist in writing complex game logic scripts in Unity, enabling a designer-led team to deploy a high-functioning custom program.",
      },
    ],
    finalResult: [
      "Obscura functioned as a \"Portola Obscura\" booth where users stepped into a darkroom and \"held\" a bespoke VR camera.",
      "Personalized Narrative: The system tracked what users dwelled on—faces, clothing, or scenery—to subconsciously dictate their unique path through history.",
      "Audience Engagement: An external view allowed spectators to watch the viewer's journey, sparking organic conversation about the artist's intent.",
      "Physical Souvenir: Visitors received a custom photostrip representing the specific \"meaningful\" themes they activated during their session.",
    ],
    nextSteps: "Following the success of the exhibition day, the team is exploring the potential for an expanded, longer-term exhibit residency at MOHAI to accommodate a wider audience.",
    learnings: [
      {
        title: "Designing for Two Selves",
        description: 'Applied Kahneman\'s philosophy by designing for both the experiencing self (the immersive VR booth) and the remembering self (the physical photostrip souvenir).',
      },
      {
        title: "Intentional Friction",
        description: "Learned that making images larger to force head movement—rather than just eye movement—actually increased the user's sense of agency and physical connection to the art.",
      },
      {
        title: "Technical Resilience",
        description: "Confirmed that using AI as a collaborative \"engineer\" allows designers to maintain creative control over complex, tech-heavy installations without sacrificing reliability.",
      },
    ],
    stats: [
      { value: "200+", label: "Visitors experienced the installation" },
      { value: "4.7", label: "Average experience rating" },
      { value: "3", label: "Award nominations" },
    ],
  },
  {
    slug: "memory-care",
    title: "Memory Care Experiences for Dementia",
    subtitle: "Multi-sensory dementia care station",
    description: "Qualitative life enrichment for residents with mid-to-late stage dementia",
    image: "/images/memory-care.png",
    role: "Lead Product Designer",
    timeline: "2022–2023",
    team: "2 Designers, 4 Engineers, 1 PM",
    rotation: 4.1,
    yOffset: 3,
    outcome: "Successfully deployed a permanent pilot program with over 200 recorded resident sessions. Achieved a 95% net positive impact on resident mood and engagement. Recognized as a Finalist for Fast Company's 2022 World Changing Ideas and an Honorable Mention for the SCAN Foundation Innovation Award. Secured an additional 20% in follow-up funding for further development.",
    problem: "Residents with mid-to-late stage dementia often face sensory deprivation and social isolation, yet are frequently ignored by modern tech interventions.",
    context: "A collaborative effort at SFCJL focusing on qualitative life enrichment for residents in Stages 4–6 of dementia.",
    scope: "Led research, physical prototyping, and a full UI redesign of the station's content library.",
    databaseResearch: "Built a comprehensive database evaluating the AgeTech landscape and Alzheimer's care standards.",
    interactionDesign: "Bridged the gap between passive screen viewing and active tactile touch through bespoke hardware.",
    softwareOverhaul: 'Refined the caregiver interface from a cluttered medical database into a flexible "DJ-style" session tool.',
    testing: "Conducted multi-phase testing, beginning with internal staff walkthroughs and progressing to high-fidelity on-site resident trials.",
    struggles: [
      {
        title: "The VR Disconnect",
        description: "While stakeholders were eager to use VR, research into the Reisberg Scale indicated that head-mounted displays would likely cause fear, confusion, and further isolation for this demographic.",
      },
      {
        title: 'The "Endless" Race',
        description: 'An early driving simulator prototype lacked a designated ending, causing significant anxiety for a resident who refused to stop because the "race wasn\'t over".',
      },
    ],
    successes: [
      {
        title: "Democratizing Access",
        description: 'Redesigned the haptic hardware from a fixed-chair platform into a portable "Haptic Footrest" wedge, ensuring it could be used by all residents, including those in wheelchairs.',
      },
      {
        title: "Low-Code Engineering",
        description: "Utilized Arduino and AI-assisted coding (ChatGPT) to rapidly iterate on complex sensory hardware without needing an external engineering team.",
      },
    ],
    finalResult: [
      'The Cat Petting Experience: A tactile toy "hacked" with pressure sensors and haptic motors that triggers synchronized "purring" video and vibrations.',
      'Portable Haptic Footrest: A standalone device that allows residents to "feel" the road in driving videos or the bass in music directly through their feet.',
      'Digital Content Library: A redesigned web platform for staff that prioritizes "Engagement Tips" and resident preferences over medical metadata.',
    ],
    nextSteps: "Knowledge Sharing: Currently publishing a design recommendation paper to standardize multi-sensory care in other facilities. Wireless Iteration: Developing a more robust, wireless version of the Cat Petting Experience to allow residents to hold the toy freely without setup constraints.",
    testimonials: [
      {
        role: "Life Enrichment Coordinator",
        quote: "The Experience Station is building a connection to the outside world. Residents feel like they are letting go of it. This makes it more accessible.",
      },
      {
        role: "Staff Manager",
        quote: "The Experience Station helps bring residents back online. It soothes the parasympathetic nervous system and helps mitigate distressing behaviors.",
      },
      {
        role: "Facility Staff",
        quote: "The Experience Station is an extension of what we do in the neighborhoods where we get to create our own little worlds.",
      },
    ],
    learnings: [
      {
        title: 'Designing for the "Edges"',
        description: "This project built a deep empathy for non-standard populations, reinforcing that accessibility isn't a feature—it is the product.",
      },
      {
        title: "Tactile Feedback over Mechanics",
        description: 'Learned that providing the feeling of agency (e.g., road vibration) is often more valuable for this demographic than complex interactive mechanics that risk failure.',
      },
      {
        title: "Systemic Care Design",
        description: 'By focusing on the caregiver as the primary "operator," I learned to design tools that reduce cognitive load for users working in high-stress environments.',
      },
    ],
    stats: [
      { value: "200+", label: "Recorded resident sessions" },
      { value: "95%", label: "Positive mood and engagement impact" },
      { value: "2", label: "Major award recognitions" },
    ],
  },
];
