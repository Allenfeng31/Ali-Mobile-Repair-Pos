import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { ArrowLeft, BadgeCheck, Camera, CheckCircle2, ClipboardCheck, ShieldCheck, Wrench } from 'lucide-react';
import ReviewsSection from '@/components/ReviewsSection';
import FaqAccordion from '@/components/FaqAccordion';
import SharedRepairPageResultsSection from '@/components/repair-results/SharedRepairPageResultsSection';
import type { RepairResultMatchingItem } from '@/lib/repair-results';
import type { SharedRepairModelCandidate } from '@/lib/sharedRepairContext';
import CameraModuleRepairBookingControls from '@/components/services/CameraModuleRepairBookingControls';
import { type SharedRepairSelectedDeviceViewModel } from '@/components/services/SharedRepairSelectedDevice';
import CameraModuleRepairSelectionExperience from '@/components/services/CameraModuleRepairSelectionExperience';
import { ServiceSchema } from '@/components/services/ServiceSchema';
import type { SharedRepairHierarchyModel } from '@/lib/sharedRepairHierarchy';
import styles from './CameraModuleRepairLandingPage.module.css';

export type CameraModuleRepairLandingConfig = Readonly<{
  repairSlug: 'front-camera-replacement' | 'back-camera-replacement';
  bookingService: 'Front Camera Replacement' | 'Back Camera Replacement';
  title: string;
  description: string;
  eyebrow: string;
  symptoms: readonly string[];
  distinctionTitle: string;
  distinctionBody: string;
  inspectionBody: string;
  relatedHref?: string;
  relatedLabel?: string;
}>;

type CameraModuleRepairLandingPageProps = Readonly<{
  config: CameraModuleRepairLandingConfig;
  canonicalPath: string;
  candidates: readonly SharedRepairModelCandidate[];
  initialResults?: RepairResultMatchingItem[];
  hierarchy?: Readonly<{
    models: readonly SharedRepairHierarchyModel[];
    selectedBrandSlug: string | null;
    selectedModelSlug: string | null;
    selectedDevice?: SharedRepairSelectedDeviceViewModel | null;
  }>;
}>;

const CARD_CLASS = `${styles.contentCard} flex h-full min-h-[188px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent text-center`;
const SYMPTOM_CARD_CLASS = `${styles.symptomCard} flex h-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent text-center`;

const FRONT_CAMERA_FAQS = [
  {
    question: 'Why is my front camera black, blurry or not opening?',
    answer: 'Drops and impact are common hardware causes, but a black preview, blur or camera-app crashes can also come from software, connectors or other internal faults. Ali Mobile diagnoses the device before recommending front camera replacement.',
  },
  {
    question: 'Can front camera replacement fix Face ID or facial recognition?',
    answer: 'For supported non-iPhone models, repair limited to the front camera module does not normally affect standard face unlock. It does not guarantee every biometric fault will be fixed because sensors, calibration, connectors and other hardware can require separate assessment.',
  },
  {
    question: 'When might front camera replacement not be the right repair?',
    answer: 'Replacement may not be suitable when dirt, an obstructing case or protector, an app or software issue, connector damage, liquid damage, biometric hardware or a board-level fault is causing the symptom. We inspect the phone before recommending the repair path.',
  },
  {
    question: 'How much does front camera repair cost?',
    answer: 'The price depends on the brand and model. Use the model selector for an exact price, a From price where valid repair variants exist, or a Custom Quote when no trusted exact price is available. You can also call <a href="tel:0481058514">0481 058 514</a> for a current quote.',
  },
  {
    question: 'How long does front camera repair take?',
    answer: 'A straightforward front camera replacement usually takes around 30–45 minutes once diagnosis confirms the camera fault and the correct part is available. Connector, liquid or other internal faults can take longer to assess or repair.',
  },
  {
    question: 'Will front camera repair affect my data, and should I back up first?',
    answer: 'A standard front camera replacement does not normally require data erasure. Back up important information before hardware repair as a precaution, especially when the phone has impact, liquid or other internal damage.',
  },
  {
    question: 'Does front camera repair come with a warranty?',
    answer: 'Standard completed front camera repairs include a 6-month warranty under our normal warranty terms.',
  },
] as const;

