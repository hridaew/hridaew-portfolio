import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const page = OTHER_PAGES.find((p) => p.path === "/obscura/thoughts")!;

export const metadata: Metadata = pageMetadata(page);

export default function ObscuraThoughtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webPageJsonLd(page)} />
      {children}
    </>
  );
}
