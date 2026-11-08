import type { Metadata } from "next";
import localFont from "next/font/local";
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

// Every font is bundled, nothing is fetched from Google at build time (its font URLs broke the production build).
// Geist and Geist Mono come from the `geist` package as one variable file each, covering every weight in use.
const geistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

// Handwriting on the Visitor Board's post-its (Permanent Marker, OFL, via Fontsource). Loaded when a note is
// drawn, not preloaded with the page.
const marker = localFont({
  src: "../../node_modules/@fontsource/permanent-marker/files/permanent-marker-latin-400-normal.woff2",
  variable: "--font-marker",
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
