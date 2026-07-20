"use client";

import {
  useEffect,
  useRef,
  useState,
  type Ref,
  type VideoHTMLAttributes,
} from "react";

type DeferredVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "src" | "preload" | "autoPlay"
> & {
  src: string;
  /** How far outside the viewport to start loading (px or CSS margin). */
  rootMargin?: string;
  ref?: Ref<HTMLVideoElement>;
};

function assignRef(ref: Ref<HTMLVideoElement> | undefined, node: HTMLVideoElement | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
  } else {
    ref.current = node;
  }
}

/**
 * Poster-first video: keeps `preload="none"` until near the viewport, then
 * sets `src` and plays. Pauses when scrolled away to save decode/bandwidth.
 */
export function DeferredVideo({
  src,
  rootMargin = "200px 0px",
  poster,
  ref,
  ...rest
}: DeferredVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { root: null, rootMargin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (active) {
      if (el.dataset.loadedSrc !== src) {
        el.src = src;
        el.dataset.loadedSrc = src;
      }
      void el.play().catch(() => {
        /* autoplay may be blocked; muted + playsInline usually ok */
      });
    } else {
      el.pause();
    }
  }, [active, src]);

  return (
    <video
      {...rest}
      ref={(node) => {
        videoRef.current = node;
        assignRef(ref, node);
      }}
      poster={poster}
      preload="none"
      playsInline
    />
  );
}
