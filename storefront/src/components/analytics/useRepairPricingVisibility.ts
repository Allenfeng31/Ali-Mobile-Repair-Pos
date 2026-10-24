"use client";

import { useEffect, useRef } from "react";
import {
  trackRepairPricingVisibility,
  type RepairPageContext,
} from "@/lib/ga4RepairEvents";

export type RepairPricingVisibilityEvent = {
  eventName: "repair_price_view" | "repair_quote_view";
  /** Local-only signature used to deduplicate the same visible price state. */
  stateKey: string;
  context: RepairPageContext & {
    placement: "pricing";
    pricingState: "numeric" | "quote";
    priceSource?: "published_pos";
  };
};

const STABLE_VISIBILITY_MS = 250;

export function useRepairPricingVisibility(events: readonly RepairPricingVisibilityEvent[]) {
  const targetRef = useRef<HTMLDivElement>(null);
  const emittedKeysRef = useRef(new Set<string>());
  const eventsRef = useRef(events);
  const signature = events
    .map((event) => `${event.eventName}:${event.stateKey}:${JSON.stringify(event.context)}`)
    .sort()
    .join("|");

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const target = targetRef.current;
    const visibleEvents = eventsRef.current;
    if (!target || visibleEvents.length === 0 || typeof IntersectionObserver === "undefined") return;

    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some((entry) => entry.target === target && entry.isIntersecting && entry.intersectionRatio >= 0.5);

      if (!isVisible) {
        timers.forEach(clearTimeout);
        timers.clear();
        return;
      }

      for (const event of visibleEvents) {
        const dedupeKey = `${event.eventName}:${event.stateKey}`;
        if (emittedKeysRef.current.has(dedupeKey) || timers.has(dedupeKey)) continue;

        timers.set(dedupeKey, setTimeout(() => {
          timers.delete(dedupeKey);
          if (emittedKeysRef.current.has(dedupeKey)) return;
          emittedKeysRef.current.add(dedupeKey);
          trackRepairPricingVisibility(event.eventName, event.context);
        }, STABLE_VISIBILITY_MS));
      }
    }, { threshold: 0.5 });

    observer.observe(target);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [signature]);

  return targetRef;
}
