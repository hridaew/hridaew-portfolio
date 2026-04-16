import { expect, test } from "@playwright/test";

test.describe("Wafflings", () => {
  test("section, butter chicken card, and recipe modal", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Wafflings", { exact: true })).toBeVisible();

    const recipeCard = page.locator("button").filter({ hasText: /^Recipe/ }).filter({ hasText: /Butter chicken/i });
    await expect(recipeCard).toBeVisible();

    await recipeCard.click();

    const dialog = page.getByRole("dialog", { name: /Butter Chicken Recipe/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /Butter Chicken Recipe/i })).toBeVisible();
  });
});
