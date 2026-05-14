/**
 * Alternate home-page copy when choom (`theme-cyberpunk`) is active.
 * Streetslang is aligned to the user-supplied glossary export
 * `E:\Documents\choomdoc.txt` (Cyberpunk Wiki — Streetslang: Common Jargon,
 * Netrunning Terms, Solo Jargon, etc.). Pastiche only — not canon dialogue.
 */

export const CHOOM = {
  heroName: "HRIDAE WALIA",
  heroRole: "PREEM EDGERUNNER",
  heroExpandShow: "Jack in — spill the full psych file",
  heroExpandHide: "Stash the file — seal the pane",
  heroCloseExpanded: "Disconnect neural pane",
  heroReplayAvatar: "Re-roll portrait feed",
  heroReplayTitle: "Re-run face anim",
  heroPronShow: "HRIDAE WALIA, show frequency",
  heroPronHide: "HRIDAE WALIA, hide frequency",
  cvLabel: "DAT",
  liLabel: "NET",
  toolkitLabel: "CHROME RACK · DECKHEAD TOOLS",
  workSectionLabel: "GIGS · EDGE FILE",
  bioP1:
    "Ghosting Night City? Negative, choom — I’m holding a preem biz in the Bay sprawl: Founding Interface for Domis. Conapt-grade home stacks in meatspace, ML chrome that actually hauls your crib out of the red.",
  bioP2:
    "Half a decade on the clock: AR sweat rituals at Virdio, full-sensory braindance install at OBSCURA for the corpo museum crowd, and haptic rigs for chooms in neural fog — MCES lane, dignity-forward, output you can netrun in meatspace.",
  bioP3:
    "Prints on file: CCA Interaction Design, UW Seattle HCI master — pure scratch on the creds, no gonk noise.",
  footerBuildNote:
    "Compiled this NET on Figma shards → Figma Make stack → Claude Code + Cursor + Antigravity — preem toolchain while the eddies held out",
  cheatPlaceholder: "CUT ICE · ENTER RUNTIME CODE",
  cheatConfirm: "EXEC",
  wafflingsSectionLabel: "SIDE CHANNELS · WAFFLESTACK",
  wipBadge: "SCOP",
  cheatClue1: "Clue 1: Choom / choomba — friend on the street",
  cheatClue2: "Clue 2: Invincibles-era year stamp",
  cheatClue3: "Clue 3: Preem kitchen scop (runs on butter + heat)",
  cheatClue4: "Clue 4: Scorched-earth keyword (solo close-a-contract slang)",
  copyEmailAria: "Rip coords to clipboard",
} as const;

export const CHOOM_PROJECT_TITLES: Record<string, string> = {
  domis: "Domis build — zero-to-one crib daemon",
  virdio: "Virdio AR sweatforge — every slab, every lens",
  obscura: "OBSCURA — ghost-photo braindance at MOHAI",
  "memory-care": "MCES lane — chrome for chooms in the fog",
};

export const CHOOM_PROJECT_DESCRIPTIONS: Record<string, string> = {
  domis:
    "Spinning a home-maintenance stack from null — AI reads your dataslate, drops tasks, keeps the loft out of the red with joy, not slog. Preem biz, choom.",
  virdio:
    "Machine-vision chrome turned consumer sweat ritual — light clients in meatspace, heavy output on every rep.",
  obscura:
    "300+ unseen stills → VR braindance haunt for museum chooms — async exhibit, house packed, no mushi in the story reel.",
  "memory-care":
    "R&D on the MCES rig — multi-modal haptic install for neural-fog runners: dignity-forward chrome, ripperdoc-grade care UX, no corpo padding.",
};

/** Per-project card captions [card0, card1, card2] when choom is active. */
export const CHOOM_CARD_CAPTIONS: Record<string, [string, string, string]> = {
  domis: [
    "Paper chaos → task vectors for your stack — Domis parser online",
    "Log every rivet, keep the UI lighter than air",
    "AI personalization — skip the scop grind, preem hold on the chrome",
  ],
  virdio: [
    "Hero loop — chrome flex on desktop slab",
    "AR drill + pocket client — same chrome pipeline, meatspace + slab",
    "Profile stack — stats, streaks, street cred",
  ],
  obscura: [
    "Async VR haunt — MOHAI crowd, full jack on the door",
    "Exhibit night 9/13/2025 — house packed, razor-thin margins on the run",
    "Quest 3S rig — chrome deploy, no gonk wiring",
  ],
  "memory-care": [
    "MCES node — SFCJL host, Bay sprawl anchor",
    "Haptic sim — touch chrome, soul in the feedback",
    "Caregiver dataslate — data well for the ones still fighting",
  ],
};

export const CHOOM_MEMORY_CHIPS: [string, string, string] = [
  "CABHI — double chop pull on the creds",
  "Fast Company world-change finalist — nova experimental lane",
  "SCAN Innovation Award — corpo nod, street proof",
];

export const CHOOM_WAFFLINGS: {
  title: string;
  preview: string;
}[] = [
  {
    title: "Butter Chicken Recipe — kitchen-side black ICE (joke run)",
    preview:
      "Runners keep asking for my spice stack. It’s a vibes-build: amounts drift like heat in the sprawl. More Kashmiri red if you want pain. If taste reads flat, it’s salt or butter — butter scales linear, choom. That’s nova.",
  },
  {
    title: "Recorder-Proto — vinyl scratch deck, pocket build",
    preview: "Forged chrome from a gonk routine — preem side gig, choom.",
  },
  {
    title: "Experiment — claws on the smart slab",
    preview:
      "Smart slabs answer then forget — stateless ghosts. I’m wiring persistent memory so the box holds your thoughts like gear, not gomi.",
  },
  {
    title: "Dynamic UI — what even is chrome now?",
    preview:
      "I hate slop-vid and slop-skin UIs. Still, there’s biz in the noise. Everyone screaming dead Hollywood, dead UX — then shipping the same generated gomi.",
  },
  {
    title: "Experiment — face as input channel",
    preview:
      "Spatial’s old news — try facial kinesis. Your mug drives the slab. Weird? Sure. On-brand? Preem choom energy.",
  },
  {
    title: "More gigs incoming…",
    preview: "",
  },
];

export function choomCardCaption(
  slug: string,
  index: 0 | 1 | 2,
  fallback: string,
): string {
  const row = CHOOM_CARD_CAPTIONS[slug];
  if (!row) return fallback;
  return row[index] ?? fallback;
}

export function choomProjectTitle(slug: string, fallback: string): string {
  return CHOOM_PROJECT_TITLES[slug] ?? fallback;
}

export function choomProjectDescription(slug: string, fallback: string): string {
  return CHOOM_PROJECT_DESCRIPTIONS[slug] ?? fallback;
}
