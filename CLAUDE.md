# Project: Personal Portfolio (React + GSAP + WebGL)

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Animation**: GSAP 3.14 (GreenSock) + @gsap/react for timeline animations; Framer Motion for layout/presence animations
- **3D**: Three.js (available, not yet deeply integrated)
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss
- **Scrolling**: Lenis for smooth scroll
- **Fonts**: Bricolage Grotesque at 700 only (display/headings), DM Sans (body/UI)
- **Utilities**: clsx + tailwind-merge via `cn()` helper in `src/lib/utils.ts`

## Architecture Guidelines

- **"Next Level Interactivity"**: Prioritize performance. No layout thrashing.
- Use `useRef` over `useState` for continuous animation values (mouse position, scroll offsets).
- Use `requestAnimationFrame` loops for physics-based animations, not React state updates.
- Use Plan Mode for all complex component architecture.
- Verify all animations in browser before marking task complete.

## Design System

- **Color Tokens**: CSS custom properties defined in `globals.css` (light/dark mode)
- **Typography**: `font-[family-name:var(--font-display)] font-bold` for display/H1/H2 and editorial headings (Bricolage is loaded at weight 700 only), `font-[family-name:var(--font-dm-sans)]` for body
- **Case Study Pages**: Each case study has a dedicated page in `src/app/{project}/page.tsx` with custom layouts and project-specific components
- **Editorial Layouts**: Use `EditorialLayout` component with `width` prop ("text", "breakout", "full-width")

## Boris Guide Principles

- Start every complex task in Plan Mode.
- Create subagents for repetitive refactoring.
- If a bug fix is mediocre, scrap it and ask for the "elegant solution."

## Animation Principles (12 Principles for Web)

- **Timing**: Keep interactions under 300ms, tooltips at 150ms. Define timing scales early and reuse everywhere.
- **Easing**: ease-out for entrances (snappy arrival, gentle settle), ease-in for exits, spring for interactive elements. Explore curves at easing.dev.
- **Staging**: Sequential animation guides focus better than simultaneous movement. Control what animates and when.
- **Follow Through**: Springs create organic overshoot-and-settle. Use stiffness 200-400, damping 20-30. Reserve stagger for non-critical elements.
- **Anticipation**: Preparatory cues before major transitions (slight scale-down before expand, pull before release).
- **Secondary Action**: Small flourishes reinforce primary feedback without stealing focus (particles on confirm, subtle sound).
- **Squash & Stretch**: Subtle scale on click (0.9 → 1.0) conveys weight. Keep subtle — too much becomes cartoonish.
- **Appeal**: Great animation is invisible — users think "this feels good" not "nice animation." Craft differentiates when features standardize.
- **Solid Drawing**: Create depth through shadows, layering, and CSS perspective. Maintain consistent scaling for volume illusion.
- **Exaggeration**: Amplify for emphasis. Use sparingly for onboarding, empty states, confirmations, and errors.

## Design Standards

- Treat design with the same high standards as Apple and Airbnb.
- Scrutinize the smallest details and push for excellent design.
- Pay attention to storytelling and stay close to the case study writeup content to maintain structure and story.
- Case study source of truth: `New Case Study Writings.txt`
- Process images: organized by project in their respective Process folders (e.g., `Virdio Process/`)

## Deployment Checklist

- **Build number (MANDATORY on push)**: Bump the version string at the bottom of `src/app/page.tsx` (currently at ~line 341) only when preparing to push/deploy—not on every local edit or agent turn. Increment patch for fixes, minor for features. Never push without bumping.
- **Deploy command**: `vercel --prod --yes` from project root
- **Always commit + push before deploying** so git and Vercel stay in sync
- Before deploying, verify local `main` is up to date with `origin/main` (`git fetch origin && git log --oneline origin/main -3`)

## Bug Prevention

- Never use `setPointerCapture` for scroll containers — it kills native trackpad/touch scrolling. Use native `overflow-x: auto` instead.
- Never use `scroll-snap-type: x mandatory` on horizontal galleries — it often breaks trackpad/touch scrolling. Plain `overflow-x: auto` with `flex` + `flex-shrink-0` children is more reliable.
- Never use `<style jsx>` with multiline className strings — Turbopack can't parse them. Use `.scrollbar-hide` utility class from globals.css.
- Always make interaction values configurable (e.g., `hoverScale` prop) instead of hardcoding — different contexts need different behaviors.
- Always test scroll/drag components on trackpad, mouse wheel, AND touch.
- Always verify images exist in `public/assets/` before referencing them in components.
- When using `ImgHTMLAttributes`, `src` can be `string | Blob` — always guard with `typeof src === "string"`.
- Use `<Link href="/">` for navigation buttons, not `useRouter().push()` or `useRouter().back()` — programmatic navigation can fail silently in certain component contexts.
- For mixed-size image layouts (e.g., desktop + phone mockups), use flex with the larger image setting natural height and the smaller one scaling via `h-full w-auto object-contain` — never use `items-stretch` on a grid as it distorts aspect ratios.
- Case studies with dedicated pages should use `href` field in case study data to navigate instead of opening the modal.
- **Audio autoplay**: Browser autoplay policy blocks `new Audio().play()` if called outside a direct user gesture. Always preload Audio objects on mount with `.load()`, then `.play()` on user action. If play is triggered via state change (e.g., `useEffect` on phase change), the gesture context is lost — preloading on mount preserves it.
- **Fixed overlays inside positioned containers**: Framer Motion `layoutId` calculates positions relative to the nearest `overflow: hidden` ancestor. Use `createPortal(…, document.body)` to escape container constraints for expanded image overlays.
- **Touch handling on custom pan/drag components**: Always add `touchAction: "none"` to containers that handle their own pointer events, otherwise the browser will fight for touch gestures (scroll vs. drag).
- **Border-radius mismatches**: When nesting rounded elements, inner border-radius must match the outer container's radius exactly or gaps will show at corners on small screens.
- **Windows PowerShell command chaining**: Don’t use `&&` (it fails on Windows PowerShell 5.x). Use `;` or run commands separately.
- **PowerShell `curl`**: `curl` is an alias for `Invoke-WebRequest` and can behave differently than real curl. For quick local checks prefer `node -e "fetch(...)"` or `Invoke-WebRequest` explicitly.
- **Upstash Redis in dev**: Avoid initializing `Redis.fromEnv()` at module scope. If env vars are missing, it can spam errors and slow endpoints; lazily create the client only when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` exist (and return safe fallbacks otherwise).
- **Dark UI tokens**: Floating “pill” chrome relies on CSS variables from `html.dark`. If a page is visually dark but the pill renders light, ensure `document.documentElement.classList.add("dark")` is set for that route.

## Accessibility

- **ARIA references**: When using `aria-labelledby`, always ensure the target `id` exists in the DOM.
- **Color contrast**: All text must meet WCAG AA 4.5:1 contrast ratio. Dark mode `--text-subtle` was bumped from `#7a7a8c` (~~4.1:1) to `#8e8ea0` (~~5.0:1) for this reason. Always verify contrast when changing color tokens.
- **Focus management**: Modal auto-focuses close button on open, restores focus to trigger on close. All interactive elements have visible `:focus-visible` outlines defined in `globals.css`.
- **Keyboard navigation**: Modal closes on Escape. All interactive elements must be keyboard-accessible.

## Key Conventions

- All components use `"use client"` directive when they need interactivity
- Image assets live in `public/assets/{project}/` and `public/images/`
- Case study data lives in `src/data/case-studies/`
- Type definitions in `src/types/`