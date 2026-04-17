import React from 'react';
import { BRANDS, MODELS, REPAIR_TYPES, LSI_KEYWORDS } from '@/data/seo-data';
import { slugify, detectDeviceType } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';

interface RepairPageProps {
  params: Promise<{
    brand: string;
    model: string;
    'repair-type': string;
  }>;
}

export function generateStaticParams() {
  const allParams: { brand: string; model: string; 'repair-type': string }[] = [];

  for (const brand of BRANDS) {
    const models = MODELS[brand] || [];
    for (const model of models) {
      for (const repair of REPAIR_TYPES) {
        allParams.push({
          brand: slugify(brand),
          model: slugify(model),
          'repair-type': repair.slug,
        });
      }
    }
  }

  return allParams;
}

export async function generateMetadata({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const repairType = REPAIR_TYPES.find(r => r.slug === resolvedParams['repair-type']);
  let displayModel = (resolvedParams.model || '').replace(/-/g, ' ');
  for (const b of BRANDS) {
    const m = MODELS[b]?.find(x => slugify(x) === resolvedParams.model);
    if (m) { displayModel = m; break; }
  }
  const title = `${displayModel} ${repairType?.name || 'Repair'} in Ringwood | Ali Mobile`;
  const description = `Fast, professional ${displayModel} ${repairType?.name?.toLowerCase() || 'repair'} in Ringwood, Melbourne. Under 1 hour, 6-month warranty, No Fix No Charge. Book now.`;
  return { title, description };
}

function generateFaqs(model: string, repairType: { name: string; slug: string }, brand: string) {
  const lsi = getLSIForRepair(repairType.slug);
  const component = lsi.component?.[0] || repairType.name.toLowerCase();
  const altComponent = lsi.component?.[1] || 'damaged component';

  return [
    {
      question: `How long does the ${model} ${repairType.name} take?`,
      answer: `Most ${model} ${repairType.name.toLowerCase()} jobs are completed in under 1 hour at our Ringwood Square location. Walk-ins are welcome on weekdays for same-day service.`,
    },
    {
      question: `Do you use OEM parts for ${model} ${repairType.name.toLowerCase()}?`,
      answer: `We use premium-quality ${component} parts that meet or exceed OEM specifications. All parts come with our 6-month warranty, so you can be confident in the quality of the ${altComponent} replacement.`,
    },
    {
      question: `How much does a ${model} ${repairType.name.toLowerCase()} cost?`,
      answer: `Pricing depends on the specific ${model} variant and the condition of the ${component}. Use our Live Quote tool or call 0481 058 514 for an instant, accurate price. Our "No Fix, No Charge" policy means you only pay if we successfully complete the repair.`,
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
  const repairTypeSlug = resolvedParams['repair-type'];
  const repairType = REPAIR_TYPES.find(r => r.slug === repairTypeSlug);

  // Reverse lookup for readable names
  let displayBrand = "Device";
  let displayModel = decodeURIComponent(resolvedParams.model).replace(/-/g, ' ');

  for (const b of BRANDS) {
    if (slugify(b) === resolvedParams.brand) displayBrand = b;
    const m = MODELS[b]?.find(x => slugify(x) === resolvedParams.model);
    if (m) displayModel = m;
  }

  if (!repairType) {
    return (
      <div className="page-container" style={{ textAlign: 'center' }}>
        <h1>Service Not Found</h1>
        <p>The repair service you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/repairs" className="primary-btn" style={{ display: 'inline-block', marginTop: '2rem' }}>
          Browse All Repairs
        </Link>
      </div>
    );
  }

  const faqs = generateFaqs(displayModel, repairType, displayBrand);

  return (
    <>
      <RepairServiceSchema
        serviceName={`${displayModel} ${repairType.name} in Ringwood`}
        description={`Professional ${repairType.name} for ${displayModel} in Ringwood. Expert technicians, fast turnaround, 6-month warranty.`}
      />

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <div className="page-container" style={{ paddingBottom: '0' }}>
        <Breadcrumbs brand={resolvedParams.brand} model={resolvedParams.model} service={resolvedParams['repair-type']} />

        <div className="repair-hero">
          <h1>{displayModel} {repairType.name} in Ringwood</h1>

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
