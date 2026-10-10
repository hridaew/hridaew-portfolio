import type { Metadata } from "next";
import { EsperRoom } from "@/components/lab/esper/EsperRoom";

export const metadata: Metadata = {
  title: "Hridae Walia",
  description: "Interaction, product and experience design — Domis, Virdio, OBSCURA, Memory Care.",
  robots: { index: false, follow: false },
};

export default function EsperPage() {
  return <EsperRoom />;
}
