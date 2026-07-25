import type { Metadata } from "next";
import { SavorWafflingBody } from "@/components/savor/SavorWafflingBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";
import { SAVOR_OPENING, SAVOR_TITLE } from "@/data/waffling-article-copy";

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
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#0c0c0e] text-white">
      <WafflingEntrance>
        <SavorWafflingBody />
      </WafflingEntrance>
      <PostPill title={SAVOR_TITLE} />
    </main>
  );
}
