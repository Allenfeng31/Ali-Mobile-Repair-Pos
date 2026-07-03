"use client";

import { useEffect, useId, useRef, useState } from 'react';
import {
  getRepairResultAltText,
  getRepairResultImageSrc,
  type PublicRepairResult,
  type RepairResultDeviceCategory,
} from '@/lib/repair-results';
import BeforeAfterSlider from './BeforeAfterSlider';
import styles from './HubRepairResultsSection.module.css';

export type HubRepairResultItem = Pick<
  PublicRepairResult,
  | 'id'
  | 'device_category'
  | 'brand'
  | 'model'
  | 'repair_type'
  | 'repair_type_slug'
  | 'image_pair_alt_text'
  | 'title'
  | 'short_description'
  | 'related_repair_url'
>;

interface HubRepairResultsSectionProps {
  category: RepairResultDeviceCategory;
  brand?: string;
  scope: 'repair-hub' | 'brand-hub';
  initialResults?: HubRepairResultItem[];
  showResultSummary?: boolean;
}

type RepairGroup = 'screen' | 'battery' | 'charging-port' | 'back-glass-or-housing';

const GROUP_LABELS: Record<RepairGroup, string> = {
  'screen': 'Screen Replacement',
  'battery': 'Battery Replacement',
  'charging-port': 'Charging Port Replacement',
  'back-glass-or-housing': 'Back Glass / Housing Replacement',
};

const GROUP_SHORT_LABELS: Record<RepairGroup, string> = {
  'screen': 'Screen',
  'battery': 'Battery',
  'charging-port': 'Charging',
  'back-glass-or-housing': 'Back Housing',
};

const GROUPS_IN_ORDER: RepairGroup[] = ['screen', 'battery', 'charging-port', 'back-glass-or-housing'];
const DESCRIPTION_TOGGLE_LENGTH = 160;

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

function getInitialRepairGroup(results?: HubRepairResultItem[]) {
  if (!results?.length) return null;
  return normalizeRepairGroup(results[0].repair_type_slug);
}

export default function HubRepairResultsSection({
  category,
  brand,
  scope,
  initialResults,
  showResultSummary = false,
}: HubRepairResultsSectionProps) {
  const hasServerResultSet = initialResults !== undefined;
  const [results, setResults] = useState<HubRepairResultItem[]>(initialResults || []);
  const [activeGroup, setActiveGroup] = useState<RepairGroup | null>(getInitialRepairGroup(initialResults));
  const [hasLoaded, setHasLoaded] = useState(hasServerResultSet && Boolean(initialResults?.length));
  const [failed, setFailed] = useState(hasServerResultSet && !initialResults?.length);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reactId = useId();
  const stableId = reactId.replace(/:/g, '');

  useEffect(() => {
    if (hasServerResultSet) return;
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
  }, [category, brand, hasLoaded, failed, hasServerResultSet]);

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
  const hasMultipleResults = results.length > 1;
  const activeResultId = String(activeResult.id);
  const activeDescriptionId = `hub-repair-result-description-${stableId}-${activeResultId}`;
  const isDescriptionExpanded = expandedResultId === activeResultId;

  const activateResult = (result: HubRepairResultItem) => {
    const nextGroup = normalizeRepairGroup(result.repair_type_slug);
    if (!nextGroup) return;
    setActiveGroup(nextGroup);
    setExpandedResultId(null);
  };

  if (showResultSummary) {
    return (
      <section ref={sectionRef} className={styles.section} aria-labelledby={`hub-repair-results-heading-${scope}`}>
        <div className={styles.compactShell}>
          <div className={styles.compactHeader}>
            <span className={styles.kicker}>Workshop Proof</span>
            <h2 id={`hub-repair-results-heading-${scope}`}>Real {activeResult.brand} Repair Results</h2>
            <p>
              Before and after repair photos from approved Ali Mobile &amp; Repair jobs, checked for privacy before they appear here.
            </p>
          </div>

          <div className={styles.mediaColumn}>
            <div className={styles.mediaFrame}>
              <BeforeAfterSlider
                key={activeResult.id}
                deviceCategory={activeResult.device_category}
                beforeSrc={beforeSrc}
                afterSrc={afterSrc}
                beforeAlt={getRepairResultAltText(activeResult, 'before')}
                afterAlt={getRepairResultAltText(activeResult, 'after')}
                priority={activeResult.id === results[0]?.id}
              />
            </div>

            {hasMultipleResults && (
              <div className={styles.selectorRow} role="tablist" aria-label="Repair result examples">
                {results.map((result) => {
                  const group = normalizeRepairGroup(result.repair_type_slug);
                  if (!group) return null;

                  const selected = result.id === activeResult.id;
                  const tabId = `hub-repair-result-tab-${stableId}-${result.id}`;
                  const panelId = `hub-repair-result-panel-${stableId}-${result.id}`;

                  return (
                    <button
                      key={result.id}
                      id={tabId}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={panelId}
                      className={`${styles.selectorButton} ${selected ? styles.selectorButtonActive : ''}`}
                      onClick={() => activateResult(result)}
                    >
                      <span>{result.model}</span>
                      <small>{GROUP_SHORT_LABELS[group]}</small>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.panelColumn}>
            {results.map((result) => {
              const group = normalizeRepairGroup(result.repair_type_slug);
              if (!group) return null;

              const selected = result.id === activeResult.id;
              const resultId = String(result.id);
              const panelId = `hub-repair-result-panel-${stableId}-${result.id}`;
              const tabId = `hub-repair-result-tab-${stableId}-${result.id}`;
              const descriptionId = selected ? activeDescriptionId : `hub-repair-result-description-${stableId}-${result.id}`;
              const canExpandDescription = Boolean(result.short_description && result.short_description.length > DESCRIPTION_TOGGLE_LENGTH);
              const expanded = selected && expandedResultId === resultId;

              return (
                <article
                  key={result.id}
                  id={panelId}
                  role={hasMultipleResults ? 'tabpanel' : undefined}
                  aria-labelledby={hasMultipleResults ? tabId : undefined}
                  className={styles.resultPanel}
                  hidden={!selected}
                >
                  <h3>{result.title}</h3>
                  <p className={styles.resultMeta}>{result.brand} {result.model} - {result.repair_type}</p>
                  {result.short_description && (
                    <p
                      id={descriptionId}
                      className={`${styles.resultDescription} ${expanded ? styles.resultDescriptionExpanded : ''}`}
                    >
                      {result.short_description}
                    </p>
                  )}
                  {selected && canExpandDescription && (
                    <button
                      type="button"
                      className={styles.detailsToggle}
                      aria-expanded={expanded}
                      aria-controls={descriptionId}
                      onClick={() => setExpandedResultId(expanded ? null : resultId)}
                    >
                      {expanded ? 'Show less' : 'Show full details'}
                    </button>
                  )}
                  {result.related_repair_url && (
                    <a className={styles.relatedLink} href={result.related_repair_url}>
                      View matching repair page
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

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
