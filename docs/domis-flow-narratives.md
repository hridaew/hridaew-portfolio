# Domis flow narratives (source for classification)

Write the journeys in plain language first. A diagramming agent then assigns each moment a shape:

- **start_end** — squircle (journey begin / terminal success)
- **decision** — diamond (branching question)
- **process** — rectangle (work done: screen action, system job, agent step)
- **data** — cylinder (stored or returned datasets, payloads, results)
- **input** — parallelogram (owner provides or edits information)

Lanes: **Owner** vs **Backend / AI**.

---

## 1. Address intelligence

Goal: create a home from an address, with Domis researching facts via consensus search.

### Owner
1. Begin create-home.
2. Enter / pick an address (typed or from autofill suggestions).
3. Decide whether the autofill suggestion looks right.
4. If yes: choose the autofill suggestion.
5. If no: type the address manually.
6. Wait while Domis loads home facts (owner-visible waiting state).
7. Decide whether useful data came back (yes / incomplete / fail).
8. If yes: review the prefilled fields.
9. If incomplete: leave blanks to fill later.
10. If fail: use an empty form and enter facts manually.
11. Optionally edit fields and name spaces.
12. Optionally edit or replace the home photo (or skip).
13. Home is created.

### Backend / AI
A. Resolve / normalize the address and gather property context.
B. Run three independent home-fact searches.
C. Hold the three source result sets.
D. Review agent cross-references the three runs (agreement rules).
E. Produce a consensus payload (agreed fields and blanks).
F. Return that payload to the owner form.

### Edges (high level)
- Owner 2 → 3 → 4|5 → Backend A→B→C→D→E→F → Owner 6→7 → 8|9|10 → 11 → 12 → 13
- Photo skip: 12 → 13

---

## 2. Appliance intelligence

Goal: add an appliance to the home so it can be tagged later; vision + link enrichment.

### Owner
1. Begin add-appliance / open capture.
2. Photograph the appliance label, or skip if no camera.
3. If skip: enter brand/model manually.
4. Decide whether the extract looks readable (yes / incomplete / no).
5. If no: retake the photo, or switch to manual entry.
6. Confirm the appliance identity (edit if needed).
7. Attach useful manuals/parts links, or save without links if none found.
8. Appliance is on the home.

### Backend / AI
A. Vision model reads the label photo.
B. Hold brand/model (and related) candidates from vision.
C. Search for manuals and parts links for the confirmed identity.
D. Hold link results (or none).
E. Rank which attachments are useful to show.
F. Return candidates / links to the owner UI.

### Edges (high level)
- Owner 1 → 2 → Backend A→B → Owner 4 → 6 → Backend C→D→E→F → Owner 7 → 8
- Skip camera: 1 → 3 → 6 → …
- Retake: 4-no → 5 → 2 (loop) or 3
- Incomplete extract still goes to confirm (4 → 6)
- Links not found: 7 → save without → 8
