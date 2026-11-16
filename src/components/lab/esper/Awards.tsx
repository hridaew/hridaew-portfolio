import { Award, Newspaper, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Station } from "./stations";

const ICONS = { award: Trophy, finalist: Award, press: Newspaper };

/**
 * A project's honours and press as capsules under its summary, each with a neutral icon.
 * The full formal name shows on hover.
 */
export function StationAwards({ station, className }: { station: Station; className?: string }) {
  if (!station.awards?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Recognition">
      {station.awards.map((a) => {
        const Icon = ICONS[a.kind];
        return (
          <li
            key={a.label}
            title={a.title}
            className="type-body-medium inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] py-1.5 pl-2.5 pr-3 font-medium text-black/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
          >
            <Icon aria-hidden size={15} strokeWidth={1.9} className="shrink-0 text-black/60" />
            {a.label}
          </li>
        );
      })}
    </ul>
  );
}
