/**
 * Address intelligence demo fixture.
 * Copy matches DomisCaseStudyBody address section — edit here, not in UI.
 */

export type AddressProfileFieldKey =
  | "property"
  | "yearBuilt"
  | "squareFootage"
  | "bedrooms"
  | "bathrooms"
  | "roof"
  | "heating"
  | "lotSize";

export type AddressProfileField = {
  key: AddressProfileFieldKey;
  /** Row label as shown in the case study / create-home UI */
  label: string;
  /** Display string for the filled value (or empty when user must add) */
  display: string;
  /** Numeric value when useful for animation / enrichment stubs */
  value?: number;
  /** True when the page shows a muted "Add" placeholder */
  empty?: boolean;
};

/** Typed into the search field during the create-home enrich demo */
export const ADDRESS_TYPED = "2140 Fillmore St";

/** Optional fuller line if a demo needs city/state context */
export const ADDRESS_FULL = "2140 Fillmore St, San Francisco, CA";

/** Local assets for map → avatar conversion demos (zero network) */
export const ADDRESS_ASSETS = {
  /** Satellite / map thumb used as the "before" home photo */
  mapThumb: "/assets/domis/live/property-map-thumb.png",
  /** Web Homes silhouette placeholder */
  emptySilhouette: "/assets/domis/live/empty-home-silhouette.png",
  /** Generated-looking home avatar from Lab Homes UI */
  homeAvatar: "/assets/domis/live/home-avatar.png",
  /** Mobile 3D home avatar icon */
  homeAvatar3d: "/assets/domis/live/home-avatar-3d.png",
} as const;

/**
 * Profile rows returned after enrich — order matches the case study mock.
 * Lot size stays empty ("Add") like the page.
 */
export const ADDRESS_PROFILE_FIELDS: readonly AddressProfileField[] = [
  {
    key: "property",
    label: "Property",
    display: "Single family",
  },
  {
    key: "yearBuilt",
    label: "Year built",
    display: "1974",
    value: 1974,
  },
  {
    key: "squareFootage",
    label: "Square footage",
    display: "1,840",
    value: 1840,
  },
  {
    key: "bedrooms",
    label: "Bedrooms",
    display: "3",
    value: 3,
  },
  {
    key: "bathrooms",
    label: "Bathrooms",
    display: "2",
    value: 2,
  },
  {
    key: "roof",
    label: "Roof",
    display: "Asphalt shingle",
  },
  {
    key: "heating",
    label: "Heating",
    display: "Forced air, gas",
  },
  {
    key: "lotSize",
    label: "Lot size",
    display: "Add",
    empty: true,
  },
] as const;

/** Flat lookup for enrich stubs (numeric + display) */
export const ADDRESS_PROFILE = {
  address: ADDRESS_TYPED,
  addressFull: ADDRESS_FULL,
  property: "Single family",
  yearBuilt: 1974,
  yearBuiltDisplay: "1974",
  squareFootage: 1840,
  squareFootageDisplay: "1,840",
  bedrooms: 3,
  bedroomsDisplay: "3",
  bathrooms: 2,
  bathroomsDisplay: "2",
  roof: "Asphalt shingle",
  heating: "Forced air, gas",
  lotSizeDisplay: "Add",
  lotSizeEmpty: true,
  assets: ADDRESS_ASSETS,
} as const;
