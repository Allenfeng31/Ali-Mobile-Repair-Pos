import React from 'react';
import { REPAIR_TYPES, LSI_KEYWORDS } from '@/data/seo-data';
import { fetchRepairCatalog, fetchRepairDetails } from '@/lib/api';
import { slugify, formatDynamicParam } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import { Zap, ShieldCheck, CheckCircle, Droplet, Battery, Smartphone, Plug, Wrench, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import ChatNowButton from '@/components/ChatNowButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';

export const revalidate = 3600; // ISR: revalidate every hour
export const dynamicParams = true; // Allow on-demand generation of new pages

function getRepairIcon(slug: string, size = 48) {
  if (slug.includes('water')) return <Droplet size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('battery')) return <Battery size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('port')) return <Plug size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  if (slug.includes('screen') || slug.includes('glass') || slug.includes('display')) return <Smartphone size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
  return <Wrench size={size} strokeWidth={1.5} color="#2563eb" aria-hidden="true" />;
}

interface RepairPageProps {
  params: Promise<{
    category: string;
    brand: string;
    model: string;
    'repair-type': string;
  }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  const params: { category: string; brand: string; model: string; 'repair-type': string }[] = [];

  for (const brand of catalog.brands) {
    for (const model of brand.models) {
      for (const repair of REPAIR_TYPES) {
        params.push({
          category: brand.category,
          brand: brand.slug,
          model: model.slug,
          'repair-type': repair.slug
        });
      }
    }
  }

  return params;
}

/** Stable hash: deterministic index from a string (sum of char codes mod length). */
function stableHash(str: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i) * (i + 1)) % 1_000_000;
  }
  return hash % modulo;
}

const META_DESCRIPTION_TEMPLATES = [
  (m: string, r: string) =>
    `Fast, professional ${m} ${r.toLowerCase()} in Ringwood, Melbourne. Under 1 hour, 6-month warranty, No Fix No Charge. Book now.`,
  (m: string, r: string) =>
    `Need a ${m} ${r.toLowerCase()}? Our Ringwood experts complete most jobs in under 60 minutes with premium-quality parts and a 6-month guarantee.`,
  (m: string, r: string) =>
    `Walk-in ${m} ${r.toLowerCase()} at Ali Mobile Ringwood. Same-day turnaround, transparent pricing, and a No Fix No Charge promise. Call or book online.`,
  (m: string, r: string) =>
    `Expert ${m} ${r.toLowerCase()} service near you in Ringwood. Quick turnaround, 6-month warranty on all parts, and free diagnostics. Get started today.`,
];

