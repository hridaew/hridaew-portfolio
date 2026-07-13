"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { LightboxImage } from "@/components/virdio/Lightbox";

type Severity = "high" | "medium" | "low";

type ExtractedTask = {
  id: string;
  title: string;
  detail: string;
  source: string;
  severity: Severity;
};

const DEFAULT_TASKS: ExtractedTask[] = [
  {
    id: "t1",
    title: "Repair roof flashing at chimney",
    detail: "Evidence of water intrusion near chimney base — address before next rain.",
    source: "Found in Exterior — Roof",
    severity: "high",
  },
  {
    id: "t2",
    title: "Replace GFCI outlet in kitchen",
    detail: "Outlet fails trip test; safety hazard near water sources.",
    source: "Found in Electrical — Kitchen",
    severity: "high",
  },
  {
    id: "t3",
    title: "Service furnace before winter",
    detail: "Filter overdue; heat exchanger needs professional inspection.",
    source: "Found in HVAC — Heating",
    severity: "medium",
  },
  {
    id: "t4",
    title: "Seal basement window wells",
    detail: "Minor gaps allowing moisture; cosmetic now, structural later.",
    source: "Found in Foundation — Windows",
    severity: "low",
  },
];

const REPORT_HIGHLIGHTS = [
  {
    id: "h1",
    text: "Evidence of water staining and deteriorated flashing at the chimney base.",
    taskId: "t1",
  },
  {
    id: "h2",
    text: "Kitchen GFCI receptacle fails to trip under test conditions.",
    taskId: "t2",
  },
  {
    id: "h3",
    text: "Furnace filter heavily soiled; last service date unknown.",
    taskId: "t3",
  },
  {
    id: "h4",
    text: "Window well seals show minor gaps with early moisture marks.",
    taskId: "t4",
  },
];

const SEVERITY_STYLES: Record<Severity, string> = {
  high: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  low: "border-sky-400/30 bg-sky-400/10 text-sky-300",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "Urgent",
  medium: "Soon",
  low: "Monitor",
};

interface DocumentProcessorDemoProps {
  className?: string;
  /** Static fallback when interactive demo shouldn't run */
  fallbackSrc?: string;
  fallbackAlt?: string;
  /** Prefer static composite instead of interactive demo */
  forceFallback?: boolean;
  /** Stagger delay between task card reveals (seconds) */
  staggerDelay?: number;
  /** Highlight lift duration (seconds) */
  highlightDuration?: number;
}

