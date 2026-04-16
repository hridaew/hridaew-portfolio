/**
 * Home cheat code resolution — no persistence: themes live only on
 * `document.documentElement` until a full page refresh.
 */

export type CheatThemeClass = "theme-2004" | "theme-cyberpunk";

export type CheatOverlayId = "destroy" | "butter-chicken";

export type ResolvedHomeCheat =
  | { kind: "theme_intro"; theme: CheatThemeClass; variant: "2004" | "choom" }
  | { kind: "overlay"; id: CheatOverlayId };

const TABLE: Record<string, ResolvedHomeCheat> = {
  "2004": { kind: "theme_intro", theme: "theme-2004", variant: "2004" },
  choom: { kind: "theme_intro", theme: "theme-cyberpunk", variant: "choom" },
  destroy: { kind: "overlay", id: "destroy" },
  "butter chicken": { kind: "overlay", id: "butter-chicken" },
};

export function resolveHomeCheatCode(raw: string): ResolvedHomeCheat | null {
  const code = raw.trim().toLowerCase();
  return TABLE[code] ?? null;
}

export function applyDocumentTheme(theme: CheatThemeClass): void {
  document.documentElement.classList.remove("theme-2004", "theme-cyberpunk");
  document.documentElement.classList.add(theme);
}
