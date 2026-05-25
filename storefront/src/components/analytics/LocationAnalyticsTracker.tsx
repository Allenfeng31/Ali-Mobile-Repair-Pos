"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

type LocationAnalyticsTrackerProps = {
  suburb: string;
};

function isHomepageHref(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href === "/") return true;

  try {
    const parsed = new URL(href, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname === "/";
  } catch {
    return false;
  }
}

export default function LocationAnalyticsTracker({ suburb }: LocationAnalyticsTrackerProps) {
  useEffect(() => {
    analytics.trackSuburbPageView(suburb);

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (anchor instanceof HTMLAnchorElement && isHomepageHref(anchor)) {
        analytics.trackSuburbHomeClick(suburb);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [suburb]);

  return null;
}
