import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HOME_VARIANTS } from "@/components/variants/shared/variants";
import "@/components/variants/index/variants-index.css";

export default function VariantsIndex() {
  return (
    <main className="vx">
      <header className="vx-head">
        <p className="v-mono vx-kicker">hridaew.com / home page explorations</p>
        <h1 className="v-display vx-title">Home, five ways</h1>
        <p className="vx-lede v-sans">
          Same person, same work, five different front doors. Each one borrows its
          interaction model from a project it introduces. Use the switcher at the
          bottom of any variant to hop between them.
        </p>
        <Link href="/" className="vx-live v-mono">
          Current home
          <ArrowUpRight className="size-3.5" strokeWidth={2.25} aria-hidden />
        </Link>
      </header>

      <ol className="vx-list">
        {HOME_VARIANTS.map((v) => (
          <li key={v.slug}>
            <Link href={v.href} className="vx-card">
              <span className="vx-thumb" data-tone={v.tone}>
                <Image
                  src={`/assets/variants/${v.slug}.webp`}
                  alt={`${v.name} home variant preview`}
                  fill
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover object-top"
                  priority={v.n <= 2}
                />
              </span>
              <span className="vx-meta">
                <span className="v-mono vx-num">0{v.n}</span>
                <span className="v-display vx-name">{v.name}</span>
                <span className="vx-pitch v-sans">{v.pitch}</span>
                <span className="v-mono vx-borrowed">Borrowed from: {v.borrowedFrom}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
