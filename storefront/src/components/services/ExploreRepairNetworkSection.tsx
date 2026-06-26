import Link from 'next/link';
import { ArrowRight, Laptop, Smartphone, Tablet, Watch, Wrench } from 'lucide-react';

export interface ExploreRepairLink {
  href: string;
  label: string;
  description?: string;
}

interface ExploreRepairNetworkSectionProps {
  headingId?: string;
  sectionDescription: string;
  modelGroupHeading: string;
  modelLinks: ReadonlyArray<ExploreRepairLink>;
  categoryLinks: ReadonlyArray<ExploreRepairLink>;
  categoryGroupHeading?: string;
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
  headingId = 'explore-more-repairs-heading',
  sectionDescription,
  modelGroupHeading,
  modelLinks,
  categoryLinks,
  categoryGroupHeading = 'Other Repair Categories',
}: ExploreRepairNetworkSectionProps) {
  const dedupedModelLinks = dedupeLinks(modelLinks);
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
      aria-labelledby={headingId}
    >
      <div className="flex w-full flex-col items-center gap-6 rounded-[28px] border border-blue-100 bg-transparent px-4 py-5 sm:px-5 sm:py-6">
        <div className="mx-auto flex w-full max-w-[42rem] flex-col items-center text-center">
          <h2
            id={headingId}
            className="mx-auto w-full text-center text-2xl font-black leading-tight tracking-[-0.02em] text-slate-950"
          >
            Explore More Repairs
          </h2>
          <p className="mx-auto mt-2 w-full text-center text-sm font-medium leading-6 text-slate-600 sm:text-[0.98rem]">
            {sectionDescription}
          </p>
        </div>

        {dedupedModelLinks.length > 0 && (
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <h3 className="text-center text-sm font-extrabold uppercase tracking-[0.14em] text-slate-500">
              {modelGroupHeading}
            </h3>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {dedupedModelLinks.map((link) => {
                const Icon = getExploreRepairLinkIcon(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative flex min-h-12 w-full items-center justify-center rounded-2xl border border-blue-100 bg-transparent px-4 py-3 pr-12 text-center text-sm font-extrabold text-slate-800 transition duration-200 ease-out touch-manipulation hover:-translate-y-0.5 hover:border-blue-200 hover:bg-transparent hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span className="flex min-w-0 max-w-full items-center justify-center gap-3 text-center">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-transparent text-blue-600 transition group-hover:border-blue-200 group-hover:bg-transparent">
                        <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 break-words leading-snug text-center">{link.label}</span>
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={2.3}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-1/2 shrink-0 -translate-y-1/2 text-blue-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-1/2"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {dedupedCategoryLinks.length > 0 && (
          <div className="flex w-full flex-col items-center gap-3 text-center">
            <h3 className="text-center text-sm font-extrabold uppercase tracking-[0.14em] text-slate-500">
              {categoryGroupHeading}
            </h3>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {dedupedCategoryLinks.map((link) => {
                const Icon = getExploreRepairLinkIcon(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative flex min-h-12 w-full items-center justify-center rounded-2xl border border-blue-100 bg-transparent px-4 py-3 pr-12 text-center text-sm font-extrabold text-slate-800 transition duration-200 ease-out touch-manipulation hover:-translate-y-0.5 hover:border-blue-200 hover:bg-transparent hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span className="flex min-w-0 max-w-full items-center justify-center gap-3 text-center">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-blue-100 bg-transparent text-blue-600 transition group-hover:border-blue-200 group-hover:bg-transparent">
                        <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 break-words leading-snug text-center">{link.label}</span>
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={2.3}
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-1/2 shrink-0 -translate-y-1/2 text-blue-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-1/2"
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
