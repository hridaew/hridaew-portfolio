"use client";

import { useState, useCallback, useRef } from "react";
import { HOME_COLUMN } from "@/components/home/homeGrid";
import { CheatCodeInput } from "@/components/CheatCodeInput";
import { DestroySequence } from "@/components/cheat-codes/DestroySequence";
import { ButterChicken } from "@/components/cheat-codes/ButterChicken";
import {
  ChoomNetrunIntro,
  Theme2004Intro,
  useThemeIntroEnterSkip,
} from "@/components/cheat-codes/CheatThemeIntros";
import {
  applyDocumentTheme,
  resolveHomeCheatCode,
  type CheatThemeClass,
} from "@/lib/homeCheats";
import { playClick } from "@/lib/audio";

type ThemeIntroState = { theme: CheatThemeClass; variant: "2004" | "choom" };

export function HomeCheatEasterEggs() {
  const [activeCheat, setActiveCheat] = useState<string | null>(null);
  const [themeIntro, setThemeIntro] = useState<ThemeIntroState | null>(null);
  const themeIntroRef = useRef<ThemeIntroState | null>(null);
  themeIntroRef.current = themeIntro;

  const completeThemeIntro = useCallback((theme: CheatThemeClass) => {
    applyDocumentTheme(theme);
    setThemeIntro(null);
  }, []);

  const skipThemeIntro = useCallback(() => {
    const cur = themeIntroRef.current;
    if (!cur) return;
    applyDocumentTheme(cur.theme);
    setThemeIntro(null);
  }, []);

  useThemeIntroEnterSkip(!!themeIntro, skipThemeIntro);

  const handleCheatCode = useCallback((code: string) => {
    const resolved = resolveHomeCheatCode(code);
    if (!resolved) return;
    playClick();

    if (resolved.kind === "theme_intro") {
      setThemeIntro({ theme: resolved.theme, variant: resolved.variant });
      return;
    }
    if (resolved.id === "destroy") {
      setActiveCheat("destroy");
      return;
    }
    setActiveCheat("butter-chicken");
  }, []);

  const dismissButterChicken = useCallback(() => {
    setActiveCheat(null);
  }, []);

  return (
    <>
      {themeIntro?.variant === "2004" && (
        <Theme2004Intro
          theme={themeIntro.theme}
          onComplete={completeThemeIntro}
          onSkip={completeThemeIntro}
        />
      )}
      {themeIntro?.variant === "choom" && (
        <ChoomNetrunIntro
          theme={themeIntro.theme}
          onComplete={completeThemeIntro}
          onSkip={completeThemeIntro}
        />
      )}

      <div className="relative z-0 mt-[120px]">
        <div className={HOME_COLUMN}>
          <CheatCodeInput onActivate={handleCheatCode} />
        </div>
      </div>

      {activeCheat === "destroy" && <DestroySequence />}
      {activeCheat === "butter-chicken" && <ButterChicken onDismiss={dismissButterChicken} />}
    </>
  );
}
