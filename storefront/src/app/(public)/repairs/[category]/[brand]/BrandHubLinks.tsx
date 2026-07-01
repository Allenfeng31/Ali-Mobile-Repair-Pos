"use client";

import { useState } from "react";
import Link from "next/link";

interface BrandHubLink {
  href: string;
  label: string;
}

interface BrandHubLinksProps {
  links: BrandHubLink[];
  initialVisibleCount?: number;
}

const BRAND_LINKS_ID = "brand-hub-other-phone-brand-links";

export default function BrandHubLinks({
  links,
  initialVisibleCount = 4,
}: BrandHubLinksProps) {
  const [expanded, setExpanded] = useState(false);
  const hasHiddenLinks = links.length > initialVisibleCount;

  return (
    <>
      <ul id={BRAND_LINKS_ID} className="brand-hub-link-grid">
        {links.map((link, index) => {
          const isCollapsed = hasHiddenLinks && !expanded && index >= initialVisibleCount;

          return (
            <li
              key={link.href}
              className={isCollapsed ? "brand-hub-collapsed-link" : undefined}
              aria-hidden={isCollapsed || undefined}
            >
              <Link
                href={link.href}
                className="brand-hub-outline-link"
                prefetch={false}
                tabIndex={isCollapsed ? -1 : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {hasHiddenLinks && (
        <button
          type="button"
          className="brand-hub-show-more"
          aria-expanded={expanded}
          aria-controls={BRAND_LINKS_ID}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show fewer brands" : "Show more brands"}
        </button>
      )}
    </>
  );
}
