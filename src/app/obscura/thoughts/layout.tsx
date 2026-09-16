import type { Metadata, Viewport } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const page = OTHER_PAGES.find((p) => p.path === "/obscura/thoughts")!;

export const metadata: Metadata = pageMetadata(page);

// Without this a phone paints its own chrome — the notch strip and the bar
// under the home indicator — from the site's light default, which reads as
// white bands above and below a black page.
export const viewport: Viewport = {
  themeColor: "#000000",
};

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
