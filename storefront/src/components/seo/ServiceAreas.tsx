"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { SERVICE_AREAS, type ServiceArea } from "@/data/serviceAreas";

export default function ServiceAreas() {
  const [showMore, setShowMore] = useState(false);

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

  return (
    <section className="service-areas-container" aria-labelledby="service-areas-heading">
      <div className="service-areas-layout">
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

        <div className="suburb-cloud" aria-label="Service area suburb links">
          {featuredAreas.map((area) => (
            <Link key={area.slug} href={`/locations/${area.slug}`} className="suburb-tag">
              <span>{area.name}</span>
              <small>{area.driveTime}</small>
              <ArrowRight size={14} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          ))}

          <div className="service-areas-more">
            <button
              type="button"
              className="service-areas-more-toggle"
              aria-expanded={showMore}
              onClick={() => setShowMore((current) => !current)}
            >
              <span>{showMore ? "Show Fewer Suburbs ↑" : "Show More Suburbs ↓"}</span>
              <small>{remainingAreas.length} more areas</small>
            </button>

            {showMore ? (
              <div className="suburb-cloud suburb-cloud-expanded">
                {remainingAreas.map((area) => (
                  <Link key={area.slug} href={`/locations/${area.slug}`} className="suburb-tag">
                    <span>{area.name}</span>
                    <small>{area.driveTime}</small>
                    <ArrowRight size={14} strokeWidth={2.7} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
