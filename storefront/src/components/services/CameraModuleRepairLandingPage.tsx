import Link from 'next/link';
import { Suspense } from 'react';
import { Camera, CheckCircle2, ClipboardCheck, PhoneCall, Wrench } from 'lucide-react';
import type { SharedRepairModelCandidate } from '@/lib/sharedRepairContext';
import CameraModuleRepairBookingControls from '@/components/services/CameraModuleRepairBookingControls';

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
}>;

export default function CameraModuleRepairLandingPage({ config, canonicalPath, candidates }: CameraModuleRepairLandingPageProps) {
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
      <section className="repair-hero repair-detail-hero relative text-center" aria-labelledby="camera-module-heading">
        <span className="repair-kicker mx-auto mb-5"><Camera size={14} strokeWidth={2.6} aria-hidden="true" />{config.eyebrow}</span>
        <h1 id="camera-module-heading">{config.title}</h1>
        <p className="repair-detail-subtitle">{config.description}</p>
        <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Quote only</span>
          <h2 className="mt-3 text-xl font-black text-slate-950">Assessment before repair</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">We confirm the suitable repair path and quote after inspecting the model, fault and parts availability.</p>
        </div>
        <div className="mt-6 flex w-full justify-center">
          <Suspense fallback={<Link href={`/book-repair?category=phone&service=${encodeURIComponent(config.bookingService)}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-bold !text-white">Request an assessment</Link>}>
            <CameraModuleRepairBookingControls basePath={canonicalPath} repairSlug={config.repairSlug} bookingService={config.bookingService} candidates={candidates} />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="symptoms-heading">
        <div className="repair-workbench-heading"><span>Common symptoms</span><h2 id="symptoms-heading">When to arrange a camera assessment</h2><p>Camera faults can share symptoms with connectors, board faults, liquid damage or app behaviour, so inspection comes first.</p></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{config.symptoms.map((symptom) => <article key={symptom} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700"><CheckCircle2 className="mb-3 text-blue-600" size={20} aria-hidden="true" />{symptom}</article>)}</div>
      </section>
      <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-14" aria-label="Camera repair guidance">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><Camera className="mb-4 text-blue-600" size={25} aria-hidden="true" /><h2 className="text-xl font-black text-slate-950">{config.distinctionTitle}</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{config.distinctionBody}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><Wrench className="mb-4 text-blue-600" size={25} aria-hidden="true" /><h2 className="text-xl font-black text-slate-950">What happens next</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{config.inspectionBody}</p></article>
      </section>
      <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"><div className="rounded-2xl border border-slate-200 bg-white p-6 text-center"><ClipboardCheck className="mx-auto text-blue-600" size={26} aria-hidden="true" /><h2 className="mt-3 text-xl font-black text-slate-950">Call ahead for parts and timing</h2><p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">We can confirm the model, likely repair path and quote process before you travel to Ringwood Square.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><a href="tel:0481058514" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><PhoneCall size={18} aria-hidden="true" />Call the repair desk</a>{config.relatedHref && config.relatedLabel ? <Link href={config.relatedHref} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">{config.relatedLabel}</Link> : null}</div></div></section>
    </main>
  );
}
