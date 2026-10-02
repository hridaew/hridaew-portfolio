import type { Metadata } from "next";
import { OneSplatPage } from "@/components/lab/one-splat/OneSplatPage";

export const metadata: Metadata = {
  title: "One Splat (lab) - Hridae Walia",
  description: "A home-page experiment: the work as real 3D gaussian splats.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OneSplatPage />;
}