const BACK_CAMERA_FAQS = [
  {
    question: 'Why is my rear camera blurry, shaking, black or unable to focus?',
    answer: 'Possible causes include impact, dirty or cracked lens glass, a camera-module or stabilisation fault, liquid exposure, connector damage, software or another internal fault. We diagnose the phone before recommending module replacement.',
  },
  {
    question: 'Is the camera module broken, or is it only the outer lens glass?',
    answer: 'Cracked outer glass with otherwise normal photos may only need Camera Lens Replacement. Focus failure, a shaking live image, black preview or image defects can point to the internal camera module or another fault, so inspection confirms the correct repair.',
  },
  {
    question: 'Can cracked camera glass be replaced without replacing the camera module?',
    answer: 'Yes, when damage is limited to the outer lens glass and the camera underneath still works correctly. See our <a href="/repairs/phone/camera-lens-replacement">Camera Lens Replacement</a> service; we inspect the phone before confirming which part needs repair.',
  },
  {
    question: 'Is a rattling rear camera always a fault?',
    answer: 'Not necessarily. Some stabilised cameras can have normal internal movement. Inspection is more appropriate when the live image shakes, focus fails or the symptom started after impact or other damage.',
  },
  {
    question: 'When might back camera replacement not be the right repair?',
    answer: 'Module replacement may not be suitable when dirty or cracked lens glass, a case or protector, an app or software issue, normal stabilisation movement, liquid damage, connector damage or a board-level fault is causing the symptom.',
  },
  {
    question: 'How much does back camera repair cost?',
    answer: 'The price depends on the brand and model. Use the model selector for an exact price, a From price where valid repair variants exist, or a Custom Quote when no trusted exact price is available. You can also call <a href="tel:0481058514">0481 058 514</a> for a current quote.',
  },
  {
    question: 'How long does back camera repair take?',
    answer: 'A straightforward camera-module replacement usually takes around 30–45 minutes once diagnosis confirms the module fault and the correct part is available. Connector, liquid or other internal faults can take longer to assess or repair.',
  },
  {
    question: 'Will my data be affected, and should I back up before repair?',
    answer: 'A standard back camera replacement does not normally require data erasure. Back up important information before hardware repair as a precaution, especially when the phone has impact, liquid or other internal damage.',
  },
  {
    question: 'Does back camera repair come with a warranty?',
    answer: 'Standard completed back camera repairs include a 6-month warranty under our normal warranty terms.',
  },
] as const;

function RepairTrustBadges() {
  return <div className="trust-badges mt-8">
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Inspection Before Work</div>
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" /></span>Clear Quote First</div>
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Repair Warranty</div>
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><BadgeCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Repair Desk</div>
  </div>;
}

function ContentCard({ icon, title, body, children }: { icon: ReactNode; title: string; body: string; children?: ReactNode }) {
  return <article data-camera-module-content-card className={CARD_CLASS}>
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">{icon}</span>
    <h3 className="mt-5 text-balance text-[1rem] font-black leading-[1.14] text-slate-950">{title}</h3>
    <p className="mt-4 text-pretty text-[0.95rem] font-medium leading-[1.62] text-slate-500">{body}</p>
    {children}
  </article>;
}

