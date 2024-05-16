import React from "react";

interface PlusSvgProps {
  className?: string;
  size?: number;
}

export function PlusSvg({
  className = "text-gray-800 dark:text-white",
  size = 6,
}: PlusSvgProps) {
  return (
    <svg
      className={`h-${size} w-${size} ${className}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 12h14m-7 7V5"
      />
    </svg>
  );
}
