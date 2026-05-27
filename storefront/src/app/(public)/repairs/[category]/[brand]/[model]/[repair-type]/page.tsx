import React from 'react';
import { REPAIR_TYPES, LSI_KEYWORDS } from '@/data/seo-data';
import { fetchRepairCatalog, fetchRepairDetails } from '@/lib/api';
import { slugify, formatDynamicParam } from '@/lib/inventoryUtils';
import { RepairServiceSchema } from '@/components/seo/SchemaOrg';
import { Zap, ShieldCheck, CheckCircle, Droplet, Battery, Smartphone, Plug, Wrench, ShieldAlert, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import ChatNowButton from '@/components/ChatNowButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import BackButton from '@/components/BackButton';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';

export const dynamic = 'force-dynamic';

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

interface RepairTypeSeoPocket {
  quickAnswer: string;
  repairOptions: Array<{
    name: string;
    shortDescription: string;
    bestFor: string;
    notes: string;
  }>;
  commonProblems: Array<{
    title: string;
    description: string;
  }>;
  diagnosticSteps: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

const IPHONE_13_SCREEN_REPLACEMENT_SEO_POCKET: RepairTypeSeoPocket = {
  quickAnswer:
    "Need iPhone 13 screen replacement in Ringwood? Ali Mobile & Repair checks cracked glass, OLED faults, touch issues, frame fit, Face ID area condition, and display option availability before quoting.",
  repairOptions: [
    {
      name: "Standard display path",
      shortDescription:
        "A cost-conscious iPhone 13 screen replacement option for cracked glass, touch faults, or a display that needs a practical repair.",
      bestFor:
        "Customers who want the phone working again cleanly without choosing the highest display tier.",
      notes:
        "We still test brightness, touch response, speaker mesh alignment, camera area fit, and the frame edge before handover.",
    },
    {
      name: "Premium OLED path",
      shortDescription:
        "A higher-grade OLED option for customers who care about deeper blacks, smoother viewing, and stronger colour consistency.",
      bestFor:
        "Customers who use their iPhone 13 heavily for photos, maps, work apps, videos, and daily messaging.",
      notes:
        "A bent frame can stress a fresh OLED panel, so we inspect the housing before fitting a premium display.",
    },
    {
      name: "Diagnosis before display fitting",
      shortDescription:
        "Bench testing for black screen, green lines, flicker, partial touch failure, pressure marks, or uncertain impact damage.",
      bestFor:
        "Phones where the display fault may be linked to frame damage, liquid exposure, camera area damage, or another internal fault.",
      notes:
        "If a screen assembly will not solve the issue, we explain the next likely fault before any extra work.",
    },
  ],
  commonProblems: [
    {
      title: "Cracked glass with working touch",
      description:
        "The phone may still unlock and swipe, but glass flakes, lifted corners, and pressure on the OLED layer can worsen after continued use.",
    },
    {
      title: "Green lines, flicker, or black screen",
      description:
        "OLED faults can appear after a drop even when the outside glass is not badly shattered. We test display output before quoting.",
    },
    {
      title: "Touch dead zones",
      description:
        "A damaged digitizer can leave parts of the display unresponsive. We test touch across the full panel before and after fitting.",
    },
    {
      title: "Top sensor and Face ID area risk",
      description:
        "Impact around the earpiece, front camera, or sensor area can affect Face ID-related behaviour. We inspect that area before repair.",
    },
    {
      title: "Frame bend or lifted screen edge",
      description:
        "A small housing bend can stop a replacement display from sitting cleanly, so frame fit is checked before the screen is installed.",
    },
    {
      title: "True Tone and display message checks",
      description:
        "Where supported, display data and True Tone behaviour are checked carefully. Some iOS display messages can depend on part type and device pairing.",
    },
  ],
  diagnosticSteps: [
    {
      step: "01",
      title: "Inspect glass, OLED, and housing fit",
      description:
        "We check cracks, display lines, pressure marks, lifted corners, frame bends, and whether the device is safe to open.",
    },
    {
      step: "02",
      title: "Test touch, Face ID area, and sensors",
      description:
        "Before quoting, we test touch response, front camera area, proximity behaviour, earpiece mesh, and visible liquid indicators.",
    },
    {
      step: "03",
      title: "Confirm display tier and limitations",
      description:
        "We explain the available screen option, part availability, warranty limits, iOS display message considerations, and expected repair time before work begins.",
    },
    {
      step: "04",
      title: "Final handover checks",
      description:
        "After fitting, we test brightness, colour, touch, charging, cameras, speaker, microphone, buttons, and normal operation before return.",
    },
  ],
  faq: [
    {
      question: "How long does iPhone 13 screen replacement take in Ringwood?",
      answer:
        "If the correct display assembly is in stock and there is no hidden frame or liquid damage, iPhone 13 screen replacement is usually completed in under 1 hour.",
    },
    {
      question: "Can you fix an iPhone 13 with green lines, flicker, or a black screen?",
      answer:
        "Yes. Green lines, flicker, black display, and touch dead zones are common OLED or digitizer symptoms. We test the phone first to confirm whether a screen assembly is the right repair.",
    },
    {
      question: "Do you check Face ID before replacing the iPhone 13 screen?",
      answer:
        "Yes. We check the Face ID area, front camera area, proximity behaviour, and earpiece mesh condition before repair because impact around the top of the display can affect those parts.",
    },
    {
      question: "Will True Tone still work after an iPhone 13 screen replacement?",
      answer:
        "Where supported, we check display data and True Tone behaviour during the repair process. The result can depend on the display option, device condition, and whether the original screen data is readable.",
    },
    {
      question: "Will my iPhone 13 still be water resistant after screen replacement?",
      answer:
        "We clean old adhesive and reseal carefully, but factory water resistance cannot be guaranteed after any phone has been opened. Keep the phone away from water after repair.",
    },
    {
      question: "Do I need to book before visiting for iPhone 13 screen replacement?",
      answer:
        "Booking helps us prepare the right display option and gives you priority at the repair desk. Walk-ins are welcome, but part availability can vary.",
    },
  ],
};

function getRepairTypeSeoPocket(params: {
  category: string;
  brand: string;
  model: string;
  repairType: string;
}): RepairTypeSeoPocket | null {
  const category = slugify(params.category);
  const brand = slugify(params.brand);
  const model = slugify(params.model);
  const repairType = slugify(params.repairType);

  if (
    category === "phone" &&
    (brand === "iphone" || brand === "apple") &&
    model === "iphone-13" &&
    repairType === "screen-replacement"
  ) {
    return IPHONE_13_SCREEN_REPLACEMENT_SEO_POCKET;
  }

  return null;
}

function TechnicianWorkbenchProcess({ pocket }: { pocket: RepairTypeSeoPocket }) {
  return (
    <section className="repair-workbench-shell w-full flex flex-col justify-center items-center text-center mx-auto" aria-labelledby="technician-workbench-heading">
      <details className="w-full rounded-[26px] border border-slate-200 bg-white/80 shadow-[0_16px_54px_rgba(15,23,42,0.06)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:content-[''] sm:px-6 relative">
          <div className="w-full text-center absolute left-0 right-0 mx-auto pointer-events-none z-0">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
              Technician Workbench Process
            </span>
            <h2 id="technician-workbench-heading" className="mt-1 text-lg font-black tracking-tight text-slate-950">
              iPhone 13 screen checks before we quote
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            Details
          </span>
        </summary>

        <div className="border-t border-slate-100 px-5 pb-6 pt-4 sm:px-6">
          <p className="max-w-3xl text-sm font-semibold leading-6 text-slate-600">{pocket.quickAnswer}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {pocket.repairOptions.map((option) => (
              <article key={option.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-black text-slate-950">{option.name}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{option.shortDescription}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-blue-600">Best for</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{option.bestFor}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{option.notes}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {pocket.commonProblems.map((problem) => (
              <article key={problem.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-black text-slate-950">{problem.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{problem.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {pocket.diagnosticSteps.map((step) => (
              <article key={step.step} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[48px_1fr]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-950">{step.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
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

export function generateFaqs(model: string, repairName: string, repairSlug: string, price: number, modelCode?: string, brand?: string) {
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

  const baseFaqs = [
    {
      question: `How long does the ${model} ${repairName} take?`,
      answer: isWaterDamage 
        ? `Water damage recovery typically takes around 1 hour. If the damage is extensive and requires more time for professional drying or component cleaning, our technicians will inform you beforehand.`
        : `Most ${model} ${repairName.toLowerCase()} jobs are completed in under 1 hour at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Walk-ins are welcome on weekdays for same-day service.`,
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

  if ((brand?.toLowerCase() === 'apple' || brand?.toLowerCase() === 'iphone') && repairSlug.includes('screen')) {
    baseFaqs.splice(1, 0, {
      question: "What is the difference between Standard, Premium, and Genuine screens?",
      answer: `We offer three tiers to suit your budget: <br/><br/> 
<b>1. Standard (In-cell LCD):</b> A budget-friendly aftermarket option. It works reliably, but uses LCD technology instead of OLED, meaning colors are slightly cooler and it consumes a bit more battery. Best for a quick, cost-effective fix. <br/><br/>
<b>2. Premium (Soft OLED) - ⭐ Highly Recommended:</b> This is our most popular option and the sweet spot for value. It uses the exact same Soft OLED technology as your original Apple screen. You get the deep blacks, vibrant colors, perfect edge-to-edge touch sensitivity, and original battery efficiency, all at a significantly better price than the Genuine part. <br/><br/>
<b>3. Genuine (OEM):</b> The uncompromised original factory display. It offers maximum quality for purists, but comes with the highest price tag.`
    });
  }

  return baseFaqs;
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

export function getLSIForRepair(slug: string): { component?: string[]; issue?: string[] } {
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
import RepairPricingAndCTA from '@/components/services/RepairPricingAndCTA';

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
  const seoPocket = getRepairTypeSeoPocket({
    category: resolvedParams.category,
    brand: resolvedParams.brand,
    model: resolvedParams.model,
    repairType: resolvedParams['repair-type'],
  });

  // Validate repair type exists in our known list, or accept POS-provided name
  const knownRepair = REPAIR_TYPES.find(r => r.slug === resolvedParams['repair-type']);
  const finalRepairName = knownRepair?.name || repairTypeDerived;

  const faqs = seoPocket?.faq || generateFaqs(displayModel, finalRepairName, resolvedParams['repair-type'], price, modelCode, displayBrand);

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

      {/* Repair detail hero */}
      <main className="repair-page-shell repair-page-shell-narrow" style={{ paddingBottom: '0' }}>
        <Breadcrumbs category={resolvedParams.category} brand={resolvedParams.brand} model={resolvedParams.model} service={resolvedParams['repair-type']} />

        <section className="repair-hero repair-detail-hero relative" aria-labelledby="repair-detail-heading">
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex justify-start text-left z-10">
            <BackButton fallbackHref={`/repairs/${resolvedParams.category}/${resolvedParams.brand}/${resolvedParams.model}`} />
          </div>
          <span className="repair-detail-icon mt-6">{getRepairIcon(resolvedParams['repair-type'])}</span>
          <h1>{displayModel} {finalRepairName} in Ringwood</h1>
          <p className="repair-detail-subtitle">Choose a quality tier, confirm the quote, then book the repair path that fits your device and budget.</p>

          <RepairPricingAndCTA 
            brandName={displayBrand}
            modelName={displayModel}
            repairName={finalRepairName}
            variants={details?.variants || []}
          />

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
            <div className="trust-badge">
              <span className="trust-badge-icon"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
              Clear Quote First
            </div>
          </div>
        </section>
      </main>

      {/* ─── SOCIAL PROOF ─────────────────────────────── */}
      <ReviewsSection />

      {/* ─── WATER DAMAGE POLICY ──────────────────────── */}
      {resolvedParams['repair-type'] === 'water-damage-repair' && <WaterDamagePolicySection />}

      {seoPocket && <TechnicianWorkbenchProcess pocket={seoPocket} />}

      {/* ─── FAQ SECTION ──────────────────────────────── */}
      <FaqAccordion faqs={faqs} />
    </>
  );
}
