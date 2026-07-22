import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageTransitionProvider } from "@/components/PageTransition";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { BrowserEngineScript } from "@/components/BrowserEngineScript";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // 700 unused on mono in practice; extrabold covers emphasis.
  weight: ["400", "500", "800"],
  display: "swap",
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
    images: [
      {
        url: "/social-open-graph.png",
        alt: "Hridae Walia — Product Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hridae Walia - Product Designer",
    description:
      "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale.",
    images: ["/social-open-graph.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <BrowserEngineScript />
      </head>
      <body
        className={`${displayFont.variable} ${geistSans.variable} ${geistMono.variable} type-body antialiased`}
      >
        {/* SVG defs for `html.theme-2004` home CRT (`filter: url(#…)` in globals.css). */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={0}
          height={0}
          aria-hidden
          style={{ position: "absolute", overflow: "hidden", clipPath: "inset(50%)" }}
        >
          <defs>
            <filter
              id="cheat-crt-2004"
              x="-12%"
              y="-12%"
              width="124%"
              height="124%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.004 0.01"
                numOctaves={2}
                stitchTiles="stitch"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={5}
                xChannelSelector="R"
                yChannelSelector="G"
                result="disp"
              />
              <feGaussianBlur in="disp" stdDeviation={0.15} result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1.06 0 0 0 0  0 1.04 0 0 0  0 0 1.1 0 0  0 0 0 1 0"
              />
            </filter>
            <filter
              id="cheat-crt-2004-soft"
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation={0.12} result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="1.03 0 0 0 0  0 1.02 0 0 0  0 0 1.05 0 0  0 0 0 1 0"
              />
            </filter>
          </defs>
        </svg>
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
        <Toaster position="bottom-center" />
        <Analytics />
      </body>
    </html>
  );
}
