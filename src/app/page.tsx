import { EsperRoom } from "@/components/lab/esper/EsperRoom";
import { HomeLlmIndex } from "@/components/seo/HomeLlmIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, profilePageJsonLd } from "@/lib/seo";
import { OTHER_PAGES } from "@/lib/site-identity";

const homePage = OTHER_PAGES[0];

export const metadata = pageMetadata(homePage, "website");

/** Home: the room. Search engines and readers without JavaScript get the same identity and work as plain text. */
export default function Home() {
  return (
    <>
      <JsonLd data={profilePageJsonLd()} />
      <HomeLlmIndex />
      <EsperRoom />
    </>
  );
}
