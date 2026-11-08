import { HomeRoute } from "@/components/home/HomeRoute";
import { pageMetadata } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const homePage = OTHER_PAGES[0];

// The previous home page, kept at /classic. The room (EsperRoom) is the home page now.
export const metadata = { ...pageMetadata(homePage, "website"), robots: { index: false, follow: true } };

export default function Home() {
  return (
    <>
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "[data-ssr-home-stack]{visibility:visible!important;pointer-events:auto!important}",
          }}
        />
      </noscript>
      <HomeRoute />
    </>
  );
}
