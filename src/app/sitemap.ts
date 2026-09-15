import type { MetadataRoute } from "next";
import { ALL_SITEMAP_PAGES, SITE_ORIGIN, absoluteUrl } from "@/lib/site-identity";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...ALL_SITEMAP_PAGES.filter((page) => page.sitemap).map((page) => ({
      url: absoluteUrl(page.path),
      lastModified,
      changeFrequency: page.path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: page.path === "/" ? 1 : page.path.split("/").length === 2 ? 0.8 : 0.6,
    })),
    {
      url: `${SITE_ORIGIN}/llms.txt`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_ORIGIN}/llms-full.txt`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
