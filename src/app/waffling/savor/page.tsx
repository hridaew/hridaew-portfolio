import type { Metadata } from "next";
import { SavorWafflingBody } from "@/components/savor/SavorWafflingBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";

const savorTitle = "Savor: Video to 3D model tool";
const savorDescription =
  "Savor turns a phone video of an object into a photoreal 3D Gaussian splat, cleaned and explorable, running locally on your Mac.";
const savorUrl = "https://hridaew.com/waffling/savor";
const savorOgImage = {
  url: "/assets/savor/og.jpg",
  width: 1200,
  height: 630,
  alt: "Savor — turn a phone video into a photoreal 3D Gaussian splat",
};

export const metadata: Metadata = {
  title: savorTitle,
  description: savorDescription,
  openGraph: {
    title: savorTitle,
    description: savorDescription,
    url: savorUrl,
    type: "article",
    images: [savorOgImage],
  },
  twitter: {
    card: "summary_large_image",
    title: savorTitle,
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
      <PostPill title="Savor" />
    </main>
  );
}
