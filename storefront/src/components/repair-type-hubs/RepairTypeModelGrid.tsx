"use client";

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import type {
  RepairTypeHubCategoryGroup,
  RepairTypeHubModelLink,
} from '@/lib/repair-type-hubs';
import {
  getMacBookFamilyKey,
  MACBOOK_FAMILY_LABELS,
  MACBOOK_FAMILY_ORDER,
} from '@/lib/macbookModelFamilies';
import { smartSortModels } from '@/lib/modelSortConfig';
import {
  getIPadSeriesKey,
  getLenovoTabletSeriesKey,
  getSamsungTabletSeriesKey,
  IPAD_REPAIR_TYPE_HUB_SERIES_ORDER,
  IPAD_SERIES_LABELS,
  LENOVO_TABLET_REPAIR_TYPE_HUB_SERIES_ORDER,
  LENOVO_TABLET_SERIES_LABELS,
  SAMSUNG_TABLET_REPAIR_TYPE_HUB_SERIES_ORDER,
  SAMSUNG_TABLET_SERIES_LABELS,
} from '@/lib/tabletModelFamilies';
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

const CATEGORY_MOBILE_LABELS: Record<string, string> = {
  phone: 'Phone Repair',
  tablet: 'Tablet Repair',
  laptop: 'Laptop Repair',
  watch: 'Watch Repair',
};

const CATEGORY_DESKTOP_HEADINGS: Record<string, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  laptop: 'Laptop',
  watch: 'Smart Watch',
};

function getCategoryButtonLabel(category: RepairTypeHubCategoryGroup) {
  return CATEGORY_MOBILE_LABELS[category.category] ?? `${category.categoryLabel} Repair`;
}

function getCategoryDesktopHeading(category: RepairTypeHubCategoryGroup) {
  return CATEGORY_DESKTOP_HEADINGS[category.category] ?? category.categoryLabel;
}

function getBrandKey(category: string, brandSlug: string) {
  return `${category}:${brandSlug}`;
}

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

