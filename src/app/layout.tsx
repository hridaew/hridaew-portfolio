import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PageTransitionProvider } from "@/components/PageTransition";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSerif.variable} ${dmSans.variable} antialiased`}
      >
        <SmoothScroll />
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
        <Toaster position="bottom-center" />
        <Analytics />
      </body>
    </html>
  );
}
