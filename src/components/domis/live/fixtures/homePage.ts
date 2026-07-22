/**
 * Domis Home / Tasks tab fixture.
 *
 * Screen capture: `/assets/home/domis-home-screen.png`
 * Flutter: `HomePage` in local `vendor/mobile-app-design-combined`
 * (design/fab-create-menu + ios-sheet-backdrop + task-card-visuals + tasks-edge-fade).
 */

export const HOME_PAGE_SHOT = "/assets/home/domis-home-screen.png" as const;

export const HOME_PAGE = {
  shot: HOME_PAGE_SHOT,
  /** Flutter tab index 0 — commented as Tasks content in app_widget_tree */
  tabLabel: "Home / Tasks tab",
} as const;
