import { Inter, Outfit } from "next/font/google";
import type { ReactNode } from "react";
import "material-symbols/rounded.css";

/**
 * Self-hosted via next/font (no fonts.googleapis.com).
 * Material Symbols Rounded ships with the `material-symbols` package.
 * CSS variables are consumed by domis-live*.css --*-font tokens.
 */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-domis-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["700"],
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
