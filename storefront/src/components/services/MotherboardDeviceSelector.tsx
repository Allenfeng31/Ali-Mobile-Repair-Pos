'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { MotherboardSelectorGroup } from '@/lib/motherboardSelector';
import hubStyles from '@/components/repair-type-hubs/RepairTypeHub.module.css';
import styles from './SharedRepairHierarchyPresentation.module.css';

export default function MotherboardDeviceSelector({ groups }: { groups: readonly MotherboardSelectorGroup[] }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openBrand, setOpenBrand] = useState<string | null>(null);
  const [openSeries, setOpenSeries] = useState<string | null>(null);

  return <div className={styles.brandList} data-motherboard-device-selector>
    {groups.map((group) => {
      const groupId = `motherboard-group-${group.key}`;
      const groupExpanded = openGroup === group.key;

      return <article key={group.key} className={`${hubStyles.brandAccordionItem} ${groupExpanded ? hubStyles.brandAccordionItemOpen : ''}`}>
        <button
          type="button"
          className={hubStyles.brandToggle}
          aria-expanded={groupExpanded}
          aria-controls={groupId}
          onClick={() => {
            setOpenGroup((current) => current === group.key ? null : group.key);
            setOpenBrand(null);
            setOpenSeries(null);
          }}
        >
          <span className={hubStyles.brandToggleCopy}>
            <span className={hubStyles.brandHeading}>{group.label}</span>
            <span className={hubStyles.brandCount}>{group.modelCount} models</span>
          </span>
          <span className={`${hubStyles.brandToggleIndicator} ${groupExpanded ? hubStyles.brandToggleIndicatorOpen : ''}`} aria-hidden="true">+</span>
        </button>
        <div id={groupId} className={`${styles.panel} ${styles.brandPanel}`} hidden={!groupExpanded}>
          <div className={styles.seriesList}>
            {group.brands.map((brand) => {
              const brandKey = `${group.key}-${brand.brandSlug}`;
              const brandId = `motherboard-brand-${brandKey}`;
              const brandExpanded = openBrand === brandKey;
              return <div key={brandKey} className={hubStyles.seriesItem}>
                <button
                  type="button"
                  className={`${hubStyles.seriesCard} ${brandExpanded ? hubStyles.seriesCardActive : ''}`}
                  aria-expanded={brandExpanded}
                  aria-controls={brandId}
                  onClick={() => {
                    setOpenBrand((current) => current === brandKey ? null : brandKey);
                    setOpenSeries(null);
                  }}
                >
                  <span className={hubStyles.seriesCardCopy}>
                    <span className={hubStyles.seriesHeading}>{brand.brand}</span>
                    <span className={hubStyles.seriesCount}>{brand.series.reduce((count, series) => count + series.models.length, 0)} models</span>
                  </span>
                  <span className={`${hubStyles.seriesToggleIndicator} ${brandExpanded ? hubStyles.seriesToggleIndicatorOpen : ''}`} aria-hidden="true">+</span>
                </button>
                <div id={brandId} className={`${styles.panel} ${styles.seriesPanel}`} hidden={!brandExpanded}>
                  {brand.series.map((series) => {
                    const seriesKey = `${brandKey}-${series.label}`;
                    const seriesId = `motherboard-series-${seriesKey.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
                    const seriesExpanded = openSeries === seriesKey;
                    return <div key={seriesKey} className={hubStyles.seriesItem}>
                      <button
                        type="button"
                        className={`${hubStyles.seriesCard} ${seriesExpanded ? hubStyles.seriesCardActive : ''}`}
                        aria-expanded={seriesExpanded}
                        aria-controls={seriesId}
                        onClick={() => setOpenSeries((current) => current === seriesKey ? null : seriesKey)}
                      >
                        <span className={hubStyles.seriesCardCopy}>
                          <span className={hubStyles.seriesHeading}>{series.label}</span>
                          <span className={hubStyles.seriesCount}>{series.models.length} models</span>
                        </span>
                        <span className={`${hubStyles.seriesToggleIndicator} ${seriesExpanded ? hubStyles.seriesToggleIndicatorOpen : ''}`} aria-hidden="true">+</span>
                      </button>
                      <div id={seriesId} className={`${styles.panel} ${styles.seriesPanel}`} hidden={!seriesExpanded}>
                        <ul className={styles.modelList}>
                          {series.models.map((model) => <li key={`${model.category}-${model.brandSlug}-${model.modelSlug}`}>
                            <Link href={model.href} prefetch={false} className={styles.modelLink}>{model.model}</Link>
                          </li>)}
                        </ul>
                      </div>
                    </div>;
                  })}
                </div>
              </div>;
            })}
          </div>
        </div>
      </article>;
    })}
    <noscript><style>{`[data-motherboard-device-selector] [hidden] { display: block !important; }`}</style></noscript>
  </div>;
}
