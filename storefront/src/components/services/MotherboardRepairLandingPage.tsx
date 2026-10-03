import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Cpu, ShieldCheck, Wrench } from 'lucide-react';
import type { ReactNode } from 'react';

import FaqAccordion from '@/components/FaqAccordion';
import ReviewsSection from '@/components/ReviewsSection';
import hubStyles from '@/components/repair-type-hubs/RepairTypeHub.module.css';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import CameraModuleRepairSelectionExperience from '@/components/services/CameraModuleRepairSelectionExperience';
import {
  MOTHERBOARD_REPAIR_NAME,
  MOTHERBOARD_REPAIR_SLUG,
  getMotherboardBookingHref,
  type MotherboardEligibleDevice,
} from '@/lib/motherboardRepair';
import { buildMotherboardSelectorGroups } from '@/lib/motherboardSelector';
import MotherboardDeviceSelector from './MotherboardDeviceSelector';
import MotherboardRepairFacts from './MotherboardRepairFacts';
import styles from './CameraModuleRepairLandingPage.module.css';

const SITE_URL = 'https://www.alimobile.com.au';
const CARD_CLASS = `${hubStyles.reasonCard} flex h-full flex-col`;

const FAQS = [
  { question: 'What happens first with a motherboard repair?', answer: 'We inspect the device and assess the reported fault first. We then provide an estimated price range before detailed board-level diagnosis begins.' },
  { question: 'When will I know the final repair price?', answer: 'After detailed diagnosis confirms the fault, we provide the final repair price. Repair starts only after you approve that final quote.' },
  { question: 'How long does motherboard or logic board repair take?', answer: 'Typical turnaround is around 2–3 weeks. Specialist or off-site board-level work may be required, so the expected timing is confirmed after diagnosis.' },
  { question: 'What if the repair is unsuccessful?', answer: 'If the board-level repair is unsuccessful, no repair fee is charged.' },
  { question: 'Can a board fault affect my data?', answer: 'It can. Board faults and the condition of the device may affect data access, so back up important data where possible before assessment.' },
  { question: 'Can water damage require motherboard diagnosis?', answer: 'Yes. Liquid exposure can affect board components and connectors. We assess the device condition and fault before recommending a repair path.' },
];

function ContentCard({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children?: ReactNode }) {
  return <article data-motherboard-content-card className={CARD_CLASS}>
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">{icon}</span>
    <h3>{title}</h3>
    <p>{body}</p>
    {children}
  </article>;
}

