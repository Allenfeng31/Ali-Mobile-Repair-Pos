"use client";

import { useId, useState } from "react";
import Link from "next/link";

export type IPhoneServiceAreaLinkCard = {
  href: string;
  name: string;
  description: string;
};

type IPhoneServiceAreaLinksProps = {
  cards: IPhoneServiceAreaLinkCard[];
};

const FEATURED_SERVICE_AREA_COUNT = 4;

export default function IPhoneServiceAreaLinks({ cards }: IPhoneServiceAreaLinksProps) {
  const [expanded, setExpanded] = useState(false);
  const reactId = useId();
  const areaListId = `iphone-service-areas-${reactId.replace(/:/g, "")}`;
  const hiddenCount = Math.max(cards.length - FEATURED_SERVICE_AREA_COUNT, 0);

  return (
    <>
      <div className="repair-signal-grid" id={areaListId}>
        {cards.map((area, index) => {
          const isHidden = index >= FEATURED_SERVICE_AREA_COUNT && !expanded;

          return (
            <Link
              key={area.href}
              href={area.href}
              prefetch={false}
              className="repair-signal-card iphone-service-area-link"
              style={isHidden ? { display: "none" } : undefined}
              aria-hidden={isHidden || undefined}
              tabIndex={isHidden ? -1 : undefined}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{area.name} repair information</h3>
              <p>{area.description}</p>
            </Link>
          );
        })}
      </div>

      {hiddenCount > 0 ? (
        <button
          type="button"
          className="service-areas-more-toggle"
          aria-expanded={expanded}
          aria-controls={areaListId}
          onClick={() => setExpanded((current) => !current)}
        >
          <span>{expanded ? "Show fewer suburbs" : "Show more suburbs"}</span>
          <small>{expanded ? "Show the featured suburbs only" : `${hiddenCount} more suburbs`}</small>
        </button>
      ) : null}
    </>
  );
}
