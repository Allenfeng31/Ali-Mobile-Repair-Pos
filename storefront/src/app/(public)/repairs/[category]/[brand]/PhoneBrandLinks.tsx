"use client";

import { useState } from "react";
import Link from "next/link";

interface PhoneBrandLink {
  href: string;
  label: string;
}

interface PhoneBrandLinksProps {
  links: PhoneBrandLink[];
  initialVisibleCount?: number;
}

const BRAND_LINKS_ID = "iphone-other-phone-brand-links";

export default function PhoneBrandLinks({
  links,
  initialVisibleCount = 6,
}: PhoneBrandLinksProps) {
  const [expanded, setExpanded] = useState(false);
  const hasHiddenLinks = links.length > initialVisibleCount;

  return (
    <>
      <ul id={BRAND_LINKS_ID} className="iphone-hub-link-grid">
        {links.map((link, index) => {
          const isCollapsed = hasHiddenLinks && !expanded && index >= initialVisibleCount;

          return (
            <li
              key={link.href}
              className={isCollapsed ? "iphone-hub-collapsed-link" : undefined}
              aria-hidden={isCollapsed || undefined}
            >
              <Link
                href={link.href}
                className="iphone-hub-outline-link"
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
          className="iphone-hub-show-more"
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
