import type { Metadata } from "next";
import { CaseStudySeo } from "@/components/seo/CaseStudySeo";
import { caseStudyByPath, pageMetadata } from "@/lib/seo";

const page = caseStudyByPath("/memory-care");

export const metadata: Metadata = pageMetadata(page);

export default function MemoryCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CaseStudySeo path="/memory-care" />
      {children}
    </>
  );
}
