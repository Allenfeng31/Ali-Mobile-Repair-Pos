"use client";

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import type {
  RepairTypeHubCategoryGroup,
  RepairTypeHubModelLink,
} from '@/lib/repair-type-hubs';
import { smartSortModels } from '@/lib/modelSortConfig';
import styles from './RepairTypeHub.module.css';

interface RepairTypeModelGridProps {
  hubLabel: string;
  categories: RepairTypeHubCategoryGroup[];
  title?: string;
  description?: string;
}

interface SearchResultLink extends RepairTypeHubModelLink {
  brand: string;
}

interface SeriesGroup {
  key: string;
  label: string;
  models: RepairTypeHubModelLink[];
}

const SEARCH_RESULT_LIMIT = 20;

function sortModelLinks<T extends RepairTypeHubModelLink>(models: T[]): T[] {
  const sortable = models.map((model) => ({
    model: model.model,
    slug: model.modelSlug,
    repairTypes: [],
  }));

  const sorted = smartSortModels(sortable);
  const modelsBySlug = new Map(
    models.map((model) => [model.modelSlug, model] as const),
  );

  return sorted.flatMap((item) => {
    const original = modelsBySlug.get(item.slug);
    return original ? [original] : [];
  });
}

function sortSearchResults(results: SearchResultLink[]) {
  return sortModelLinks(results);
}

function getSamsungSeriesKey(model: RepairTypeHubModelLink) {
  const slug = model.modelSlug.toLowerCase();
  const name = model.model.toLowerCase();

  if (slug.startsWith('galaxy-a') || name.includes('galaxy a')) return 'a';
  if (slug.startsWith('galaxy-s') || name.includes('galaxy s')) return 's';
  if (slug.startsWith('galaxy-note') || name.includes('note')) return 'note';
  if (slug.startsWith('galaxy-z') || name.includes('fold') || name.includes('flip')) return 'z';
  return 'other';
}

function getOppoSeriesKey(model: RepairTypeHubModelLink) {
  const slug = model.modelSlug.toLowerCase();
  const name = model.model.toLowerCase();

  if (name.includes('reno') || slug.includes('reno')) return 'reno';
  if (name.includes('find') || slug.includes('find')) return 'find';
  if (/^a\d+/i.test(name) || /\ba\d+\b/i.test(name) || /^a\d+/i.test(slug) || /-a\d+/i.test(slug)) return 'a';
  return 'other';
}

function getSeriesLabel(brandSlug: string, seriesKey: string) {
  if (brandSlug === 'samsung') {
    switch (seriesKey) {
      case 'a':
        return 'Galaxy A Series';
      case 's':
        return 'Galaxy S Series';
      case 'note':
        return 'Galaxy Note Series';
      case 'z':
        return 'Galaxy Z Series';
      default:
        return 'Other Samsung Models';
    }
  }

  switch (seriesKey) {
    case 'a':
      return 'A Series';
    case 'reno':
      return 'Reno Series';
    case 'find':
      return 'Find Series';
    default:
      return 'Other Oppo Models';
  }
}

function getSeriesOrder(brandSlug: string) {
  return brandSlug === 'samsung'
    ? ['a', 's', 'note', 'z', 'other']
    : ['a', 'reno', 'find', 'other'];
}

function getBrandSeriesGroups(
  brandSlug: string,
  models: RepairTypeHubModelLink[],
): SeriesGroup[] | null {
  if (brandSlug !== 'samsung' && brandSlug !== 'oppo') {
    return null;
  }

  const groups = new Map<string, RepairTypeHubModelLink[]>();

  for (const model of models) {
    const seriesKey =
      brandSlug === 'samsung'
        ? getSamsungSeriesKey(model)
        : getOppoSeriesKey(model);
    const bucket = groups.get(seriesKey) ?? [];
    bucket.push(model);
    groups.set(seriesKey, bucket);
  }

  return getSeriesOrder(brandSlug)
    .map((seriesKey) => {
      const seriesModels = groups.get(seriesKey);
      if (!seriesModels || seriesModels.length === 0) {
        return null;
      }

      return {
        key: seriesKey,
        label: getSeriesLabel(brandSlug, seriesKey),
        models: sortModelLinks(seriesModels),
      };
    })
    .filter((group): group is SeriesGroup => Boolean(group));
}

