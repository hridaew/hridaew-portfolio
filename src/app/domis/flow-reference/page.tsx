"use client";

import { useEffect } from "react";
import { DomisFlowReference } from "@/components/domis/flow-reference/DomisFlowReference";

/**
 * Full-page Domis flow reference (Owner + Backend/AI lanes).
 * Open /domis/flow-reference — not linked from the case study nav.
 */
export default function DomisFlowReferencePage() {
  useEffect(() => {
    // Light reference board — do not inherit case-study dark chrome.
    document.documentElement.classList.remove("dark");
    return () => {
      document.documentElement.classList.add("dark");
    };
  }, []);

  return <DomisFlowReference />;
}
