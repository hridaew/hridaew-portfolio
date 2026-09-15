import {
  PERSON,
  PERSON_BIO,
  CASE_STUDIES,
  CV_HREF,
  LINKEDIN_HREF,
  GITHUB_HREF,
  SITE_ORIGIN,
  absoluteUrl,
} from "@/lib/site-identity";

export function buildLlmsTxt(): string {
  const cases = CASE_STUDIES.map(
    (page) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`,
  ).join("\n");

  return `# ${PERSON.name}

> ${PERSON.jobTitle}. ${PERSON.worksFor.jobTitle} at [${PERSON.worksFor.name}](${PERSON.worksFor.url}). Pronounced ${PERSON.pronunciation}.

${PERSON_BIO.join("\n\n")}

## Now

${PERSON.worksFor.jobTitle} at [${PERSON.worksFor.name}](${PERSON.worksFor.url}) (2024–present), an AI-powered consumer home maintenance app.

## Selected work

${cases}

## Smaller builds (wafflings)

- [Savor](${absoluteUrl("/waffling/savor")}): on-device tool that turns a phone video into a 3D Gaussian splat.
- [Saving Baby J](${absoluteUrl("/waffling/orca")}): walk-up arcade game using thrown orca plushies as the controller.
- [Recorder prototype](${absoluteUrl("/waffling/recorder")}): skeuomorphic mobile voice recorder.
- [Butter chicken recipe](${absoluteUrl("/butter-chicken")}).

## Education

- ${PERSON.alumniOf[0].department}, ${PERSON.alumniOf[0].name} (${PERSON.alumniOf[0].year})
- ${PERSON.alumniOf[1].department}, ${PERSON.alumniOf[1].name} (${PERSON.alumniOf[1].year})

## Contact

- Email: ${PERSON.email}
- LinkedIn: ${LINKEDIN_HREF}
- GitHub: ${GITHUB_HREF}
- CV: ${CV_HREF}
- Site: ${SITE_ORIGIN}

## For machines

- Canonical URLs are lowercase kebab-case: ${absoluteUrl("/domis")}, ${absoluteUrl("/virdio")}, ${absoluteUrl("/obscura")}, ${absoluteUrl("/memory-care")}. Mixed-case and \`/projects/...\` aliases redirect here.
- Homepage, case studies, and this file are meant to be readable from a plain HTTP fetch (no JavaScript required).
- Longer digest: ${absoluteUrl("/llms-full.txt")}
`;
}

export function buildLlmsFullTxt(): string {
  return `# ${PERSON.name} — full digest

${buildLlmsTxt()}

## Case study notes

### Domis — ${absoluteUrl("/domis")}

${PERSON.name} is the Product Designer at Domis. The product helps homeowners keep track of a house: what it is, what it needs, and what to do next. Setup is the hard part — owners often do not know their own homes well enough to fill a complete model — so the work focuses on getting useful structure from the smallest action a person will actually take.

Signature flows:

- Address: type an address once; Domis researches the house and fills what it can.
- Appliance: photograph a nameplate; Domis returns item fields instead of a blank form.
- Inspection report: a messy PDF becomes a list of tasks.

Role: Founding Product Designer (2024–present). Live product: ${PERSON.worksFor.url}

### Virdio — ${absoluteUrl("/virdio")}

Hardware-free AR fitness: a consumer app using a device camera rather than dedicated gym hardware. Designed across mobile (small, unstable positioning) and TV/desktop (large, stable). Notable design problems: making floor/camera calibration feel like a warm-up instead of a scan, and keeping the workout going when tracking fails.

Role: Product Designer (2021–2022). Platforms: iOS, Android, Web, TV.

### OBSCURA — ${absoluteUrl("/obscura")}

Immersive exhibit at the Museum of History & Industry (MOHAI) in Seattle, built around 300+ unseen photographs of post-WWII life in Japan. Solitary VR and a public exhibition share a spatial computing environment: the viewer's gaze dynamically curates which images they see, so the path through the archive is personal rather than a fixed timeline.

Role: interaction design, prototyping, and Unity development. Exhibition: 13 September 2025. Visitor notes: ${absoluteUrl("/obscura/thoughts")}

### Memory Care Experience Station — ${absoluteUrl("/memory-care")}

Multi-sensory installation for people living with mid-to-late stage Alzheimer's, with Maria Mortati Experience Design, at the San Francisco Campus for Jewish Living. Includes physical interactives (for example a haptic cat-petting simulator) and a caregiver-facing digital library. Recognition includes Fast Company 2022 World Changing Ideas (finalist), CABHI awards, and a SCAN Foundation Innovation Award.

Role: Interaction Designer (physical prototyping and UI).

## Disambiguation

This is ${PERSON.name} the product / interaction designer (${LINKEDIN_HREF}), not other people with the same or similar family name. Current work is Domis; training is MHCI+D at the University of Washington and BFA Interaction Design at California College of the Arts.
`;
}
