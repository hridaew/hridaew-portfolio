"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { ImageProps } from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { CopyEmailPill } from "@/components/shared/CopyEmailPill";
import {
  buildButterChickenRecipeShareUrl,
  downloadButterChickenRecipePdf,
} from "@/lib/butterChickenRecipePdf";
import { cn } from "@/lib/utils";

/** Same spine as `HOME_COLUMN` but slightly tighter side gutters inside the modal sheet. */
const RECIPE_MODAL_COLUMN =
  "mx-auto w-full min-w-0 max-w-[800px] px-4 md:px-[88px]" as const;

/* ── asset paths ────────────────────────────────────────────────── */

const IMG = {
  hero: "/assets/butter-chicken/hero.jpg",
  ref1: "/assets/butter-chicken/reference/moti-mahal-1.jpg",
  ref2: "/assets/butter-chicken/reference/moti-mahal-2.jpg",
} as const;

const STEP_IMG = {
  marinate: "/assets/butter-chicken/steps/marinate.jpg",
  char: "/assets/butter-chicken/steps/char.jpg",
  sauceGenerous: "/assets/butter-chicken/steps/sauce-generous.jpg",
  sauceColor: "/assets/butter-chicken/steps/sauce-color.jpg",
  final1: "/assets/butter-chicken/steps/final-1.jpg",
  final2: "/assets/butter-chicken/steps/final-2.jpg",
} as const;

/** Soft fade / settle once `next/image` finishes decoding (avoids harsh pop-in). */
function RecipeImageFade({
  frame,
  className,
  onLoadingComplete,
  ...rest
}: ImageProps & { frame: "fill" | "inline" }) {
  const reduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);

  const frameClass =
    frame === "fill" ? "absolute inset-0 overflow-hidden" : "relative inline-block max-w-full";

  if (reduceMotion) {
    return (
      <div className={frameClass}>
        <Image {...rest} className={className} onLoadingComplete={onLoadingComplete} />
      </div>
    );
  }

  return (
    <motion.div
      className={frameClass}
      initial={{ opacity: 0.06, y: frame === "fill" ? 6 : 4 }}
      animate={{ opacity: loaded ? 1 : 0.06, y: loaded ? 0 : frame === "fill" ? 6 : 4 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        {...rest}
        className={className}
        onLoadingComplete={(e) => {
          setLoaded(true);
          onLoadingComplete?.(e);
        }}
      />
    </motion.div>
  );
}

const ING = {
  chicken: "/assets/butter-chicken/ingredients/chicken.jpg",
  chiliPowder: "/assets/butter-chicken/ingredients/chili-powder.jpg",
  garamMasala: "/assets/butter-chicken/ingredients/garam-masala.jpg",
  oil: "/assets/butter-chicken/ingredients/oil.jpg",
  yogurt: "/assets/butter-chicken/ingredients/yogurt.jpg",
  lemon: "/assets/butter-chicken/ingredients/lemon.jpg",
  fenugreek: "/assets/butter-chicken/ingredients/fenugreek.jpg",
  salt: "/assets/butter-chicken/ingredients/salt.jpg",
  gingerGarlic: "/assets/butter-chicken/ingredients/ginger-garlic.jpg",
  blackSalt: "/assets/butter-chicken/ingredients/black-salt.jpg",
  tomatoes: "/assets/butter-chicken/ingredients/tomatoes.jpg",
  butter: "/assets/butter-chicken/ingredients/butter.jpg",
  cream: "/assets/butter-chicken/ingredients/cream.jpg",
  sugar: "/assets/butter-chicken/ingredients/sugar.jpg",
  greenChili: "/assets/butter-chicken/ingredients/green-chili.jpg",
} as const;

/* ── ingredient row ─────────────────────────────────────────────── */

function IngredientRow({
  icon,
  name,
  amount,
  note,
}: {
  icon: string;
  name: string;
  amount: string;
  note?: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center gap-3 px-4 py-2.5">
        <div className="relative size-8 shrink-0">
          <RecipeImageFade
            frame="fill"
            alt=""
            src={icon}
            fill
            sizes="32px"
            quality={65}
            className="pointer-events-none object-cover"
            draggable={false}
          />
        </div>
        <p className="min-w-0 flex-1 truncate font-[family-name:var(--font-geist)] text-[15px] font-normal leading-[1.4] text-white/80">
          {name}
        </p>
        <p className="shrink-0 font-[family-name:var(--font-geist-mono)] text-sm font-normal leading-[1.4] text-white/50">
          {amount}
        </p>
      </div>
      {note && (
        <p className="px-4 pb-1 text-right font-[family-name:var(--font-geist-mono)] text-[11px] font-normal leading-[1.4] text-white/40 italic">
          {note}
        </p>
      )}
    </div>
  );
}

function IngredientDivider() {
  return <div className="mx-4 h-px bg-white/[0.06]" />;
}

function IngredientCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
        {label}
      </p>
      <div className="relative flex w-full flex-col rounded-xl bg-white/[0.02] py-1.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-white/[0.08]"
        />
        {children}
      </div>
    </div>
  );
}

