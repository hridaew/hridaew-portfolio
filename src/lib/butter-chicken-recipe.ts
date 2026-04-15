export type ParsedButterChicken = {
    intro: string[];
    ingredients: string[];
    tandooriIngredients: string[];
    tandooriSteps: string[];
    butterChickenSteps: string[];
};

function normalizeLines(raw: string) {
    return raw
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((l) => l.replace(/\t/g, "  ").trimEnd());
}

function isHeading(line: string) {
    const t = line.trim().toLowerCase();
    return t === "tandoori chicken" || t === "butter chicken";
}

function stripBullet(line: string) {
    return line.trim().replace(/^[-•]\s*/, "");
}

export function parseButterChicken(raw: string): ParsedButterChicken {
    const lines = normalizeLines(raw);

    const intro: string[] = [];
    const ingredients: string[] = [];
    const tandooriIngredients: string[] = [];
    const tandooriSteps: string[] = [];
    const butterChickenSteps: string[] = [];

    let mode: "intro" | "ingredients" | "tandoori-ingredients" | "tandoori-steps" | "butter-steps" =
        "intro";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const t = line.trim();
        if (!t) continue;

        if (t === "—" || t === "---") {
            if (mode === "ingredients") mode = "tandoori-steps";
            continue;
        }

        if (isHeading(t)) {
            mode = t.toLowerCase() === "tandoori chicken" ? "tandoori-steps" : "butter-steps";
            continue;
        }

        if (mode === "intro") {
            const looksLikeMeasure = /\b(gm|tbsp|tsp|cup|ml|f)\b/i.test(t) || /^\d/.test(t);
            if (looksLikeMeasure || t.toLowerCase().includes("ingredients")) {
                mode = "ingredients";
                if (!t.toLowerCase().startsWith("ingredients")) ingredients.push(stripBullet(t));
                continue;
            }
            intro.push(t);
            continue;
        }

        if (mode === "ingredients") {
            if (t.toLowerCase().startsWith("tandoori chicken")) {
                mode = "tandoori-ingredients";
                continue;
            }
            ingredients.push(stripBullet(t));
            continue;
        }

        if (mode === "tandoori-ingredients") {
            if (t.toLowerCase() === "—" || t.toLowerCase() === "---") {
                mode = "tandoori-steps";
                continue;
            }
            if (isHeading(t)) {
                mode = t.toLowerCase() === "butter chicken" ? "butter-steps" : "tandoori-steps";
                continue;
            }
            tandooriIngredients.push(stripBullet(t.replace(/^\-\s*/, "")));
            continue;
        }

        if (mode === "tandoori-steps") {
            if (t.toLowerCase() === "butter chicken") {
                mode = "butter-steps";
                continue;
            }
            if (isHeading(t)) continue;
            tandooriSteps.push(stripBullet(t));
            continue;
        }

        if (isHeading(t)) continue;
        butterChickenSteps.push(stripBullet(t));
    }

    return {
        intro,
        ingredients,
        tandooriIngredients,
        tandooriSteps,
        butterChickenSteps,
    };
}
