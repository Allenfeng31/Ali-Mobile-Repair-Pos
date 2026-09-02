"use client";

import { useEffect, useRef, useState } from 'react';
import {
  getRepairResultAltText,
  getRepairResultImageSrc,
  type RepairResultDeviceCategory,
  type RepairResultMatchingItem,
} from '@/lib/repair-results';
import BeforeAfterSlider from './BeforeAfterSlider';
import styles from './RepairResultsMatchingSection.module.css';

type RepairResultsMatchingContext = 'model' | 'detail';

interface RepairResultsMatchingSectionProps {
  category: string;
  brand: string;
  model: string;
  repairType?: string;
  context: RepairResultsMatchingContext;
  mobileVariant?: 'iphone15-compact-pilot';
  initialResults?: RepairResultMatchingItem[];
}

interface MatchingApiResponse {
  status: 'SUCCESS';
  data: RepairResultMatchingItem[];
}

function isDeviceCategory(value: string): value is RepairResultDeviceCategory {
  return value === 'phone' || value === 'tablet' || value === 'laptop' || value === 'watch';
}

function buildMatchingUrl({
  category,
  brand,
  model,
  repairType,
  context,
}: RepairResultsMatchingSectionProps) {
  const params = new URLSearchParams({
    category,
    brand,
    model,
    context,
    limit: '3',
  });

  if (repairType) {
    params.set('repair_type', repairType);
  }

  return `/api/public/repair-results/matching?${params.toString()}`;
}

export default function RepairResultsMatchingSection(props: RepairResultsMatchingSectionProps) {
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const requestedRef = useRef(false);
  const hasInitialResults = Boolean(props.initialResults?.length);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [results, setResults] = useState<RepairResultMatchingItem[]>(() => props.initialResults || []);
  const [hasLoaded, setHasLoaded] = useState(hasInitialResults);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (hasInitialResults) return;
    const target = observerTargetRef.current;
    if (!target || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1000px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasInitialResults, shouldLoad]);

  useEffect(() => {
    if (hasInitialResults) return;
    if (!shouldLoad || requestedRef.current) return;
    requestedRef.current = true;

    const controller = new AbortController();

    async function loadMatches() {
      try {
        const response = await fetch(buildMatchingUrl(props), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Repair results matching request failed: ${response.status}`);
        }

        const payload = (await response.json()) as MatchingApiResponse;
        const nextResults = Array.isArray(payload.data) ? payload.data.slice(0, 3) : [];
        setResults(nextResults);
        setActiveIndex(0);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('[repair-results-matching] Failed to load matches:', error);
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setHasLoaded(true);
        }
      }
    }

    loadMatches();
    return () => controller.abort();
  }, [hasInitialResults, props, shouldLoad]);

  if (!hasLoaded) {
    return <div ref={observerTargetRef} className={styles.observerTarget} aria-hidden="true" />;
  }

  if (results.length === 0) return null;

  const activeResult = results[Math.min(activeIndex, results.length - 1)];
  const deviceCategory = isDeviceCategory(activeResult.device_category) ? activeResult.device_category : 'phone';
  const isIphone15MobilePilot = props.mobileVariant === 'iphone15-compact-pilot';

  return (
    <section
      className={`${styles.section} ${isIphone15MobilePilot ? styles.iphone15CompactPilot : ''}`}
      aria-labelledby="matching-repair-results-heading"
    >
      <div className={styles.copy}>
        <span className={styles.kicker}>Workshop Proof</span>
        <h2 id="matching-repair-results-heading">Real Repair Results</h2>
        <p>Approved before and after repair photos from Ali Mobile &amp; Repair jobs, checked for privacy before publishing.</p>

        {results.length > 1 && (
          <div className={styles.resultTabs} role="tablist" aria-label="Matching repair results">
            {results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={`${styles.resultTab} ${index === activeIndex ? styles.resultTabActive : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                {result.repair_type}
              </button>
            ))}
          </div>
        )}

        <div className={styles.resultMeta}>
          <strong>{activeResult.title}</strong>
          {activeResult.short_description && <span>{activeResult.short_description}</span>}
        </div>

        {activeResult.related_repair_url && (
          <a className={styles.relatedLink} href={activeResult.related_repair_url}>
            View matching repair page
          </a>
        )}
      </div>

      <div className={styles.visual}>
        <BeforeAfterSlider
          key={activeResult.id}
          deviceCategory={deviceCategory}
          beforeSrc={getRepairResultImageSrc(activeResult, 'before')}
          afterSrc={getRepairResultImageSrc(activeResult, 'after')}
          beforeAlt={getRepairResultAltText(activeResult, 'before')}
          afterAlt={getRepairResultAltText(activeResult, 'after')}
          compactMobile={isIphone15MobilePilot}
        />
      </div>
    </section>
  );
}
