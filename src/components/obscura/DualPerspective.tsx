"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DualPerspectiveProps {
  curatorImage: string;
  spectatorImage: string;
  className?: string;
}

export function DualPerspective({
  curatorImage,
  spectatorImage,
  className,
}: DualPerspectiveProps) {
  const [active, setActive] = useState<"curator" | "spectator" | null>(null);

  return (
    <div className={cn("flex gap-3 md:gap-4 h-[400px] md:h-[500px]", className)}>
      {/* Curator Panel */}
      <motion.div
        className="relative overflow-hidden rounded-2xl cursor-pointer group"
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
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-amber-200/80 text-xs uppercase tracking-[0.15em] font-medium mb-1">
            First Person
          </p>
          <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl md:text-3xl text-white">
            The Curator
          </h3>
          <motion.p
            className="text-neutral-300 text-sm mt-2 leading-relaxed"
            animate={{ opacity: active === "curator" ? 1 : 0, y: active === "curator" ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            The viewer enters the booth and scans Wayne&apos;s photos through a viewfinder. Their gaze drives the narrative — dwell on faces and the story shifts to people.
          </motion.p>
        </div>
      </motion.div>

      {/* Spectator Panel */}
      <motion.div
        className="relative overflow-hidden rounded-2xl cursor-pointer group"
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
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-amber-200/80 text-xs uppercase tracking-[0.15em] font-medium mb-1">
            Third Person
          </p>
          <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl md:text-3xl text-white">
            The Spectator
          </h3>
          <motion.p
            className="text-neutral-300 text-sm mt-2 leading-relaxed"
            animate={{ opacity: active === "spectator" ? 1 : 0, y: active === "spectator" ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            Outside the booth, an audience watches a projection of the viewer&apos;s journey. A gaze reticle shows what they&apos;re looking at, turning &quot;looking&quot; into performance.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
