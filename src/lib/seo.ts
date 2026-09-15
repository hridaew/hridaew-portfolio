import type { Metadata } from "next";
import {
  PERSON,
  SITE_ORIGIN,
  CASE_STUDIES,
  absoluteUrl,
  type PublicPage,
} from "@/lib/site-identity";

export const PERSON_JSONLD_ID = `${SITE_ORIGIN}/#person`;
export const WEBSITE_JSONLD_ID = `${SITE_ORIGIN}/#website`;

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_JSONLD_ID,
    name: PERSON.name,
    givenName: PERSON.givenName,
    familyName: PERSON.familyName,
    alternateName: PERSON.pronunciation,
    jobTitle: PERSON.worksFor.jobTitle,
    description: PERSON.description,
    url: PERSON.url,
    image: PERSON.image,
    email: `mailto:${PERSON.email}`,
    sameAs: [...PERSON.sameAs],
    worksFor: {
      "@type": "Organization",
      name: PERSON.worksFor.name,
      url: PERSON.worksFor.url,
    },
    alumniOf: PERSON.alumniOf.map((school) => ({
      "@type": "CollegeOrUniversity",
      name: school.name,
      url: school.url,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_JSONLD_ID,
    name: `${PERSON.name} Portfolio`,
    url: SITE_ORIGIN,
    description: PERSON.shortDescription,
    inLanguage: "en-US",
    publisher: { "@id": PERSON_JSONLD_ID },
    author: { "@id": PERSON_JSONLD_ID },
  };
}

export function rootGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [personJsonLd(), websiteJsonLd()],
  };
}

export function profilePageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_ORIGIN}/#profile`,
    url: SITE_ORIGIN,
    name: `${PERSON.name} — ${PERSON.jobTitle}`,
    description: PERSON.description,
    isPartOf: { "@id": WEBSITE_JSONLD_ID },
    mainEntity: { "@id": PERSON_JSONLD_ID },
    about: { "@id": PERSON_JSONLD_ID },
  };
}

export function webPageJsonLd(page: PublicPage, extra?: Record<string, unknown>) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(page.path)}#webpage`,
    url: absoluteUrl(page.path),
    name: page.title,
    description: page.description,
    isPartOf: { "@id": WEBSITE_JSONLD_ID },
    author: { "@id": PERSON_JSONLD_ID },
    about: { "@id": PERSON_JSONLD_ID },
    ...extra,
  };
}

export function articleJsonLd(page: PublicPage) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(page.path)}#article`,
    headline: page.title,
    description: page.description,
    url: absoluteUrl(page.path),
    author: { "@id": PERSON_JSONLD_ID },
    mainEntityOfPage: absoluteUrl(page.path),
    publisher: { "@id": PERSON_JSONLD_ID },
  };
}

const DEFAULT_OG_IMAGE = {
  url: "/social-open-graph.png",
  alt: `${PERSON.name} — ${PERSON.jobTitle}`,
};

export function pageMetadata(page: PublicPage, ogType: "website" | "article" = "article"): Metadata {
  const url = absoluteUrl(page.path);
  const title =
    page.path === "/"
      ? `${PERSON.name} - ${PERSON.jobTitle}`
      : `${page.title} · ${PERSON.name}`;
  return {
    title:
      page.path === "/"
        ? `${PERSON.name} - ${PERSON.jobTitle}`
        : `${page.title} · ${PERSON.name}`,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: page.description,
      url,
      siteName: `${PERSON.name} Portfolio`,
      locale: "en_US",
      type: ogType,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export function caseStudyByPath(path: string): PublicPage {
  const found = CASE_STUDIES.find((p) => p.path === path);
  if (!found) {
    throw new Error(`Unknown case study path: ${path}`);
  }
  return found;
}

export const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "Bytespider",
  "meta-externalagent",
  "meta-externalfetcher",
  "FacebookBot",
  "cohere-ai",
  "Diffbot",
  "YouBot",
] as const;
