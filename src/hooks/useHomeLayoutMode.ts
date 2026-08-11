"use client";

import { useSyncExternalStore } from "react";
import {
  getHomeLayoutMode,
  subscribeHomeLayoutMode,
  type HomeLayoutMode,
} from "@/lib/home-layout";

function subscribe(onStoreChange: () => void) {
  return subscribeHomeLayoutMode(() => onStoreChange());
}

function getSnapshot(): HomeLayoutMode {
  return getHomeLayoutMode();
}

function getServerSnapshot(): HomeLayoutMode {
  return "stack";
}

/** Reactive home layout mode (`split` | `stack`). Stamps `data-home-layout` on `<html>`. */
export function useHomeLayoutMode(): HomeLayoutMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