/* ── instruction primitives ─────────────────────────────────────── */

function StepBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-[22px] items-center rounded-full border border-white/15 bg-white/[0.04] px-2.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}

function Instruction({
  n,
  children,
  sub,
}: {
  n: number;
  children: React.ReactNode;
  sub?: boolean;
}) {
  if (sub) {
    return (
      <div className="flex items-start gap-2.5 pl-9">
        <span className="mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-geist-mono)] text-[9px] text-white/30">
          {n}
        </span>
        <p className="min-w-0 flex-1 font-[family-name:var(--font-geist)] text-sm leading-[1.5] text-white/60">
          {children}
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <span className="mt-[2px] flex size-6 shrink-0 items-center justify-center rounded-full border border-white/15 font-[family-name:var(--font-geist-mono)] text-[11px] text-white/50">
        {n}
      </span>
      <p className="min-w-0 flex-1 font-[family-name:var(--font-geist)] text-base leading-[1.5] text-white/80">
        {children}
      </p>
    </div>
  );
}

/* ── step side image (thumbnail + portal lightbox above recipe modal z-200) ─ */

const RECIPE_STEP_LIGHTBOX_Z_BACK = "z-[220]";
const RECIPE_STEP_LIGHTBOX_Z_FRONT = "z-[221]";

function StepImage({
  src,
  caption,
  aspect = "square",
  objectPosition,
}: {
  src: string;
  caption?: string;
  aspect?: "square" | "tall";
  objectPosition?: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const t = window.requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(t);
    };
  }, [lightboxOpen, close]);

  const enlargeLabel = caption ? `View larger: ${caption}` : "View step photo larger";
  const imgAlt = caption || "Recipe step photo";

  const portal =
    portalReady &&
    createPortal(
      <AnimatePresence>
        {lightboxOpen ? (
          <>
            <motion.div
              key="recipe-step-lb-back"
              role="presentation"
              className={cn("fixed inset-0 bg-black/70 backdrop-blur-2xl", RECIPE_STEP_LIGHTBOX_Z_BACK)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={close}
            />
            <motion.div
              key="recipe-step-lb-front"
              role="dialog"
              aria-modal="true"
              aria-label={imgAlt}
              className={cn(
                "fixed inset-0 flex cursor-zoom-out items-center justify-center p-4 outline-none focus-visible:outline-none sm:p-6 md:p-10 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(1rem,env(safe-area-inset-top))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))]",
                RECIPE_STEP_LIGHTBOX_Z_FRONT,
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={close}
            >
              <div
                className="flex max-h-full max-w-full cursor-default flex-col items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <RecipeImageFade
                  frame="inline"
                  src={src}
                  alt={imgAlt}
                  width={1680}
                  height={1260}
                  quality={72}
                  sizes="(max-width: 768px) 96vw, min(96vw, 1680px)"
                  className="m-0 block h-auto max-h-[min(82dvh,82vh)] w-auto max-w-[min(96vw,1680px)] border-0 object-contain p-0 shadow-none outline-none ring-0"
                  style={objectPosition ? { objectPosition } : undefined}
                  draggable={false}
                  decoding="async"
                />
                {caption ? (
                  <p className="max-w-[min(96vw,40rem)] text-center font-[family-name:var(--font-geist-mono)] text-xs leading-snug text-white/70">
                    {caption}
                  </p>
                ) : null}
              </div>
              <motion.button
                ref={closeBtnRef}
                type="button"
                className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] right-[max(1rem,calc(env(safe-area-inset-right)+0.5rem))] flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.08 }}
                whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.92 }}
                onClick={close}
                aria-label="Close enlarged photo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6L18 18" />
                </svg>
              </motion.button>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <div className="flex w-[112px] shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={cn(
            "relative w-full shrink-0 cursor-zoom-in overflow-hidden rounded text-left outline-none transition-[opacity,transform] duration-150 ease-out hover:opacity-95 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/50",
            aspect === "tall" ? "h-[128px]" : "h-[112px]",
          )}
          aria-label={enlargeLabel}
        >
          <RecipeImageFade
            frame="fill"
            alt=""
            src={src}
            fill
            sizes="112px"
            quality={68}
            className="pointer-events-none object-cover"
            style={objectPosition ? { objectPosition } : undefined}
            draggable={false}
          />
        </button>
        {caption && (
          <p className="w-full font-[family-name:var(--font-geist-mono)] text-xs font-normal leading-[1.4] text-white/70 text-right">
            {caption}
          </p>
        )}
      </div>
      {portal}
    </>
  );
}

