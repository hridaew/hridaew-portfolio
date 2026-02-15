# Accessibility & Images Audit Plan
**Project**: Hridae Walia Portfolio
**Date**: February 15, 2026
**Audit Type**: Accessibility Review, Missing Images/Metadata Check

---

## Executive Summary

Comprehensive accessibility review completed. The project demonstrates **strong accessibility practices** with proper semantic HTML, ARIA labels, and image alt text. However, there are **critical missing metadata files** for favicons and social sharing that must be added before launch.

**Overall Scores**:
- **Accessibility**: 8/10 - Strong foundation with minor improvements needed
- **Images**: 10/10 - All images present and properly optimized
- **Metadata**: 3/10 - Missing critical social sharing images

---

## 🚨 Critical Priority (Fix Before Launch)

### 1. Add Favicon Files
**Status**: ❌ MISSING
**Impact**: High - Affects browser tab display and bookmarks

**Missing Files**:
- `public/favicon.ico` - Main favicon for browsers (32×32px or 48×48px)

**What Exists**:
- ✅ `src/app/icon.png` - Next.js app icon (currently shows a cat image)

**Action Items**:
```bash
# Create favicon.ico from your brand icon/logo
# Place in public/favicon.ico
# Recommended size: 32×32px or 48×48px .ico format
```

---

### 2. Add Open Graph Images
**Status**: ❌ MISSING
**Impact**: Critical - Affects social media sharing (LinkedIn, Twitter, Slack, etc.)

**Missing Files**:
- `src/app/opengraph-image.png` - Social media preview image
- `src/app/twitter-image.png` - Twitter/X card image (optional, falls back to opengraph-image)

**Specifications**:
- **Open Graph Image**: 1200×630px PNG or JPG
- **Twitter Image**: 1200×630px PNG or JPG (can be same as OG image)
- Should showcase your portfolio brand/work
- Include your name and "Product Designer" tagline

**Action Items**:
```bash
# Create 1200×630px social preview image
# Save as: src/app/opengraph-image.png
# Optional: src/app/twitter-image.png (if different from OG)
```

---

### 3. Update Metadata Configuration
**Status**: ⚠️ INCOMPLETE
**Impact**: High - Affects SEO and social sharing

**Current State** (`src/app/layout.tsx:24-27`):
```typescript
export const metadata: Metadata = {
  title: "Hridae Walia - Product Designer",
  description: "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale. Expert in designing and prototyping high-craft experiences across mobile, web, tangible, and AR/VR platforms.",
};
```

**Required Updates**:
```typescript
export const metadata: Metadata = {
  title: "Hridae Walia - Product Designer",
  description: "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale. Expert in designing and prototyping high-craft experiences across mobile, web, tangible, and AR/VR platforms.",

  // ADD THESE:
  metadataBase: new URL('https://hridaewalia.com'), // Replace with your actual domain

  openGraph: {
    title: "Hridae Walia - Product Designer",
    description: "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale.",
    url: 'https://hridaewalia.com',
    siteName: 'Hridae Walia Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png', // Auto-detected if file exists
        width: 1200,
        height: 630,
        alt: 'Hridae Walia - Product Designer Portfolio',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: "Hridae Walia - Product Designer",
    description: "Product Designer with 5+ years of experience delivering end-to-end, research-led products at scale.",
    images: ['/twitter-image.png'], // Auto-detected if file exists
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};
```

**Files to Update**:
- `src/app/layout.tsx` (lines 24-27)

---

## 🔶 High Priority (Accessibility Fixes)

### 4. Test and Fix Color Contrast
**Status**: ⚠️ NEEDS VERIFICATION
**Impact**: High - WCAG AA compliance failure

**Potential Issues** (`src/app/globals.css:26-33`):
```css
--text-subtle: #a1a1a1;  /* Light gray on white - likely fails WCAG AA */
--text-muted: #818181;   /* Medium gray on white - may fail WCAG AA */
--background: #ffffff;   /* White background */
```

**WCAG AA Requirements**:
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold): 3:1 contrast ratio

**Action Items**:
1. Test current colors at https://webaim.org/resources/contrastchecker/
2. If failing:
   - Darken `--text-subtle` to at least `#767676` (4.5:1)
   - Darken `--text-muted` to at least `#595959` (7:1) or `#767676` (4.5:1)
3. Update both light and dark mode tokens in `globals.css`

**Files to Update**:
- `src/app/globals.css` (lines 26-33)

---

### 5. Add Focus Indicators
**Status**: ❌ MISSING
**Impact**: Medium-High - Affects keyboard navigation users

**Issue**: No custom focus indicators defined in CSS

**Action Items**:
Add to `src/app/globals.css` (after line 100):

