"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Check,
  Loader2,
  Sparkles,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "scanning" | "extracting" | "complete";

interface ExtractedField {
  label: string;
  value: string;
  source: string;
  page: number;
  highlight: string;
}

const FIELDS: ExtractedField[] = [
  {
    label: "Manufacturer",
    value: "Bosch",
    source: "User Manual — Bosch SHPM78W55N",
    page: 1,
    highlight: "Bosch",
  },
  {
    label: "Model Number",
    value: "SHPM78W55N",
    source: "User Manual — Specs Plate",
    page: 1,
    highlight: "SHPM78W55N",
  },
  {
    label: "Serial Number",
    value: "FD 8801 234 567",
    source: "User Manual — Specs Plate",
    page: 1,
    highlight: "FD 8801 234 567",
  },
  {
    label: "Warranty Period",
    value: "1 Year Limited",
    source: "Warranty Certificate — Coverage Terms",
    page: 2,
    highlight: "1 Year Limited",
  },
  {
    label: "Purchase Date",
    value: "March 15, 2024",
    source: "Purchase Receipt — Order #48291",
    page: 1,
    highlight: "March 15, 2024",
  },
  {
    label: "Retailer",
    value: "Home Depot",
    source: "Purchase Receipt — Store Info",
    page: 1,
    highlight: "Home Depot",
  },
];

const DOC_PAGES = [
  {
    title: "User Manual",
    lines: [
      "Bosch SHPM78W55N",
      "Dishwasher — Installation Guide",
      "",
      "Model: SHPM78W55N",
      "Serial: FD 8801 234 567",
      "Voltage: 120V / 60Hz",
      "",
      "Important Safety Instructions",
      "Read all instructions before use.",
    ],
  },
  {
    title: "Warranty",
    lines: [
      "Limited Warranty Certificate",
      "",
      "Coverage: 1 Year Limited",
      "Parts & Labor included",
      "",
      "Valid from date of purchase",
      "Non-transferable",
    ],
  },
  {
    title: "Receipt",
    lines: [
      "Home Depot — Order #48291",
      "",
      "Bosch Dishwasher SHPM78W55N",
      "Qty: 1    $849.00",
      "",
      "Purchase Date: March 15, 2024",
      "Store #4521 — Austin, TX",
      "Payment: Visa ****4821",
    ],
  },
];

const spring = { type: "spring" as const, stiffness: 300, damping: 28 };