export async function generateMetadata({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const details = await fetchRepairDetails(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );

  const model = details?.model || formatDynamicParam(resolvedParams.model);
  const repairName = details?.repairType || formatDynamicParam(resolvedParams['repair-type']);
  const priceStr = details?.price ? ` from $${details.price}` : '';
  const modelCode = details?.modelCode;

  const title = modelCode
    ? `${model} ${repairName} | Ringwood${priceStr} | ${modelCode}`
    : `${model} ${repairName} in Ringwood${priceStr} | Ali Mobile`;
    
  const templateIdx = stableHash(`${model}${repairName}`, META_DESCRIPTION_TEMPLATES.length);
  const description = META_DESCRIPTION_TEMPLATES[templateIdx](model, repairName);

  return { title, description };
}

function generateFaqs(model: string, repairName: string, repairSlug: string, price: number, modelCode?: string) {
  const lsi = getLSIForRepair(repairSlug);
  const component = lsi.component?.[0] || repairName.toLowerCase();
  const altComponent = lsi.component?.[1] || 'damaged component';
  
  const displayModel = modelCode ? `${model} (${modelCode})` : model;
  const isWaterDamage = repairSlug === 'water-damage-repair';
  
  const priceInfo = isWaterDamage
    ? `Water damage recovery starts from $50 for the intensive cleaning and drying process. If additional parts like a screen or battery are needed, we will provide a comprehensive quote after the internal assessment.`
    : (price > 0
      ? `Starting from $${price}, the exact pricing depends on the specific ${displayModel} variant.`
      : `Pricing depends on the specific ${displayModel} variant and the condition of the ${component}. Use our Live Quote tool or call 0481 058 514 for an instant, accurate price.`);

  return [
    {
      question: `How long does the ${model} ${repairName} take?`,
      answer: isWaterDamage 
        ? `Water damage recovery typically takes around 1 hour. If the damage is extensive and requires more time for professional drying or component cleaning, our technicians will inform you beforehand.`
        : `Most ${model} ${repairName.toLowerCase()} jobs are completed in under 1 hour at our Ringwood Square location. Walk-ins are welcome on weekdays for same-day service.`,
    },
    {
      question: `Do you use OEM parts for ${model} ${repairName.toLowerCase()}?`,
      answer: isWaterDamage
        ? `For water damage, our first priority is to rescue your original high-quality boards and components using specialized cleaning. If a component like the screen is beyond saving, we replace it with premium parts that meet or exceed OEM standards.`
        : `We use premium-quality ${component} parts that meet or exceed OEM specifications. All parts come with our 6-month warranty, so you can be confident in the quality of the ${altComponent} replacement.`,
    },
    {
      question: `How much does a ${model} ${repairName.toLowerCase()} cost?`,
      answer: `${priceInfo} ${isWaterDamage ? 'Please note that due to the labor-intensive nature of the drying and cleaning process, a specialized labor fee applies even if the device is ultimately unrepairable.' : 'Our "No Fix, No Charge" policy means you only pay if we successfully complete the repair.'}`,
    },
    {
      question: `What if my ${model} has additional damage beyond the ${isWaterDamage ? 'initial leak' : component}?`,
      answer: `Our technicians perform a free diagnostic assessment on every device. ${isWaterDamage ? 'Water damage often affects multiple areas simultaneously. We will test every function and give you a full report before you commit to any major part replacements.' : `If we discover additional issues such as ${lsi.issue?.[0] || 'internal damage'}, we'll inform you before proceeding with any extra work. You're never charged for repairs you didn't approve.`}`,
    },
    {
      question: `Is there a warranty for ${model} water damage recovery?`,
      answer: isWaterDamage
        ? `Due to the unpredictable nature of liquid-induced corrosion, we do not offer a general warranty on water damage rescue services. However, if we replace a specific part (like a new screen), that specific part will still be covered by our 6-month warranty, provided the rest of the device remains stable.`
        : `Yes, all our standard repairs come with a comprehensive 6-month warranty on both parts and labor at our Ringwood location.`,
    },
  ];
}

function WaterDamagePolicySection() {
  return (
    <div className="page-container" style={{ paddingTop: '0', paddingBottom: '0' }}>
      <div style={{
        background: '#fef2f2',
        border: '1px solid #fee2e2',
        borderRadius: '1rem',
        padding: '2rem',
        marginTop: '0rem',
        marginBottom: '3rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShieldAlert size={28} color="#dc2626" />
          <h2 style={{ margin: 0, color: '#991b1b', fontSize: '1.5rem', fontWeight: 700 }}>
            Special Policy: Water Damage Recovery
          </h2>
        </div>
        <div style={{ color: '#b91c1c', lineHeight: '1.6', fontSize: '1.05rem' }}>
          <p style={{ margin: 0 }}>
            While our general motto is "No Fix, No Charge," water damage is a special case. 
            Liquid damage requires immediate intervention: we must completely disassemble your phone, dry every component, 
            and perform professional alcohol cleaning to stop corrosion. Because this specialized labor is required regardless 
            of the final outcome, a labor fee applies even if the phone is not successfully repaired. 
            Furthermore, due to the complexity of motherboard corrosion, we do not provide a general warranty for 
            water damage rescue. <em>Exception:</em> If a specific part (e.g., a screen) is replaced, that part will carry 
            our standard warranty.
          </p>
        </div>
      </div>
    </div>
  );
}

function getLSIForRepair(slug: string): { component?: string[]; issue?: string[] } {
  if (slug === 'screen-replacement') return { component: LSI_KEYWORDS.components.screen, issue: LSI_KEYWORDS.issues.screenDamage };
  if (slug === 'battery-replacement') return { component: LSI_KEYWORDS.components.battery, issue: LSI_KEYWORDS.issues.batteryDrain };
  if (slug === 'charging-port-repair' || slug === 'charging-port-replacement') return { component: LSI_KEYWORDS.components.chargingPort };
  if (slug === 'water-damage-repair') return { issue: LSI_KEYWORDS.issues.waterDamage };
  if (slug === 'back-glass-repair' || slug === 'back-housing-replacement') return { component: ['back housing', 'rear panel', 'back glass'] };
  if (slug === 'camera-repair' || slug === 'front-camera-replacement' || slug === 'back-camera-replacement') return { component: ['camera module', 'lens assembly'] };
  return {};
}

import { notFound } from 'next/navigation';
import RepairTypeClient from '@/components/services/RepairTypeClient';
import RepairCTA from '@/components/services/RepairCTA';

export default async function RepairServicePage({ params }: RepairPageProps) {
  const resolvedParams = await params;
  const details = await fetchRepairDetails(
    resolvedParams.category,
    resolvedParams.brand,
    resolvedParams.model,
    resolvedParams['repair-type']
  );

  if (!details && !resolvedParams.model) {
    notFound();
  }

  // Use POS data if available, otherwise derive from URL params
  const displayBrand = details?.brand || formatDynamicParam(resolvedParams.brand);
  const displayModel = details?.model || formatDynamicParam(resolvedParams.model);
  const repairTypeDerived = details?.repairType || formatDynamicParam(resolvedParams['repair-type']);
  const price = details?.price || 0;
  const modelCode = details?.modelCode;

  // Validate repair type exists in our known list, or accept POS-provided name
  const knownRepair = REPAIR_TYPES.find(r => r.slug === resolvedParams['repair-type']);
  const finalRepairName = knownRepair?.name || repairTypeDerived;

  const faqs = generateFaqs(displayModel, finalRepairName, resolvedParams['repair-type'], price, modelCode);

  return (
    <>
      <RepairServiceSchema
        serviceName={`${displayModel} ${finalRepairName} in Ringwood`}
        description={`Professional ${finalRepairName} for ${displayModel} in Ringwood. Expert technicians, fast turnaround, 6-month warranty.`}
        price={price > 0 ? String(price) : undefined}
        modelCode={modelCode}
      />

      <RepairTypeClient 
        deviceModel={displayModel}
        repairType={finalRepairName}
        price={price}
      />

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <div className="page-container" style={{ paddingBottom: '0' }}>
        <Breadcrumbs category={resolvedParams.category} brand={resolvedParams.brand} model={resolvedParams.model} service={resolvedParams['repair-type']} />

        <div className="repair-hero">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {getRepairIcon(resolvedParams['repair-type'])}
          </div>
          <h1>{displayModel} {finalRepairName} in Ringwood</h1>

          {price > 0 || resolvedParams['repair-type'] === 'water-damage-repair' ? (
            <p style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#2563eb',
              marginBottom: '1rem',
              marginTop: '-0.25rem',
              letterSpacing: '-0.5px',
            }}>
              Starting from ${price > 0 ? price : 50}
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
                Please fill out the form below or call{' '}
                <a href="tel:0481058514" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline' }}>
                  0481 058 514
                </a>{' '}
                for an instant quote.
              </p>
            </div>
          )}

          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-badge-icon"><Zap size={20} strokeWidth={2.5} aria-hidden="true" /></span>
              Under 1 Hour
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon">
                {resolvedParams['repair-type'] === 'water-damage-repair' ? <ShieldAlert size={20} strokeWidth={2.5} aria-hidden="true" /> : <ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" />}
              </span>
              {resolvedParams['repair-type'] === 'water-damage-repair' ? 'Specialist Rescue' : 'No Fix, No Charge'}
            </div>
            <div className="trust-badge">
              <span className="trust-badge-icon"><CheckCircle size={20} strokeWidth={2.5} aria-hidden="true" /></span>
              6-Month Warranty
            </div>
          </div>

          <RepairCTA 
            modelSlug={resolvedParams.model}
            repairSlug={resolvedParams['repair-type']}
            modelName={displayModel}
            repairName={finalRepairName}
          />
        </div>
      </div>

      {/* ─── SOCIAL PROOF ─────────────────────────────── */}
      <ReviewsSection />

      {/* ─── WATER DAMAGE POLICY ──────────────────────── */}
      {resolvedParams['repair-type'] === 'water-damage-repair' && <WaterDamagePolicySection />}

      {/* ─── FAQ SECTION ──────────────────────────────── */}
      <FaqAccordion faqs={faqs} />
    </>
  );
}

