"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";

interface IconButtonProps {
  children: React.ReactNode;
  label?: string;
  onClick?: () => void;
  isDark?: boolean;
  href?: string;
}

export function IconButton({ children, label, onClick, isDark, href }: IconButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleHover = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1.1, duration: 0.25, ease: "back.out(1.7)" });
    }
  }, []);

  const handleLeave = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, { scale: 1, duration: 0.25, ease: "power2.out" });
    }
  }, []);

  const handleTap = useCallback(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(ref.current, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
        },
      });
    }
  }, []);

  const button = (
    <button
      ref={ref}
      className={`${
        isDark ? "bg-[#2a2a2a] hover:bg-[#3a3a3a]" : "bg-[#f1f1f1] hover:bg-[#e5e5e5]"
      } flex items-center justify-center p-[10px] rounded-[18px] w-[36px] h-[36px] transition-colors`}
      aria-label={label}
      onClick={() => {
        handleTap();
        onClick?.();
      }}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      {children}
    </button>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {button}
      </a>
    );
  }

  return button;
}
