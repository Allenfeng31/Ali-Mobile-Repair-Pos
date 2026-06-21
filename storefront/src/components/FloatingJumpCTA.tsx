"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface FloatingJumpCTAProps {
  targetId: string;
  label: string;
}

function isTargetBelowViewport(target: Element) {
  const rect = target.getBoundingClientRect();
  return rect.top >= window.innerHeight;
}

export default function FloatingJumpCTA({ targetId, label }: FloatingJumpCTAProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const target = document.getElementById(targetId);

    if (!target) {
      setIsVisible(false);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);
    const updateVisibility = () => {
      setIsVisible(isTargetBelowViewport(target));
    };

    updateReducedMotion();
    updateVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        const { top, bottom } = entry.boundingClientRect;
        setIsVisible(top >= window.innerHeight && bottom > window.innerHeight);
      },
      { threshold: [0, 0.01, 1] }
    );

    observer.observe(target);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateReducedMotion);
    } else {
      mediaQuery.addListener(updateReducedMotion);
    }

    const rafId = window.requestAnimationFrame(updateVisibility);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();

      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateReducedMotion);
      } else {
        mediaQuery.removeListener(updateReducedMotion);
      }
    };
  }, [targetId]);

  const handleClick = () => {
    const target = document.getElementById(targetId);

    if (!target) return;

    const matchingAnchor = document.querySelector<HTMLAnchorElement>(
      `a.repair-primary-action[href="#${targetId}"], a.repair-secondary-action[href="#${targetId}"]`
    );

    if (matchingAnchor && !reducedMotion) {
      matchingAnchor.click();
      return;
    }

    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
      inline: "nearest",
    });
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-hidden={!isVisible}
      disabled={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      onClick={handleClick}
      className={[
        "fixed left-1/2 z-40 flex min-h-11 max-w-[calc(100vw-7rem)] -translate-x-1/2 cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-white/40 bg-white/[0.16] px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(15,23,42,0.20),inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(15,23,42,0.08)] ring-1 ring-white/45 backdrop-blur-2xl backdrop-saturate-200 transition-[opacity,transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-white/65 hover:bg-white/[0.22] hover:shadow-[0_22px_52px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.82)] disabled:cursor-default md:hidden",
        "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isVisible ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0",
      ].join(" ")}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.12)_38%,rgba(191,219,254,0.14)_68%,rgba(255,255,255,0.30)_100%)]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-x-4 top-1 h-px rounded-full bg-white/70"
        aria-hidden="true"
      />
      <span className="relative z-10 truncate drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">{label}</span>
      <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50/70 text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
      </span>
    </button>
  );
}
