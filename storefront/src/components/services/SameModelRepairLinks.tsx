"use client";

import { useId, useState } from 'react';
import Link from 'next/link';
import { Battery, Droplet, Plug, Smartphone, Wrench } from 'lucide-react';

export interface SameModelRepairLink {
  href: string;
  label: string;
  slug: string;
}

interface SameModelRepairLinksProps {
  links: ReadonlyArray<SameModelRepairLink>;
  mobileVariant?: 'iphone15-compact-pilot';
}

function getRepairIcon(slug: string, size = 18) {
  if (slug.includes('water')) return <Droplet size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('battery')) return <Battery size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('port')) return <Plug size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('screen') || slug.includes('glass') || slug.includes('display')) return <Smartphone size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  return <Wrench size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
}

export default function SameModelRepairLinks({
  links,
  mobileVariant,
}: SameModelRepairLinksProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const listId = useId();
  const isIphone15MobilePilot = mobileVariant === 'iphone15-compact-pilot';
  const shouldShowMobileToggle = isIphone15MobilePilot && links.length > 3;

  return (
    <div className="flex w-full flex-col gap-3">
      <div id={listId} className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
        {links.map((link, index) => {
          const isCollapsedMobileExtra = shouldShowMobileToggle && index > 2 && !isExpanded;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${isCollapsedMobileExtra ? 'hidden md:flex' : 'flex'} group min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm shadow-blue-950/5 transition duration-200 ease-out touch-manipulation hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${isIphone15MobilePilot ? 'max-md:min-h-12 max-md:bg-transparent max-md:px-3 max-md:py-2.5 max-md:shadow-none max-md:hover:translate-y-0 max-md:hover:bg-blue-50/40' : ''}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={`grid shrink-0 place-items-center rounded-xl border border-blue-100 text-blue-600 transition group-hover:border-blue-200 ${isIphone15MobilePilot ? 'h-8 w-8 bg-transparent md:h-9 md:w-9 md:bg-blue-50/80 md:group-hover:bg-white' : 'h-9 w-9 bg-blue-50/80 group-hover:bg-white'}`}>
                  {getRepairIcon(link.slug, isIphone15MobilePilot ? 17 : 18)}
                </span>
                <span className="min-w-0 break-words leading-snug">{link.label}</span>
              </span>
              <span
                className={`shrink-0 rounded-full border border-blue-100 px-2 py-1 text-xs text-blue-600 transition group-hover:translate-x-0.5 group-hover:border-blue-200 group-hover:bg-blue-600 group-hover:text-white ${isIphone15MobilePilot ? 'bg-transparent md:bg-white' : 'bg-white'}`}
                aria-hidden="true"
              >
                &rarr;
              </span>
            </Link>
          );
        })}
      </div>

      {shouldShowMobileToggle && (
        <button
          type="button"
          className="flex min-h-11 items-center justify-center rounded-full border border-blue-100 bg-transparent px-4 py-2 text-sm font-extrabold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:hidden"
          aria-expanded={isExpanded}
          aria-controls={listId}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? 'Show fewer repair paths' : 'View more repair paths'}
        </button>
      )}
    </div>
  );
}