/* ── main body ──────────────────────────────────────────────────── */

/** Hero `ExpandToggle` chrome: `rounded-full bg-white/[0.03]` + hover/active. */
const RECIPE_CHROME_ICON_BTN =
  "relative size-8 shrink-0 cursor-pointer rounded-full bg-white/[0.03] transition-colors duration-75 ease-out hover:bg-white/[0.08] active:bg-white/[0.16] disabled:pointer-events-none disabled:opacity-40" as const;

function ButterChickenRecipeTitleActions() {
  const [pdfBusy, setPdfBusy] = useState(false);

  const onShare = useCallback(async () => {
    const url = buildButterChickenRecipeShareUrl();
    if (!url) {
      toast.error("Could not build link");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }, []);

  const onDownloadPdf = useCallback(async () => {
    setPdfBusy(true);
    try {
      await downloadButterChickenRecipePdf();
    } catch {
      toast.error("Could not create PDF");
    } finally {
      setPdfBusy(false);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={cn(RECIPE_CHROME_ICON_BTN)}
        aria-busy={pdfBusy}
        aria-label={pdfBusy ? "Generating PDF" : "Download recipe as PDF"}
        disabled={pdfBusy}
        onClick={onDownloadPdf}
      >
        <Download
          className="pointer-events-none absolute left-1/2 top-1/2 size-[15px] -translate-x-1/2 -translate-y-1/2 text-white/80"
          strokeWidth={2}
          aria-hidden
        />
      </button>
      <button
        type="button"
        className={cn(RECIPE_CHROME_ICON_BTN)}
        aria-label="Copy link to this recipe"
        onClick={onShare}
      >
        <Share2
          className="pointer-events-none absolute left-1/2 top-1/2 size-[15px] -translate-x-1/2 -translate-y-1/2 text-white/80"
          strokeWidth={2}
          aria-hidden
        />
      </button>
    </div>
  );
}

export const ButterChickenRecipeCloseButton = forwardRef<
  HTMLButtonElement,
  { onClose: () => void; className?: string }
>(function ButterChickenRecipeCloseButton({ onClose, className }, ref) {
  const localRef = useRef<HTMLButtonElement | null>(null);

  const setButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as { current: HTMLButtonElement | null }).current = node;
      }
    },
    [ref],
  );

  const handleClick = useCallback(() => {
    const el = localRef.current;
    if (el) {
      el.style.display = "none";
    }
    onClose();
  }, [onClose]);

  return (
    <button
      ref={setButtonRef}
      type="button"
      aria-label="Close recipe"
      onClick={handleClick}
      className={cn(
        "group relative size-8 shrink-0 cursor-pointer rounded-full bg-white/[0.03]",
        "transition-colors duration-75 ease-out hover:bg-white/[0.08] active:bg-white/[0.16]",
        "motion-reduce:transition-none",
        className,
      )}
    >
      <svg
        className="pointer-events-none absolute inset-0 block size-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 32 32"
        aria-hidden
      >
        <circle cx="16" cy="16" fill="white" fillOpacity="0.03" r="16" />
        <path
          d="M12 12l8 8m0-8l-8 8"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-white/80 transition-none group-active:stroke-white/35 motion-reduce:transition-none"
          style={{ mixBlendMode: "screen" }}
        />
      </svg>
    </button>
  );
});

