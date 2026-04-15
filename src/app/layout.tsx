import type { Metadata } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageTransitionProvider } from "@/components/PageTransition";
import { ButterChickenRecipeDeepLink } from "@/components/butter-chicken/ButterChickenRecipeDeepLink";
import { ButterChickenRecipeModalProvider } from "@/components/butter-chicken/ButterChickenRecipeModal";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hridae Walia - Product Designer",
  description:
    "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale. Expert in designing and prototyping high-craft experiences across mobile, web, tangible, and AR/VR platforms.",
  metadataBase: new URL("https://hridaew.com"),
  openGraph: {
    title: "Hridae Walia - Product Designer",
    description:
      "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale.",
    url: "https://hridaew.com",
    siteName: "Hridae Walia Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hridae Walia - Product Designer",
    description:
      "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${geistSans.variable} ${geistMono.variable} type-body antialiased`}
      >
        <ButterChickenRecipeModalProvider>
          <PageTransitionProvider>
            {children}
          </PageTransitionProvider>
          <Suspense fallback={null}>
            <ButterChickenRecipeDeepLink />
          </Suspense>
        </ButterChickenRecipeModalProvider>
        <Toaster position="bottom-center" />
        <Analytics />
      </body>
    </html>
  );
}
