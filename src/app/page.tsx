import { HomeLlmIndex } from "@/components/seo/HomeLlmIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomeRoute } from "@/components/home/HomeRoute";
import { pageMetadata, profilePageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const homePage = OTHER_PAGES[0];

export const metadata = pageMetadata(homePage, "website");

export default function Home() {
  return (
    <>
      <JsonLd data={profilePageJsonLd()} />
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "[data-ssr-home-stack]{visibility:visible!important;pointer-events:auto!important}",
          }}
        />
      </noscript>
      <HomeLlmIndex />
      <HomeRoute />
    </>
  );
}
