"use client";

import { useEffect, useState } from 'react';
import {
  REPAIR_RESULT_CATEGORIES,
  getRepairResultAltText,
  getRepairResultImageSrc,
  type RepairResultHomepageItem,
  type RepairResultDeviceCategory,
} from '@/lib/repair-results';
import BeforeAfterSlider from './BeforeAfterSlider';
import styles from './RealRepairResultsSection.module.css';

interface RepairResultsApiResponse {
  status: 'SUCCESS';
  data: Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>>;
}

function firstAvailableCategory(resultsByCategory: Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>>) {
  return REPAIR_RESULT_CATEGORIES.find((category) => resultsByCategory[category.value])?.value || 'phone';
}

export default function RealRepairResultsSection() {
  const [resultsByCategory, setResultsByCategory] = useState<
    Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>>
  >({});
  const [activeCategory, setActiveCategory] = useState<RepairResultDeviceCategory>('phone');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepairResults() {
      try {
        const response = await fetch('/api/public/repair-results', {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Repair results request failed: ${response.status}`);
        }

        const payload = (await response.json()) as RepairResultsApiResponse;
        const nextResults = payload?.status === 'SUCCESS' ? payload.data || {} : {};
        setResultsByCategory(nextResults);

        if (nextResults.phone) {
          setActiveCategory('phone');
        } else {
          setActiveCategory(firstAvailableCategory(nextResults));
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('[repair-results] Failed to load public homepage data:', error);
        setResultsByCategory({});
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRepairResults();

    return () => controller.abort();
  }, []);

  const hasResults = REPAIR_RESULT_CATEGORIES.some((category) => resultsByCategory[category.value]);

  useEffect(() => {
    if (!hasResults) return;

    if (!resultsByCategory[activeCategory]) {
      setActiveCategory(firstAvailableCategory(resultsByCategory));
    }
  }, [activeCategory, hasResults, resultsByCategory]);

  if (isLoading || !hasResults) return null;

  const activeResult = resultsByCategory[activeCategory] || resultsByCategory[firstAvailableCategory(resultsByCategory)];
  if (!activeResult) return null;

  const beforeSrc = getRepairResultImageSrc(activeResult, 'before');
  const afterSrc = getRepairResultImageSrc(activeResult, 'after');

  return (
    <section className={styles.section} aria-labelledby="real-repair-results-heading">
      <div className={styles.shell}>
        <div className={styles.copyCard}>
          <div className={styles.copyHeader}>
            <span className={styles.kicker}>Workshop Proof</span>
            <h2 id="real-repair-results-heading">Real Repair Results</h2>
            <p>
              Before and after repair photos from approved Ali Mobile &amp; Repair jobs, checked for privacy before they appear here.
            </p>
          </div>

          <div className={styles.meta}>
            <strong>{activeResult.title}</strong>
            {activeResult.short_description && <span>{activeResult.short_description}</span>}
          </div>

          <div className={styles.switcher} role="tablist" aria-label="Repair result categories">
            {REPAIR_RESULT_CATEGORIES.map((category) => {
              const available = Boolean(resultsByCategory[category.value]);
              const selected = activeResult.device_category === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  disabled={!available}
                  className={`${styles.switchButton} ${selected ? styles.switchButtonActive : ''}`}
                  onMouseEnter={() => available && setActiveCategory(category.value)}
                  onFocus={() => available && setActiveCategory(category.value)}
                  onClick={() => available && setActiveCategory(category.value)}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {activeResult.related_repair_url && (
            <a className={styles.relatedLink} href={activeResult.related_repair_url}>
              View matching repair page
            </a>
          )}
        </div>

        <BeforeAfterSlider
          key={activeResult.id}
          deviceCategory={activeResult.device_category}
          beforeSrc={beforeSrc}
          afterSrc={afterSrc}
          beforeAlt={getRepairResultAltText(activeResult, 'before')}
          afterAlt={getRepairResultAltText(activeResult, 'after')}
          priority={true}
        />
      </div>
    </section>
  );
}
