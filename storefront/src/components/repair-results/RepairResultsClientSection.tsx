"use client";

import { useState } from 'react';
import {
  getRepairResultAltText,
  getRepairResultImageSrc,
  type PublicRepairResult,
  type RepairResultDeviceCategory,
} from '@/lib/repair-results';
import BeforeAfterSlider from './BeforeAfterSlider';
import styles from './RepairResultsClientSection.module.css';

interface RepairResultsClientSectionProps {
  results: PublicRepairResult[];
}

function isDeviceCategory(value: string): value is RepairResultDeviceCategory {
  return value === 'phone' || value === 'tablet' || value === 'laptop' || value === 'watch';
}

export default function RepairResultsClientSection({ results }: RepairResultsClientSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (results.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="matching-repair-results-heading">
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

        {/* 
          Render textual content and links for ALL results to ensure search engines can discover them 
          without needing to click tabs. Visually hide inactive ones. 
        */}
        <div className={styles.resultMetaContainer}>
          {results.map((result, index) => (
            <div 
              key={`meta-${result.id}`} 
              className={styles.resultMeta} 
              style={{ display: index === activeIndex ? 'flex' : 'none' }}
              aria-hidden={index !== activeIndex}
            >
              <strong>{result.title}</strong>
              {result.short_description && <span>{result.short_description}</span>}
              {result.related_repair_url && (
                <a 
                  href={result.related_repair_url} 
                  className={styles.relatedLink}
                >
                  View repair pricing →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        <div className={styles.sliderContainer}>
          {/* Pre-render all slider components. Lazy load images via standard Next.js logic internally if needed,
              but they will be in the DOM. */}
          {results.map((result, index) => {
            const resultDeviceCategory = isDeviceCategory(result.device_category) ? result.device_category : 'phone';
            return (
              <div 
                key={`slider-${result.id}`}
                style={{ display: index === activeIndex ? 'block' : 'none', width: '100%', height: '100%' }}
                aria-hidden={index !== activeIndex}
              >
                <BeforeAfterSlider
                  beforeSrc={getRepairResultImageSrc(result as any, 'before')}
                  afterSrc={getRepairResultImageSrc(result as any, 'after')}
                  beforeAlt={getRepairResultAltText(result as any, 'before')}
                  afterAlt={getRepairResultAltText(result as any, 'after')}
                  deviceCategory={resultDeviceCategory}
                  priority={index === 0}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
