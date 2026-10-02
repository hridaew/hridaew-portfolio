import type { Metadata } from "next";
import { OneSplatPage } from "@/components/lab/one-splat/OneSplatPage";

export const metadata: Metadata = {
  title: "One Splat, three cards (lab) - Hridae Walia",
  description: "A home-page experiment: the work as real 3D gaussian splats, with the home page's three cards per project.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OneSplatPage variant="three" />;
}
