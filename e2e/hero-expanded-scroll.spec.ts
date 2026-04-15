import { expect, test } from "@playwright/test";

test.describe("Hero expanded scroll (visual / layout)", () => {
  test("scrollport uses a bottom mask (no pinned overlay) and inner padding survives max scroll", async ({
    page,
  }) => {
    await page.goto("/");

    const expand = page.getByRole("button", { name: /show full bio/i });
    await expand.waitFor({ state: "visible", timeout: 30_000 });
    await expand.click();

    const scroll = page.getByTestId("hero-card-expanded-scroll");
    await scroll.waitFor({ state: "visible" });

    const backdrop = page.getByTestId("hero-expanded-bottom-fade-backdrop");
    await expect(backdrop).toBeVisible();
    const backdropH = await backdrop.evaluate((el) => el.getBoundingClientRect().height);
    expect(backdropH, "page-toned backdrop behind mask should have height").toBeGreaterThan(
      80
    );

    const mask = await scroll.evaluate((el) => {
      const s = window.getComputedStyle(el);
      const webkit = (s as CSSStyleDeclaration & { webkitMaskImage?: string })
        .webkitMaskImage;
      return (s.maskImage || webkit || "").trim();
    });
    expect(mask, "scrollport should have a non-none mask for bottom taper").not.toMatch(
      /^none$/i
    );
    expect(mask.length).toBeGreaterThan(10);

    await scroll.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(150);

    const gapPx = await scroll.evaluate((el) => {
      const inner = el.querySelector(
        '[data-testid="hero-expanded-scroll-inner"]'
      ) as HTMLElement | null;
      if (!inner) return -1;
      const child = inner.firstElementChild as HTMLElement | null;
      if (!child) return -1;
      return Math.round(inner.getBoundingClientRect().bottom - child.getBoundingClientRect().bottom);
    });

    expect(
      gapPx,
      `expected ~32px scrollable padding below body (inner bottom − child bottom), got ${gapPx}px`
    ).toBeGreaterThanOrEqual(26);
  });
});
