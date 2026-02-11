import Image from "next/image";
import { motion } from "framer-motion";
import { type HeroBlock as HeroBlockType } from "@/types/content-blocks";
import { EditorialLayout } from "../EditorialLayout";

export function HeroBlock({ block, layoutId }: { block: HeroBlockType; layoutId?: string }) {
  const { metadata } = block;

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Hero image */}
      <EditorialLayout width="breakout">
        <motion.div
          layoutId={layoutId}
          className="relative aspect-[16/9] rounded-[16px] md:rounded-[24px] overflow-hidden shadow-lg"
        >
          <Image
            alt={block.title}
            className="object-cover"
            src={block.image}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 920px"
          />
        </motion.div>
      </EditorialLayout>

      {/* Title + subtitle */}
      <EditorialLayout width="text">
        <div className="space-y-4">
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-[48px] md:text-[64px] lg:text-[72px] leading-[1.05] text-[var(--text-primary)] tracking-tight">
            {block.title}
          </h1>
          <p className="font-[family-name:var(--font-dm-sans)] text-[20px] md:text-[24px] text-[var(--text-muted)] leading-relaxed">
            {block.subtitle}
          </p>
          {block.description && (
            <p className="font-[family-name:var(--font-dm-sans)] text-[17px] md:text-[19px] text-[var(--text-muted)] leading-[1.6]">
              {block.description}
            </p>
          )}
        </div>
      </EditorialLayout>

      {/* Metadata pills */}
      <EditorialLayout width="text">
        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2 pb-4 border-t border-b border-[var(--border-card)]">
          <MetaPill label="Role" value={metadata.role} />
          <MetaPill label="Timeline" value={metadata.timeline} />
          {metadata.team && <MetaPill label="Team" value={metadata.team} />}
          {metadata.location && <MetaPill label="Location" value={metadata.location} />}
          {metadata.platforms && <MetaPill label="Platforms" value={metadata.platforms} />}
        </div>
      </EditorialLayout>

      {/* Recognition badge */}
      {block.recognition && (
        <EditorialLayout width="text">
          <div className="flex items-center gap-3 px-5 py-3 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-card)]">
            <span className="text-lg">&#9733;</span>
            <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[var(--text-secondary)] font-medium">
              {block.recognition}
            </p>
          </div>
        </EditorialLayout>
      )}
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-[family-name:var(--font-dm-sans)] font-semibold text-[11px] text-[var(--text-subtle)] uppercase tracking-[0.12em]">
        {label}
      </p>
      <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[var(--text-secondary)] leading-snug">
        {value}
      </p>
    </div>
  );
}
