import type { Metadata } from "next";
import { OrcaWafflingBody } from "@/components/orca/OrcaWafflingBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";
import { ORCA_OPENING, ORCA_TITLE } from "@/data/waffling-article-copy";

/** Meta stays on the first paragraph, not the full overflow card preview. */
const orcaDescription = ORCA_OPENING;
const orcaUrl = "https://hridaew.com/waffling/orca";
const orcaOgImage = {
  url: "/assets/orca/og.jpg",
  width: 1200,
  height: 630,
  alt: "Finished Saving Baby J booth with projected game and plush return",
};

export const metadata: Metadata = {
  title: ORCA_TITLE,
  description: orcaDescription,
  openGraph: {
    title: ORCA_TITLE,
    description: orcaDescription,
    url: orcaUrl,
    type: "article",
    images: [orcaOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: ORCA_TITLE,
    description: orcaDescription,
    images: [orcaOgImage.url],
  },
};

export default function OrcaWafflingPage() {
  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-paper text-ink">
      <WafflingEntrance>
        <OrcaWafflingBody />
      </WafflingEntrance>
      <PostPill title={ORCA_TITLE} />
    </main>
  );
}
