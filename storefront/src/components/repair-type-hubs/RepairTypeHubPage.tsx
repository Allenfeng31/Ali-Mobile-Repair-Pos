import type { ReactNode } from 'react';
import Link from 'next/link';
import type { RepairTypeHubCatalogResult } from '@/lib/repair-type-hubs';
import RepairTypeHubBreadcrumbs from './RepairTypeHubBreadcrumbs';
import RepairTypeModelGrid from './RepairTypeModelGrid';
import styles from './RepairTypeHub.module.css';

interface RepairTypeHubFaq {
  question: string;
  answer: string;
}

interface RepairTypeHubPricingItem {
  label: string;
  value: string;
  href?: string;
  description?: string;
}

interface RepairTypeHubHeroHighlight {
  title: string;
  description?: string;
}

interface RepairTypeHubPageProps {
  data: RepairTypeHubCatalogResult;
  title?: string;
  description?: string;
  heroKicker?: string;
  heroProof?: ReactNode;
  heroActions?: ReactNode;
  heroHighlights?: RepairTypeHubHeroHighlight[];
  symptoms?: string[];
  preModelGridContent?: ReactNode;
  modelGridTitle?: string;
  modelGridDescription?: string;
  technicalContent?: ReactNode;
  processSteps?: string[];
  pricing?: {
    title: string;
    items: RepairTypeHubPricingItem[];
  };
  additionalSections?: ReactNode;
  faqs?: RepairTypeHubFaq[];
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
  technicalContent,
  processSteps,
  pricing,
  additionalSections,
  faqs,
  repairResultsSlot,
}: RepairTypeHubPageProps) {
  const pageTitle = title ?? `${data.hub.label} Repair`;
  const pageDescription =
    description ??
    `Browse supported ${data.hub.label.toLowerCase()} matches from the live repair catalogue and jump straight to the existing canonical repair page.`;
  const highlights = heroHighlights ?? [
    { title: 'Ringwood Square', description: 'Visit Kiosk C1 for walk-in repair help.' },
    { title: 'Live model-based pricing', description: 'Choose your phone first to see the right repair path.' },
    { title: 'Technician inspection', description: 'We confirm the practical repair before work begins.' },
  ];

  return (
    <div className={styles.pageShell}>
      <div className={styles.pageContainer}>
        <RepairTypeHubBreadcrumbs label={data.hub.label} />

        <section className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}>{heroKicker ?? 'Repair Type Hub'}</span>
            <h1 className={styles.heroTitle}>{pageTitle}</h1>
            <p className={styles.heroDescription}>{pageDescription}</p>
            {heroProof ? <div className={styles.heroProof}>{heroProof}</div> : null}
            {heroActions ? <div className={styles.heroActions}>{heroActions}</div> : null}
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

        {symptoms && symptoms.length > 0 ? (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Symptoms</p>
                <h2 className={styles.sectionTitle}>Common repair reasons</h2>
              </div>
            </div>
            <ul className={styles.simpleList}>
              {symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {preModelGridContent ? <section className={styles.sectionCard}>{preModelGridContent}</section> : null}

        <RepairTypeModelGrid
          hubLabel={data.hub.label}
          categories={data.categories}
          title={modelGridTitle}
          description={modelGridDescription}
        />

        {pricing && pricing.items.length > 0 ? (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Pricing</p>
                <h2 className={styles.sectionTitle}>{pricing.title}</h2>
              </div>
            </div>
            <div className={styles.pricingGrid}>
              {pricing.items.map((item) => (
                item.href ? (
                  <Link
                    key={item.href ?? item.label}
                    href={item.href}
                    prefetch={false}
                    className={`${styles.pricingCard} ${styles.pricingCardLink}`}
                  >
                    <span className={styles.pricingLabel}>{item.label}</span>
                    {item.description ? <span className={styles.pricingDescription}>{item.description}</span> : null}
                    <strong className={styles.pricingValue}>{item.value}</strong>
                  </Link>
                ) : (
                  <div key={item.href ?? item.label} className={styles.pricingCard}>
                    <span className={styles.pricingLabel}>{item.label}</span>
                    {item.description ? <span className={styles.pricingDescription}>{item.description}</span> : null}
                    <strong className={styles.pricingValue}>{item.value}</strong>
                  </div>
                )
              ))}
            </div>
          </section>
        ) : null}

        {technicalContent ? <section className={styles.sectionCard}>{technicalContent}</section> : null}

        {processSteps && processSteps.length > 0 ? (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Process</p>
                <h2 className={styles.sectionTitle}>How this repair usually moves through the bench</h2>
              </div>
            </div>
            <ol className={styles.simpleList}>
              {processSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {repairResultsSlot ? <section>{repairResultsSlot}</section> : null}
        {additionalSections}

        {faqs && faqs.length > 0 ? (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>FAQs</p>
                <h2 className={styles.sectionTitle}>{data.hub.label} questions we answer every day</h2>
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
