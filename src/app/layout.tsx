import type { Metadata } from "next";
import { Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import { GeistSerifRegular } from "geist/font/serif/regular";
import "./globals.css";
import { PageTransitionProvider } from "@/components/PageTransition";
import { SheetNavProvider } from "@/components/sheet/SheetNav";
import { AchievementProvider } from "@/components/achievements/AchievementProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { BrowserEngineScript } from "@/components/BrowserEngineScript";
import { JsonLd } from "@/components/seo/JsonLd";
import { rootGraphJsonLd } from "@/lib/seo";
import { PERSON, SITE_ORIGIN } from "@/lib/site-identity";

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

// Handwriting on the Visitor Board's post-its. Loaded when a note is drawn, not preloaded with the page.
const marker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: `${PERSON.name} - ${PERSON.jobTitle}`,
  description: PERSON.description,
  metadataBase: new URL(SITE_ORIGIN),
  authors: [{ name: PERSON.name, url: SITE_ORIGIN }],
  creator: PERSON.name,
  alternates: { canonical: SITE_ORIGIN },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${PERSON.name} - ${PERSON.jobTitle}`,
    description: PERSON.shortDescription,
    url: SITE_ORIGIN,
    siteName: `${PERSON.name} Portfolio`,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/social-open-graph.png",
        alt: `${PERSON.name} — ${PERSON.jobTitle}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PERSON.name} - ${PERSON.jobTitle}`,
    description: PERSON.shortDescription,
    images: ["/social-open-graph.png"],
  },
};

export default function RootLayout({
  children,
  sheet,
}: Readonly<{
  children: React.ReactNode;
  sheet: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <BrowserEngineScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${GeistSerifRegular.variable} ${marker.variable} type-body antialiased`}
      >
        <JsonLd data={rootGraphJsonLd()} />
        <AchievementProvider>
          <SheetNavProvider>
            <PageTransitionProvider>
              {children}
              {sheet}
            </PageTransitionProvider>
          </SheetNavProvider>
        </AchievementProvider>
        <Toaster position="bottom-center" />
        <Analytics />
      </body>
    </html>
  );
}
