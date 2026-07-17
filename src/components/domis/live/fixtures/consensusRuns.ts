/**
 * Consensus (Gemini ×3) demo fixture.
 * Values match DomisCaseStudyBody Run 1/2/3 → Shown story — edit here.
 */

export type ConsensusChip = {
  label: string;
  /** When true, chip is visually dropped (disagreement / discarded). */
  dropped?: boolean;
};

export type ConsensusRun = {
  id: string;
  who: string;
  chips: readonly ConsensusChip[];
};

export type ConsensusShownChip = {
  label: string;
  /** Empty / ask-the-user field (dashed). */
  ask?: boolean;
};

/** Three Gemini search runs — keep order and copy for the editorial story. */
export const CONSENSUS_RUNS: readonly ConsensusRun[] = [
  {
    id: "run-1",
    who: "Run 1",
    chips: [
      { label: "1974" },
      { label: "2 bath" },
      { label: "1,840 sq ft" },
    ],
  },
  {
    id: "run-2",
    who: "Run 2",
    chips: [
      { label: "1974" },
      { label: "2 bath" },
      { label: "2,110 sq ft", dropped: true },
    ],
  },
  {
    id: "run-3",
    who: "Run 3",
    chips: [
      { label: "1974" },
      { label: "3 bath", dropped: true },
      { label: "1,910 sq ft", dropped: true },
    ],
  },
] as const;

/** Fields shown after majority vote. */
export const CONSENSUS_SHOWN: {
  who: string;
  chips: readonly ConsensusShownChip[];
  caption: string;
} = {
  who: "Shown",
  chips: [
    { label: "1974" },
    { label: "2 bath" },
    { label: "Add sq ft", ask: true },
  ],
  caption:
    "Two out of three is enough to show. No agreement means the field arrives empty and asks.",
} as const;
