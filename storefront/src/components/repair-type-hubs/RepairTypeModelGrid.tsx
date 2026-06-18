"use client";

import { useId, useState } from 'react';
import Link from 'next/link';
import type { RepairTypeHubCategoryGroup } from '@/lib/repair-type-hubs';
import styles from './RepairTypeHub.module.css';

interface RepairTypeModelGridProps {
  hubLabel: string;
  categories: RepairTypeHubCategoryGroup[];
}

export default function RepairTypeModelGrid({ hubLabel, categories }: RepairTypeModelGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchId = useId();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const showCategoryHeadings = categories.length > 1;

  const filteredCategories = categories
    .map((categoryGroup) => ({
      ...categoryGroup,
      brands: categoryGroup.brands
        .map((brandGroup) => ({
          ...brandGroup,
          models: brandGroup.models.filter((model) => {
            if (!normalizedSearch) return true;
            return (
              model.model.toLowerCase().includes(normalizedSearch) ||
              model.modelCode?.toLowerCase().includes(normalizedSearch) === true
            );
          }),
        }))
        .filter((brandGroup) => brandGroup.models.length > 0),
    }))
    .filter((categoryGroup) => categoryGroup.brands.length > 0);

  return (
    <section aria-labelledby="repair-type-hub-models" className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Supported Models</p>
          <h2 id="repair-type-hub-models" className={styles.sectionTitle}>
            Find a matching model for {hubLabel}
          </h2>
        </div>
        <p className={styles.sectionBody}>
          Only real catalogue matches are shown here. Every link goes directly to the existing brand, model, and repair page.
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
      </div>

      {filteredCategories.length === 0 ? (
        <p className={styles.emptyState}>No supported models found for &quot;{searchTerm}&quot;.</p>
      ) : (
        <div className={styles.categoryStack}>
          {filteredCategories.map((categoryGroup) => (
            <section key={categoryGroup.category} className={styles.categorySection}>
              {showCategoryHeadings && (
                <h3 className={styles.categoryHeading}>{categoryGroup.categoryLabel}</h3>
              )}

              {categoryGroup.brands.map((brandGroup) => (
                <div key={`${categoryGroup.category}-${brandGroup.brandSlug}`} className={styles.brandSection}>
                  <h4 className={styles.brandHeading}>{brandGroup.brand}</h4>
                  <div className={styles.modelGrid}>
                    {brandGroup.models.map((model) => (
                      <Link
                        key={`${model.brandSlug}-${model.modelSlug}-${model.repairSlug}`}
                        href={model.href}
                        prefetch={false}
                        className={styles.modelCard}
                      >
                        <div className={styles.modelCardInfo}>
                          <span className={styles.modelName}>{model.model}</span>
                          {model.modelCode && <span className={styles.modelCode}>({model.modelCode})</span>}
                        </div>
                        <span className={styles.modelCardArrow} aria-hidden="true">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
