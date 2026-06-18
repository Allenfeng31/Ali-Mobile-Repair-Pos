"use client";

import { useEffect, useState, useRef } from 'react';
import {
  getRepairResultAltText,
  getRepairResultImageSrc,
  type PublicRepairResult,
  type RepairResultDeviceCategory,
} from '@/lib/repair-results';
import BeforeAfterSlider from './BeforeAfterSlider';
import styles from './HubRepairResultsSection.module.css';

interface HubRepairResultsSectionProps {
  category: RepairResultDeviceCategory;
  brand?: string;
  scope: 'repair-hub' | 'brand-hub';
}

type RepairGroup = 'screen' | 'battery' | 'charging-port' | 'back-glass-or-housing';

const GROUP_LABELS: Record<RepairGroup, string> = {
  'screen': 'Screen Replacement',
  'battery': 'Battery Replacement',
  'charging-port': 'Charging Port Replacement',
  'back-glass-or-housing': 'Back Glass / Housing Replacement',
};

const GROUPS_IN_ORDER: RepairGroup[] = ['screen', 'battery', 'charging-port', 'back-glass-or-housing'];

function normalizeRepairGroup(slug: string): RepairGroup | null {
  if (slug === 'screen-replacement' || slug === 'screen-repair' || slug === 'screen') {
    return 'screen';
  }
  if (slug === 'battery-replacement' || slug === 'battery-service' || slug === 'battery-repair' || slug === 'battery') {
    return 'battery';
  }
  if (slug === 'charging-port-replacement' || slug === 'charging-port-repair' || slug === 'charging-port') {
    return 'charging-port';
  }
  if (slug === 'back-glass-replacement' || slug === 'back-housing-replacement' || slug === 'back-glass' || slug === 'back-housing') {
    return 'back-glass-or-housing';
  }
  return null;
}

export default function HubRepairResultsSection({ category, brand, scope }: HubRepairResultsSectionProps) {
  const [results, setResults] = useState<PublicRepairResult[]>([]);
  const [activeGroup, setActiveGroup] = useState<RepairGroup | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hasLoaded || failed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          observer.disconnect();

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const params = new URLSearchParams();
          params.set('category', category);
          if (brand) {
            params.set('brand', brand);
          }

          fetch(`/api/public/repair-results/hub?${params.toString()}`, {
            signal: controller.signal,
          })
            .then(res => {
              clearTimeout(timeoutId);
              if (!res.ok) throw new Error('Failed');
              return res.json();
            })
            .then(payload => {
              if (payload.status === 'SUCCESS' && Array.isArray(payload.data) && payload.data.length > 0) {
                setResults(payload.data);
                const firstResultGroup = normalizeRepairGroup(payload.data[0].repair_type_slug);
                if (firstResultGroup) {
                  setActiveGroup(firstResultGroup);
                }
                setHasLoaded(true);
              } else {
                setFailed(true);
              }
            })
            .catch(() => {
              clearTimeout(timeoutId);
              setFailed(true);
            });
        }
      },
      { rootMargin: '300px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [category, brand, hasLoaded, failed]);

  if (failed) return null;

  if (!hasLoaded) {
    return <section ref={sectionRef} style={{ minHeight: '1px' }} aria-hidden="true" />;
  }

  if (results.length === 0 || !activeGroup) return null;

  const activeResult = results.find(r => normalizeRepairGroup(r.repair_type_slug) === activeGroup) || results[0];
  const activeResultGroup = normalizeRepairGroup(activeResult.repair_type_slug) || activeGroup;

  const beforeSrc = getRepairResultImageSrc(activeResult, 'before');
  const afterSrc = getRepairResultImageSrc(activeResult, 'after');

  const availableGroups = results.map(r => normalizeRepairGroup(r.repair_type_slug)).filter(Boolean) as RepairGroup[];

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby={`hub-repair-results-heading-${scope}`}>
      <div className={styles.shell}>
        <div className={styles.copyCard}>
          <div className={styles.copyHeader}>
            <span className={styles.kicker}>Workshop Proof</span>
            <h2 id={`hub-repair-results-heading-${scope}`}>Real {activeResult.brand} Repair Results</h2>
            <p>
              Before and after repair photos from approved Ali Mobile &amp; Repair jobs, checked for privacy before they appear here.
            </p>
          </div>

          <div className={styles.meta}>
            <strong>{activeResult.title}</strong>
            {activeResult.short_description && <span>{activeResult.short_description}</span>}
          </div>

          <div className={styles.switcher} role="tablist" aria-label="Repair type categories">
            {GROUPS_IN_ORDER.map((group) => {
              const available = availableGroups.includes(group);
              if (!available) return null;

              const selected = activeResultGroup === group;

              return (
                <button
                  key={group}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`${styles.switchButton} ${selected ? styles.switchButtonActive : ''}`}
                  onMouseEnter={() => setActiveGroup(group)}
                  onFocus={() => setActiveGroup(group)}
                  onClick={() => setActiveGroup(group)}
                >
                  {GROUP_LABELS[group]}
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
          priority={false}
        />
      </div>
    </section>
  );
}
