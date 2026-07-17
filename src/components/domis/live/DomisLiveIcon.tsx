import {
  Bed,
  Calendar,
  ChevronRight,
  CircleHelp,
  Droplet,
  Fan,
  FileText,
  FlashlightOff,
  Globe,
  Hammer,
  ImagePlus,
  MapPin,
  PenTool,
  Plus,
  QrCode,
  Refrigerator,
  Ruler,
  ScanLine,
  ShowerHead,
  Star,
  StickyNote,
  Store,
  Tag,
  ThumbsUp,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Material Symbols ligature name → Lucide (keeps fixture/icon string APIs stable). */
const ICONS: Record<string, LucideIcon> = {
  star: Star,
  recommend: ThumbsUp,
  location_on: MapPin,
  storefront: Store,
  tag: Tag,
  qr_code_2: QrCode,
  water_drop: Droplet,
  description: FileText,
  language: Globe,
  build: Wrench,
  chevron_right: ChevronRight,
  kitchen: Refrigerator,
  bolt: Zap,
  mode_fan: Fan,
  calendar_today: Calendar,
  document_scanner: ScanLine,
  add_photo_alternate: ImagePlus,
  add: Plus,
  close: X,
  flash_off: FlashlightOff,
  help: CircleHelp,
  design_services: PenTool,
  square_foot: Ruler,
  bed: Bed,
  shower: ShowerHead,
  home_repair_service: Hammer,
  notes: StickyNote,
};

export type DomisLiveIconProps = {
  /** Material Symbols Rounded ligature name (mapped to Lucide). */
  name: string;
  size?: number;
  color?: string;
  className?: string;
};

/** Inline SVG icon — no Material Symbols webfont / ligatures. */
export function DomisLiveIcon({
  name,
  size = 20,
  color = "currentColor",
  className,
}: DomisLiveIconProps) {
  const Icon = ICONS[name] ?? FileText;
  return (
    <Icon
      className={["domis-live-icon", className].filter(Boolean).join(" ")}
      size={size}
      color={color}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}
