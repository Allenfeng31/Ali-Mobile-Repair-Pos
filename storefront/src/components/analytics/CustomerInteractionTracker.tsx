"use client";

import { useEffect } from "react";
import { getRepairPageContext, trackRepairCtaClick, type RepairCtaAction } from "@/lib/ga4RepairEvents";

function getTrackedAction(anchor: HTMLAnchorElement): RepairCtaAction | null {
  const href = anchor.getAttribute("href");
  if (!href) return null;
  if (href === "#models-list") return "select_model";
  if (href.startsWith("tel:")) return "call";

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin === window.location.origin && url.pathname === "/book-repair") return "book_repair";
    if (
      (url.hostname === "www.google.com" || url.hostname === "google.com")
      && url.pathname.startsWith("/maps/dir")
      && url.searchParams.has("destination")
    ) return "get_directions";
  } catch {
    return null;
  }

  return null;
}

function getPlacement(anchor: HTMLAnchorElement) {
  const explicitPlacement = anchor.closest<HTMLElement>("[data-ga4-placement]")?.dataset.ga4Placement;
  if (explicitPlacement === "header" || explicitPlacement === "footer" || explicitPlacement === "hero" || explicitPlacement === "pricing" || explicitPlacement === "content") {
    return explicitPlacement;
  }
  if (anchor.closest("header")) return "header" as const;
  if (anchor.closest("footer")) return "footer" as const;
  if (anchor.closest("section")?.querySelector("h1")) return "hero" as const;
  return "content" as const;
}

export default function CustomerInteractionTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const action = getTrackedAction(anchor);
      if (!action) return;

      trackRepairCtaClick({
        ...getRepairPageContext(window.location.pathname),
        action,
        placement: getPlacement(anchor),
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
