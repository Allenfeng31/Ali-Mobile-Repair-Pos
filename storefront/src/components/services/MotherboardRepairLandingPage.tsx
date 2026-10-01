import Link from 'next/link';
import { AlertTriangle, Cpu, PhoneCall } from 'lucide-react';

import { ServiceSchema } from '@/components/services/ServiceSchema';
import SharedRepairSelectedDevice from '@/components/services/SharedRepairSelectedDevice';
import {
  MOTHERBOARD_REPAIR_NAME,
  MOTHERBOARD_REPAIR_SLUG,
  getMotherboardBookingHref,
  type MotherboardEligibleDevice,
} from '@/lib/motherboardRepair';
import MotherboardRepairFacts from './MotherboardRepairFacts';

const SITE_URL = 'https://www.alimobile.com.au';

function selectionHref(canonicalPath: string, category: string, brand: string, model: string) {
  return `${canonicalPath}?${new URLSearchParams({ category, brand, model }).toString()}`;
}

export default function MotherboardRepairLandingPage({
  canonicalPath,
  eligibleDevices,
  selection,
}: {
  canonicalPath: string;
  eligibleDevices: readonly MotherboardEligibleDevice[];
  selection: MotherboardEligibleDevice | null;
}) {
  const phoneBrands = [...new Map(eligibleDevices
    .filter((device) => device.category === 'phone')
    .map((device) => [device.brandSlug, device] as const)).values()];
  const macBooks = eligibleDevices.filter((device) => device.category === 'laptop');
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Repairs', item: `${SITE_URL}/repairs` },
      { '@type': 'ListItem', position: 3, name: MOTHERBOARD_REPAIR_NAME, item: `${SITE_URL}${canonicalPath}` },
    ],
  };

  return <main className="repair-page-shell repair-page-shell-narrow repair-detail-page-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <ServiceSchema
      serviceName={MOTHERBOARD_REPAIR_NAME}
      description="Quote-first motherboard and logic board diagnosis for supported phones and MacBook models."
      url={`${SITE_URL}${canonicalPath}`}
    />

    <nav aria-label="Breadcrumb" className="mb-8 flex justify-center text-center text-sm text-slate-600">
      <ol className="flex flex-wrap items-center justify-center gap-2">
        <li><Link href="/" className="font-semibold hover:text-blue-700 hover:underline">Home</Link></li>
        <li aria-hidden="true">›</li>
        <li><Link href="/repairs" className="font-semibold hover:text-blue-700 hover:underline">Repairs</Link></li>
        <li aria-hidden="true">›</li>
        <li><span aria-current="page" className="font-bold text-blue-600">Motherboard &amp; Logic Board Repair</span></li>
      </ol>
    </nav>

    <section className="repair-hero repair-detail-hero relative text-center" aria-labelledby="motherboard-repair-heading">
      <span className="repair-detail-icon text-blue-600"><Cpu size={34} strokeWidth={2.4} aria-hidden="true" /></span>
      <span className="repair-kicker mx-auto mb-5"><Cpu size={14} strokeWidth={2.6} aria-hidden="true" />Board-level diagnosis</span>
      <h1 id="motherboard-repair-heading">Motherboard &amp; Logic Board Repair</h1>
      <p className="repair-detail-subtitle">Quote-first diagnosis for no-power, startup, charging and board-level faults on supported phones and MacBooks.</p>

      {selection ? <SharedRepairSelectedDevice
        selection={{
          selectedDevice: { brand: selection.brand, brandSlug: selection.brandSlug, model: selection.model, modelSlug: selection.modelSlug },
          selectedRepair: { name: MOTHERBOARD_REPAIR_NAME, serviceSlug: MOTHERBOARD_REPAIR_SLUG },
          priceLabel: 'Quote on Request',
          booking: { href: getMotherboardBookingHref(selection), isAvailable: true },
        }}
        changeModelHref={`${canonicalPath}#motherboard-device-selector`}
      /> : <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Quote only</span>
        <p className="mt-3 text-xl font-black text-slate-950">Select your device for an assessment request</p>
        <a href="#motherboard-device-selector" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-bold !text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700">Select your device</a>
      </div>}

      {!selection ? <div className="mt-5 flex justify-center">
        <a href="tel:0481058514" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50"><PhoneCall size={18} aria-hidden="true" />Call 0481 058 514</a>
      </div> : null}
      <MotherboardRepairFacts />
    </section>

    {!selection ? <section id="motherboard-device-selector" className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="motherboard-device-selector-heading">
      <div className="repair-workbench-heading"><span>Choose your device</span><h2 id="motherboard-device-selector-heading">Find your device for board-level assessment</h2><p>Select a device type, then its brand and model. Assessment suitability is confirmed after diagnosis.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="motherboard-phone-selector-heading">
          <h3 id="motherboard-phone-selector-heading" className="text-xl font-black text-slate-950">Phone</h3>
          <div className="mt-4 space-y-3">
            {phoneBrands.map((brand) => {
              const models = eligibleDevices.filter((device) => device.category === 'phone' && device.brandSlug === brand.brandSlug);
              return <details key={brand.brandSlug} className="rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-bold text-slate-900">{brand.brand}</summary>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {models.map((model) => <li key={model.modelSlug}><Link className="font-semibold text-blue-700 hover:underline" href={selectionHref(canonicalPath, model.category, model.brandSlug, model.modelSlug)}>{model.model}</Link></li>)}
                </ul>
              </details>;
            })}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="motherboard-macbook-selector-heading">
          <h3 id="motherboard-macbook-selector-heading" className="text-xl font-black text-slate-950">MacBook</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Choose your MacBook model for a quote-first board-level assessment.</p>
          <ul className="mt-4 grid gap-2">
            {macBooks.map((model) => <li key={model.modelSlug}><Link className="font-semibold text-blue-700 hover:underline" href={selectionHref(canonicalPath, model.category, model.brandSlug, model.modelSlug)}>{model.model}</Link></li>)}
          </ul>
        </section>
      </div>
    </section> : null}

    <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="motherboard-symptoms-heading">
      <div className="repair-workbench-heading"><span>When assessment helps</span><h2 id="motherboard-symptoms-heading">Board-level faults need diagnosis first</h2><p>No power, repeated boot failures, power-management faults and persistent charging issues can have several causes. Diagnosis identifies whether board-level repair is suitable.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700">No power, startup loops or faults that continue after ordinary parts checks.</article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700">Charging and power-management symptoms that may involve connectors, batteries or board components.</article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-700">Liquid-related or impact-related faults where component-level repair may be considered after inspection.</article>
      </div>
    </section>

    <section className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-14" aria-label="Motherboard assessment boundaries">
      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><AlertTriangle className="mb-4 text-blue-600" size={25} aria-hidden="true" /><h2 className="text-xl font-black text-slate-950">Turnaround is confirmed after diagnosis</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">Motherboard and logic board repairs may require specialist board-level work and are not typically completed the same day. Expected turnaround is confirmed after diagnosis.</p></article>
      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><Cpu className="mb-4 text-blue-600" size={25} aria-hidden="true" /><h2 className="text-xl font-black text-slate-950">Repair suitability and data</h2><p className="mt-3 text-sm font-semibold leading-6 text-slate-700">Microsoldering or component-level work is considered only where suitable. Board faults can affect data access, and outcomes depend on the device condition and confirmed fault.</p><Link href="/repairs/water-damage" className="mt-4 inline-flex font-bold text-blue-700 hover:underline">Water damage assessment</Link></article>
    </section>
  </main>;
}
