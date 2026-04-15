interface EditorialLayoutProps {
  children: React.ReactNode;
  /** Kept for API compatibility; parent should use {@link SITE_COLUMN} from `@/components/home/homeGrid`. */
  width?: "text" | "breakout" | "full";
}

export function EditorialLayout({ children }: EditorialLayoutProps) {
  return <div className="mx-auto w-full min-w-0 max-w-full px-0">{children}</div>;
}
