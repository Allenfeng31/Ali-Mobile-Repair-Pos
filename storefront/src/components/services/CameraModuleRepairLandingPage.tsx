import Link from 'next/link';
import { Suspense } from 'react';
import { Camera, CheckCircle2, ClipboardCheck, PhoneCall, Wrench } from 'lucide-react';
import type { SharedRepairModelCandidate } from '@/lib/sharedRepairContext';
import CameraModuleRepairBookingControls from '@/components/services/CameraModuleRepairBookingControls';
import SharedRepairHierarchySections from '@/components/services/SharedRepairHierarchySections';
import SharedRepairSelectedDevice, { type SharedRepairSelectedDeviceViewModel } from '@/components/services/SharedRepairSelectedDevice';
import type { SharedRepairHierarchyModel } from '@/lib/sharedRepairHierarchy';

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
  hierarchy?: Readonly<{
    models: readonly SharedRepairHierarchyModel[];
    selectedBrandSlug: string | null;
    selectedModelSlug: string | null;
    selectedDevice?: SharedRepairSelectedDeviceViewModel | null;
  }>;
}>;

export default function CameraModuleRepairLandingPage({ config, canonicalPath, candidates, hierarchy }: CameraModuleRepairLandingPageProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Phone Repairs', href: '/repairs/phone' },
    { label: config.bookingService },
  ];
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.label,
      item: `https://www.alimobile.com.au${item.href ?? canonicalPath}`,
    })),
  };

  return (
    <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600">
        <ol className="flex flex-wrap items-center justify-center gap-2">
          {breadcrumbs.map((item, index) => <li key={item.label} className="flex items-center gap-2">{index > 0 ? <span aria-hidden="true">›</span> : null}{item.href ? <Link href={item.href} className="font-semibold hover:text-blue-700 hover:underline">{item.label}</Link> : <span aria-current="page" className="font-bold text-blue-600">{item.label}</span>}</li>)}
        </ol>
      </nav>
      <section className="repair-hero repair-detail-hero relative text-center" data-camera-module-hero aria-labelledby="camera-module-heading">
        <span className="repair-kicker mx-auto mb-5"><Camera size={14} strokeWidth={2.6} aria-hidden="true" />{config.eyebrow}</span>
        <h1 id="camera-module-heading">{config.title}</h1>
        <p className="repair-detail-subtitle">{config.description}</p>
        <div data-camera-module-assessment className="mx-auto mt-6 flex w-full max-w-md flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center sm:p-8">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>
          <span className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-blue-700">Quote only</span>
          <h2 className="mt-2 text-xl font-black leading-tight text-slate-950">Assessment before repair</h2>
          <p className="mt-3 max-w-[32rem] text-sm font-semibold leading-6 text-slate-600">We confirm the suitable repair path and quote after inspecting the model, fault and parts availability.</p>
          <p className="mt-4 text-sm font-bold text-slate-700">Choose a supported model below to view its current repair option.</p>
        </div>
        {hierarchy?.selectedDevice ? <SharedRepairSelectedDevice selection={hierarchy.selectedDevice} changeModelHref="#shared-repair-model-selection" /> : null}
        {!hierarchy ? <div className="mt-6 flex w-full justify-center">
          <Suspense fallback={<Link href={`/book-repair?category=phone&service=${encodeURIComponent(config.bookingService)}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-bold !text-white">Request an assessment</Link>}>
            <CameraModuleRepairBookingControls basePath={canonicalPath} repairSlug={config.repairSlug} bookingService={config.bookingService} candidates={candidates} />
          </Suspense>
        </div> : null}
      </section>
      {hierarchy ? <div className="relative z-10"><SharedRepairHierarchySections models={hierarchy.models} selectedBrandSlug={hierarchy.selectedBrandSlug} selectedModelSlug={hierarchy.selectedModelSlug} genericSelectionPath={canonicalPath} /></div> : null}
      <section data-camera-module-guidance-grid className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="symptoms-heading">
        <div className="repair-workbench-heading"><span>Common symptoms</span><h2 id="symptoms-heading">When to arrange a camera assessment</h2><p>Camera faults can share symptoms with connectors, board faults, liquid damage or app behaviour, so inspection comes first.</p></div>
        <div className="grid grid-cols-1 gap-5 md:auto-rows-fr md:grid-cols-2 lg:grid-cols-3 lg:gap-6">{config.symptoms.map((symptom) => <article key={symptom} data-camera-module-content-card className="flex h-full min-h-[160px] flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center text-sm font-semibold leading-6 text-slate-700 md:p-8"><span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><CheckCircle2 size={20} aria-hidden="true" /></span>{symptom}</article>)}</div>
      </section>
      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-14" aria-label="Camera repair guidance">
        <article data-camera-module-content-card className="flex h-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center md:p-8"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><Camera size={20} aria-hidden="true" /></span><h2 className="mt-5 text-lg font-black leading-tight text-slate-950">{config.distinctionTitle}</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{config.distinctionBody}</p></article>
        <article data-camera-module-content-card className="flex h-full flex-col items-center rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center md:p-8"><span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><Wrench size={20} aria-hidden="true" /></span><h2 className="mt-5 text-lg font-black leading-tight text-slate-950">What happens next</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{config.inspectionBody}</p></article>
      </section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"><div data-camera-module-content-card className="rounded-[28px] border-[2px] border-slate-800 bg-transparent p-6 text-center md:p-8"><span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><ClipboardCheck size={20} aria-hidden="true" /></span><h2 className="mt-5 text-lg font-black leading-tight text-slate-950">Call ahead for parts and timing</h2><p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">We can confirm the model, likely repair path and quote process before you travel to Ringwood Square.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><a href="tel:0481058514" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><PhoneCall size={18} aria-hidden="true" />Call the repair desk</a>{config.relatedHref && config.relatedLabel ? <Link href={config.relatedHref} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{config.relatedLabel}</Link> : null}</div></div></section>
    </main>
  );
}
