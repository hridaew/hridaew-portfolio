import type { Metadata } from "next";
import { SavorWafflingBody } from "@/components/savor/SavorWafflingBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, webPageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";
import { SAVOR_OPENING, SAVOR_TITLE } from "@/data/waffling-article-copy";

const savorPage = OTHER_PAGES.find((p) => p.path === "/waffling/savor")!;

/** Meta stays on the first paragraph, not the full overflow card preview. */
const savorDescription = SAVOR_OPENING;
const savorUrl = "https://hridaew.com/waffling/savor";
const savorOgImage = {
  url: "/assets/savor/og.jpg",
  width: 1200,
  height: 630,
  alt: "Savor — turn a phone video into a photoreal 3D Gaussian splat",
};

export const metadata: Metadata = {
  title: SAVOR_TITLE,
  description: savorDescription,
  openGraph: {
    title: SAVOR_TITLE,
    description: savorDescription,
    url: savorUrl,
    type: "article",
    images: [savorOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SAVOR_TITLE,
    description: savorDescription,
    images: [savorOgImage.url],
  },
};

export default function SavorWafflingPage() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-paper text-ink">
      <JsonLd data={webPageJsonLd(savorPage)} />
      <JsonLd data={articleJsonLd(savorPage)} />
      <WafflingEntrance>
        <SavorWafflingBody />
      </WafflingEntrance>
      <PostPill title={SAVOR_TITLE} />
    </main>
  );
}
