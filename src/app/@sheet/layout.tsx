"use client";

import { CaseStudySheet } from "@/components/sheet/CaseStudySheet";

export default function SheetSlotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sheet open state is owned by SheetNav (optimistic). Do not remount on
  // segment changes — that would restart the slide mid-open.
  return <CaseStudySheet>{children}</CaseStudySheet>;
}
