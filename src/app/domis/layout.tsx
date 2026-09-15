import type { Metadata } from "next";
import { CaseStudySeo } from "@/components/seo/CaseStudySeo";
import { caseStudyByPath, pageMetadata } from "@/lib/seo";

const page = caseStudyByPath("/domis");

export const metadata: Metadata = pageMetadata(page);

export default function DomisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CaseStudySeo path="/domis" />
      {children}
    </>
  );
}
