"use client";

import { useState, useEffect, useCallback } from "react";
import { HOME_COLUMN } from "@/components/home/homeGrid";
import { CheatCodeInput } from "@/components/CheatCodeInput";
import { DestroySequence } from "@/components/cheat-codes/DestroySequence";
import { ButterChicken } from "@/components/cheat-codes/ButterChicken";

export function HomeCheatEasterEggs() {
  const [activeCheat, setActiveCheat] = useState<string | null>(null);

  const handleCheatCode = useCallback((code: string) => {
    const codeMap: Record<string, string> = {
      "2004": "theme-2004",
      choom: "theme-cyberpunk",
      destroy: "destroy",
      "butter chicken": "butter-chicken",
    };

    const action = codeMap[code];
    if (!action) return;

    if (action.startsWith("theme-")) {
      document.documentElement.classList.remove("theme-2004", "theme-cyberpunk");
      document.documentElement.classList.add(action);
      sessionStorage.setItem("activeCheat", action);
      setActiveCheat(action);
    } else {
      sessionStorage.setItem("activeCheat", action);
      setActiveCheat(action);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("activeCheat");
    if (!saved) return;
    if (saved.startsWith("theme-")) {
      document.documentElement.classList.add(saved);
      queueMicrotask(() => setActiveCheat(saved));
    }
    sessionStorage.removeItem("activeCheat");
  }, []);

  return (
    <>
      <div className="relative z-0 mt-[120px]">
        <div className={HOME_COLUMN}>
          <CheatCodeInput onActivate={handleCheatCode} />
        </div>
      </div>

      {activeCheat === "destroy" && <DestroySequence />}
      {activeCheat === "butter-chicken" && <ButterChicken />}
    </>
  );
}
