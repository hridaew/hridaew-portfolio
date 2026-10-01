"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/contactEmail";
import { useAchievements } from "@/components/achievements/AchievementProvider";

const COPIED_MS = 1800;

/** Copy the contact email; `copied` flips true for a beat after success. */
export function useCopyEmail() {
  const { unlock } = useAchievements();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = CONTACT_EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    unlock("copy-email");
    if (timer.current) clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }, [unlock]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { email: CONTACT_EMAIL, copied, copy };
}
