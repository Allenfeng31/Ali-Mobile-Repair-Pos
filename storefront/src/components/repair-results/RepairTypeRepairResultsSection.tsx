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

interface RepairTypeRepairResultsSectionProps {
  category: RepairResultDeviceCategory;
  repairType: string;
  heading: string;
  description: string;
  initialResults?: RepairResultMatchingItem[];
}

interface MatchingApiResponse {
  status: 'SUCCESS';
  data: RepairResultMatchingItem[];
}

function buildMatchingUrl({ category, repairType }: RepairTypeRepairResultsSectionProps) {
  const params = new URLSearchParams({
    category,
    repair_type: repairType,
    context: 'hub',
    limit: '3',
  });

  return `/api/public/repair-results/matching?${params.toString()}`;
}

export default function RepairTypeRepairResultsSection(props: RepairTypeRepairResultsSectionProps) {
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const requestedRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const hasInitialResults = Boolean(props.initialResults?.length);
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
    let isActive = true;
    const timeout = window.setTimeout(() => controller.abort(), 4000);

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
        if (!isActive) return;
        setResults(nextResults);
        setActiveIndex(0);
      } catch (error) {
        if (!isActive || controller.signal.aborted) return;
        console.error('[repair-type-results] Failed to load matches:', error);
        setResults([]);
      } finally {
        window.clearTimeout(timeout);
        if (isActive) {
          setHasLoaded(true);
        }
      }
    }

    loadMatches();

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [hasInitialResults, props, shouldLoad]);

  if (!hasLoaded) {
    return <div ref={observerTargetRef} className={styles.observerTarget} aria-hidden="true" />;
  }

  if (results.length === 0) return null;

  const activeResult = results[Math.min(activeIndex, results.length - 1)];

  return (
    <section className={styles.section} aria-labelledby="repair-type-results-heading">
      <div className={styles.copy}>
        <span className={styles.kicker}>Recent Jobs</span>
        <h2 id="repair-type-results-heading">{props.heading}</h2>
        <p>{props.description}</p>

        {results.length > 1 && (
          <div className={styles.resultTabs} role="tablist" aria-label={`${props.heading} tabs`}>
            {results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                className={`${styles.resultTab} ${index === activeIndex ? styles.resultTabActive : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                {result.model}
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
          deviceCategory={activeResult.device_category}
          beforeSrc={getRepairResultImageSrc(activeResult, 'before')}
          afterSrc={getRepairResultImageSrc(activeResult, 'after')}
          beforeAlt={getRepairResultAltText(activeResult, 'before')}
          afterAlt={getRepairResultAltText(activeResult, 'after')}
        />
      </div>
    </section>
  );
}
