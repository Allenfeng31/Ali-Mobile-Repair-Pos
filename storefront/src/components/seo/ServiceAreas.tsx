"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { SERVICE_AREAS, type ServiceArea } from "@/data/serviceAreas";

interface ServiceAreasProps {
  mobileVariant?: 'iphone15-compact-pilot';
}

export default function ServiceAreas({ mobileVariant }: ServiceAreasProps) {
  const isIphone15MobilePilot = mobileVariant === 'iphone15-compact-pilot';

  const featuredSlugs = [
    "ringwood",
    "ringwood-east",
    "heathmont",
    "mitcham",
    "croydon",
    "nunawading",
    "wantirna",
    "bayswater",
    "boronia",
  ] as const;

  const featuredAreas = featuredSlugs
    .map((slug) => SERVICE_AREAS.find((area) => area.slug === slug))
    .filter((area): area is ServiceArea => Boolean(area));

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
          className={`suburb-cloud ${isIphone15MobilePilot ? 'max-md:!grid-cols-1 max-md:!gap-2 min-[420px]:max-md:!grid-cols-2' : ''}`}
          aria-label="Service area suburb links"
        >
          {featuredAreas.map((area) => (
            <Link
              key={area.slug}
              href={`/locations/${area.slug}`}
              className="suburb-tag"
            >
              <span>{area.name}</span>
              <small>{area.driveTime}</small>
              <ArrowRight size={14} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