export function ButterChickenRecipeBody() {
  return (
    <div className={cn(RECIPE_MODAL_COLUMN, "flex flex-col gap-12 pt-16 pb-6 md:pt-24 md:pb-8")}>
      <div className="flex w-full flex-col gap-3">
        <h3
          id="butter-chicken-modal-title"
          className="w-full min-w-0 font-[family-name:var(--font-geist)] text-[40px] font-bold leading-normal text-white/80"
        >
          Butter Chicken Recipe
        </h3>
        <ButterChickenRecipeTitleActions />
      </div>

      {/* Hero image */}
      <div className="flex items-start">
        <div className="relative size-[266px] shrink-0 overflow-hidden rounded-xl shadow-[0px_4px_24px_6px_rgba(182,60,23,0.15)]">
          <RecipeImageFade
            frame="fill"
            alt="Butter chicken"
            src={IMG.hero}
            fill
            priority
            sizes="266px"
            quality={75}
            className="pointer-events-none object-cover"
            draggable={false}
          />
        </div>
      </div>

      {/* Intro */}
      <p className="font-[family-name:var(--font-geist)] text-base font-normal leading-[1.4] text-white/80">
        {`A few people have asked me for my Butter Chicken Recipe and I don't know where else to put it, so why not here.`}
      </p>

      {/* Reference photos */}
      <div className="flex w-full gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="relative h-[168px] w-full overflow-hidden rounded-lg">
            <RecipeImageFade
              frame="fill"
              alt=""
              src={IMG.ref1}
              fill
              sizes="(max-width: 768px) 45vw, 400px"
              quality={72}
              className="pointer-events-none object-cover"
              draggable={false}
            />
          </div>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs font-normal leading-[1.4] text-white/60">
            This is the benchmark, from the original Moti Mahal in Delhi.
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="relative h-[168px] w-full overflow-hidden rounded-lg">
            <RecipeImageFade
              frame="fill"
              alt=""
              src={IMG.ref2}
              fill
              sizes="(max-width: 768px) 45vw, 400px"
              quality={72}
              className="pointer-events-none object-cover"
              draggable={false}
            />
          </div>
          <p className="font-[family-name:var(--font-geist-mono)] text-xs font-normal leading-[1.4] text-white/60">
            I had the opportunity to go in the back and watch the bossman make it.
          </p>
        </div>
      </div>

      {/* Second intro paragraph */}
      <p className="font-[family-name:var(--font-geist)] text-base font-normal leading-[1.4] text-white/80">
        {`Before you read the ingredients, note that this is a vibes-based recipe: the ingredients are correct, but the amounts may vary. Increase the Kashmiri red chili powder if you want more heat, and if anything doesn't taste right, it's usually salt or butter. The key insight I've learned on my butter chicken journey is that the taste scales linearly with how much butter you put in it.`}
      </p>

      <p className="font-[family-name:var(--font-geist)] text-base font-normal leading-[1.4] text-white/80">
        Email me a photo if you make this, please:{" "}
        <CopyEmailPill />
      </p>

      {/* ─── Ingredients ─────────────────────────────────────────── */}
      <div className="flex w-full flex-col gap-6">
        <h4 className="font-[family-name:var(--font-geist)] text-2xl font-bold leading-normal text-white/80">
          Ingredients
        </h4>

        <IngredientCard label="Chicken Marinade">
          <IngredientRow icon={ING.chicken} name="Chicken, thighs ideally." amount="2 lb" />
          <IngredientDivider />
          <IngredientRow icon={ING.chiliPowder} name="Kashmiri Chili Powder" amount="3 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.garamMasala} name="Garam Masala" amount="1 1/2 tsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.oil} name="Oil, mustard ideally." amount="2 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.yogurt} name="Greek Yogurt" amount="3/4 cup" />
          <IngredientDivider />
          <IngredientRow icon={ING.lemon} name="Lemon Juice" amount="2 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.fenugreek} name="Fenugreek Leaves" amount="1 tsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.salt} name="Salt" amount="2 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.gingerGarlic} name="Ginger+Garlic Paste" amount="3 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.blackSalt} name="Black Salt" amount="1 tsp" />
        </IngredientCard>

        <IngredientCard label="Butter Chicken Sauce">
          <IngredientRow icon={ING.chiliPowder} name="Kashmiri Chili Powder" amount="2 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.tomatoes} name="Pureed Tomatoes" amount="2 lb" />
          <IngredientDivider />
          <IngredientRow
            icon={ING.butter}
            name="Butter"
            amount="3/4 cup"
            note="I did 1 1/2 cups once and it was amazing"
          />
          <IngredientDivider />
          <IngredientRow icon={ING.cream} name="Heavy Cream" amount="1 cup + 1/4 garnish" />
          <IngredientDivider />
          <IngredientRow icon={ING.salt} name="Salt" amount="to taste" />
          <IngredientDivider />
          <IngredientRow icon={ING.sugar} name="Sugar" amount="2 tbsp" />
          <IngredientDivider />
          <IngredientRow icon={ING.greenChili} name="Thai Green Chilies (no seeds)" amount="5" />
          <IngredientDivider />
          <IngredientRow icon={ING.gingerGarlic} name="Ginger Garlic Paste" amount="1 tbsp" />
        </IngredientCard>
      </div>

      {/* ─── Instructions ────────────────────────────────────────── */}
      <div className="flex w-full flex-col gap-10">
        <h4 className="font-[family-name:var(--font-geist)] text-2xl font-bold leading-normal text-white/80">
          Instructions
        </h4>

        {/* Step 1 */}
        <div className="flex w-full flex-col gap-5">
          <StepBadge label="Step 1 — Marinate & Cook" />
          <div className="flex w-full gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Instruction n={1}>
                Cut the chicken into ~1 inch pieces, make sure the chicken is dry
              </Instruction>
              <Instruction n={2}>
                Mix all the marinade ingredients in a bowl with the chicken
              </Instruction>
              <Instruction n={3}>
                Cover and leave it in the fridge for at least 3 hours
              </Instruction>
              <Instruction n={4}>
                Prepare the oven, Air Fryer recommended
              </Instruction>
              <Instruction n={1} sub>
                Preheat to 400f, enable convection if using an oven
              </Instruction>
              <Instruction n={2} sub>
                Skewer the chicken with wooden sticks, or plop them in
              </Instruction>
              <Instruction n={5}>
                Cook for 16 minutes (thighs), 14 minutes (breast). They should
                have some charred ends
              </Instruction>
              <Instruction n={6}>
                To make it even better, shred the chicken after its cooked
              </Instruction>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-4">
              <StepImage src={STEP_IMG.marinate} caption="Ignore that this chicken isn't cut" />
              <StepImage src={STEP_IMG.char} caption="See the char" />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex w-full flex-col gap-5">
          <StepBadge label="Step 2 — The Sauce" />
          <div className="flex w-full items-start gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Instruction n={1}>
                In a large pan, add some butter, and Thai Green Chilies.
              </Instruction>
              <Instruction n={2}>
                Add pureed tomatoes with the Kashmiri Chili Powder, ginger garlic
                paste, salt, and sugar.
              </Instruction>
              <Instruction n={3}>
                Cook on low until its deep red and slightly thickened
              </Instruction>
              <Instruction n={4}>
                Add cooked chicken, butter, and cream, mix
              </Instruction>
              <Instruction n={5}>
                Taste for salt, spice, sugar. If it doesn&apos;t taste right —
                adjust salt and butter
              </Instruction>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-4">
              <StepImage src={STEP_IMG.sauceGenerous} caption="Be generous" aspect="tall" />
              <StepImage src={STEP_IMG.sauceColor} caption="Color reference" aspect="tall" objectPosition="bottom" />
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex w-full flex-col gap-5">
          <StepBadge label="Step 3 — Finish" />
          <div className="flex w-full gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Instruction n={1}>Once it tastes right, plate it</Instruction>
              <Instruction n={2}>Garnish with more butter</Instruction>
              <Instruction n={3}>Perhaps a little more butter</Instruction>
              <Instruction n={4}>Tiny swirl of cream</Instruction>
              <Instruction n={5}>A bit of coriander</Instruction>
              <Instruction n={6}>Eat with Naan or Rice, not both</Instruction>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-4">
              <StepImage src={STEP_IMG.final1} aspect="tall" />
              <StepImage src={STEP_IMG.final2} aspect="tall" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
