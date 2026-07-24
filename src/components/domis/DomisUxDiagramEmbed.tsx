"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./domis-ux-diagrams.css";

type DomisUxDiagramEmbedProps = {
  /** Path under /public, e.g. `/assets/domis/diagrams/address-user-flow.svg` */
  src?: string | null;
  alt: string;
  /** Small uppercase eyebrow above the asset (omit if baked into the export). */
  type?: string;
  /** Board title (omit if baked into the export). */
  heading?: string;
  wide?: boolean;
  caption?: ReactNode;
  /** Horizontal scroll + edge fades for wide canvases. */
  scrollable?: boolean;
  /**
   * Shown until an authored asset is provided (or if the image fails to load).
   * Use the existing React diagram components as temporary stand-ins.
   */
  fallback?: ReactNode;
  className?: string;
};

/**
 * Embed a designer-authored UX diagram (SVG or PNG) in the Domis case-study
 * figure chrome. Prefer exporting from FigJam / Figma / Illustrator into
 * `public/assets/domis/diagrams/` — see that folder's README.
 */
export function DomisUxDiagramEmbed({
  src,
  alt,
  type,
  heading,
  wide = false,
  caption,
  scrollable = false,
  fallback = null,
  className,
}: DomisUxDiagramEmbedProps) {
  const [failed, setFailed] = useState(false);
  const showAsset = Boolean(src) && !failed;

  if (!showAsset) {
    if (!fallback) return null;
    return (
      <figure
        className={cn(
          "dcs-ux-figure",
          wide && "dcs-ux-figure-wide",
          className,
        )}
      >
        {fallback}
        {caption ? (
          <figcaption className="dcs-caption site-body">{caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure
      className={cn("dcs-ux-figure", wide && "dcs-ux-figure-wide", className)}
    >
      <div className="dud dud-board dux-embed" role="img" aria-label={alt}>
        {type ? <p className="dud-type">{type}</p> : null}
        {heading ? <p className="dud-heading">{heading}</p> : null}

        <div
          className={cn("dux-embed-frame", scrollable && "duf-scroll")}
        >
          {/* SVG/PNG authored assets — plain img matches other Domis media */}
          <img
            className="dux-embed-img"
            src={src!}
            alt=""
            draggable={false}
            onError={() => setFailed(true)}
          />
        </div>
      </div>
      {caption ? (
        <figcaption className="dcs-caption site-body">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
