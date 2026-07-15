"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Phase = "idle" | "pass1" | "pass2" | "pass3" | "beat" | "consensus";

type FieldKey = "model" | "year" | "capacity" | "warranty" | "manual";

interface PassRow {
  model: string;
  year: string;
  capacity: string;
  warranty: string;
  manual: string;
}

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: "model", label: "Model" },
  { key: "year", label: "Year" },
  { key: "capacity", label: "Capacity" },
  { key: "warranty", label: "Warranty" },
  { key: "manual", label: "Manual" },
];

const PASSES: PassRow[] = [
  {
    model: "Whirlpool WRF535SWHZ",
    year: "2019",
    capacity: "25 cu ft",
    warranty: "Expires Mar 2024",
    manual: "whirlpool.com/manuals/WRF535.pdf",
  },
  {
    model: "Whirlpool WRF535SMHZ",
    year: "2021",
    capacity: "25 cu ft",
    warranty: "not found",
    manual: "manualslib.com/wrf535swhz",
  },
  {
    model: "Whirlpool WRF535SMHZ",
    year: "2021",
    capacity: "24.7 cu ft",
    warranty: "Expires Aug 2026",
    manual: "whirlpool.com/docs/535.pdf",
  },
];

const CONSENSUS: Record<FieldKey, { value: string; note?: string; dropped?: boolean }> = {
  model: { value: "WRF535SMHZ (2 of 3)" },
  year: { value: "2021 (2 of 3)" },
  capacity: { value: "25 cu ft (2 of 3)" },
  warranty: {
    value: "Not shown",
    dropped: true,
    note: "No agreement across passes. Not shown.",
  },
  manual: {
    value: "Product support page",
    note: "All three links dead. Resolved to product support page.",
  },
};

function fieldDiffers(key: FieldKey, passIndex: number): boolean {
  if (passIndex === 0) return false;
  const prev = PASSES[passIndex - 1][key];
  const curr = PASSES[passIndex][key];
  // Also highlight if it differs from pass 1 for pass 3 when pass 2 matched pass 1
  if (curr !== PASSES[0][key]) return true;
  return curr !== prev;
}

const ease = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

