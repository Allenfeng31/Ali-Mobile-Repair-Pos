"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ModelEntry {
  model: string;
  slug: string;
  modelCode?: string;
}

interface SeriesGroup {
  series: string;
  models: ModelEntry[];
}

export default function BrandModelSearch({
  seriesGroups,
  categorySlug,
  brandSlug,
}: {
  seriesGroups: SeriesGroup[];
  categorySlug: string;
  brandSlug: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter groups in real-time
  const filteredGroups = seriesGroups
    .map((group) => {
      const filteredModels = group.models.filter((m) => {
        const search = searchTerm.toLowerCase();
        const matchesName = m.model.toLowerCase().includes(search);
        const matchesCode = m.modelCode ? m.modelCode.toLowerCase().includes(search) : false;
        return matchesName || matchesCode;
      });
      return { ...group, models: filteredModels };
    })
    .filter((group) => group.models.length > 0);

  return (
    <>
      <div className="search-container">
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
          placeholder="Search model name or code (e.g. SM-S931B)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredGroups.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.6, marginBottom: "3rem" }}>
          No models found matching "{searchTerm}"
        </p>
      ) : (
        filteredGroups.map((group) => (
          <div key={group.series} className="model-series-section">
            {seriesGroups.length > 1 && (
              <h2 className="model-series-title">{group.series}</h2>
            )}
            <div className="model-series-grid">
              {group.models.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/repairs/${categorySlug}/${brandSlug}/${entry.slug}`}
                  className="model-card"
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
    </>
  );
}
