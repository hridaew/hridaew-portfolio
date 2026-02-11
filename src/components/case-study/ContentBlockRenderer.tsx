import { type ContentBlock } from "@/types/content-blocks";
import { Reveal } from "@/components/Reveal";
import { HeroBlock } from "./blocks/HeroBlock";
import { SectionBlock } from "./blocks/SectionBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { TestimonialBlock } from "./blocks/TestimonialBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { ReflectionBlock } from "./blocks/ReflectionBlock";

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
  scroller?: string | Element | null;
  layoutId?: string;
}

export function ContentBlockRenderer({ blocks, scroller, layoutId }: ContentBlockRendererProps) {
  return (
    <div className="space-y-8 md:space-y-12">
      {blocks.map((block, index) => (
        <ContentBlockItem key={block.id} block={block} index={index} scroller={scroller} layoutId={layoutId} />
      ))}
    </div>
  );
}

function ContentBlockItem({ block, index, scroller, layoutId }: { block: ContentBlock; index: number; scroller?: string | Element | null; layoutId?: string }) {
  // Hero doesn't need Reveal - it's the first thing visible
  if (block.type === "hero") {
    return <HeroBlock block={block} layoutId={layoutId} />;
  }

  // Sections get extra top spacing for visual separation
  if (block.type === "section") {
    return (
      <div className="pt-8 md:pt-12">
        <Reveal delay={index < 5 ? index * 0.03 : 0} scroller={scroller}>
          <SectionBlock block={block} />
        </Reveal>
      </div>
    );
  }

  // Stats and reflections get extra top spacing
  if (block.type === "stats" || block.type === "reflection") {
    return (
      <div className="pt-4 md:pt-8">
        <Reveal delay={index < 5 ? index * 0.03 : 0} scroller={scroller}>
          {block.type === "stats" ? <StatsBlock block={block} /> : <ReflectionBlock block={block} />}
        </Reveal>
      </div>
    );
  }

  const delay = index < 5 ? index * 0.03 : 0;

  return (
    <Reveal delay={delay} scroller={scroller}>
      {renderBlock(block)}
    </Reveal>
  );
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "video":
      return <VideoBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "testimonial":
      return <TestimonialBlock block={block} />;
    case "callout":
      return <CalloutBlock block={block} />;
    default:
      return null;
  }
}