export default function RepairTypeModelGrid({
  hubLabel,
  categories,
  title,
  description,
}: RepairTypeModelGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.category ?? '');
  const [expandedBrandSlug, setExpandedBrandSlug] = useState('');
  const [expandedSeriesKey, setExpandedSeriesKey] = useState('');
  const searchId = useId();
  const expandedRegionRef = useRef<HTMLDivElement | null>(null);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const availableCategories = categories.filter((categoryGroup) => categoryGroup.brands.length > 0);
  const currentCategory =
    availableCategories.find((categoryGroup) => categoryGroup.category === activeCategory) ??
    availableCategories[0] ??
    null;
  const searchResults = currentCategory
    ? sortSearchResults(
        currentCategory.brands.flatMap((brandGroup) =>
          brandGroup.models
            .filter((model) => {
              if (!normalizedSearch) return false;
              return (
                model.model.toLowerCase().includes(normalizedSearch) ||
                model.modelCode?.toLowerCase().includes(normalizedSearch) === true
              );
            })
            .map((model) => ({
              ...model,
              brand: brandGroup.brand,
            }))
        )
      )
    : [];
  const visibleSearchResults = searchResults.slice(0, SEARCH_RESULT_LIMIT);
  const hasMoreSearchResults = searchResults.length > SEARCH_RESULT_LIMIT;

  useEffect(() => {
    if (!currentCategory) return;
    if (currentCategory.category !== activeCategory) {
      setActiveCategory(currentCategory.category);
    }
  }, [activeCategory, currentCategory]);

  useEffect(() => {
    if (!normalizedSearch) return;
    setExpandedBrandSlug('');
    setExpandedSeriesKey('');
  }, [normalizedSearch]);

  useEffect(() => {
    if (!expandedBrandSlug) return;

    window.requestAnimationFrame(() => {
      expandedRegionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [expandedBrandSlug]);

  function handleBrandToggle(nextBrandSlug: string) {
    setExpandedBrandSlug((current) => {
      const nextValue = current === nextBrandSlug ? '' : nextBrandSlug;
      setExpandedSeriesKey('');
      return nextValue;
    });
  }

  function handleSeriesToggle(nextSeriesKey: string) {
    setExpandedSeriesKey((current) => (current === nextSeriesKey ? '' : nextSeriesKey));
  }

  return (
    <section aria-labelledby="repair-type-hub-models" className={`repair-content-band ${styles.sectionCard}`}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Choose your device path</p>
          <h2 id="repair-type-hub-models" className={styles.sectionTitle}>
            {title ?? 'Choose your brand and model'}
          </h2>
        </div>
        <p className={styles.sectionBody}>
          {description ?? `Search by model name or code, then expand one brand at a time. Every link goes directly to the existing repair detail page.`}
        </p>
      </div>

      {availableCategories.length > 1 && (
        <div className={styles.categoryPicker} role="tablist" aria-label="Device category">
          {availableCategories.map((categoryGroup) => (
            <button
              key={categoryGroup.category}
              type="button"
              role="tab"
              aria-selected={categoryGroup.category === currentCategory?.category}
              className={`${styles.categoryTab} ${categoryGroup.category === currentCategory?.category ? styles.categoryTabActive : ''}`}
              onClick={() => {
                setActiveCategory(categoryGroup.category);
                setExpandedBrandSlug('');
                setExpandedSeriesKey('');
              }}
            >
              {categoryGroup.categoryLabel}
            </button>
          ))}
        </div>
      )}

      <div className={styles.searchBlock}>
        <label htmlFor={searchId} className={styles.searchLabel}>
          Search model name or model code
        </label>
        <div className={styles.searchContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id={searchId}
            type="text"
            className={styles.searchInput}
            placeholder="Search model name or model code"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        {!normalizedSearch && (
          <p className={styles.searchHint}>
            Search by model name or model code, or browse the brand list below.
          </p>
        )}
      </div>

      {!currentCategory ? (
        <p className={styles.emptyState}>No supported models are available right now.</p>
      ) : normalizedSearch ? (
        visibleSearchResults.length === 0 ? (
          <p className={styles.emptyState}>No supported models found for &quot;{searchTerm}&quot;.</p>
        ) : (
          <div className={styles.finderStack}>
            <section className={styles.subsectionBlock} aria-labelledby="repair-type-search-results-heading">
              <div className={styles.subsectionHeader}>
                <div>
                  <p className={styles.subsectionEyebrow}>Search Results</p>
                  <h3 id="repair-type-search-results-heading" className={styles.subsectionTitle}>
                    Matching models
                  </h3>
                </div>
                <p className={styles.subsectionBody}>
                  {hasMoreSearchResults
                    ? `Showing the first ${SEARCH_RESULT_LIMIT} matches. Refine your search for a shorter list.`
                    : `Showing ${visibleSearchResults.length} matching model${visibleSearchResults.length === 1 ? '' : 's'}.`}
                </p>
              </div>
              <div className={styles.searchResultsGrid}>
                {visibleSearchResults.map((model) => (
                  <Link
                    key={`${model.brandSlug}-${model.modelSlug}-${model.repairSlug}`}
                    href={model.href}
                    prefetch={false}
                    className={styles.resultCard}
                  >
                    <span className={styles.resultBrand}>{model.brand}</span>
                    <div className={styles.resultCardInfo}>
                      <span className={styles.resultModel}>{model.model}</span>
                      {model.modelCode ? <span className={styles.resultModelCode}>({model.modelCode})</span> : null}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )
      ) : (
        <div className={styles.finderStack}>
          <section className={styles.subsectionBlock} aria-labelledby="repair-type-brand-browser-heading">
            <div className={styles.subsectionHeader}>
              <div>
                <p className={styles.subsectionEyebrow}>Browse By Brand</p>
                <h3 id="repair-type-brand-browser-heading" className={styles.subsectionTitle}>
                  Browse supported brands
                </h3>
              </div>
              <p className={styles.subsectionBody}>
                Pick one brand to open its supported models. Only the expanded brand list is loaded into the page at once.
              </p>
            </div>
            <div className={styles.brandAccordion}>
              {currentCategory.brands.map((brandGroup) => {
                const isExpanded = expandedBrandSlug === brandGroup.brandSlug;
                const buttonId = `${searchId}-${brandGroup.brandSlug}-button`;
                const regionId = `${searchId}-${brandGroup.brandSlug}-panel`;
                const sortedBrandModels = sortModelLinks(brandGroup.models);
                const groupedSeries = getBrandSeriesGroups(brandGroup.brandSlug, sortedBrandModels);

                return (
                  <div
                    key={`${currentCategory.category}-${brandGroup.brandSlug}`}
                    className={`${styles.brandAccordionItem} ${isExpanded ? styles.brandAccordionItemOpen : ''}`}
                  >
                    <button
                      id={buttonId}
                      type="button"
                      className={styles.brandToggle}
                      aria-expanded={isExpanded}
                      aria-controls={regionId}
                      onClick={() => handleBrandToggle(brandGroup.brandSlug)}
                    >
                      <div className={styles.brandToggleCopy}>
                        <span className={styles.brandHeading}>{brandGroup.brand}</span>
                        <span className={styles.brandCount}>
                          {brandGroup.models.length} model{brandGroup.models.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <span
                        className={`${styles.brandToggleIndicator} ${isExpanded ? styles.brandToggleIndicatorOpen : ''}`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>

                    {isExpanded ? (
                      <div
                        id={regionId}
                        className={styles.brandPanel}
                        role="region"
                        aria-labelledby={buttonId}
                        ref={expandedRegionRef}
                      >
                        <div className={styles.brandPanelHeader}>
                          <h4 className={styles.brandPanelTitle}>{brandGroup.brand} models</h4>
                          <p className={styles.brandPanelBody}>
                            Select your exact model to go straight to the current {hubLabel.toLowerCase()} detail page.
                          </p>
                        </div>
                        {groupedSeries ? (
                          <div className={styles.seriesBrowser}>
                            <div className={styles.seriesGrid}>
                              {groupedSeries.map((seriesGroup) => {
                                const seriesPanelKey = `${brandGroup.brandSlug}:${seriesGroup.key}`;
                                const isSeriesExpanded = expandedSeriesKey === seriesPanelKey;
                                const seriesButtonId = `${buttonId}-${seriesGroup.key}-button`;
                                const seriesRegionId = `${regionId}-${seriesGroup.key}-panel`;

                                return (
                                  <button
                                    key={seriesPanelKey}
                                    id={seriesButtonId}
                                    type="button"
                                    className={`${styles.seriesCard} ${isSeriesExpanded ? styles.seriesCardActive : ''}`}
                                    aria-expanded={isSeriesExpanded}
                                    aria-controls={seriesRegionId}
                                    onClick={() => handleSeriesToggle(seriesPanelKey)}
                                  >
                                    <div className={styles.seriesCardCopy}>
                                      <span className={styles.seriesHeading}>{seriesGroup.label}</span>
                                      <span className={styles.seriesCount}>
                                        {seriesGroup.models.length} model{seriesGroup.models.length === 1 ? '' : 's'}
                                      </span>
                                    </div>
                                    <span
                                      className={`${styles.seriesToggleIndicator} ${isSeriesExpanded ? styles.seriesToggleIndicatorOpen : ''}`}
                                      aria-hidden="true"
                                    >
                                      +
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            {groupedSeries.map((seriesGroup) => {
                              const seriesPanelKey = `${brandGroup.brandSlug}:${seriesGroup.key}`;
                              const isSeriesExpanded = expandedSeriesKey === seriesPanelKey;
                              const seriesButtonId = `${buttonId}-${seriesGroup.key}-button`;
                              const seriesRegionId = `${regionId}-${seriesGroup.key}-panel`;

                              if (!isSeriesExpanded) {
                                return null;
                              }

                              return (
                                <div
                                  key={seriesPanelKey}
                                  id={seriesRegionId}
                                  className={styles.seriesPanel}
                                  role="region"
                                  aria-labelledby={seriesButtonId}
                                >
                                  <div className={styles.seriesPanelHeader}>
                                    <h5 className={styles.seriesPanelTitle}>{seriesGroup.label}</h5>
                                    <p className={styles.seriesPanelBody}>
                                      Choose your exact {seriesGroup.label.toLowerCase()} model to open the current {hubLabel.toLowerCase()} page directly.
                                    </p>
                                  </div>
                                  <div className={styles.modelGrid}>
                                    {seriesGroup.models.map((model) => (
                                      <Link
                                        key={`${model.brandSlug}-${model.modelSlug}-${model.repairSlug}`}
                                        href={model.href}
                                        prefetch={false}
                                        className={styles.modelCard}
                                      >
                                        <div className={styles.modelCardInfo}>
                                          <span className={styles.modelName}>{model.model}</span>
                                          {model.modelCode ? <span className={styles.modelCode}>({model.modelCode})</span> : null}
                                        </div>
                                        <span className={styles.modelCardArrow} aria-hidden="true">
                                          →
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={styles.modelGrid}>
                            {sortedBrandModels.map((model) => (
                              <Link
                                key={`${model.brandSlug}-${model.modelSlug}-${model.repairSlug}`}
                                href={model.href}
                                prefetch={false}
                                className={styles.modelCard}
                              >
                                <div className={styles.modelCardInfo}>
                                  <span className={styles.modelName}>{model.model}</span>
                                  {model.modelCode ? <span className={styles.modelCode}>({model.modelCode})</span> : null}
                                </div>
                                <span className={styles.modelCardArrow} aria-hidden="true">
                                  →
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
