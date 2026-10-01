'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  getRepairResultAltText,
  getRepairResultImageSrc,
  type RepairResultMatchingItem,
} from '@/lib/repair-results';
import BeforeAfterSlider from './BeforeAfterSlider';
import styles from './RepairResultsMatchingSection.module.css';

export default function SharedRepairPageResultsSection({
  initialResults,
  repairName,
  selectedModelSlug = null,
}: {
  initialResults: RepairResultMatchingItem[];
  repairName: string;
  selectedModelSlug?: string | null;
}) {
  const results = initialResults;
  const [activeIndex, setActiveIndex] = useState(0);

  if (results.length === 0) return null;

  const activeResult = results[Math.min(activeIndex, results.length - 1)];
  const isSameBrandFallback = selectedModelSlug !== null && activeResult.model_slug !== selectedModelSlug;
  const repairLabel = activeResult.repair_type.replace(/\s+(?:Replacement|Repair)$/i, '');
  const modelFamily = activeResult.brand === 'Samsung' ? 'Samsung Galaxy' : activeResult.brand;
  return (
    <section className={styles.section} aria-labelledby="shared-repair-results-heading">
      <div className={styles.copy}>
        <span className={styles.kicker}>Workshop Proof</span>
        <h2 id="shared-repair-results-heading">Real {repairName} Results</h2>
        <p>Approved before and after repair photos from matching Ali Mobile &amp; Repair jobs, checked for privacy before publishing.</p>
        {results.length > 1 ? (
          <div className={styles.resultTabs} role="tablist" aria-label="Matching shared repair results">
            {results.map((result, index) => <button key={result.id} type="button" role="tab" aria-selected={index === activeIndex} className={`${styles.resultTab} ${index === activeIndex ? styles.resultTabActive : ''}`} onClick={() => setActiveIndex(index)}>{result.model}</button>)}
          </div>
        ) : null}
        <div className={styles.resultMeta}>
          {isSameBrandFallback ? <strong>Similar {activeResult.brand} {repairLabel} Repair</strong> : null}
          <strong>{activeResult.brand} {activeResult.model} · {activeResult.repair_type}</strong>
          {isSameBrandFallback ? <span>Example from another {modelFamily} model repaired by Ali Mobile &amp; Repair.</span> : null}
          <span>{activeResult.title}</span>
          {activeResult.short_description ? <span>{activeResult.short_description}</span> : null}
          {activeResult.related_repair_url ? <Link href={activeResult.related_repair_url} className={styles.relatedLink}>View matching repair page</Link> : null}
        </div>
      </div>
      <div className={styles.visual}>
        <BeforeAfterSlider
          key={activeResult.id}
          deviceCategory="phone"
          beforeSrc={getRepairResultImageSrc(activeResult, 'before')}
          afterSrc={getRepairResultImageSrc(activeResult, 'after')}
          beforeAlt={getRepairResultAltText(activeResult, 'before')}
          afterAlt={getRepairResultAltText(activeResult, 'after')}
        />
      </div>
    </section>
  );
}
