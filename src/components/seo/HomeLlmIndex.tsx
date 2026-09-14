import {
  CASE_STUDIES,
  CV_HREF,
  LINKEDIN_HREF,
  PERSON,
  PERSON_BIO,
} from "@/lib/site-identity";

/**
 * Always present in the homepage HTML for non-JS fetchers / LLM crawlers.
 * Visually clipped so it does not compete with the designed home UI;
 * `aria-hidden` keeps it out of the accessibility tree (the visual page
 * already exposes the same identity after hydrate).
 */
export function HomeLlmIndex() {
  return (
    <article className="home-llm-index" aria-hidden="true">
      <h1>
        {PERSON.name} — {PERSON.jobTitle}
      </h1>
      <p>Pronounced {PERSON.pronunciation}.</p>
      <p>
        {PERSON.worksFor.jobTitle} at{" "}
        <a href={PERSON.worksFor.url}>{PERSON.worksFor.name}</a>.
      </p>
      {PERSON_BIO.map((para) => (
        <p key={para.slice(0, 24)}>{para}</p>
      ))}
      <h2>Selected work</h2>
      <ul>
        {CASE_STUDIES.map((page) => (
          <li key={page.path}>
            <a href={page.path}>{page.title}</a>
            {": "}
            {page.description}
          </li>
        ))}
      </ul>
      <h2>Contact</h2>
      <ul>
        <li>
          <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
        </li>
        <li>
          <a href={LINKEDIN_HREF}>LinkedIn</a>
        </li>
        <li>
          <a href={CV_HREF}>CV</a>
        </li>
        <li>
          <a href="/llms.txt">llms.txt</a>
        </li>
      </ul>
    </article>
  );
}
