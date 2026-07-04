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
  const [expandedSeriesKey, setExpandedSeriesKey] = useState("");

  const getSeriesKey = (series: string) => series.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <section id="models-list" className="brand-hub-section brand-hub-models-section" aria-labelledby="macbook-model-finder-heading">
      <div className="brand-hub-section-header">
        <span className="repair-kicker">Model identification</span>
        <h2 id="macbook-model-finder-heading">Find your exact MacBook model</h2>
        <p>
          Choose MacBook Air, MacBook Pro or the matching MacBook family to confirm the exact model before checking compatible repair options.
        </p>
      </div>

      {seriesGroups.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.72, marginBottom: "0" }}>
          No MacBook models are currently available.
        </p>
      ) : (
        <div className="brand-hub-series-browser">
          <div className="brand-hub-series-grid">
            {seriesGroups.map((group) => {
              const seriesKey = getSeriesKey(group.series);
              const isExpanded = expandedSeriesKey === seriesKey;
              const buttonId = `brand-hub-${brandSlug}-${seriesKey}-button`;
              const regionId = `brand-hub-${brandSlug}-${seriesKey}-panel`;

              return (
                <section key={group.series} className="brand-hub-series-item">
                  <button
                    id={buttonId}
                    type="button"
                    className="brand-hub-series-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={regionId}
                    onClick={() => setExpandedSeriesKey((current) => (current === seriesKey ? "" : seriesKey))}
                  >
                    <span>
                      <strong>{group.series}</strong>
                      <small>
                        {group.models.length} model{group.models.length === 1 ? "" : "s"}
                      </small>
                    </span>
                    <span className="brand-hub-series-indicator" aria-hidden="true">
                      +
                    </span>
                  </button>

                  <div
                    id={regionId}
                    className={`brand-hub-series-panel ${isExpanded ? "brand-hub-series-panel-open" : ""}`}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isExpanded}
                  >
                    <div className="brand-hub-model-grid">
                      {group.models.map((entry) => (
                        <Link
                          key={entry.slug}
                          href={`/repairs/${categorySlug}/${brandSlug}/${entry.slug}`}
                          prefetch={false}
                          className="model-card"
                          tabIndex={isExpanded ? undefined : -1}
                          onClick={() => analytics.trackModelClick(entry.model)}
                        >
                          <div className="model-card-info">
                            <span>{entry.model}</span>
                            {entry.modelCode && <span className="model-code">({entry.modelCode})</span>}
                          </div>
                          <span className="model-card-arrow" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
