# Savor Waffling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a Butter Chicken–style written waffling for Savor at `/waffling/savor`, first in the homepage waffle row, with trailer hero video.

**Architecture:** Copy video + extract poster into `public/assets/savor/`. Add homepage card data + Choom row. Build `SavorWafflingBody` from full SAVOR.md using Butter Chicken column/type patterns. Wire `src/app/waffling/savor/page.tsx` with `WafflingEntrance` + `PostPill`.

**Tech Stack:** Next.js App Router, existing `DeferredVideo`, Framer/CSS entrance via `WafflingEntrance`, Tailwind tokens already used on Butter Chicken.

---

### Task 1: Assets

**Files:**
- Create: `public/assets/savor/trailer.mp4`
- Create: `public/assets/savor/card-poster.jpg`

**Steps:**
1. `mkdir -p public/assets/savor`
2. Copy trailer from Downloads
3. `ffmpeg` extract a mid-clip frame (~1–2s) as JPEG poster (~1200px wide)

### Task 2: Homepage card + Choom

**Files:**
- Modify: `src/data/homepage-wafflings.ts`
- Modify: `src/lib/homeChoomCopy.ts`

**Steps:**
1. Insert Savor card at index 0 (`taperedRim`, href `/waffling/savor`, poster image)
2. Insert matching Choom title/preview at index 0

### Task 3: Page body + route

**Files:**
- Create: `src/components/savor/SavorWafflingBody.tsx`
- Create: `src/app/waffling/savor/page.tsx`

**Steps:**
1. Port full SAVOR.md into JSX matching Butter Chicken spine
2. Hero uses `DeferredVideo` (or muted autoplay video) with poster
3. Page shell mirrors `butter-chicken/page.tsx`

### Task 4: Verify

**Steps:**
1. Confirm assets exist and paths resolve
2. Spot-check homepage first card + `/waffling/savor` in browser if server available
