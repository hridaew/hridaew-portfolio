import type { Metadata } from "next";
import { CaseStudySeo } from "@/components/seo/CaseStudySeo";
import { caseStudyByPath, pageMetadata } from "@/lib/seo";

const page = caseStudyByPath("/obscura");

export const metadata: Metadata = pageMetadata(page);

export default function ObscuraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CaseStudySeo path="/obscura" />
      {children}
    </>
  );
}
