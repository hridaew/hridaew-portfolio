import { expect, test } from "@playwright/test";

function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ");
}

test.describe("LLM / crawler readiness", () => {
  test("homepage HTML includes identity and projects without executing JS", async ({
    request,
  }) => {
    const res = await request.get("/");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    expect(html).toContain("application/ld+json");
    expect(html).toContain("schema.org");
    expect(html).toContain('"@type":"Person"');

    const withoutScripts = stripScripts(html);
    expect(withoutScripts).toContain("Hridae Walia");
    expect(withoutScripts).toContain("Product Designer");
    expect(withoutScripts).toContain("Domis");
    expect(withoutScripts).toContain("Virdio");
    expect(withoutScripts).toMatch(/OBSCURA|Obscura/);
    expect(withoutScripts).toMatch(/Memory Care/i);
    expect(withoutScripts).toContain("/domis");
    expect(withoutScripts).toContain("/virdio");
  });

  test("llms.txt and robots.txt are explicit", async ({ request }) => {
    const llms = await request.get("/llms.txt");
    expect(llms.ok()).toBeTruthy();
    const llmsBody = await llms.text();
    expect(llmsBody).toContain("# Hridae Walia");
    expect(llmsBody).toContain("https://hridaew.com/domis");
    expect(llmsBody).not.toContain("User-Agent:");

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("User-Agent: GPTBot");
    expect(robotsBody).toContain("User-Agent: ClaudeBot");
    expect(robotsBody).toContain("User-Agent: PerplexityBot");
    expect(robotsBody).toContain("User-Agent: CCBot");
    expect(robotsBody).toContain("Allow: /");
    expect(robotsBody).toContain("Sitemap: https://hridaew.com/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapBody = await sitemap.text();
    expect(sitemapBody).toContain("https://hridaew.com/virdio");
    expect(sitemapBody).toContain("https://hridaew.com/llms.txt");
  });

  test("mixed-case and /projects/ aliases land on lowercase case studies", async ({
    request,
  }) => {
    const virdio = await request.get("/Virdio");
    expect(virdio.ok()).toBeTruthy();
    expect(new URL(virdio.url()).pathname).toBe("/virdio");
    expect(stripScripts(await virdio.text())).toMatch(/Virdio/);

    const obscura = await request.get("/projects/obscura");
    expect(obscura.ok()).toBeTruthy();
    expect(new URL(obscura.url()).pathname).toBe("/obscura");
    expect(stripScripts(await obscura.text())).toMatch(/OBSCURA|Obscura|MOHAI/);

    const titled = await request.get("/Projects/Virdio");
    expect(titled.ok()).toBeTruthy();
    expect(new URL(titled.url()).pathname).toBe("/virdio");
  });
});
