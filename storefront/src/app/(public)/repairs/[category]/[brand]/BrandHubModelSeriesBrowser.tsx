"use client";

import { useState } from "react";
import Link from "next/link";

export interface BrandHubSeriesModel {
  model: string;
  slug: string;
  modelCode?: string;
}

export interface BrandHubSeriesGroup {
  key: string;
  label: string;
  models: BrandHubSeriesModel[];
}

interface BrandHubModelSeriesBrowserProps {
  brandSlug: string;
  categorySlug: string;
  seriesGroups: BrandHubSeriesGroup[];
}

export default function BrandHubModelSeriesBrowser({
  brandSlug,
  categorySlug,
  seriesGroups,
}: BrandHubModelSeriesBrowserProps) {
  const [expandedSeriesKey, setExpandedSeriesKey] = useState("");

  return (
    <div className="brand-hub-series-browser">
      <div className="brand-hub-series-grid">
        {seriesGroups.map((series) => {
          const isExpanded = expandedSeriesKey === series.key;
          const buttonId = `brand-hub-${brandSlug}-${series.key}-button`;
          const regionId = `brand-hub-${brandSlug}-${series.key}-panel`;

          return (
            <section key={series.key} className="brand-hub-series-item">
              <button
                id={buttonId}
                type="button"
                className="brand-hub-series-toggle"
                aria-expanded={isExpanded}
                aria-controls={regionId}
                onClick={() => setExpandedSeriesKey((current) => (current === series.key ? "" : series.key))}
              >
                <span>
                  <strong>{series.label}</strong>
                  <small>
                    {series.models.length} model{series.models.length === 1 ? "" : "s"}
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
                  {series.models.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/repairs/${categorySlug}/${brandSlug}/${entry.slug}`}
                      prefetch={false}
                      className="model-card"
                      tabIndex={isExpanded ? undefined : -1}
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
  );
}
