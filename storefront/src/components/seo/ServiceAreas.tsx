"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { SERVICE_AREAS, type ServiceArea } from "@/data/serviceAreas";

interface ServiceAreasProps {
  mobileVariant?: 'iphone15-compact-pilot';
}

export default function ServiceAreas({ mobileVariant }: ServiceAreasProps) {
  const [showMore, setShowMore] = useState(false);
  const expandedSuburbsId = useId();
  const isIphone15MobilePilot = mobileVariant === 'iphone15-compact-pilot';

  const featuredSlugs = [
    "ringwood",
    "ringwood-east",
    "heathmont",
    "mitcham",
    "croydon",
    "nunawading",
    "boxhill",
    "glenwaverley",
    "doncaster",
  ];

  const featuredAreas = featuredSlugs
    .map((slug) => SERVICE_AREAS.find((area) => area.slug === slug))
    .filter((area): area is ServiceArea => Boolean(area));

  const remainingAreas = SERVICE_AREAS.filter((area) => !featuredSlugs.includes(area.slug));
  const orderedAreas = [...featuredAreas, ...remainingAreas];
  const hasHiddenAreas = isIphone15MobilePilot
    ? orderedAreas.length > 12
    : remainingAreas.length > 0;

  function getAreaVisibilityClass(index: number) {
    if (showMore) return '';

    if (isIphone15MobilePilot) {
      if (index >= 12) return '!hidden';
      if (index >= 6) return 'max-md:!hidden';
      return '';
    }

    return index >= featuredAreas.length ? '!hidden' : '';
  }

  return (
    <section
      className={`service-areas-container ${isIphone15MobilePilot ? 'max-md:!my-8 max-md:!px-4' : ''}`}
      aria-labelledby="service-areas-heading"
    >
      <div className={`service-areas-layout ${isIphone15MobilePilot ? 'max-md:!gap-5 max-md:!rounded-[24px] max-md:!bg-transparent max-md:!p-5' : ''}`}>
        <div className="service-areas-header">
          <span className="service-areas-kicker">
            <MapPin size={16} strokeWidth={2.5} aria-hidden="true" />
            Local coverage
          </span>
          <h2 id="service-areas-heading">Proudly Serving Melbourne&apos;s Eastern Suburbs & Beyond</h2>
          <p>
            Customers visit our Ringwood Square repair bench from nearby suburbs for clear quotes,
            No Fix No Charge diagnostics, and practical repair options before committing.
          </p>
          <div className="service-area-proof-row" aria-label="Local service highlights">
            <span>
              <Navigation size={15} strokeWidth={2.5} aria-hidden="true" />
              Easy Ringwood access
            </span>
            <span>
              <ShieldCheck size={15} strokeWidth={2.5} aria-hidden="true" />
              Warranty-backed repairs
            </span>
          </div>
        </div>

        <div
          id={expandedSuburbsId}
          className={`suburb-cloud ${isIphone15MobilePilot ? 'max-md:!grid-cols-1 max-md:!gap-2 min-[420px]:max-md:!grid-cols-2' : ''}`}
          aria-label="Service area suburb links"
        >
          {orderedAreas.map((area, index) => (
            <Link
              key={area.slug}
              href={`/locations/${area.slug}`}
              className={`suburb-tag ${getAreaVisibilityClass(index)}`}
            >
              <span>{area.name}</span>
              <small>{area.driveTime}</small>
              <ArrowRight size={14} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          ))}

          {hasHiddenAreas && (
            <div className="service-areas-more">
              <button
                type="button"
                className="service-areas-more-toggle"
                aria-expanded={showMore}
                aria-controls={expandedSuburbsId}
                onClick={() => setShowMore((current) => !current)}
              >
                <span>{showMore ? "Show Fewer Suburbs ↑" : "Show More Suburbs ↓"}</span>
                <small>{isIphone15MobilePilot ? `${orderedAreas.length} total areas` : `${remainingAreas.length} more areas`}</small>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