export default function MotherboardRepairLandingPage({ canonicalPath, eligibleDevices, selection }: {
  canonicalPath: string;
  eligibleDevices: readonly MotherboardEligibleDevice[];
  selection: MotherboardEligibleDevice | null;
}) {
  const selectorGroups = buildMotherboardSelectorGroups(eligibleDevices, canonicalPath);
  const selectedDevice = selection ? {
    selectedDevice: { brand: selection.brand, brandSlug: selection.brandSlug, model: selection.model, modelSlug: selection.modelSlug },
    selectedRepair: { name: MOTHERBOARD_REPAIR_NAME, serviceSlug: MOTHERBOARD_REPAIR_SLUG },
    priceLabel: 'Quote on Request',
    booking: { href: getMotherboardBookingHref(selection), isAvailable: true },
  } : null;
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Repairs', item: `${SITE_URL}/repairs` },
      { '@type': 'ListItem', position: 3, name: MOTHERBOARD_REPAIR_NAME, item: `${SITE_URL}${canonicalPath}` },
    ],
  };

  return <>
    <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell" style={{ paddingBottom: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ServiceSchema serviceName={MOTHERBOARD_REPAIR_NAME} description="Quote-first motherboard and logic board assessment for supported phones, tablets, MacBooks and Apple Watch models." url={`${SITE_URL}${canonicalPath}`} />
      <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600"><ol className="flex flex-wrap items-center justify-center gap-2"><li><Link href="/" className="font-semibold hover:text-blue-700 hover:underline">Home</Link></li><li aria-hidden="true">›</li><li><Link href="/repairs" className="font-semibold hover:text-blue-700 hover:underline">Repairs</Link></li><li aria-hidden="true">›</li><li><span aria-current="page" className="font-bold text-blue-600">Motherboard &amp; Logic Board Repair</span></li></ol></nav>

      <CameraModuleRepairSelectionExperience
        title={MOTHERBOARD_REPAIR_NAME}
        description="Quote-first assessment for no-power, startup, charging and other board-level faults. Repair suitability and pricing are confirmed only after diagnosis."
        eyebrow="Board-level diagnosis"
        icon="cpu"
        bookingService={MOTHERBOARD_REPAIR_NAME}
        canonicalPath={canonicalPath}
        useMasterFacts
        heroFacts={<MotherboardRepairFacts />}
        selectActionLabel="Select your device"
        selectorGuide="Choose your device type, then its brand or series and model. Selection requests a motherboard or logic-board assessment; repairability is confirmed after diagnosis."
        selectorContent={<section className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8" aria-labelledby="motherboard-device-selector-heading"><div className="repair-workbench-heading"><span>Choose your device</span><h2 id="motherboard-device-selector-heading">Find your device for board-level assessment</h2><p>Select a device type, then a brand or series and model. We confirm assessment suitability after inspection.</p></div><MotherboardDeviceSelector groups={selectorGroups} /></section>}
        hierarchy={{ models: [], selectedBrandSlug: selection?.brandSlug ?? null, selectedModelSlug: selection?.modelSlug ?? null, selectedDevice }}
      />

      <div data-motherboard-content>
        <section data-motherboard-layout-section className={styles.layoutSection} aria-labelledby="motherboard-process-heading">
          <div className="repair-workbench-heading"><span>How the assessment works</span><h2 id="motherboard-process-heading">A clear quote-first board-level process</h2><p>Board-level work starts with an initial assessment, then proceeds only when you approve the relevant estimate and final quote.</p></div>
          <div className={hubStyles.reasonGrid}>
            <ContentCard icon={<ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" />} title="1. Device received and inspected" body="After we receive the device, we inspect its condition and the reported symptoms." />
            <ContentCard icon={<Wrench size={20} strokeWidth={2.5} aria-hidden="true" />} title="2. Initial fault assessment" body="We assess the likely fault and whether board-level diagnosis may be appropriate." />
            <ContentCard icon={<ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" />} title="3. Estimated price range" body="We provide an estimated price range before detailed board-level diagnosis begins." />
            <ContentCard icon={<Cpu size={20} strokeWidth={2.5} aria-hidden="true" />} title="4. Detailed board-level diagnosis" body="If you accept the estimate, we perform detailed diagnosis to identify the exact fault." />
            <ContentCard icon={<Wrench size={20} strokeWidth={2.5} aria-hidden="true" />} title="5. Exact fault and final price" body="We confirm the exact fault and final repair price, then explain the result to you." />
            <ContentCard icon={<CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" />} title="6. Repair after final approval" body="Repair begins only when you approve the final quote. If the repair is unsuccessful, no repair fee is charged." />
          </div>
        </section>

        <section data-motherboard-layout-section className={styles.layoutSection} aria-labelledby="motherboard-symptoms-heading">
          <div className="repair-workbench-heading"><span>When assessment helps</span><h2 id="motherboard-symptoms-heading">Board-level faults need diagnosis first</h2><p>Similar symptoms can have different causes. We assess the device before deciding whether board-level repair is the appropriate path.</p></div>
          <div className={hubStyles.reasonGrid}>
            <ContentCard icon={<AlertTriangle size={20} strokeWidth={2.5} aria-hidden="true" />} title="Power and startup faults" body="No power, restart loops, unexpected shutdowns and faults that remain after ordinary part checks may need board-level assessment." />
            <ContentCard icon={<Cpu size={20} strokeWidth={2.5} aria-hidden="true" />} title="Charging and connectivity symptoms" body="Charging, power-management, signal and data faults can involve a battery, connector, accessory or board component. Diagnosis separates the likely cause." />
            <ContentCard icon={<ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" />} title="Impact or liquid exposure" body="Drops and liquid exposure can affect internal components and the board. Condition and repair suitability are confirmed after inspection." />
          </div>
        </section>

        <section data-motherboard-layout-section className={styles.layoutSection} aria-labelledby="motherboard-boundaries-heading">
          <div className="repair-workbench-heading"><span>Timing and preparation</span><h2 id="motherboard-boundaries-heading">Specialist work with clear boundaries</h2><p>We set expectations after assessment so the scope, cost and timing are understood before detailed work begins.</p></div>
          <div className={hubStyles.reasonGrid}>
            <ContentCard icon={<Cpu size={20} strokeWidth={2.5} aria-hidden="true" />} title="Around 2–3 weeks" body="Typical turnaround is around 2–3 weeks. Specialist or off-site board-level work may be required, and the expected timing is confirmed after diagnosis." />
            <ContentCard icon={<ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" />} title="Data and water-damage considerations" body="Board faults can affect data access. Back up important information where possible and tell us about any liquid exposure before assessment."><Link href="/repairs/water-damage" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100">Water damage assessment</Link></ContentCard>
          </div>
        </section>

        <div data-motherboard-layout-section className={styles.layoutSection}><FaqAccordion faqs={FAQS} density="comfortable" layout="repair-detail" /></div>
      </div>

      <section data-motherboard-layout-section className={styles.layoutSection} aria-labelledby="motherboard-links-heading"><div className={`${styles.linksPanel} mx-auto flex w-full flex-col gap-6 rounded-[28px] border-[2px] border-slate-800 bg-transparent text-center`}><div className="repair-workbench-heading"><span>Helpful links</span><h2 id="motherboard-links-heading" className="scroll-mt-32">Board-level assessment in Ringwood</h2><p>Visit Ali Mobile &amp; Repair at Kiosk C1 inside Ringwood Square. We inspect the device, explain the assessment outcome and confirm the quote before approved work begins.</p></div><div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row"><Link href="/repairs/phone" className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold !text-white transition-colors hover:bg-blue-700">Phone Repair Services</Link><Link href="/repairs/water-damage" className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50">Water Damage Assessment</Link></div></div></section>
    </main>
    <ReviewsSection />
  </>;
}
