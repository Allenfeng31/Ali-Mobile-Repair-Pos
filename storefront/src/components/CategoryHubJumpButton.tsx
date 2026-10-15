"use client";

import type { ReactNode } from "react";

interface CategoryHubJumpButtonProps {
  targetId: string;
  children: ReactNode;
}

export default function CategoryHubJumpButton({ targetId, children }: CategoryHubJumpButtonProps) {
  const scrollToSelection = () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <button
      type="button"
      className="repair-primary-action"
      aria-controls={targetId}
      onClick={scrollToSelection}
    >
      {children}
    </button>
  );
}
