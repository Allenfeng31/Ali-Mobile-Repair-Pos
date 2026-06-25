import Link from 'next/link';
import { ArrowRight, Laptop, Smartphone, Tablet, Watch, Wrench } from 'lucide-react';

export interface ExploreRepairLink {
  href: string;
  label: string;
  description?: string;
}

interface ExploreRepairNetworkSectionProps {
  iphoneModelLinks: ReadonlyArray<ExploreRepairLink>;
  categoryLinks: ReadonlyArray<ExploreRepairLink>;
}

function getExploreRepairLinkIcon(href: string) {
  if (href.startsWith('/repairs/phone/iphone/')) return Smartphone;
  if (href.startsWith('/repairs/tablet/')) return Tablet;
  if (href.startsWith('/repairs/laptop/')) return Laptop;
  if (href.startsWith('/repairs/watch/')) return Watch;
  if (href.startsWith('/repairs/phone/')) return Smartphone;
  return Wrench;
}

function dedupeLinks(links: ReadonlyArray<ExploreRepairLink>) {
  const seen = new Set<string>();

  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export default function ExploreRepairNetworkSection({
  iphoneModelLinks,
  categoryLinks,
}: ExploreRepairNetworkSectionProps) {
  const dedupedModelLinks = dedupeLinks(iphoneModelLinks);
  const seenHrefs = new Set(dedupedModelLinks.map((link) => link.href));
  const dedupedCategoryLinks = dedupeLinks(categoryLinks).filter((link) => {
    if (seenHrefs.has(link.href)) return false;
    seenHrefs.add(link.href);
    return true;
  });

  if (dedupedModelLinks.length === 0 && dedupedCategoryLinks.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full"
      aria-labelledby="explore-more-repairs-heading"
    >
      <div className="flex w-full flex-col gap-6 rounded-[28px] border border-blue-100 bg-white/80 px-4 py-5 shadow-sm shadow-blue-950/5 sm:px-5 sm:py-6">
        <div className="w-full max-w-[42rem]">
          <h2
            id="explore-more-repairs-heading"
            className="text-2xl font-black leading-tight tracking-[-0.02em] text-slate-950"
          >
            Explore More Repairs
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600 sm:text-[0.98rem]">
            Browse other iPhone models or explore repair services for other devices.
          </p>
        </div>

        {dedupedModelLinks.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-500">
              More iPhone Models
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {dedupedModelLinks.map((link) => {
                const Icon = getExploreRepairLinkIcon(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm shadow-blue-950/5 transition duration-200 ease-out touch-manipulation hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50/80 text-blue-600 transition group-hover:border-blue-200 group-hover:bg-white">
                        <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 break-words leading-snug">{link.label}</span>
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={2.3}
                      aria-hidden="true"
                      className="shrink-0 text-blue-600 transition group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {dedupedCategoryLinks.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Other Repair Categories
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {dedupedCategoryLinks.map((link) => {
                const Icon = getExploreRepairLinkIcon(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 shadow-sm shadow-blue-950/5 transition duration-200 ease-out touch-manipulation hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50/80 text-blue-600 transition group-hover:border-blue-200 group-hover:bg-white">
                        <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 break-words leading-snug">{link.label}</span>
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={2.3}
                      aria-hidden="true"
                      className="shrink-0 text-blue-600 transition group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
