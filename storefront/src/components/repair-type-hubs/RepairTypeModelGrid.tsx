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

type SortableModelLink = RepairTypeHubModelLink & {
  repairTypes: { slug: string; name: string; price: number }[];
};

const SEARCH_RESULT_LIMIT = 20;

function sortModelLinks<T extends RepairTypeHubModelLink>(models: T[]): T[] {
  const sortable = models.map((model) => ({
    ...model,
    repairTypes: [],
  })) as Array<T & SortableModelLink>;

  return smartSortModels(sortable) as Array<T>;
}

function sortSearchResults(results: SearchResultLink[]) {
  return sortModelLinks(results);
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
  }, [normalizedSearch]);

  function handleBrandToggle(nextBrandSlug: string) {
    setExpandedBrandSlug((current) => {
      const willOpen = current !== nextBrandSlug;

      if (willOpen) {
        window.requestAnimationFrame(() => {
          expandedRegionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      }

      return willOpen ? nextBrandSlug : '';
    });
  }

  return (
    <section aria-labelledby="repair-type-hub-models" className={styles.sectionCard}>
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

                return (
                  <div key={`${currentCategory.category}-${brandGroup.brandSlug}`} className={styles.brandAccordionItem}>
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
