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
}

interface RepairTypeHubCta {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

interface RepairTypeHubPageProps {
  data: RepairTypeHubCatalogResult;
  title?: string;
  description?: string;
  intro?: ReactNode;
  symptoms?: string[];
  technicalContent?: ReactNode;
  processSteps?: string[];
  pricing?: {
    title: string;
    items: RepairTypeHubPricingItem[];
  };
  faqs?: RepairTypeHubFaq[];
  cta?: RepairTypeHubCta;
  repairResultsSlot?: ReactNode;
}

export default function RepairTypeHubPage({
  data,
  title,
  description,
  intro,
  symptoms,
  technicalContent,
  processSteps,
  pricing,
  faqs,
  cta,
  repairResultsSlot,
}: RepairTypeHubPageProps) {
  const pageTitle = title ?? `${data.hub.label} Repair`;
  const pageDescription =
    description ??
    `Browse supported ${data.hub.label.toLowerCase()} matches from the live repair catalogue and jump straight to the existing canonical repair page.`;

  return (
    <div className={styles.pageShell}>
      <div className={styles.pageContainer}>
        <RepairTypeHubBreadcrumbs label={data.hub.label} />

        <section className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.heroKicker}>Repair Type Hub Foundation</span>
            <h1 className={styles.heroTitle}>{pageTitle}</h1>
            <p className={styles.heroDescription}>{pageDescription}</p>
            {intro ? <div className={styles.heroIntro}>{intro}</div> : null}
          </div>

          <dl className={styles.heroStats}>
            <div className={styles.heroStat}>
              <dt>Enabled categories</dt>
              <dd>{data.categories.length}</dd>
            </div>
            <div className={styles.heroStat}>
              <dt>Brands</dt>
              <dd>{data.totalBrands}</dd>
            </div>
            <div className={styles.heroStat}>
              <dt>Matching models</dt>
              <dd>{data.totalModels}</dd>
            </div>
          </dl>
        </section>

        <RepairTypeModelGrid hubLabel={data.hub.label} categories={data.categories} />

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

        {technicalContent ? <section className={styles.sectionCard}>{technicalContent}</section> : null}

        {processSteps && processSteps.length > 0 ? (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Process</p>
                <h2 className={styles.sectionTitle}>How this hub will guide repairs</h2>
              </div>
            </div>
            <ol className={styles.simpleList}>
              {processSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ) : null}

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
                <div key={item.label} className={styles.pricingCard}>
                  <span className={styles.pricingLabel}>{item.label}</span>
                  <strong className={styles.pricingValue}>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {faqs && faqs.length > 0 ? (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>FAQs</p>
                <h2 className={styles.sectionTitle}>Questions this hub can answer</h2>
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

        {repairResultsSlot ? <section>{repairResultsSlot}</section> : null}

        {cta ? (
          <section className={styles.ctaCard}>
            <div>
              <h2 className={styles.ctaTitle}>{cta.title}</h2>
              <p className={styles.ctaDescription}>{cta.description}</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href={cta.primaryHref} className={styles.primaryButton}>
                {cta.primaryLabel}
              </Link>
              {cta.secondaryHref && cta.secondaryLabel ? (
                <Link href={cta.secondaryHref} className={styles.secondaryButton}>
                  {cta.secondaryLabel}
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
