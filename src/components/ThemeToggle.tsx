"use client";

import { IconButton } from "./IconButton";

// Half-moon SVG path (from legacy svgPaths.p7818c00)
const moonPath =
  "M6.4 14.4C6.014 14.4 5.62794 14.3611 5.24183 14.2833C4.85583 14.2056 4.48633 14.0889 4.13333 13.9333C4.02222 13.8778 3.93333 13.8014 3.86667 13.7042C3.8 13.6069 3.76667 13.5 3.76667 13.3833C3.76667 13.293 3.78611 13.2077 3.825 13.1275C3.86389 13.0472 3.92222 12.9769 4 12.9167C4.75556 12.3167 5.34444 11.5889 5.76667 10.7333C6.18889 9.87778 6.4 8.96667 6.4 8C6.4 7.03333 6.18333 6.125 5.75 5.275C5.31667 4.425 4.72778 3.69444 3.98333 3.08333C3.91589 3.02289 3.86294 2.95233 3.8245 2.87167C3.78594 2.79111 3.76667 2.70544 3.76667 2.61467C3.76667 2.49378 3.8 2.38611 3.86667 2.29167C3.93333 2.19722 4.025 2.12222 4.14167 2.06667C4.49167 1.91111 4.85928 1.79444 5.2445 1.71667C5.62961 1.63889 6.01478 1.6 6.4 1.6C7.28889 1.6 8.11944 1.76667 8.89167 2.1C9.66389 2.43333 10.3417 2.89167 10.925 3.475C11.5083 4.05833 11.9667 4.73733 12.3 5.512C12.6333 6.28678 12.8 7.11456 12.8 7.99533C12.8 8.87622 12.6333 9.70556 12.3 10.4833C11.9667 11.2611 11.5083 11.9417 10.925 12.525C10.3417 13.1083 9.66389 13.5667 8.89167 13.9C8.11944 14.2333 7.28889 14.4 6.4 14.4Z";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <IconButton label="Toggle theme" onClick={onToggle} isDark={isDark}>
      <div className="relative size-[16px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <mask
            height="16"
            id="mask-theme"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
            width="16"
            x="0"
            y="0"
          >
            <rect fill="#D9D9D9" height="16" width="16" />
          </mask>
          <g mask="url(#mask-theme)">
            <path d={moonPath} fill="#A1A1A1" />
          </g>
        </svg>
      </div>
    </IconButton>
  );
}
