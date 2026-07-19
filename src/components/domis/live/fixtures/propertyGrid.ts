/**
 * Property grid demo — nine homes (Fillmore center).
 * Icons live under /assets/domis/live/homes/.
 */

import { ADDRESS_ASSETS } from "./addressProfile";

export type PropertyGridHome = {
  id: string;
  name: string;
  src: string;
  /** Center card that starts large. */
  hero?: boolean;
};

/** Row-major 3×3 order. Hero must stay at index 4. */
export const PROPERTY_GRID_HOMES: readonly PropertyGridHome[] = [
  {
    id: "marina",
    name: "Marina Home",
    src: "/assets/domis/live/homes/home-marina.png",
  },
  {
    id: "valencia",
    name: "Valencia Home",
    src: "/assets/domis/live/homes/home-valencia.png",
  },
  {
    id: "noe",
    name: "Noe Home",
    src: "/assets/domis/live/homes/home-noe.png",
  },
  {
    id: "pacific",
    name: "Pacific Home",
    src: "/assets/domis/live/homes/home-pacific.png",
  },
  {
    id: "fillmore",
    name: "Fillmore Home",
    src: ADDRESS_ASSETS.homeAvatar,
    hero: true,
  },
  {
    id: "dolores",
    name: "Dolores Home",
    src: "/assets/domis/live/homes/home-dolores.png",
  },
  {
    id: "castro",
    name: "Castro Home",
    src: "/assets/domis/live/homes/home-castro.png",
  },
  {
    id: "hayes",
    name: "Hayes Home",
    src: "/assets/domis/live/homes/home-hayes.png",
  },
  {
    id: "mission",
    name: "Mission Home",
    src: "/assets/domis/live/homes/home-mission.png",
  },
] as const;