```css
/* Focus indicators for keyboard navigation */
*:focus-visible {
  outline: 2px solid var(--text-primary);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--text-primary);
  outline-offset: 4px;
  border-radius: 4px;
}

input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--text-primary);
  outline-offset: 2px;
}
```

**Files to Update**:
- `src/app/globals.css` (add after base styles)

---

### 6. Add Keyboard Support to Animated Cards
**Status**: ⚠️ INCOMPLETE
**Impact**: Medium - Interactive elements not keyboard accessible

**Current Issue** (`src/components/AnimatedCard.tsx:162-172`):
Cards use `<div>` with click handlers but no keyboard support:

```tsx
<div
  onClick={() => selectedCase === null && onClick()}
  onMouseEnter={...}
  // ❌ No keyboard support - can't Tab to it or activate with Enter/Space
>
```

**Action Items**:
Option 1 - Add role and keyboard handlers:
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => selectedCase === null && onClick()}
  onKeyDown={(e) => {
    if (selectedCase === null && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  }}
  onMouseEnter={...}
  aria-label={`View ${title} case study`}
>
```

Option 2 - Wrap in semantic `<button>`:
```tsx
<button
  onClick={() => selectedCase === null && onClick()}
  onMouseEnter={...}
  aria-label={`View ${title} case study`}
  className="w-full border-0 bg-transparent p-0 cursor-pointer"
>
  {/* existing card content */}
</button>
```

**Files to Update**:
- `src/components/AnimatedCard.tsx` (line 162)

---

## 🔷 Medium Priority (Enhancements)

### 7. Add Reduced Motion Support
**Status**: ❌ MISSING
**Impact**: Medium - Affects users with motion sensitivity

**Issue**: No `prefers-reduced-motion` media query support for GSAP animations

**Action Items**:
Create a utility hook:

```typescript
// src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

Then use in animated components:
```tsx
const prefersReducedMotion = useReducedMotion();

useEffect(() => {
  if (!prefersReducedMotion) {
    gsap.to(...); // Only animate if user hasn't opted out
  } else {
    // Apply instant state changes without animation
    gsap.set(...);
  }
}, [prefersReducedMotion]);
```

**Files to Create**:
- `src/hooks/useReducedMotion.ts` (new file)

**Files to Update**:
- `src/components/AnimatedCard.tsx`
- `src/app/page.tsx`
- `src/components/HeroTextAnimation.tsx`
- `src/components/MagneticButton.tsx`

---

### 8. Add "Skip to Main Content" Link
**Status**: ❌ MISSING
**Impact**: Medium - Improves keyboard navigation UX

**Issue**: No skip link for keyboard users to bypass header navigation

**Action Items**:
Add to `src/app/page.tsx` (line 206, before main content wrapper):

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md"
>
  Skip to main content
</a>

<div className="min-h-screen w-full relative overflow-x-hidden">
  <div ref={mainWrapperRef} className="...">
    <main id="main-content" className="flex-1 w-full flex flex-col">
      {/* existing content */}
    </main>
  </div>
</div>
```

Add to `src/app/globals.css`:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Files to Update**:
- `src/app/page.tsx` (line 206)
- `src/app/globals.css` (add utility classes)

---

### 9. Improve Modal Accessibility
**Status**: ⚠️ INCOMPLETE
**Impact**: Medium - Modal not fully screen reader accessible

**Current Issues** (`src/components/CaseStudyModal.tsx`):
- Missing `role="dialog"` and `aria-modal="true"`
- No focus trapping
- May not announce properly to screen readers

**Action Items**:
Install focus-trap-react:
```bash
npm install focus-trap-react
```

Update modal component:
```tsx
import FocusTrap from 'focus-trap-react';

export function CaseStudyModal({ caseStudy, onClose, ... }) {
  const titleId = useId();

  return (
    <FocusTrap>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // ... existing props
      >
        {/* Modal content */}
        <h1 id={titleId}>{caseStudy.title}</h1>

        <button
          onClick={onClose}
          aria-label="Close case study"
        >
          {/* Close icon */}
        </button>
      </motion.div>
    </FocusTrap>
  );
}
```

**Files to Update**:
- `src/components/CaseStudyModal.tsx`
- `package.json` (add dependency)

---

### 10. Add Apple Touch Icon
**Status**: ❌ MISSING
**Impact**: Low-Medium - Affects iOS home screen bookmarks

**Action Items**:
```bash
# Create 180×180px PNG for iOS devices
# Save as: src/app/apple-icon.png
```

Then update metadata in `layout.tsx` (covered in #3).

---

## ✅ Accessibility Strengths (Already Implemented)

### Image Alt Text - EXCELLENT ✅
All images have proper, descriptive alt text:
- Case study cards use dynamic `alt={title}`
- About section photo: `alt="Hridae at Valve Software"`
- Gallery images: `alt={item.caption}`
- LinkedIn icon: `alt="LinkedIn"`
- All case study images have context-appropriate alt text

**Verified Files**:
- `src/app/page.tsx:251`
- `src/components/AnimatedCard.tsx:202`
- `src/components/AboutMeSection.tsx:48, 197`
- `src/components/InspirationsGallery.tsx:70`

---

### ARIA Labels - GOOD ✅
Interactive elements have appropriate ARIA labels:
- All icon buttons use `aria-label={label}`
- Decorative elements use `aria-hidden="true"`
- No buttons missing labels

**Verified Files**:
- `src/components/IconButton.tsx:48`
- `src/components/AnimatedCard.tsx:209`

---

### Semantic HTML - EXCELLENT ✅
Proper semantic structure throughout:
- `<html lang="en">` attribute set
- Proper use of `<main>`, `<section>`, `<footer>`, `<header>`
- Correct heading hierarchy (`<h1>`, `<h2>`, `<h3>`)
- Lists use `<ul>` and `<li>` elements
- Native form elements (`<button>`, `<a>`, `<input>`)

**Verified Files**:
- `src/app/layout.tsx:35`
- All component files

---

### Form Accessibility - GOOD ✅
Forms have proper attributes:
- Input has `placeholder`, `autoComplete`, `spellCheck`
- Keyboard handling implemented (Enter key)

**Verified Files**:
- `src/components/CheatCodeInput.tsx:27-35`

---

### Image Optimization - EXCELLENT ✅
- Next.js `<Image>` component used throughout
- Native lazy loading: `loading="lazy"`
- Proper `sizes` attribute for responsive images
- All 191 images present in `public/assets/`

**Verified Directories**:
- ✅ `/images/` - 5 images
- ✅ `/assets/aboutme.png`
- ✅ `/assets/cheat-codes/` - Easter egg assets
- ✅ `/assets/domis/` - Case study images
- ✅ `/assets/ideas/` - 11 whiteboard sketches
- ✅ `/assets/inspirations/` - 13 gallery images
- ✅ `/assets/memory-care/` - 18+ case study images
- ✅ `/assets/obscura/` - 30+ images & videos
- ✅ `/assets/sides/` - 14 side project images
- ✅ `/assets/virdio/` - Case study images

**No broken image references found.**

---

## 🎯 Implementation Checklist

### Before Launch (Critical)
- [ ] Create and add `public/favicon.ico` (32×32px)
- [ ] Create and add `src/app/opengraph-image.png` (1200×630px)
- [ ] Update metadata in `src/app/layout.tsx` with Open Graph tags
- [ ] Test color contrast and fix if needed
- [ ] Add focus indicators to `globals.css`
- [ ] Add keyboard support to `AnimatedCard` component

### Week 1 (High Priority)
- [ ] Create `useReducedMotion` hook
- [ ] Add reduced motion support to animated components
- [ ] Add "Skip to main content" link
- [ ] Improve modal accessibility with focus trap
- [ ] Create and add `src/app/apple-icon.png` (180×180px)

### Week 2+ (Nice to Have)
- [ ] Add structured data (JSON-LD) for SEO
- [ ] Create `manifest.json` for PWA support
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Run Lighthouse accessibility audit
- [ ] Test keyboard navigation on all pages

---

## 📊 Audit Methodology

### Tools & Techniques Used:
1. ✅ Manual code review of all TSX/TS files
2. ✅ Image reference verification (191 files checked)
3. ✅ ARIA attributes inspection
4. ✅ Semantic HTML structure review
5. ✅ Keyboard navigation testing (code-level)
6. ✅ Metadata configuration review
7. ⚠️ Color contrast analysis (manual testing recommended)

### Not Tested (Recommend Manual Testing):
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast with actual color picker
- [ ] Keyboard navigation in browser
- [ ] Touch target sizes on mobile
- [ ] Zoom to 200% (text reflow)

---

## 🔗 Resources

### Testing Tools:
- **Color Contrast**: https://webaim.org/resources/contrastchecker/
- **Lighthouse**: Chrome DevTools > Lighthouse > Accessibility
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE**: https://wave.webaim.org/
- **NVDA Screen Reader**: https://www.nvaccess.org/

### Guidelines:
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Next.js Metadata**: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- **Open Graph Protocol**: https://ogp.me/

---

## 📝 Notes

1. **No code was pushed** as requested - this is an audit-only report
2. All image assets are present and accounted for
3. The project has a strong accessibility foundation
4. Main gaps are metadata/social images and keyboard navigation
5. Consider running automated tools (Lighthouse, axe) for additional insights

---

**Audit Completed**: February 15, 2026
**Auditor**: Claude Code
**Next Review**: After implementing critical fixes
