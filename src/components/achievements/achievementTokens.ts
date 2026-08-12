/**
 * Xbox 360 achievement toast design tokens.
 * Geometry is 720p design size (maps 1:1 to CSS px). Timings from reference clip.
 */

/** Surface (also mirrored as CSS vars `--ach-*` in globals.css) */
export const ACH_PILL_FILL = "#F7F7F7";
export const ACH_PILL_TEXT = "#1a1a1a";
export const ACH_PILL_OUTLINE = "#FFFFFF";
export const ACH_PILL_RIM = "#FFFFFF";
export const ACH_PILL_GLOW =
  "0 0 0 1px #FFFFFF, 0 2px 14px rgba(0,0,0,0.18), inset 0 -1px 0 rgba(0,0,0,0.06)";
/** Glyph stays light — sits on the dark chrome sphere, not the light pill. */
export const ACH_GLYPH_COLOR = "#f6f6f6";

export const ACH_ORB_SIZE_PX = 57;
export const ACH_PILL_HEIGHT_PX = 64;
export const ACH_BOTTOM_OFFSET_PX = 67;
export const ACH_Z_INDEX = 240;

export const ACH_ARC_GREEN = "#bcff46";
export const ACH_RING_MUTED = "#8a8a8a";
export const ACH_RING_BG = "#6a6a6a";
export const ACH_RING_NOTCH = "#5a5a5a";
export const ACH_RING_STROKE = 4.2;
export const ACH_RING_RADIUS = 26;
export const ACH_SPHERE_RADIUS = 18;

/** Site mark on the chrome sphere (copied from app favicon). */
export const ACH_SITE_MARK_SRC = "/assets/achievements/site-mark.png";

/** Entrance / hold / exit (toast shell) */
export const ACH_ENTER_ORB_MS = 130;
export const ACH_ENTER_GROW_MS = 270;
export const ACH_ENTER_TEXT_DELAY_MS = 270;
export const ACH_ENTER_TEXT_MS = 200;
export const ACH_HOLD_MS = 5250;
export const ACH_EXIT_TEXT_MS = 65;
export const ACH_EXIT_MS = 300;
export const ACH_QUEUE_GAP_MS = 250;

/** Inner disc flip while holding */
export const ACH_FLIP_HOLD_MS = 1000;
export const ACH_FLIP_OUT_MS = 115;
export const ACH_FLIP_IN_MS = 100;

export const ACH_GLYPH_SIZE = 26;
export const ACH_TEXT_SIZE_PX = 13;
