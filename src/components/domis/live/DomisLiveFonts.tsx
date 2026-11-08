import localFont from "next/font/local";
import type { ReactNode } from "react";
import "material-symbols/rounded.css";

/**
 * Bundled via next/font/local from Fontsource (OFL); nothing is fetched at build time.
 * Material Symbols Rounded ships with the `material-symbols` package.
 * CSS variables are consumed by domis-live*.css --*-font tokens.
 */
const outfit = localFont({
  src: "../../../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-domis-outfit",
});

const inter = localFont({
  src: "../../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-domis-inter",
});

/** Apply on any ancestor of `.domis-live` so font CSS variables resolve. */
export const domisLiveFontVariables = `${outfit.variable} ${inter.variable}`;

export type DomisLiveFontsProps = {
  children: ReactNode;
  className?: string;
};

/** Scopes Outfit + Inter CSS variables for Domis live demos (offline-safe). */
export function DomisLiveFonts({ children, className }: DomisLiveFontsProps) {
  return (
    <div
      className={[domisLiveFontVariables, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
