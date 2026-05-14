import type { jsPDF } from "jspdf";
import { CONTACT_EMAIL } from "@/lib/contactEmail";

/** Shareable URL that opens the recipe page (`/butter-chicken`). */
export function buildButterChickenRecipeShareUrl(): string {
  if (typeof window === "undefined") return "";
  return new URL("/butter-chicken", window.location.origin).toString();
}

const MARGIN_PT = 48;
const BOTTOM_SAFE_PT = 52;
const LINE_LH = 13.8;

function addPageIfNeeded(doc: jsPDF, y: number, nextBlockHeight: number): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + nextBlockHeight > pageH - BOTTOM_SAFE_PT) {
    doc.addPage();
    return MARGIN_PT + 14;
  }
  return y;
}

function writeLines(
  doc: jsPDF,
  lines: string[],
  x: number,
  maxW: number,
  yStart: number,
  fontSize: number,
  style: "normal" | "bold" = "normal",
): number {
  let y = yStart;
  doc.setFont("helvetica", style);
  doc.setFontSize(fontSize);
  for (const raw of lines) {
    const wrapped = doc.splitTextToSize(raw, maxW) as string[];
    for (const line of wrapped) {
      y = addPageIfNeeded(doc, y, LINE_LH);
      doc.text(line, x, y);
      y += LINE_LH;
    }
  }
  return y;
}

/** Client-only: builds a simple text PDF and triggers download. */
export async function downloadButterChickenRecipePdf(): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - MARGIN_PT * 2;
  const x = MARGIN_PT;
  let y = MARGIN_PT + 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  y = addPageIfNeeded(doc, y, 28);
  doc.text("Butter Chicken Recipe", x, y);
  y += 30;

  const paragraphs: string[] = [
    `A few people have asked me for my Butter Chicken Recipe and I don't know where else to put it, so why not here.`,
    `Before you read the ingredients, note that this is a vibes-based recipe: the ingredients are correct, but the amounts may vary. Increase the Kashmiri red chili powder if you want more heat, and if anything doesn't taste right, it's usually salt or butter. The key insight I've learned on my butter chicken journey is that the taste scales linearly with how much butter you put in it.`,
    `Email me a photo if you make this, please: ${CONTACT_EMAIL}`,
  ];

  y = writeLines(doc, paragraphs, x, maxW, y, 11, "normal");
  y += 10;

  y = writeLines(doc, ["Ingredients"], x, maxW, y, 14, "bold");
  y += 4;

  y = writeLines(doc, ["CHICKEN MARINADE"], x, maxW, y, 10, "bold");
  y += 2;
  y = writeLines(
    doc,
    [
      "Chicken, thighs ideally. — 2 lb",
      "Kashmiri Chili Powder — 3 tbsp",
      "Garam Masala — 1 1/2 tsp",
      "Oil, mustard ideally. — 2 tbsp",
      "Greek Yogurt — 3/4 cup",
      "Lemon Juice — 2 tbsp",
      "Fenugreek Leaves — 1 tsp",
      "Salt — 2 tbsp",
      "Ginger+Garlic Paste — 3 tbsp",
      "Black Salt — 1 tsp",
    ],
    x,
    maxW,
    y,
    11,
    "normal",
  );
  y += 10;

  y = writeLines(doc, ["BUTTER CHICKEN SAUCE"], x, maxW, y, 10, "bold");
  y += 2;
  y = writeLines(
    doc,
    [
      "Kashmiri Chili Powder — 2 tbsp",
      "Pureed Tomatoes — 2 lb",
      "Butter — 3/4 cup (note: I did 1 1/2 cups once and it was amazing)",
      "Heavy Cream — 1 cup + 1/4 garnish",
      "Salt — to taste",
      "Sugar — 2 tbsp",
      "Thai Green Chilies (no seeds) — 5",
      "Ginger Garlic Paste — 1 tbsp",
    ],
    x,
    maxW,
    y,
    11,
    "normal",
  );
  y += 12;

  y = writeLines(doc, ["Instructions"], x, maxW, y, 14, "bold");
  y += 6;

  y = writeLines(doc, ["Step 1 — Marinate & Cook"], x, maxW, y, 11, "bold");
  y += 2;
  y = writeLines(
    doc,
    [
      "1. Cut the chicken into ~1 inch pieces, make sure the chicken is dry",
      "2. Mix all the marinade ingredients in a bowl with the chicken",
      "3. Cover and leave it in the fridge for at least 3 hours",
      "4. Prepare the oven, Air Fryer recommended",
      "   a. Preheat to 400f, enable convection if using an oven",
      "   b. Skewer the chicken with wooden sticks, or plop them in",
      "5. Cook for 16 minutes (thighs), 14 minutes (breast). They should have some charred ends",
      "6. To make it even better, shred the chicken after its cooked",
    ],
    x,
    maxW,
    y,
    11,
    "normal",
  );
  y += 10;

  y = writeLines(doc, ["Step 2 — The Sauce"], x, maxW, y, 11, "bold");
  y += 2;
  y = writeLines(
    doc,
    [
      "1. In a large pan, add some butter, and Thai Green Chilies.",
      "2. Add pureed tomatoes with the Kashmiri Chili Powder, ginger garlic paste, salt, and sugar.",
      "3. Cook on low until its deep red and slightly thickened",
      "4. Add cooked chicken, butter, and cream, mix",
      "5. Taste for salt, spice, sugar. If it doesn't taste right — adjust salt and butter",
    ],
    x,
    maxW,
    y,
    11,
    "normal",
  );
  y += 10;

  y = writeLines(doc, ["Step 3 — Finish"], x, maxW, y, 11, "bold");
  y += 2;
  y = writeLines(
    doc,
    [
      "1. Once it tastes right, plate it",
      "2. Garnish with more butter",
      "3. Perhaps a little more butter",
      "4. Tiny swirl of cream",
      "5. A bit of coriander",
      "6. Eat with Naan or Rice, not both",
    ],
    x,
    maxW,
    y,
    11,
    "normal",
  );

  doc.save("butter-chicken-recipe.pdf");
}
