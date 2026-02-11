interface EditorialLayoutProps {
  children: React.ReactNode;
  width?: "text" | "breakout" | "full";
}

const widthClasses = {
  text: "max-w-[680px]",
  breakout: "max-w-[920px]",
  full: "max-w-full",
} as const;

export function EditorialLayout({ children, width = "text" }: EditorialLayoutProps) {
  return (
    <div className={`mx-auto w-full ${widthClasses[width]} px-6 md:px-0`}>
      {children}
    </div>
  );
}
