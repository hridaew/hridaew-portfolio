# Visual & typography review: `/lab/one-splat-open`

*Done by a review subagent, 2026-10-04. Review only, no edits. Tested at 1440×900 and at mobile (375×812). Contrast figures are computed against `--paper` (#f4f4f3).*

## Summary
- **High: on desktop, the mouse wheel can't scroll the left column.** The wheel handler in `OneSplatPage.tsx` calls `preventDefault()` everywhere and turns each scroll into a project change. At 1440×900 the column is about 1012–1073px tall but the viewport is 900px. The cheat-code footer can't be reached, and when Side builds is open its description and links are cut off.
- **High: collapsed index rows show a 4px sliver of their hidden text.** `.detail > div { padding: 0 0 4px }` sits inside the collapsed (`0fr`) grid row, so the top of each meta line shows as grey tick marks.
- **High: muted index text fails WCAG contrast.** Inactive titles are 1.99:1, inactive subtitles 1.59:1, the active subtitle 2.52:1 and the pronunciation 2.59:1.
- **Medium–High: on mobile, the index doesn't line up.** The masthead and footer start at x=16, but index titles start at x=48 because `.side nav` padding adds to `.index` padding. The "in" glass button also wraps onto its own line.
- **Medium: the cards crowd the splat, and nothing signals that the open title or description goes to the case study.**

## 1. Typography
- **Medium:** `.copy` is `0.94rem` (15.04px), which isn't on any scale. Use 15px, or match the intro at 16/24 so the left column has two text sizes instead of three.
- **Medium:** the glass button labels don't match. About me is 13/600, the email is 12/400, and CV/in are 12/600. Use one size, e.g. 13px/500; the email can stay at 400.
- **Medium:** the Memory Care subtitle drops below its title while the others sit inline. Either put every subtitle below its title, shorten the title ("Memory Care Station"), or accept it with `margin-top: 2px`. On mobile the title also breaks onto two lines.
- **Low:** the album/game captions in the bio sheet are 10px uppercase. Use 11px with `letter-spacing: 0.08em`.
- **Low:** tabular figures are applied to the whole `.sheetPanel`, prose included. Limit them to the date cells.
- **Medium: the bio sheet copy (`HeroCardExpandedBody.tsx`) is inconsistent:**
  - dates use spaced hyphens and trailing dashes ("2024 -", "2022 - 2023"); use en dashes ("2024–now", "2022–2023")
  - "Maria Mortati Experience Design 2020–2021, 2023" doesn't match "Memory Care Experience Station 2020–2023" in the index
  - **typo: the "MOVES:" label should be "MOVIES"**
  - "Top 3:", "GAMES:" and "ALBUMS:" have colons but "EXPERIENCE" and "EDUCATION" don't; drop the colons
  - "Dementia" is capitalized in the sheet but lowercase in the index
- **Low:** on mobile, a line in the bio starts with "— whether". Use a non-breaking space before the em dash, or `text-wrap: pretty` on `.mastIntro p`, `.copy` and the bio paragraphs.

## 2. Layout & spacing
- **High: wheel and overflow.**
  - (a) Only hijack the wheel over `.stage`, or when `.side` can't scroll any further in that direction.
  - (b) Or tighten the column: `.side` gap 40→28, `.mastIntro p + p` 24→16, `.row` padding 12→10, and add `@media (max-height: 940px)` tightening.
- **High: the 4px leak.** Set `.detail > div { padding: 0 }` and move the spacing into the `.copy`/`.links` margins.
- **Medium: cards vs splat.** The cards use about 92% of the viewport height, the middle one covers the house roof, and the Memory Care object sits mostly under the cards.
  - Try `--home-work-card-max: min(28vw, 440px, calc((100svh - 160px) * 0.5))` with a 22px gap.
  - Or move the splat further left while cards are showing.
  - Keep the arc.
- **Medium: mobile alignment.** Use `.side nav { padding: 8px 0 48px }`, or `.index { padding: 0 16px }` under 820px.
- **Medium: mobile spacing.**
  - There's about 100px of empty space above the splat.
  - The "in" pill wraps alone; use `gap: 8px`, or swap the email for an envelope icon under 400px.
  - The cards (46vw) cover a third of the splat; try 40vw, or a horizontal strip below the splat.
- **Low:** `nav { margin: auto 0 }` leaves uneven gaps when the viewport is tall. Consider `margin-top: clamp(32px, 8vh, 96px)`.
- **Low:** on mobile, the "EXPERIENCE" label in the bio sheet is indented about 14px more than the body text (the shared component's padding).

## 3. Color & surfaces
- **High: contrast of index text.**

  | Element | Contrast now | Required | Fix |
  |---|---|---|---|
  | Inactive title (ink 0.34) | 1.99:1 | 3:1 (large text) | ink 0.52 |
  | Inactive sub (ink 0.24) | 1.59:1 | 4.5:1 | `--ink-subtle`, or hide until hover/open |
  | Active sub (ink 0.44) | 2.52:1 | 4.5:1 | `--ink-muted` |
  | Pronunciation (ink 0.45) | 2.59:1 | 4.5:1 | `--ink-muted` |

  Meta (5.05:1) and the intro/description (8.3:1) pass.
- **Low: glass buttons.** They read as frosted pills, and the tint is subtle as intended: visible on Memory Care and Domis, barely visible on OBSCURA. Don't strengthen it. Labels pass contrast.
- **Low:** the OBSCURA cards show as solid black blocks while their images load. Use a `--paper-sunken` placeholder.

## 4. Interaction affordances
- **Medium: nothing shows that the open title or description navigates.** The description's hover change (secondary ink → ink) is nearly invisible. Add a trailing "→" on the open title, or a "Read case study →" link, and underline the description on hover.
- **Low:** hovering an inactive title looks the same as the open state. Use ink 0.7 for hover.
- **Low:** the canvas shows `cursor: pointer` when hovering an object, but a click only jiggles it. Keep `grab` throughout. *(This is left over from the removed overview feature.)*
- **Low:** the name button's focus ring is weak (28% ink). Use the global ink ring instead.

## 5. Polish & bugs
- **Medium:** in the bio sheet, the game/album/movie tiles show as empty white cards until their images load. Add a light fill and the correct aspect ratio.
- **Low:** the splat morph looked squashed for a moment mid-transition. This may be the preview browser throttling frames; it wasn't checked at full frame rate.
- **Not verified:** Safari, dark mode, and how the glass looks over a moving splat at 60fps.

## If you only fix five things
1. Let the left column scroll (limit the wheel-to-project handler to the stage, or to when `.side` is at its scroll edge) and/or tighten the vertical spacing.
2. Remove the 4px leak.
3. Fix contrast: inactive titles at ink 0.52, subtitles at `--ink-subtle`, the active subtitle and pronunciation at `--ink-muted`.
4. Fix mobile alignment (drop the extra nav padding) and stop the "in" pill wrapping.
5. Make "open the case study" visible, and shrink the cards to about `min(28vw, 440px)`.

Close behind: fix the bio sheet copy (the "MOVES" typo, en-dash dates, matching project names and years) and use one label size for all four glass buttons.

---

# Second review (after fixes)

All of the first review's fixes were checked and pass, except two, which are now fixed:
- **Inactive subtitles were still 4.11:1.** The site's `--ink-subtle` token measures 4.11:1 on paper, not the ~4.6:1 its comment claims. Inactive subtitles now use `--ink-muted` (5.05:1), and open/hover subtitles step up to `--ink-secondary`. The token itself is unchanged; fixing it would affect other pages.
- **The mobile buttons still wrapped by 3px.** About me's padding is now 10/12px on mobile.

New findings, now fixed:
- The "→" trailed the subtitle. It now sits right after the title.
- The signature replay button (`HeroCard.tsx`, shared) had no visible focus state. Removed `focus-visible:outline-none` so the global ring shows.
- The name's focus ring nearly touched the pronunciation. Gap 0.45rem → 0.6rem.
- The description's hover underline competed with the links row. Lightened to 20% ink.

Open decisions for the owner:
- Mobile cards (40vw) are too small to read and still cover the splat. Options: a strip below the splat at ~70vw, one card at 60vw, or hide them on mobile.
- The Memory Care subtitle wraps on desktop.
- The bio sheet project name and years don't match the index.
- Some bio labels have colons and others don't.
- The 10px captions in the bio sheet are too small.
- There's empty space above the splat on mobile.
- The image tiles in the bio sheet are blank white until their images load.

---

# Craft pass (owner: "fix everything to your taste")

- **Index as a table of contents.** Titles and subtitles sit in two aligned columns (10.5rem title column, 16px gap), so every subtitle starts at the same x. On mobile, rows stack title over subtitle.
- **Consistent index copy.** Subtitles are all short noun phrases: "AI home maintenance app", "AR home fitness app", "Immersive VR exhibition", "Multisensory dementia care", "Things I make to learn". Meta lines all follow "Role · (Venue ·) Years". "Memory Care Experience Station" is now "Memory Care", which fits the column and stops the subtitle repeating the title.
- **Custom arrow.** The case-study mark is a drawn SVG arrow (1.5 stroke, round caps) matching the About chevron, replacing the text "→". It fades in on the open row and nudges 3px on hover.
- **One link style.** Intro project links, Side builds links and the description hover all use a 1px underline at 30% ink, 3px offset, going full ink on hover.
- **Vertical rhythm.** Column top padding is 4.5vh (24–56px), bottom 32px, section gaps 28px, intro paragraph gap 16px, row padding 10px. The column now fits 1440×900 exactly with the footer visible; the longest project (Side builds) scrolls about 30px.
- **Buttons.** All four labels are 13px on desktop, the email included. On mobile all four step down to 12px together with a 6px gap, so they share one row at 375px.
- **Cards vs objects.** When cards are showing, the object frames at 33% of the stage and 92% size, so it clears the cards.
- **Mobile cards.** A horizontal, snap-scrolling strip of cards at 68vw sits under the object, which moves up into the space above.
- **Bio sheet.**
  - Section labels have no colons (Top 3, Games, Albums, Movies).
  - "AI-powered", lowercase "dementia" and "multisensory" match the index.
  - Images sit on `--paper-sunken` while loading, so there are no blank white boxes.