export default function CameraModuleRepairLandingPage({ config, canonicalPath, candidates, initialResults = [], hierarchy }: CameraModuleRepairLandingPageProps) {
  const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Phone Repairs', href: '/repairs/phone' }, { label: config.bookingService }];
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, item: `https://www.alimobile.com.au${item.href ?? canonicalPath}` })),
  };
  const isBackCamera = config.repairSlug === 'back-camera-replacement';
  const faqs = isBackCamera ? BACK_CAMERA_FAQS : FRONT_CAMERA_FAQS;
  const reciprocalHref = isBackCamera ? '/repairs/phone/front-camera-replacement' : '/repairs/phone/back-camera-replacement';
  const reciprocalLabel = isBackCamera ? 'Front Camera Repair' : 'Back Camera Repair';

  return <>
    <ServiceSchema serviceName={config.title} description={config.description} url={`https://www.alimobile.com.au${canonicalPath}`} />
    <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell" style={{ paddingBottom: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600"><ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">{breadcrumbs.map((item, index) => <li key={item.label} className="flex items-center gap-2">{index > 0 ? <span aria-hidden="true">›</span> : null}{item.href ? <Link href={item.href} className="font-semibold transition-colors hover:text-blue-700 hover:underline">{item.label}</Link> : <span aria-current="page" className="font-bold text-blue-600">{item.label}</span>}</li>)}</ol></nav>
      <div className="repair-detail-topbar"><Link href="/repairs/phone" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><ArrowLeft size={17} aria-hidden="true" />Back to phone repairs</Link></div>
      {hierarchy ? <CameraModuleRepairSelectionExperience
        key={hierarchy.selectedDevice ? `${hierarchy.selectedDevice.selectedDevice.brandSlug}/${hierarchy.selectedDevice.selectedDevice.modelSlug}` : 'generic'}
        title={config.title}
        description={config.description}
        eyebrow={config.eyebrow}
        bookingService={config.bookingService}
        canonicalPath={canonicalPath}
        hierarchy={hierarchy}
      /> : <section className="repair-hero repair-detail-hero relative" data-camera-module-hero aria-labelledby="camera-module-heading">
        <span className="repair-detail-icon text-blue-600"><Camera size={34} strokeWidth={2.4} aria-hidden="true" /></span>
        <div data-camera-module-hero-stack className="flex w-full flex-col items-center text-center">
          <span className="repair-kicker mx-auto mb-5"><Camera size={14} strokeWidth={2.6} aria-hidden="true" />{config.eyebrow}</span>
          <h1 id="camera-module-heading">{config.title}</h1><p className="repair-detail-subtitle">{config.description}</p>
          <div className="mt-6 flex w-full justify-center"><Suspense fallback={<Link href={`/book-repair?category=phone&service=${encodeURIComponent(config.bookingService)}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-bold !text-white">Request an assessment</Link>}><CameraModuleRepairBookingControls basePath={canonicalPath} repairSlug={config.repairSlug} bookingService={config.bookingService} candidates={candidates} /></Suspense></div>
        </div>
        <RepairTrustBadges />
      </section>}
      <SharedRepairPageResultsSection initialResults={initialResults} repairName={config.bookingService} />

      <div data-camera-module-content>
        <section data-camera-module-layout-section className={styles.layoutSection} aria-labelledby="camera-preparation-heading">
          <div className="repair-workbench-heading">
            <span>{isBackCamera ? 'Choose the right repair' : 'Before repair'}</span>
            <h2 id="camera-preparation-heading">{isBackCamera ? 'Camera Module or Camera Lens?' : 'Before a front camera repair'}</h2>
            <p>{isBackCamera ? 'Outer camera glass and the internal rear-camera module are different repair paths. We confirm which part is affected before work begins.' : 'A few practical checks and a clear repair boundary help us assess the front camera fault accurately.'}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
            {isBackCamera ? <><ContentCard icon={<Camera size={20} strokeWidth={2.5} aria-hidden="true" />} title="Cracked outer camera lens / glass" body={config.distinctionBody}>{config.relatedHref && config.relatedLabel ? <Link href={config.relatedHref} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100">{config.relatedLabel}</Link> : null}</ContentCard><ContentCard icon={<ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" />} title="Quick checks before repair" body="Clean the camera area, remove anything covering the lenses, restart the phone and compare the rear camera in more than one app. Persistent faults can then be assessed in person." /></> : <><ContentCard icon={<ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" />} title="Quick checks before repair" body="Clean the front camera area, remove an obstructing case or protector, restart the phone and compare front and rear cameras. Persistent faults can then be assessed in person." /><ContentCard icon={<Camera size={20} strokeWidth={2.5} aria-hidden="true" />} title="Front Camera vs Face ID / biometric boundary" body={config.distinctionBody} /></>}
          </div>
        </section>

        <section data-camera-module-layout-section data-camera-module-guidance-grid className={styles.layoutSection} aria-labelledby="symptoms-heading">
          <div className="repair-workbench-heading"><span>Common symptoms</span><h2 id="symptoms-heading">{isBackCamera ? 'Back camera symptoms we assess' : 'Front camera symptoms we assess'}</h2><p>Camera symptoms can involve software, accessories, connectors, liquid exposure or internal hardware, so we inspect before recommending a repair.</p></div>
          <div data-camera-module-symptom-grid className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:grid-cols-3 lg:gap-6">{config.symptoms.map((symptom) => <article key={symptom} data-camera-module-content-card data-camera-module-symptom-card className={SYMPTOM_CARD_CLASS}><span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><CheckCircle2 size={20} aria-hidden="true" /></span><h3 className="text-balance text-[1rem] font-black leading-[1.14] text-slate-950">{symptom}</h3></article>)}</div>
        </section>

        <section data-camera-module-layout-section className={styles.layoutSection} aria-labelledby="camera-process-heading">
          <div className="repair-workbench-heading"><span>Repair process</span><h2 id="camera-process-heading">{isBackCamera ? 'Inspection and testing' : 'Diagnosis and preparation'}</h2><p>We confirm the fault and suitable repair scope before work, then check the functions relevant to the completed repair.</p></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6"><ContentCard icon={<Wrench size={20} strokeWidth={2.5} aria-hidden="true" />} title={isBackCamera ? 'What we inspect before recommending replacement' : 'How we diagnose the problem'} body={config.inspectionBody} /><ContentCard icon={<CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" />} title={isBackCamera ? 'What we test after repair' : 'Before bringing your phone in'} body={isBackCamera ? 'After a suitable repair, we check camera opening, image output, focus and the practical photo or video behaviour relevant to the repair scope.' : 'Back up important information before service where possible. Bring the device charged if practical, and tell us which apps, camera and symptoms are affected.'} /></div>
        </section>
        <div data-camera-module-layout-section className={styles.layoutSection}>
          <FaqAccordion faqs={[...faqs]} density="comfortable" layout="repair-detail" />
        </div>
      </div>
      <section data-camera-module-layout-section data-camera-module-links className={styles.layoutSection} aria-labelledby="camera-links-heading"><div className={`${styles.linksPanel} mx-auto flex w-full flex-col gap-6 rounded-[28px] border-[2px] border-slate-800 bg-transparent text-center`}><div className="repair-workbench-heading"><span>Helpful links</span><h2 id="camera-links-heading" className="scroll-mt-32">Explore related phone repairs</h2><p>Book an assessment at Ali Mobile &amp; Repair in Ringwood. We confirm the model, fault, suitable repair and quote before approved work begins.</p></div><div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row"><Link href="/repairs/phone" className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold !text-white transition-colors hover:bg-blue-700">Phone Repair Services</Link><Link href={reciprocalHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50">{reciprocalLabel}</Link>{isBackCamera && config.relatedHref && config.relatedLabel ? <Link href={config.relatedHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50">{config.relatedLabel}</Link> : null}</div></div></section>
    </main>
    <ReviewsSection />
  </>;
}
