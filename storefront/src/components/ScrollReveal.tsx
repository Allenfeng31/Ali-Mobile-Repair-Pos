"use client";

import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  if (className) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
}
