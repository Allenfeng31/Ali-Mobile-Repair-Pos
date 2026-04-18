import React from 'react';
import { REPAIR_TYPES, LSI_KEYWORDS } from '@/data/seo-data';
import { fetchRepairCatalog, fetchRepairDetails } from '@/lib/api';
import { slugify } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';

export const revalidate = 3600; // ISR: revalidate every hour
export const dynamicParams = true; // Allow on-demand generation of new pages

interface RepairPageProps {
  params: Promise<{
    brand: string;
    model: string;
    'repair-type': string;
  }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  const allParams: { brand: string; model: string; 'repair-type': string }[] = [];

  for (const brand of catalog.brands) {
    for (const model of brand.models) {
      for (const repair of model.repairTypes) {
        allParams.push({
          brand: brand.slug,
          model: model.slug,
          'repair-type': repair.slug,
        });
      }
    }
  }

  return allParams;
}

export async function generateMetadata({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const details = await fetchRepairDetails(
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );

  const model = details?.model || resolvedParams.model.replace(/-/g, ' ');
  const repairName = details?.repairType || resolvedParams['repair-type'].replace(/-/g, ' ');
  const priceStr = details?.price ? ` from $${details.price}` : '';

  const title = `${model} ${repairName} in Ringwood${priceStr} | Ali Mobile`;
  const description = `Fast, professional ${model} ${repairName.toLowerCase()} in Ringwood, Melbourne. Under 1 hour, 6-month warranty, No Fix No Charge. Book now.`;
  return { title, description };
}

function generateFaqs(model: string, repairName: string, repairSlug: string, price: number) {
  const lsi = getLSIForRepair(repairSlug);
  const component = lsi.component?.[0] || repairName.toLowerCase();
  const altComponent = lsi.component?.[1] || 'damaged component';
  const priceInfo = price > 0
    ? `Starting from $${price}, the exact pricing depends on the specific ${model} variant.`
    : `Pricing depends on the specific ${model} variant and the condition of the ${component}. Use our Live Quote tool or call 0481 058 514 for an instant, accurate price.`;

  return [
    {
      question: `How long does the ${model} ${repairName} take?`,
      answer: `Most ${model} ${repairName.toLowerCase()} jobs are completed in under 1 hour at our Ringwood Square location. Walk-ins are welcome on weekdays for same-day service.`,
    },
    {
      question: `Do you use OEM parts for ${model} ${repairName.toLowerCase()}?`,
      answer: `We use premium-quality ${component} parts that meet or exceed OEM specifications. All parts come with our 6-month warranty, so you can be confident in the quality of the ${altComponent} replacement.`,
    },
    {
      question: `How much does a ${model} ${repairName.toLowerCase()} cost?`,
      answer: `${priceInfo} Our "No Fix, No Charge" policy means you only pay if we successfully complete the repair.`,
    },
    {
      question: `What if my ${model} has additional damage beyond the ${component}?`,
      answer: `Our technicians perform a free diagnostic assessment on every device. If we discover additional issues such as ${lsi.issue?.[0] || 'internal damage'}, we'll inform you before proceeding with any extra work. You're never charged for repairs you didn't approve.`,
    },
    {
      question: `Where is your ${model} repair shop located?`,
      answer: `We're located at Kiosk C1, Ringwood Square Shopping Centre, Ringwood VIC 3134. We're easily accessible from Croydon, Mitcham, Bayswater, and the wider Melbourne eastern suburbs. Free parking is available at the shopping centre.`,
    },
  ];
}

function getLSIForRepair(slug: string): { component?: string[]; issue?: string[] } {
  if (slug === 'screen-replacement') return { component: LSI_KEYWORDS.components.screen, issue: LSI_KEYWORDS.issues.screenDamage };
  if (slug === 'battery-replacement') return { component: LSI_KEYWORDS.components.battery, issue: LSI_KEYWORDS.issues.batteryDrain };
  if (slug === 'charging-port-repair') return { component: LSI_KEYWORDS.components.chargingPort };
  if (slug === 'water-damage-repair') return { issue: LSI_KEYWORDS.issues.waterDamage };
  if (slug === 'back-glass-repair') return { component: ['back glass', 'rear panel'] };
  if (slug === 'camera-repair') return { component: ['camera module', 'lens assembly'] };
  return {};
}

export default async function RepairServicePage({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const details = await fetchRepairDetails(
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );

  // Use POS data if available, otherwise derive from URL params
  const displayBrand = details?.brand || resolvedParams.brand.replace(/-/g, ' ');
  const displayModel = details?.model || resolvedParams.model.replace(/-/g, ' ');
  const repairName = details?.repairType || resolvedParams['repair-type'].replace(/-/g, ' ');
  const price = details?.price || 0;

  // Validate repair type exists in our known list, or accept POS-provided name
  const knownRepair = REPAIR_TYPES.find(r => r.slug === resolvedParams['repair-type']);
  const finalRepairName = knownRepair?.name || repairName;

  const faqs = generateFaqs(displayModel, finalRepairName, resolvedParams['repair-type'], price);

  return (
    <>
      <RepairServiceSchema
        serviceName={`${displayModel} ${finalRepairName} in Ringwood`}
        description={`Professional ${finalRepairName} for ${displayModel} in Ringwood. Expert technicians, fast turnaround, 6-month warranty.`}
        price={price > 0 ? String(price) : undefined}
      />

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <div className="page-container" style={{ paddingBottom: '0' }}>
        <Breadcrumbs brand={resolvedParams.brand} model={resolvedParams.model} service={resolvedParams['repair-type']} />

        <div className="repair-hero">
          <h1>{displayModel} {finalRepairName} in Ringwood</h1>

          {price > 0 ? (
            <p style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#2563eb',
              marginBottom: '1rem',
              marginTop: '-0.25rem',
              letterSpacing: '-0.5px',
            }}>
              Starting from ${price}
            </p>
          ) : (
            <div style={{ marginBottom: '1rem', marginTop: '-0.25rem' }}>
              <p style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#2563eb',
                marginBottom: '0.5rem',
              }}>
                Quote on Request
              </p>
              <p style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'var(--foreground)',
                opacity: 0.85,
              }}>
                Get an instant quote for this repair! Call{' '}
                <a href="tel:0481058514" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>
                  0481 058 514
                </a>{' '}
                or <strong>Chat Now</strong>.
              </p>
            </div>
          )}

          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-badge-icon">⚡</span>
              Under 1 Hour
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon">🛡️</span>
              No Fix, No Charge
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon">✅</span>
              6-Month Warranty
            </div>
          </div>

          <div className="cta-group">
            <Link href="/book-repair" className="cta-book">
              Book Repair Now
            </Link>
            <a href="tel:0481058514" className="cta-call">
              📞 Call 0481 058 514
            </a>
          </div>
        </div>
      </div>

      {/* ─── SOCIAL PROOF ─────────────────────────────── */}
      <ReviewsSection />

      {/* ─── FAQ SECTION ──────────────────────────────── */}
      <FaqAccordion faqs={faqs} />
    </>
  );
}
