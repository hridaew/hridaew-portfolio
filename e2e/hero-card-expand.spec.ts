import { expect, test, type Page } from "@playwright/test";

async function sampleShellTopY(
  page: Page,
  intervalMs: number,
  count: number
): Promise<number[]> {
  const ys: number[] = [];
  for (let i = 0; i < count; i++) {
    const box = await page.getByTestId("hero-card-shell").boundingBox();
    if (box) ys.push(box.y);
    if (i < count - 1) await page.waitForTimeout(intervalMs);
  }
  return ys;
}

test.describe("Hero card expand", () => {
  test("shell top Y stays stable during expand (no post-blur vertical snap)", async ({
    page,
  }) => {
    await page.goto("/");

    const expand = page.getByRole("button", { name: /show full bio/i });
    await expand.waitFor({ state: "visible", timeout: 30_000 });

    const before = await page.getByTestId("hero-card-shell").boundingBox();
    expect(before).not.toBeNull();

    await expand.click();

    const during = await sampleShellTopY(page, 40, 16);
    expect(during.length).toBeGreaterThan(0);

    const driftPx =
      Math.max(...during, before!.y) - Math.min(...during, before!.y);

    expect(driftPx, `vertical drift during expand was ${driftPx}px`).toBeLessThan(
      6
    );

    await page.waitForTimeout(500);
    const after = await page.getByTestId("hero-card-shell").boundingBox();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.y - before!.y)).toBeLessThan(4);
  });
});