export function DocumentProcessorDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleFields, setVisibleFields] = useState(0);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const [docPage, setDocPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startProcessing = useCallback(() => {
    if (phase !== "idle") return;
    clearTimers();
    setPhase("scanning");
    setVisibleFields(0);
    setActiveCitation(null);
    setDocPage(0);

    timers.current.push(
      setTimeout(() => {
        setPhase("extracting");
        FIELDS.forEach((_, i) => {
          timers.current.push(
            setTimeout(() => {
              setVisibleFields(i + 1);
              if (i === 3) setDocPage(1);
              if (i === 4) setDocPage(2);
              if (i === FIELDS.length - 1) {
                timers.current.push(
                  setTimeout(() => setPhase("complete"), 400)
                );
              }
            }, (i + 1) * 450)
          );
        });
      }, 1800)
    );
  }, [phase, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setVisibleFields(0);
    setActiveCitation(null);
    setDocPage(0);
    setCopied(false);
  }, [clearTimers]);

  const handleCitationClick = (index: number) => {
    setActiveCitation(activeCitation === index ? null : index);
    if (index >= 4) setDocPage(2);
    else if (index >= 3) setDocPage(1);
    else setDocPage(0);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="grid lg:grid-cols-2">
          <div className="relative border-b border-black/[0.06] bg-[#f7f5f2] p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#71717a]" />
                <span className="domis-demo-label">
                  {DOC_PAGES[docPage].title}
                </span>
              </div>
              <div className="flex gap-1">
                {DOC_PAGES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDocPage(i)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors",
                      docPage === i ? "bg-[#18181b]" : "bg-[#d4d4d8]"
                    )}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={docPage}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  {DOC_PAGES[docPage].lines.map((line, i) => {
                    const isHighlighted =
                      activeCitation !== null &&
                      line.includes(FIELDS[activeCitation].highlight);
                    return (
                      <p
                        key={i}
                        className={cn(
                          "domis-demo-doc transition-all duration-300",
                          line === ""
                            ? "h-3"
                            : isHighlighted
                              ? "rounded bg-[#ffa1a8]/25 px-1 font-semibold text-[#18181b]"
                              : i === 0
                                ? "font-semibold text-[#18181b]"
                                : "text-[#52525b]"
                        )}
                      >
                        {line || "\u00A0"}
                      </p>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {phase === "scanning" && (
                <motion.div
                  className="pointer-events-none absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffa1a8] to-transparent"
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{
                    duration: 1.6,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
              )}
            </div>

            {phase === "idle" && (
              <motion.button
                type="button"
                onClick={startProcessing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18181b] px-4 py-3 domis-demo-btn text-white transition-opacity hover:opacity-90"
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="h-4 w-4" />
                Process Documents
              </motion.button>
            )}

            {phase === "scanning" && (
              <div className="mt-4 flex items-center justify-center gap-2 py-3 domis-demo-hint text-[#71717a]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning documents…
              </div>
            )}

            {(phase === "extracting" || phase === "complete") && (
              <button
                type="button"
                onClick={reset}
                className="mt-4 w-full py-2 text-center domis-demo-meta transition-colors hover:text-[#52525b]"
              >
                Reset demo
              </button>
            )}
          </div>

          <div className="bg-white p-5 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="domis-demo-label">
                Extracted Data
              </span>
              {phase === "complete" && (
                <motion.button
                  type="button"
                  onClick={handleCopy}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#f4f4f5] px-2.5 py-1 domis-demo-meta text-[#3f3f46] transition-colors hover:bg-[#e4e4e7]"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy all"}
                </motion.button>
              )}
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {FIELDS.slice(0, visibleFields).map((field, i) => (
                  <motion.button
                    key={field.label}
                    type="button"
                    onClick={() => handleCitationClick(i)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.05 }}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
                      activeCitation === i
                        ? "border-[#ffa1a8]/50 bg-[#fff5f6]"
                        : "border-black/[0.06] bg-[#fafafa] hover:border-black/[0.1] hover:bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        activeCitation === i
                          ? "bg-[#ffa1a8]/30"
                          : "bg-emerald-500/15"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3",
                          activeCitation === i
                            ? "text-[#be123c]"
                            : "text-emerald-600"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="domis-demo-field-label">
                          {field.label}
                        </span>
                        <ExternalLink
                          className={cn(
                            "h-3 w-3 shrink-0 transition-opacity",
                            activeCitation === i
                              ? "opacity-100 text-[#be123c]"
                              : "opacity-0 text-[#a1a1aa] group-hover:opacity-60"
                          )}
                        />
                      </div>
                      <p className="mt-0.5 domis-demo-field-value">
                        {field.value}
                      </p>
                      <AnimatePresence>
                        {activeCitation === i && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1.5 overflow-hidden domis-demo-source"
                          >
                            Source: {field.source} · p.{field.page}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>

              {phase === "idle" && (
                <div className="flex h-[280px] items-center justify-center">
                  <p className="domis-demo-hint">
                    Extracted fields appear here
                  </p>
                </div>
              )}

              {phase === "scanning" && (
                <div className="flex h-[280px] flex-col items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-[#a1a1aa]" />
                  <p className="domis-demo-hint">
                    Reading document contents…
                  </p>
                </div>
              )}
            </div>

            {phase === "complete" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-center domis-demo-meta"
              >
                Click any field to trace it back to the source document
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
