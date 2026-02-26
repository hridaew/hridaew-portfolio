export interface AssetLayer {
  src: string;
  alt: string;
  width: number;
  height: number;
  marginLeft: number;  // grid offset (0 for front/straight image)
  marginTop: number;   // grid offset (0 for front/straight image)
  rotation: number;    // degrees (0 for straight, 3.16 for tilted)
  isFront: boolean;    // true = rendered second (on top)
  borderRadius: number; // 12 default, 6 for MCES dashboard, 0 for cat cutout
  hasBorder: boolean;  // false for cat cutout
  hoverOffsetX: number;
  hoverOffsetY: number;
  hoverRotation: number;
}

export interface GridProjectData {
  slug: string;
  title: string;
  role: string;
  description: string;
  timeline: string;
  accentColor: string;
  isActive: boolean;
  href: string;
  assets: AssetLayer[];
}
