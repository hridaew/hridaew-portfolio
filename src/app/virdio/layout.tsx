import type { Metadata } from "next";
import { CaseStudySeo } from "@/components/seo/CaseStudySeo";
import { caseStudyByPath, pageMetadata } from "@/lib/seo";

const page = caseStudyByPath("/virdio");

export const metadata: Metadata = pageMetadata(page);

export default function VirdioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CaseStudySeo path="/virdio" />
      {children}
    </>
  );
}
