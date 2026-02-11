"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const WAYNE_IMAGES = [
  "/assets/obscura/wayne_archive_0dsc06003awaynemarketplace.jpg",
  "/assets/obscura/wayne_archive_dsc05112awaynewong.jpg",
  "/assets/obscura/wayne_archive_dsc05127asoldierportrait.jpg",
  "/assets/obscura/wayne_archive_dsc05130a.jpg",
  "/assets/obscura/wayne_archive_dsc05132a.jpg",
  "/assets/obscura/wayne_archive_dsc05135a.jpg",
  "/assets/obscura/wayne_archive_dsc05138a.jpg",
  "/assets/obscura/wayne_archive_dsc05155a.jpg",
  "/assets/obscura/wayne_archive_dsc05166awaynebayonete.jpg",
  "/assets/obscura/wayne_archive_dsc05218ac_waynewong.jpg",
  "/assets/obscura/wayne_archive_dsc05232awayne2soldiers.jpg",
  "/assets/obscura/wayne_archive_dsc05265acjapanesefamily.jpg",
  "/assets/obscura/wayne_archive_dsc05267awaynejapanesemotherdaughter.jpg",
  "/assets/obscura/wayne_1946.avif",
  "/assets/obscura/wayne_2019.avif",
];

interface WayneCarouselProps {
  className?: string;
}

export function WayneCarousel({ className }: WayneCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Duplicate images for seamless loop
    const totalWidth = track.scrollWidth / 2;

    tweenRef.current = gsap.to(track, {
      x: -totalWidth,
      duration: 60,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          return parseFloat(x as unknown as string) % totalWidth;
        }),
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  const handleMouseEnter = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 0, duration: 0.6, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.6, ease: "power2.in" });
    }
  };

  // Double the images array for seamless looping
  const doubledImages = [...WAYNE_IMAGES, ...WAYNE_IMAGES];

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div ref={trackRef} className="flex gap-3 will-change-transform">
          {doubledImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="flex-shrink-0"
              style={{ opacity: 0.7 + Math.sin(i * 0.4) * 0.3 }}
            >
              <img
                src={src}
                alt={`Wayne Wong archive photograph ${(i % WAYNE_IMAGES.length) + 1}`}
                className="h-[180px] w-[240px] rounded-lg object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
      <p className="text-center font-[family-name:var(--font-dm-sans)] text-sm text-neutral-400 italic">
        Wayne Wong&apos;s hidden archive — hundreds of unexposed 35mm photographs from post-war
        Japan, 1946
      </p>
    </div>
  );
}