function PassCard({
  label,
  data,
  passIndex,
  highlight,
}: {
  label: string;
  data: PassRow;
  passIndex: number;
  highlight: boolean;
}) {
  return (
    <div className="glass-panel flex h-full min-w-0 flex-col overflow-hidden rounded-3xl">
      <div className="border-b border-white/[0.06] px-4 py-3 md:px-5">
        <p className="site-label text-left text-white/45">{label}</p>
      </div>
      <ul className="flex flex-1 flex-col gap-0 p-1">
        {FIELDS.map(({ key, label: fieldLabel }) => {
          const warn = highlight && fieldDiffers(key, passIndex);
          const empty = data[key] === "not found";
          return (
            <li
              key={key}
              className={cn(
                "rounded-2xl px-3 py-2.5 md:px-4",
                warn && "bg-amber-400/[0.08] ring-1 ring-inset ring-amber-400/20"
              )}
            >
              <p className="site-label text-left text-white/40">{fieldLabel}</p>
              <p
                className={cn(
                  "site-body mt-0.5 break-all text-left",
                  empty ? "text-white/40 italic" : "text-white/70"
                )}
              >
                {data[key]}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ConsensusCard({ emphasizeWarranty }: { emphasizeWarranty: boolean }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-white/10",
        "bg-[rgba(40,34,28,0.72)] shadow-[0_16px_48px_-16px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]",
        "backdrop-blur-[20px] backdrop-saturate-[180%]"
      )}
    >
      <div className="border-b border-white/[0.08] px-4 py-3 md:px-5">
        <p className="site-label text-left text-white/45">Consensus</p>
      </div>
      <ul className="flex flex-col gap-0 p-1">
        {FIELDS.map(({ key, label }) => {
          const row = CONSENSUS[key];
          const isWarranty = key === "warranty";
          return (
            <li
              key={key}
              className={cn(
                "rounded-2xl px-3 py-2.5 md:px-4",
                isWarranty &&
                  emphasizeWarranty &&
                  "bg-amber-400/[0.06] ring-1 ring-inset ring-amber-400/15"
              )}
            >
              <p className="site-label text-left text-white/40">{label}</p>
              {row.dropped ? (
                <p className="site-body mt-0.5 text-left text-white/45 italic">
                  {row.value}
                </p>
              ) : (
                <p className="site-body mt-0.5 text-left text-white">{row.value}</p>
              )}
              {row.note ? (
                <p className="site-label mt-1 text-left text-white/40">{row.note}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {PASSES.map((pass, i) => (
        <PassCard
          key={i}
          label={`Pass ${i + 1}`}
          data={pass}
          passIndex={i}
          highlight
        />
      ))}
      <ConsensusCard emphasizeWarranty />
    </div>
  );
}

export function ApplianceConsensusDemo({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "consensus" : "idle");
  const [warrantyBeat, setWarrantyBeat] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (reduceMotion) {
      setPhase("consensus");
      setWarrantyBeat(true);
    }
  }, [reduceMotion]);

  const run = useCallback(() => {
    if (reduceMotion) {
      setPhase("consensus");
      setWarrantyBeat(true);
      return;
    }
    clearTimers();
    setWarrantyBeat(false);
    setPhase("pass1");
    timers.current.push(setTimeout(() => setPhase("pass2"), 420));
    timers.current.push(setTimeout(() => setPhase("pass3"), 840));
    timers.current.push(setTimeout(() => setPhase("beat"), 1260));
    timers.current.push(
      setTimeout(() => {
        setPhase("consensus");
        // Give the warranty drop its own beat after the card lands
        timers.current.push(setTimeout(() => setWarrantyBeat(true), 320));
      }, 1680)
    );
  }, [clearTimers, reduceMotion]);

  const reset = useCallback(() => {
    clearTimers();
    setWarrantyBeat(false);
    setPhase(reduceMotion ? "consensus" : "idle");
  }, [clearTimers, reduceMotion]);

  if (reduceMotion) {
    return (
      <div className={cn("w-full min-w-0", className)}>
        <StaticFallback />
        <p className="site-gallery-caption mt-4 text-left text-white/40">
          Three scans, three answers. Only what survives consensus is shown.
        </p>
      </div>
    );
  }

  const showPass = (n: number) =>
    phase === `pass${n}` ||
    (n === 1 && ["pass2", "pass3", "beat"].includes(phase)) ||
    (n === 2 && ["pass3", "beat"].includes(phase)) ||
    (n === 3 && phase === "beat");

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {phase === "idle" || phase === "consensus" ? (
          <button
            type="button"
            onClick={phase === "idle" ? run : reset}
            className="glass-panel inline-flex items-center rounded-full px-5 py-2.5 site-body text-white transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
          >
            {phase === "idle" ? "Run scan" : "Replay"}
          </button>
        ) : (
          <span className="site-label text-white/45">
            {phase === "beat" ? "Reconciling…" : "Scanning…"}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ease}
            className="glass-panel flex min-h-[220px] items-center justify-center rounded-3xl px-6 py-10"
          >
            <p className="site-body max-w-md text-center text-white/55">
              Three scans of the same fridge. Differing fields light up, then consensus
              keeps only what survives.
            </p>
          </motion.div>
        ) : phase === "consensus" ? (
          <motion.div
            key="consensus"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ease}
            className="mx-auto w-full max-w-xl"
          >
            <ConsensusCard emphasizeWarranty={warrantyBeat} />
          </motion.div>
        ) : (
          <motion.div
            key="passes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={ease}
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
          >
            {[0, 1, 2].map((i) =>
              showPass(i + 1) ? (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={ease}
                >
                  <PassCard
                    label={`Pass ${i + 1}`}
                    data={PASSES[i]}
                    passIndex={i}
                    highlight={i > 0}
                  />
                </motion.div>
              ) : (
                <div
                  key={i}
                  className="hidden min-h-[1px] md:block"
                  aria-hidden
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
