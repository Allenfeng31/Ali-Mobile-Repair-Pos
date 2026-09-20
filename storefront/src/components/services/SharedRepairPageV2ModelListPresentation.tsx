'use client';

import { useState, type ReactNode } from 'react';
import styles from './SharedRepairPageV2ModelListPresentation.module.css';

interface SharedRepairPageV2ModelListPresentationProps {
  regionId: string;
  initiallyExpanded: boolean;
  modelCount: number;
  children: ReactNode;
}

export default function SharedRepairPageV2ModelListPresentation({
  regionId,
  initiallyExpanded,
  modelCount,
  children,
}: SharedRepairPageV2ModelListPresentationProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const hasMobileMore = modelCount > 5;
  const hasDesktopMore = modelCount > 16;
  const hasMore = hasMobileMore;
  const controlId = `${regionId}-more-control`;

  return (
    <>
      <div
        id={regionId}
        className={`mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3 ${styles.modelGrid}`}
        data-expanded={expanded}
      >
        {children}
      </div>
      {hasMore ? (
        <div className="flex justify-center">
          <button
            id={controlId}
            type="button"
            className={styles.moreControl}
            data-desktop-more={hasDesktopMore}
            aria-expanded={expanded}
            aria-controls={regionId}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Show Fewer Models' : 'Show More Models'}
          </button>
        </div>
      ) : null}
      {hasMore ? (
        <noscript>
          <style>{`#${regionId} > [data-shared-repair-model-card] { display: block !important; } #${controlId} { display: none !important; }`}</style>
        </noscript>
      ) : null}
    </>
  );
}