function getSamsungPhoneSeriesKey(model: RepairTypeHubModelLink) {
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

function buildTabletSeriesGroups(
  brandSlug: 'ipad' | 'samsung' | 'lenovo',
  models: RepairTypeHubModelLink[],
): SeriesGroup[] {
  const groups = new Map<string, RepairTypeHubModelLink[]>();
  const order = brandSlug === 'ipad'
    ? IPAD_REPAIR_TYPE_HUB_SERIES_ORDER
    : brandSlug === 'samsung'
      ? SAMSUNG_TABLET_REPAIR_TYPE_HUB_SERIES_ORDER
      : LENOVO_TABLET_REPAIR_TYPE_HUB_SERIES_ORDER;
  const labels = brandSlug === 'ipad'
    ? IPAD_SERIES_LABELS
    : brandSlug === 'samsung'
      ? SAMSUNG_TABLET_SERIES_LABELS
      : LENOVO_TABLET_SERIES_LABELS;
  const supportedKeys = new Set<string>(order);
  const unsupportedModels: string[] = [];

  for (const model of models) {
    const key = brandSlug === 'ipad'
      ? getIPadSeriesKey(model.model, model.modelSlug)
      : brandSlug === 'samsung'
        ? getSamsungTabletSeriesKey(model.model, model.modelSlug)
        : getLenovoTabletSeriesKey(model.model, model.modelSlug);

    if (!supportedKeys.has(key)) {
      unsupportedModels.push(model.model);
      continue;
    }

    const bucket = groups.get(key) ?? [];
    bucket.push(model);
    groups.set(key, bucket);
  }

  if (unsupportedModels.length > 0) {
    const familyName = brandSlug === 'ipad'
      ? 'iPad'
      : brandSlug === 'samsung'
        ? 'Samsung Tablet'
        : 'Lenovo Tablet';
    throw new Error(`Unsupported ${familyName} models found in Repair Type Hub family grouping: ${unsupportedModels.join(', ')}`);
  }

  return order.flatMap((key) => {
    const seriesModels = groups.get(key);
    if (!seriesModels || seriesModels.length === 0) {
      return [];
    }

    return [{
      key,
      label: labels[key],
      models: seriesModels,
    }];
  });
}

function buildMacBookSeriesGroups(models: RepairTypeHubModelLink[]): SeriesGroup[] {
  const groups = new Map<string, RepairTypeHubModelLink[]>();

  for (const model of models) {
    const key = getMacBookFamilyKey(model.model, model.modelSlug);
    const bucket = groups.get(key) ?? [];
    bucket.push(model);
    groups.set(key, bucket);
  }

  return MACBOOK_FAMILY_ORDER.flatMap((key) => {
    const seriesModels = groups.get(key);
    if (!seriesModels || seriesModels.length === 0) {
      return [];
    }

    return [{
      key,
      label: MACBOOK_FAMILY_LABELS[key],
      models: seriesModels,
    }];
  });
}

function getBrandSeriesGroups(
  category: string,
  brandSlug: string,
  models: RepairTypeHubModelLink[],
): SeriesGroup[] | null {
  if (category === 'tablet' && brandSlug === 'ipad') {
    return buildTabletSeriesGroups('ipad', models);
  }

  if (category === 'tablet' && brandSlug === 'samsung') {
    return buildTabletSeriesGroups('samsung', models);
  }

  if (category === 'tablet' && brandSlug === 'lenovo') {
    return buildTabletSeriesGroups('lenovo', models);
  }

  if (category === 'laptop' && brandSlug === 'macbook') {
    return buildMacBookSeriesGroups(models);
  }

  if (brandSlug !== 'samsung' && brandSlug !== 'oppo') {
    return null;
  }

  const groups = new Map<string, RepairTypeHubModelLink[]>();

  for (const model of models) {
    const seriesKey =
      brandSlug === 'samsung'
        ? getSamsungPhoneSeriesKey(model)
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
  const [activeCategory, setActiveCategory] = useState('');
  const [expandedBrandKey, setExpandedBrandKey] = useState('');
  const [expandedSeriesKey, setExpandedSeriesKey] = useState('');
  const [isMobileLayout, setIsMobileLayout] = useState(true);
  const searchId = useId();
  const expandedRegionRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRefs = useRef(new Map<string, HTMLElement>());
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const availableCategories = categories.filter((categoryGroup) => categoryGroup.brands.length > 0);
  const categoryResetKey = availableCategories
    .map((categoryGroup) => `${categoryGroup.category}:${categoryGroup.brands.map((brand) => brand.brandSlug).join(',')}`)
    .join('|');
  const searchResults = sortSearchResults(
    availableCategories.flatMap((categoryGroup) =>
      categoryGroup.brands.flatMap((brandGroup) =>
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
  );
  const visibleSearchResults = searchResults.slice(0, SEARCH_RESULT_LIMIT);
  const hasMoreSearchResults = searchResults.length > SEARCH_RESULT_LIMIT;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const updateLayoutMode = () => setIsMobileLayout(mediaQuery.matches);

    updateLayoutMode();
    mediaQuery.addEventListener('change', updateLayoutMode);

    return () => mediaQuery.removeEventListener('change', updateLayoutMode);
  }, []);

  useEffect(() => {
    setSearchTerm('');
    setActiveCategory('');
    setExpandedBrandKey('');
    setExpandedSeriesKey('');
  }, [hubLabel, categoryResetKey]);

  useEffect(() => {
    if (!normalizedSearch) return;
    setActiveCategory('');
    setExpandedBrandKey('');
    setExpandedSeriesKey('');
  }, [normalizedSearch]);

  useEffect(() => {
    if (!expandedBrandKey) return;

    window.requestAnimationFrame(() => {
      expandedRegionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [expandedBrandKey]);

  function handleCategoryToggle(nextCategory: string) {
    if (!isMobileLayout) return;

    const willOpenCategory = activeCategory !== nextCategory;

    setActiveCategory((current) => {
      const nextValue = current === nextCategory ? '' : nextCategory;
      setExpandedBrandKey('');
      setExpandedSeriesKey('');
      return nextValue;
    });

    if (willOpenCategory) {
      window.requestAnimationFrame(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        categorySectionRefs.current.get(nextCategory)?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    }
  }

  function handleBrandToggle(category: string, nextBrandSlug: string) {
    const nextBrandKey = getBrandKey(category, nextBrandSlug);

    setExpandedBrandKey((current) => {
      const nextValue = current === nextBrandKey ? '' : nextBrandKey;
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

      {availableCategories.length === 0 ? (
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
            <div className={styles.categoryBrowser}>
              {availableCategories.map((categoryGroup) => {
                const categoryIsExpanded = !isMobileLayout || activeCategory === categoryGroup.category;
                const categoryButtonId = `${searchId}-${categoryGroup.category}-category-button`;
                const categoryRegionId = `${searchId}-${categoryGroup.category}-category-panel`;

                return (
                  <section
                    key={categoryGroup.category}
                    ref={(element) => {
                      if (element) {
                        categorySectionRefs.current.set(categoryGroup.category, element);
                      } else {
                        categorySectionRefs.current.delete(categoryGroup.category);
                      }
                    }}
                    className={`${styles.deviceCategorySection} ${categoryIsExpanded ? styles.deviceCategorySectionOpen : ''}`}
                    data-category={categoryGroup.category}
                    data-expanded={categoryIsExpanded}
                    aria-labelledby={categoryButtonId}
                  >
                    <button
                      id={categoryButtonId}
                      type="button"
                      className={styles.categoryToggle}
                      role={isMobileLayout ? undefined : 'heading'}
                      aria-level={isMobileLayout ? undefined : 4}
                      aria-expanded={isMobileLayout ? categoryIsExpanded : undefined}
                      aria-controls={isMobileLayout ? categoryRegionId : undefined}
                      tabIndex={isMobileLayout ? undefined : -1}
                      onClick={() => handleCategoryToggle(categoryGroup.category)}
                    >
                      <span className={styles.categoryDesktopHeading}>{getCategoryDesktopHeading(categoryGroup)}</span>
                      <span className={styles.categoryMobileHeading}>{getCategoryButtonLabel(categoryGroup)}</span>
                      <span
                        className={`${styles.categoryToggleIndicator} ${categoryIsExpanded ? styles.categoryToggleIndicatorOpen : ''}`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>

                    <div
                      id={categoryRegionId}
                      className={styles.deviceCategoryPanel}
                      role="region"
                      aria-labelledby={categoryButtonId}
                      data-expanded={categoryIsExpanded}
                    >
                      <div className={styles.brandAccordion}>
                        {categoryGroup.brands.map((brandGroup) => {
                          const brandKey = getBrandKey(categoryGroup.category, brandGroup.brandSlug);
                          const isExpanded = expandedBrandKey === brandKey;
                          const buttonId = `${searchId}-${categoryGroup.category}-${brandGroup.brandSlug}-button`;
                          const regionId = `${searchId}-${categoryGroup.category}-${brandGroup.brandSlug}-panel`;
                          const sortedBrandModels = sortModelLinks(brandGroup.models);
                          const groupedSeries = getBrandSeriesGroups(categoryGroup.category, brandGroup.brandSlug, sortedBrandModels);

                          return (
                            <div
                              key={brandKey}
                              className={`${styles.brandAccordionItem} ${isExpanded ? styles.brandAccordionItemOpen : ''}`}
                            >
                              <button
                                id={buttonId}
                                type="button"
                                className={styles.brandToggle}
                                aria-expanded={isExpanded}
                                aria-controls={regionId}
                                onClick={() => handleBrandToggle(categoryGroup.category, brandGroup.brandSlug)}
                              >
                                <div className={styles.brandToggleCopy}>
                                  <span className={styles.brandHeading}>{brandGroup.brand}</span>
                                  <span className={styles.brandCount}>
                                    {brandGroup.models.length > 0
                                      ? `${brandGroup.models.length} model${brandGroup.models.length === 1 ? '' : 's'}`
                                      : 'Check exact model options'}
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
                                      {brandGroup.models.length > 0
                                        ? `Select your exact model to go straight to the current ${hubLabel.toLowerCase()} detail page.`
                                        : brandGroup.fallbackMessage ?? `Check available ${brandGroup.brand} repair options by exact model before choosing a repair path.`}
                                    </p>
                                  </div>

                                  {brandGroup.models.length === 0 ? (
                                    brandGroup.brandHubHref ? (
                                      <div className={styles.supportingLinks}>
                                        <Link href={brandGroup.brandHubHref} prefetch={false} className={styles.supportingLink}>
                                          View {brandGroup.brand} repair options
                                        </Link>
                                      </div>
                                    ) : null
                                  ) : groupedSeries ? (
                                    <div className={styles.seriesBrowser}>
                                      <div className={styles.seriesGrid}>
                                        {groupedSeries.map((seriesGroup) => {
                                          const seriesPanelKey = `${brandKey}:${seriesGroup.key}`;
                                          const isSeriesExpanded = expandedSeriesKey === seriesPanelKey;
                                          const seriesButtonId = `${buttonId}-${seriesGroup.key}-button`;
                                          const seriesRegionId = `${regionId}-${seriesGroup.key}-panel`;

                                          return (
                                              <div
                                                key={seriesPanelKey}
                                                className={`${styles.seriesItem} ${isSeriesExpanded ? styles.seriesItemActive : ''}`}
                                              >
                                                <button
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

                                                {isSeriesExpanded ? (
                                                  <div
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
                                                ) : null}
                                              </div>
                                          );
                                        })}
                                      </div>
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
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
