import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { RepairTypeHubCatalogResult } from '@/lib/repair-type-hubs';
import RepairTypeHubBreadcrumbs from './RepairTypeHubBreadcrumbs';
import RepairTypeModelGrid from './RepairTypeModelGrid';
import styles from './RepairTypeHub.module.css';

interface RepairTypeHubFaq {
  question: string;
  answer: string;
}

interface RepairTypeHubReason {
  title: string;
  description: string;
}

interface RepairTypeHubHeroHighlight {
  title: string;
  description?: string;
}

interface RepairTypeHubProcessStep {
  question: string;
  answer: string;
}

interface RepairTypeHubPageProps {
  data: RepairTypeHubCatalogResult;
  title?: string;
  description?: string;
  heroKicker?: string;
  heroProof?: ReactNode;
  heroActions?: ReactNode;
  heroHighlights?: RepairTypeHubHeroHighlight[];
  symptoms?: RepairTypeHubReason[];
  preModelGridContent?: ReactNode;
  modelGridTitle?: string;
  modelGridDescription?: string;
  technicalTitle?: string;
  technicalEyebrow?: string;
  technicalIntro?: string;
  technicalFaqs?: RepairTypeHubFaq[];
  processSteps?: RepairTypeHubProcessStep[];
  additionalSections?: ReactNode;
  faqs?: RepairTypeHubFaq[];
  faqHeading?: string;
  repairResultsSlot?: ReactNode;
}

export default function RepairTypeHubPage({
  data,
  title,
  description,
  heroKicker,
  heroProof,
  heroActions,
  heroHighlights,
  symptoms,
  preModelGridContent,
  modelGridTitle,
  modelGridDescription,
  technicalTitle,
  technicalEyebrow,
  technicalIntro,
  technicalFaqs,
  processSteps,
  additionalSections,
  faqs,
  faqHeading,
  repairResultsSlot,
}: RepairTypeHubPageProps) {
  const pageTitle = title ?? `${data.hub.label} Repair`;
  const pageDescription =
    description ??
    `Browse supported ${data.hub.label.toLowerCase()} matches from the live repair catalogue and jump straight to the existing canonical repair page.`;
  const highlights = heroHighlights ?? [
    { title: 'Ringwood Square', description: 'Visit Kiosk C1 for walk-in repair help.' },
    { title: 'Find the right model', description: 'Choose your phone first to open the correct repair page.' },
    { title: 'Technician inspection', description: 'We confirm the practical repair before work begins.' },
  ];

  return (
    <div className={styles.pageShell}>
      <div className={styles.pageContainer}>
        <Link href="/repairs" className={styles.backLink}>
          <ArrowLeft size={16} strokeWidth={2.6} aria-hidden="true" />
          Back to Repair Categories
        </Link>

        <RepairTypeHubBreadcrumbs label={data.hub.label} />

        <section className={`repair-tech-hero repair-tech-hero-compact ${styles.heroCard}`}>
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}>{heroKicker ?? 'Repair Type Hub'}</span>
            <h1 className={styles.heroTitle}>{pageTitle}</h1>
            <p className={styles.heroDescription}>{pageDescription}</p>
            {heroProof ? <div className={styles.heroProof}>{heroProof}</div> : null}
            {heroActions ? <div className={`repair-hero-actions ${styles.heroActions}`}>{heroActions}</div> : null}
          </div>

          <div className={styles.heroHighlights} aria-label="Repair hub highlights">
            {highlights.map((highlight) => (
              <div key={highlight.title} className={styles.heroHighlightCard}>
                <strong>{highlight.title}</strong>
                {highlight.description ? <span>{highlight.description}</span> : null}
              </div>
            ))}
          </div>
        </section>

        <RepairTypeModelGrid
          hubLabel={data.hub.label}
          categories={data.categories}
          title={modelGridTitle}
          description={modelGridDescription}
        />

        {symptoms && symptoms.length > 0 ? (
          <section className={`repair-content-band ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Symptoms</p>
                <h2 className={styles.sectionTitle}>Common repair reasons</h2>
              </div>
            </div>
            <div className={styles.reasonGrid}>
              {symptoms.map((symptom, index) => (
                <article key={symptom.title} className={styles.reasonCard}>
                  <span className={styles.reasonIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{symptom.title}</h3>
                  <p>{symptom.description}</p>
                </article>
              ))}
            </div>
            {preModelGridContent ? <div className={styles.reasonCallout}>{preModelGridContent}</div> : null}
          </section>
        ) : null}

        {technicalFaqs && technicalFaqs.length > 0 ? (
          <section className={`repair-content-band ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>{technicalEyebrow ?? 'Repair Guidance'}</p>
                <h2 className={styles.sectionTitle}>{technicalTitle ?? 'Helpful guidance before repair'}</h2>
              </div>
              {technicalIntro ? <p className={styles.sectionBody}>{technicalIntro}</p> : null}
            </div>
            <div className={styles.faqStack}>
              {technicalFaqs.map((faq) => (
                <details key={faq.question} className={styles.faqItem}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {processSteps && processSteps.length > 0 ? (
          <section className={`repair-content-band ${styles.workbenchSection}`}>
            <div className={styles.workbenchHeading}>
              <div>
                <p className={styles.sectionEyebrow}>Process</p>
                <h2 className={styles.sectionTitle}>How this repair usually moves through the bench</h2>
              </div>
            </div>
            <div className={styles.workbenchGrid}>
              {processSteps.map((step, index) => (
                <details key={step.question} className={styles.workbenchBox}>
                  <summary>
                    <span className={styles.workbenchNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.workbenchQuestion}>{step.question}</span>
                    <span className={styles.workbenchChevron} aria-hidden="true">
                      ↓
                    </span>
                  </summary>
                  <p>{step.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {repairResultsSlot ? <section>{repairResultsSlot}</section> : null}
        {additionalSections}

        {faqs && faqs.length > 0 ? (
          <section className={`repair-content-band ${styles.sectionCard}`}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>FAQs</p>
                <h2 className={styles.sectionTitle}>{faqHeading || `${data.hub.label} questions we answer every day`}</h2>
              </div>
            </div>
            <div className={styles.faqStack}>
              {faqs.map((faq) => (
                <details key={faq.question} className={styles.faqItem}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
