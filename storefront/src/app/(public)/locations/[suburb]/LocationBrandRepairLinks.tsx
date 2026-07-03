"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type LocationBrandRepairCard = {
  href: string;
  label: string;
  description: string;
  action: string;
};

type LocationBrandRepairLinksProps = {
  cards: LocationBrandRepairCard[];
};

const FEATURED_BRAND_LIMIT = 6;

export default function LocationBrandRepairLinks({ cards }: LocationBrandRepairLinksProps) {
  const [expanded, setExpanded] = useState(false);
  const reactId = useId();
  const extraCardsId = `location-brand-repairs-extra-${reactId.replace(/:/g, "")}`;
  const hasExtraCards = cards.length > FEATURED_BRAND_LIMIT;

  return (
    <>
      <div className="location-popular-grid" id={extraCardsId}>
        {cards.map((card, index) => {
          const isExtra = index >= FEATURED_BRAND_LIMIT;
          const isHidden = isExtra && !expanded;

          return (
            <Link
              key={card.href}
              href={card.href}
              className="location-popular-card"
              style={isHidden ? { display: "none" } : undefined}
              aria-hidden={isHidden || undefined}
              tabIndex={isHidden ? -1 : undefined}
            >
              <strong>{card.label}</strong>
              <span>{card.description}</span>
              <small>
                {card.action}
                <ArrowRight size={14} strokeWidth={2.7} aria-hidden="true" />
              </small>
            </Link>
          );
        })}
      </div>

      {hasExtraCards ? (
        <button
          type="button"
          className="service-areas-more-toggle"
          aria-expanded={expanded}
          aria-controls={extraCardsId}
          onClick={() => setExpanded((current) => !current)}
        >
          <span>{expanded ? "Show fewer brand repairs" : "Show more brand repairs"}</span>
          <small>{expanded ? "Hide extra brand hubs" : `${cards.length - FEATURED_BRAND_LIMIT} more brand hubs`}</small>
        </button>
      ) : null}
    </>
  );
}
