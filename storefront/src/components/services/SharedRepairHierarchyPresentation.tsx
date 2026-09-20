'use client';

import { useState } from 'react';
import Link from 'next/link';
import SharedRepairPageV2ModelListPresentation from './SharedRepairPageV2ModelListPresentation';
import listStyles from './SharedRepairPageV2ModelListPresentation.module.css';
import styles from './SharedRepairHierarchyPresentation.module.css';
import hubStyles from '@/components/repair-type-hubs/RepairTypeHub.module.css';
import type {
  SharedRepairHierarchy,
  SharedRepairHierarchyBrand,
  SharedRepairHierarchyModel,
} from '@/lib/sharedRepairHierarchy';

interface SharedRepairHierarchyPresentationProps {
  hierarchy: SharedRepairHierarchy;
}

function hierarchyId(...parts: string[]) {
  return `shared-repair-hierarchy-${parts.join('-')}`;
}

function ModelCards({
  models,
  regionId,
  initiallyExpanded,
}: {
  models: SharedRepairHierarchyModel[];
  regionId: string;
  initiallyExpanded: boolean;
}) {
  return (
    <SharedRepairPageV2ModelListPresentation
      regionId={regionId}
      initiallyExpanded={initiallyExpanded}
      modelCount={models.length}
    >
      {models.map((model) => (
        <article
          id={model.modelSlug}
          key={model.modelSlug}
          data-shared-repair-model-card
          className={`scroll-mt-28 ${listStyles.modelCard} ${hubStyles.brandAccordionItem}`}
        >
          <Link href={model.bookingHref} prefetch={false} className={hubStyles.brandToggle}>
            <span className={hubStyles.brandToggleCopy}>
              <span className={hubStyles.brandHeading}>{model.modelLabel}</span>
              <span className={hubStyles.brandCount}>{model.repairLabel}</span>
            </span>
            {model.priceLabel ? <span className={hubStyles.modelCardArrow}>{model.priceLabel}</span> : null}
          </Link>
        </article>
      ))}
    </SharedRepairPageV2ModelListPresentation>
  );
}

function BrandModels({ brand }: { brand: SharedRepairHierarchyBrand }) {
  const regionId = hierarchyId(brand.brandSlug, 'models');
  return (
    <ModelCards
      models={brand.models}
      regionId={regionId}
      initiallyExpanded={brand.initiallyExpandedModelList}
    />
  );
}

export default function SharedRepairHierarchyPresentation({ hierarchy }: SharedRepairHierarchyPresentationProps) {
  const isMultiBrand = hierarchy.brands.length > 1;
  const initialBrandSlug = hierarchy.brands.find((brand) => brand.initiallyExpanded)?.brandSlug ?? null;
  const initialSeriesId = hierarchy.brands.flatMap((brand) => brand.series.map((series) => ({
    id: hierarchyId(brand.brandSlug, series.seriesKey),
    initiallyExpanded: series.initiallyExpanded,
  }))).find((series) => series.initiallyExpanded)?.id ?? null;
  const [openBrandSlug, setOpenBrandSlug] = useState(initialBrandSlug);
  const [openSeriesId, setOpenSeriesId] = useState(initialSeriesId);

  return (
    <div className={styles.brandList} data-shared-repair-hierarchy>
      {hierarchy.brands.map((brand) => {
        const brandId = hierarchyId(brand.brandSlug, 'panel');
        const brandExpanded = !isMultiBrand || openBrandSlug === brand.brandSlug;
        const hasSeries = brand.series.length > 0;

        return (
          <article
            key={brand.brandSlug}
            className={`${hubStyles.brandAccordionItem} ${brandExpanded ? hubStyles.brandAccordionItemOpen : ''}`}
          >
            {isMultiBrand ? (
              <button
                type="button"
                className={hubStyles.brandToggle}
                data-shared-repair-hierarchy-control
                aria-expanded={brandExpanded}
                aria-controls={brandId}
                onClick={() => {
                  setOpenBrandSlug((current) => current === brand.brandSlug ? null : brand.brandSlug);
                  setOpenSeriesId(null);
                }}
              >
                <span className={hubStyles.brandToggleCopy}>
                  <span className={hubStyles.brandHeading}>{brand.brandLabel}</span>
                  <span className={hubStyles.brandCount}>{brand.modelCount} models</span>
                </span>
                <span className={`${hubStyles.brandToggleIndicator} ${brandExpanded ? hubStyles.brandToggleIndicatorOpen : ''}`} aria-hidden="true">+</span>
              </button>
            ) : null}
            <div
              id={brandId}
              className={`${styles.panel} ${styles.brandPanel}`}
              data-shared-repair-hierarchy-panel
              data-expanded={brandExpanded}
            >
              {hasSeries ? (
                <div className={styles.seriesList}>
                  {brand.series.map((series) => {
                    const seriesId = hierarchyId(brand.brandSlug, series.seriesKey);
                    const seriesPanelId = `${seriesId}-panel`;
                    const seriesExpanded = openSeriesId === seriesId;

                    return (
                      <div key={series.seriesKey} className={hubStyles.seriesItem}>
                        <button
                          type="button"
                          className={`${hubStyles.seriesCard} ${seriesExpanded ? hubStyles.seriesCardActive : ''}`}
                          data-shared-repair-hierarchy-control
                          aria-expanded={seriesExpanded}
                          aria-controls={seriesPanelId}
                          onClick={() => setOpenSeriesId((current) => current === seriesId ? null : seriesId)}
                        >
                          <span className={hubStyles.seriesCardCopy}>
                            <span className={hubStyles.seriesHeading}>{series.seriesLabel}</span>
                            <span className={hubStyles.seriesCount}>{series.models.length} models</span>
                          </span>
                          <span className={`${hubStyles.seriesToggleIndicator} ${seriesExpanded ? hubStyles.seriesToggleIndicatorOpen : ''}`} aria-hidden="true">+</span>
                        </button>
                        <div
                          id={seriesPanelId}
                          className={`${styles.panel} ${styles.seriesPanel}`}
                          data-shared-repair-hierarchy-panel
                          data-expanded={seriesExpanded}
                        >
                          <ModelCards
                            models={series.models}
                            regionId={`${seriesId}-models`}
                            initiallyExpanded={series.initiallyExpandedModelList}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <BrandModels brand={brand} />}
            </div>
          </article>
        );
      })}
      <noscript>
        <style>{`[data-shared-repair-hierarchy-panel] { display: block !important; } [data-shared-repair-hierarchy-control] { display: none !important; }`}</style>
      </noscript>
    </div>
  );
}
