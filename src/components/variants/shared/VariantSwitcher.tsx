"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HOME_VARIANTS } from "./variants";

/**
 * Review chrome for /variants — hop between explorations without hunting for
 * URLs. Dark glass so it reads on paper, coral, black, and the green mat.
 */
export function VariantSwitcher() {
  const pathname = usePathname();
  const idx = HOME_VARIANTS.findIndex((v) => pathname?.startsWith(v.href));
  if (idx === -1) return null;

  const current = HOME_VARIANTS[idx];
  const prev = HOME_VARIANTS[(idx - 1 + HOME_VARIANTS.length) % HOME_VARIANTS.length];
  const next = HOME_VARIANTS[(idx + 1) % HOME_VARIANTS.length];

  return (
    <nav aria-label="Home variants" className="v-switcher">
      <Link href="/variants" className="v-switcher__index" aria-label="All variants">
        <span className="v-mono">Variants</span>
      </Link>
      <span className="v-switcher__rule" aria-hidden />
      <Link href={prev.href} className="v-switcher__step" aria-label={`Previous: ${prev.name}`}>
        <ArrowLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Link>
      <ol className="v-switcher__dots">
        {HOME_VARIANTS.map((v) => (
          <li key={v.slug}>
            <Link
              href={v.href}
              aria-current={v.slug === current.slug ? "page" : undefined}
              className="v-switcher__dot"
            >
              <span className="v-mono">{v.n}</span>
              <span className="v-switcher__name v-mono">{v.name}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href={next.href} className="v-switcher__step" aria-label={`Next: ${next.name}`}>
        <ArrowRight className="size-3.5" strokeWidth={2.25} aria-hidden />
      </Link>
    </nav>
  );
}
