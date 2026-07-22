import type { Metadata } from "next";
import { SavorWafflingBody } from "@/components/savor/SavorWafflingBody";
import { WafflingEntrance } from "@/components/shared/WafflingEntrance";
import { PostPill } from "@/components/shared/PostPill";

export const metadata: Metadata = {
  title: "Savor: Video to 3D model tool · Hridae Walia",
  description:
    "Savor turns a phone video of an object into a photoreal 3D Gaussian splat, cleaned and explorable, running locally on your Mac.",
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
