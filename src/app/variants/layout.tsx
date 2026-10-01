import type { Metadata } from "next";
import { VariantSwitcher } from "@/components/variants/shared/VariantSwitcher";
import "@/components/variants/shared/variants.css";

export const metadata: Metadata = {
  title: "Home variants — Hridae Walia",
  description: "Five explorations of the hridaew.com home page.",
  // Explorations only: keep them out of search and away from the canonical home.
  robots: { index: false, follow: false },
};

export default function VariantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <VariantSwitcher />
    </>
  );
}
