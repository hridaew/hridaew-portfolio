"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DualPerspectiveProps {
  curatorImage: string;
  spectatorImage: string;
  className?: string;
}

/** Matches `ProjectCardBar` in `HomePage.tsx` — duration-500, cubic-bezier(0.25,1,0.5,1), grid expand, blur fade, 150ms delay. */
const barEase = "duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]";

export function DualPerspective({
  curatorImage,
  spectatorImage,
  className,
}: DualPerspectiveProps) {
  const [active, setActive] = useState<"curator" | "spectator" | null>(null);

  const curatorOpen = active === "curator";
  const spectatorOpen = active === "spectator";

  return (
    <div className={cn("flex gap-3 md:gap-4 h-[400px] md:h-[500px]", className)}>
      <motion.div
        className="relative overflow-hidden cursor-pointer group"
        animate={{
          flex: active === "curator" ? 3 : active === "spectator" ? 1 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onClick={() => setActive(active === "curator" ? null : "curator")}
        onMouseEnter={() => !active && setActive("curator")}
        onMouseLeave={() => setActive(null)}
      >
        <img
          src={curatorImage}
          alt="The Curator's View — first-person perspective through the viewfinder"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end transition-opacity",
            barEase,
            active === "spectator" ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <h3 className="type-h3 text-left m-0 text-white">The Curator</h3>
          <div
            className={cn(
              "grid transition-all",
              barEase,
              curatorOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden min-h-0">
              <div
                className={cn(
                  "pt-[16px] transition-all text-left",
                  barEase,
                  curatorOpen
                    ? "delay-[150ms] opacity-100 blur-none"
                    : "delay-0 opacity-0 blur-[8px]"
                )}
              >
                <p className="type-body m-0 text-left text-white/85">
                  The viewer enters the booth and scans Wayne&apos;s photos through a viewfinder. Their gaze drives the narrative — dwell on faces and the story shifts to people.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="relative overflow-hidden cursor-pointer group"
        animate={{
          flex: active === "spectator" ? 3 : active === "curator" ? 1 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onClick={() => setActive(active === "spectator" ? null : "spectator")}
        onMouseEnter={() => !active && setActive("spectator")}
        onMouseLeave={() => setActive(null)}
      >
        <img
          src={spectatorImage}
          alt="The Spectator's View — audience watching the projected gaze"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end transition-opacity",
            barEase,
            active === "curator" ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <h3 className="type-h3 text-left m-0 text-white">The Spectator</h3>
          <div
            className={cn(
              "grid transition-all",
              barEase,
              spectatorOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
          >
            <div className="overflow-hidden min-h-0">
              <div
                className={cn(
                  "pt-[16px] transition-all text-left",
                  barEase,
                  spectatorOpen
                    ? "delay-[150ms] opacity-100 blur-none"
                    : "delay-0 opacity-0 blur-[8px]"
                )}
              >
                <p className="type-body m-0 text-left text-white/85">
                  Outside the booth, an audience watches a projection of the viewer&apos;s journey. A gaze reticle shows what they&apos;re looking at, turning &quot;looking&quot; into performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