export function DocumentProcessorDemo({
  className,
  fallbackSrc = "/assets/home/domis-card1-tasks-composite.png",
  fallbackAlt = "Inspection report processed into prioritized Domis tasks",
  forceFallback = false,
  staggerDelay = 0.12,
  highlightDuration = 0.28,
}: DocumentProcessorDemoProps) {
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [visibleTasks, setVisibleTasks] = useState<string[]>([]);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const timersRef = useRef<number[]>([]);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const runDemo = useCallback(() => {
    if (phase === "processing") return;
    clearTimers();
    setPhase("processing");
    setVisibleTasks([]);
    setActiveHighlight(null);

    const reduce = reducedMotionRef.current;
    const stepMs = reduce ? 40 : highlightDuration * 1000;
    const cardMs = reduce ? 40 : staggerDelay * 1000;

    REPORT_HIGHLIGHTS.forEach((h, i) => {
      const t1 = window.setTimeout(() => {
        setActiveHighlight(h.id);
      }, i * (stepMs + cardMs));
      timersRef.current.push(t1);

      const t2 = window.setTimeout(() => {
        setVisibleTasks((prev) =>
          prev.includes(h.taskId) ? prev : [...prev, h.taskId]
        );
      }, i * (stepMs + cardMs) + stepMs);
      timersRef.current.push(t2);
    });

    const doneAt =
      REPORT_HIGHLIGHTS.length * (stepMs + cardMs) + (reduce ? 80 : 200);
    const tDone = window.setTimeout(() => {
      setActiveHighlight(null);
      setPhase("done");
    }, doneAt);
    timersRef.current.push(tDone);
  }, [phase, clearTimers, highlightDuration, staggerDelay]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setActiveHighlight(null);
    setVisibleTasks([]);
  }, [clearTimers]);

  if (forceFallback) {
    if (fallbackFailed) {
      return (
        <div className={cn("glass-panel-media w-full", className)}>
          <ImagePlaceholder label="Document processor — asset coming" aspectRatio="16/10" />
        </div>
      );
    }
    return (
      <div className={cn("glass-panel-media w-full bg-black/20", className)}>
        <LightboxImage
          src={fallbackSrc}
          alt={fallbackAlt}
          className="block h-auto w-full object-contain"
          draggable={false}
          onError={() => setFallbackFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("glass-panel-media w-full bg-black/20", className)}>
      <div className="flex flex-col gap-0 lg:grid lg:grid-cols-2">
        {/* Report side */}
        <div className="border-b border-white/[0.06] p-5 md:p-7 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="site-label text-neutral-500">Inspection Report · 32 pp</span>
            <span className="site-label text-white/40">Source PDF</span>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-5">
            <p className="type-caption text-neutral-600">
              PROPERTY INSPECTION — SAMPLE RESIDENCE
              <br />
              Exterior · Electrical · HVAC · Foundation
            </p>
            <div className="h-px bg-white/[0.06]" />
            {REPORT_HIGHLIGHTS.map((h) => {
              const lit = activeHighlight === h.id || visibleTasks.includes(h.taskId);
              return (
                <motion.p
                  key={h.id}
                  layout
                  className={cn(
                    "type-caption",
                    lit
                      ? "rounded-xl bg-teal-400/15 px-2 py-1.5 text-teal-100 ring-1 ring-teal-400/30"
                      : "px-2 py-1.5 text-neutral-500"
                  )}
                  animate={
                    activeHighlight === h.id
                      ? { scale: 1.02, y: -2 }
                      : { scale: 1, y: 0 }
                  }
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                >
                  {h.text}
                </motion.p>
              );
            })}
            <p className="type-caption px-2 text-neutral-700">
              Remaining pages contain standard disclosures, glossary, and inspector
              credentials&hellip;
            </p>
          </div>
        </div>

        {/* Tasks side */}
        <div className="flex flex-col p-5 md:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="site-label text-neutral-500">Tasks Found</span>
            <span className="site-label text-neutral-600">
              {visibleTasks.length}/{DEFAULT_TASKS.length}
            </span>
          </div>

          <div className="flex min-h-[280px] flex-1 flex-col gap-2.5">
            <AnimatePresence mode="popLayout">
              {DEFAULT_TASKS.filter((t) => visibleTasks.includes(t.id)).map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 340,
                    damping: 28,
                    delay: Math.min(i * 0.02, 0.08),
                  }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3.5 md:p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "site-label rounded-full border px-2 py-0.5",
                        SEVERITY_STYLES[task.severity]
                      )}
                    >
                      {SEVERITY_LABEL[task.severity]}
                    </span>
                    <span className="site-label text-neutral-600">{task.source}</span>
                  </div>
                  <p className="site-body text-neutral-200">
                    {task.title}
                  </p>
                  <p className="type-caption mt-1 text-neutral-500">
                    {task.detail}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {phase === "idle" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-4 py-10 text-center">
                <p className="site-body max-w-[260px] text-neutral-500">
                  Watch AI lift findings out of the report and assemble them into
                  prioritized, editable tasks.
                </p>
              </div>
            )}

            {phase === "processing" && visibleTasks.length === 0 && (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-10">
                <span className="site-label animate-pulse text-teal-300/70">
                  Reading report&hellip;
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {phase !== "processing" ? (
              <button
                type="button"
                onClick={phase === "done" ? reset : runDemo}
                className="site-label rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-2 text-teal-200 transition-colors hover:bg-teal-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300/60"
              >
                {phase === "done" ? "Run again" : "Process report"}
              </button>
            ) : (
              <span className="site-label px-2 py-2 text-neutral-600">Processing&hellip;</span>
            )}
            {phase === "idle" && (
              <button
                type="button"
                onClick={() => {
                  setVisibleTasks(DEFAULT_TASKS.map((t) => t.id));
                  setPhase("done");
                }}
                className="site-label rounded-full border border-white/10 px-4 py-2 text-neutral-400 transition-colors hover:border-white/20 hover:text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400/50"
              >
                Skip to result
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
