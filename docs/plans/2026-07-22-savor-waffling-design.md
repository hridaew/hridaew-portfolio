# Savor Waffling Post — Design

**Goal:** Add Savor as a first-position written waffling post at `/waffling/savor`, matching Butter Chicken’s page chrome, with the trailer as hero video.

## Decisions

| Choice | Decision |
|--------|----------|
| Format | Written post (Butter Chicken pattern), not interactive prototype |
| Route | `/waffling/savor` |
| Homepage order | First card in wafflings carousel |
| Card image | Poster frame extracted from `Savor-Trailer.mp4` (small thumb, not `imageHero`) |
| Page hero | Autoplay muted loop trailer; same frame as `poster` |
| Content | Full `SAVOR.md` writeup (install + story + links) |
| Shell | `WafflingEntrance` + `PostPill` + dark `#0c0c0e` page |

## Assets

- Source video: `/Users/hridaewalia/Downloads/Savor-Trailer.mp4`
- Source copy: `/Users/hridaewalia/Downloads/savor-portfolio/SAVOR.md`
- Output: `public/assets/savor/trailer.mp4`, `public/assets/savor/card-poster.jpg`

## Homepage card

- Title: `Savor`
- Preview: short tease from “What it is”
- `href: "/waffling/savor"`, `opacity: 1`, `taperedRim: true`
- Insert at index 0; shift Choom copy array to match

## Page body

- Title + hero video (full-bleed within text spine, rounded like Butter Chicken media)
- Sections: What it is → Install → Story → footer GitHub links
- Typography/spacing aligned with Butter Chicken (`max-w` column, Geist body, mono captions)
