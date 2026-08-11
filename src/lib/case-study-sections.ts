export type CaseStudySection = {
  id: string;
  label: string;
  number: string;
};

export const DOMIS_SECTIONS: CaseStudySection[] = [
  { id: "hero", label: "Intro", number: "00" },
  { id: "overview", label: "Overview", number: "01" },
  { id: "user-problem", label: "User problem", number: "02" },
  { id: "challenge", label: "Challenge", number: "03" },
  { id: "known", label: "The home", number: "04" },
  { id: "address", label: "Address", number: "05" },
  { id: "appliance", label: "Appliance", number: "06" },
  { id: "report", label: "Report", number: "07" },
  { id: "insights", label: "Insights", number: "08" },
];

export const VIRDIO_SECTIONS: CaseStudySection[] = [
  { id: "hero", label: "Intro", number: "00" },
  { id: "problem", label: "Problem", number: "01" },
  { id: "insight", label: "Insight", number: "02" },
  { id: "solution", label: "Solution", number: "03" },
  { id: "role-impact", label: "Role & Impact", number: "04" },
];

export const OBSCURA_SECTIONS: CaseStudySection[] = [
  { id: "hero", label: "Intro", number: "00" },
  { id: "overview", label: "Overview", number: "01" },
  { id: "intent", label: "Intent", number: "02" },
  { id: "blueprint", label: "Ideation", number: "03" },
  { id: "prototyping", label: "Prototyping", number: "04" },
  { id: "exhibition", label: "Exhibition", number: "05" },
  { id: "reflection", label: "Reflection", number: "06" },
];

export const MEMORY_CARE_SECTIONS: CaseStudySection[] = [
  { id: "hero", label: "Intro", number: "00" },
  { id: "connection", label: "Connection", number: "01" },
  { id: "accessibility", label: "Adapting haptics", number: "02" },
  { id: "caregiver", label: "Caregiver", number: "03" },
  { id: "impact", label: "Impact", number: "04" },
  { id: "reflection", label: "Reflection", number: "05" },
];

/** Sheet keys that show a floating TOC. */
export const SHEET_SECTIONS: Record<string, CaseStudySection[]> = {
  domis: DOMIS_SECTIONS,
  virdio: VIRDIO_SECTIONS,
  obscura: OBSCURA_SECTIONS,
  "memory-care": MEMORY_CARE_SECTIONS,
};
