"use client";

import { useState } from "react";
import Link from "next/link";
import { analytics } from "@/lib/analytics";

interface ModelEntry {
  model: string;
  slug: string;
  modelCode?: string;
}

interface SeriesGroup {
  series: string;
  models: ModelEntry[];
}

interface MacBookModelFinderProps {
  seriesGroups: SeriesGroup[];
  categorySlug: string;
  brandSlug: string;
}

export default function MacBookModelFinder({
  seriesGroups,
  categorySlug,
  brandSlug,
}: MacBookModelFinderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGroups = seriesGroups
    .map((group) => {
      const filteredModels = group.models.filter((entry) => {
        const search = searchTerm.toLowerCase();
        const matchesName = entry.model.toLowerCase().includes(search);
        const matchesCode = entry.modelCode ? entry.modelCode.toLowerCase().includes(search) : false;
        return matchesName || matchesCode;
      });

      return { ...group, models: filteredModels };
    })
    .filter((group) => group.models.length > 0);

  return (
    <section id="models-list" className="repair-content-band" aria-labelledby="macbook-model-finder-heading">
      <div className="overflow-hidden rounded-[30px] border border-blue-100 bg-white/85 px-5 py-5 shadow-[0_22px_70px_rgba(15,23,42,0.07)] sm:px-6 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(320px,1.12fr)] lg:items-start">
          <div className="rounded-[24px] border border-blue-100 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(248,250,252,0.82))] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <span className="repair-kicker repair-kicker-muted">Model identification</span>
            <h2
              id="macbook-model-finder-heading"
              className="mt-4 text-[1.75rem] font-black tracking-tight text-slate-950 sm:text-[2rem]"
              style={{ overflowWrap: "anywhere" }}
            >
              Find your exact MacBook model
            </h2>
            <p className="mt-3 max-w-xl text-[0.98rem] font-semibold leading-7 text-slate-600">
              Search by MacBook name, year or the A-number printed on the underside of your device.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <article className="rounded-[20px] border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-950/5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-black text-blue-700">
                  1
                </span>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                  Open the Apple menu and choose <strong>About This Mac</strong>.
                </p>
              </article>
              <article className="rounded-[20px] border border-blue-100 bg-white/90 p-4 shadow-sm shadow-blue-950/5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-black text-blue-700">
                  2
                </span>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                  Check the underside of the MacBook for an A-number such as <strong>A2338</strong>.
                </p>
              </article>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-5">
            <div className="search-container" style={{ maxWidth: "none", marginBottom: "0.9rem" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                aria-label="Search MacBook model"
                placeholder="Search MacBook Air, MacBook Pro or A2338"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-700">
              Choosing the exact model helps us show compatible repair options and accurate quote information.
            </p>
          </div>
        </div>

        <div className="mt-6">
          {filteredGroups.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.72, marginBottom: "0" }}>
              No models found matching "{searchTerm}"
            </p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.series} className="model-series-section">
                {seriesGroups.length > 1 && (
                  <h3 className="model-series-title">{group.series}</h3>
                )}
                <div className="model-series-grid">
                  {group.models.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/repairs/${categorySlug}/${brandSlug}/${entry.slug}`}
                      className="model-card"
                      onClick={() => analytics.trackModelClick(entry.model)}
                    >
                      <div className="model-card-info">
                        <span>{entry.model}</span>
                        {entry.modelCode && (
                          <span className="model-code">({entry.modelCode})</span>
                        )}
                      </div>
                      <span className="model-card-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
