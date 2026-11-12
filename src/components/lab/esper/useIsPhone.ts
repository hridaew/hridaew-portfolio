"use client";

import { useSyncExternalStore } from "react";

const PHONE = "(max-width: 767px)";

/** Below the desktop layout's breakpoint: the room (and the case study over it) is laid out for a phone. */
export function useIsPhone() {
  return useSyncExternalStore(
    (on) => {
      const mq = window.matchMedia(PHONE);
      mq.addEventListener("change", on);
      return () => mq.removeEventListener("change", on);
    },
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
}
