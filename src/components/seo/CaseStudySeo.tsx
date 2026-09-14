import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, caseStudyByPath, webPageJsonLd } from "@/lib/seo";

export function CaseStudySeo({ path }: { path: string }) {
  const page = caseStudyByPath(path);
  return (
    <>
      <JsonLd data={webPageJsonLd(page)} />
      <JsonLd data={articleJsonLd(page)} />
    </>
  );
}
