'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Camera, CheckCircle2, ClipboardCheck, PhoneCall, ShieldCheck } from 'lucide-react';
import SharedRepairHierarchySections from './SharedRepairHierarchySections';
import type { SharedRepairSelectedDeviceViewModel } from './SharedRepairSelectedDevice';
import type { SharedRepairHierarchyModel } from '@/lib/sharedRepairHierarchy';
import styles from './CameraModuleRepairLandingPage.module.css';

type CameraModuleRepairSelectionExperienceProps = Readonly<{
  title: string;
  description: string;
  eyebrow: string;
  bookingService: string;
  canonicalPath: string;
  hierarchy: Readonly<{
    models: readonly SharedRepairHierarchyModel[];
    selectedBrandSlug: string | null;
    selectedModelSlug: string | null;
    selectedDevice?: SharedRepairSelectedDeviceViewModel | null;
  }>;
}>;

const HERO_ID = 'camera-module-hero';
const MODEL_SELECTOR_REGION_ID = 'camera-module-model-selector-region';
const HERO_PRIMARY_ACTION_CLASS = 'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold !text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
const HERO_SECONDARY_ACTION_CLASS = 'inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-center text-lg font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

function scrollTo(element: Element | null) {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function getCameraModuleStartingPriceLabel(models: readonly SharedRepairHierarchyModel[]) {
  const trustedAmounts = models.flatMap((model) => {
    const match = model.priceLabel?.match(/^(?:From )?\$(\d+(?:\.\d{1,2})?)$/);
    if (!match) return [];

    const amount = Number(match[1]);
    return Number.isFinite(amount) && amount > 0 ? [amount] : [];
  });

  if (trustedAmounts.length === 0) return 'Quote on Request';

  const amount = Math.min(...trustedAmounts);
  return `Starting from $${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

function RepairTrustBadges() {
  return <div className="trust-badges mt-8">
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ClipboardCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Inspection Before Work</div>
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" /></span>Clear Quote First</div>
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><ShieldCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Repair Warranty</div>
    <div className="trust-badge"><span className="trust-badge-icon text-blue-600"><BadgeCheck size={20} strokeWidth={2.5} aria-hidden="true" /></span>Repair Desk</div>
  </div>;
}

export default function CameraModuleRepairSelectionExperience({
  title,
  description,
  eyebrow,
  bookingService,
  canonicalPath,
  hierarchy,
}: CameraModuleRepairSelectionExperienceProps) {
  const selectedDevice = hierarchy.selectedDevice ?? null;
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(!selectedDevice);
  const [isChangingModel, setIsChangingModel] = useState(false);
  const displayedSelectedDevice = isChangingModel ? null : selectedDevice;
  const selectedPriceLabel = displayedSelectedDevice
    ? hierarchy.models.find((model) => model.brandSlug === displayedSelectedDevice.selectedDevice.brandSlug && model.modelSlug === displayedSelectedDevice.selectedDevice.modelSlug)?.priceLabel ?? null
    : null;
  const selectorModels = hierarchy.models.map((model) => ({
    ...model,
    bookingHref: `${canonicalPath}?${new URLSearchParams({
      brand: model.brandSlug,
      model: model.modelSlug,
    }).toString()}`,
  }));

  useEffect(() => {
    if (selectedDevice) scrollTo(document.getElementById(HERO_ID));
  }, [selectedDevice]);

  function showModelSelector() {
    if (isModelSelectorOpen) {
      scrollTo(document.getElementById(MODEL_SELECTOR_REGION_ID));
      return;
    }

    setIsModelSelectorOpen(true);
    window.requestAnimationFrame(() => scrollTo(document.getElementById(MODEL_SELECTOR_REGION_ID)));
  }

  function changeModel() {
    setIsChangingModel(true);
    showModelSelector();
  }

  function selectModel(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element) || !event.target.closest('a')) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    setIsChangingModel(false);
    setIsModelSelectorOpen(false);
    scrollTo(document.getElementById(HERO_ID));
  }

  return <>
    <section id={HERO_ID} className="repair-hero repair-detail-hero relative scroll-mt-28" data-camera-module-hero aria-labelledby="camera-module-heading">
      <span className="repair-detail-icon text-blue-600"><Camera size={34} strokeWidth={2.4} aria-hidden="true" /></span>
      <div data-camera-module-hero-stack className="flex w-full flex-col items-center text-center">
        <span className="repair-kicker mx-auto mb-5"><Camera size={14} strokeWidth={2.6} aria-hidden="true" />{eyebrow}</span>
        <h1 id="camera-module-heading">{title}</h1>
        <p className="repair-detail-subtitle">{description}</p>

        <div data-camera-module-hero-price-card className="mx-auto mt-8 flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6 md:p-8">
          {displayedSelectedDevice ? <>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Selected device</span>
            <h2 className="mt-3 text-xl font-black leading-tight text-slate-950">{displayedSelectedDevice.selectedDevice.brand} {displayedSelectedDevice.selectedDevice.model}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">{displayedSelectedDevice.selectedRepair.name}</p>
            <p data-camera-module-hero-price className="mt-4 text-3xl font-extrabold text-blue-600">{selectedPriceLabel ?? 'Quote on Request'}</p>
          </> : <>
            <h2 className="text-xl font-black leading-tight text-slate-950">{bookingService}</h2>
            <p data-camera-module-hero-price className="mt-4 text-3xl font-extrabold text-blue-600">{getCameraModuleStartingPriceLabel(hierarchy.models)}</p>
          </>}
        </div>

        <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3">
          {displayedSelectedDevice?.booking.isAvailable ? <Link href={displayedSelectedDevice.booking.href} className={HERO_PRIMARY_ACTION_CLASS}>
            Book Repair Now <ArrowRight size={19} strokeWidth={2.6} aria-hidden="true" />
          </Link> : <button type="button" className={HERO_PRIMARY_ACTION_CLASS} aria-controls={MODEL_SELECTOR_REGION_ID} onClick={showModelSelector}>
            Select your model
          </button>}
          <a href="tel:0481058514" className={HERO_SECONDARY_ACTION_CLASS}><PhoneCall size={19} strokeWidth={2.6} aria-hidden="true" />Call 0481 058 514</a>
          {displayedSelectedDevice ? <button
            type="button"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-controls={MODEL_SELECTOR_REGION_ID}
            aria-expanded={isModelSelectorOpen}
            onClick={changeModel}
          >
            <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />Change model
          </button> : null}
        </div>
      </div>
      <RepairTrustBadges />
    </section>

    <div
      id={MODEL_SELECTOR_REGION_ID}
      data-camera-module-model-selector
      className={`${styles.modelSelector} relative z-10 scroll-mt-28`}
      hidden={!isModelSelectorOpen}
      onClick={selectModel}
    >
      <p data-camera-module-price-guide className="mx-auto mb-6 w-full max-w-3xl px-4 text-center text-sm font-semibold leading-6 text-slate-600 sm:px-6">Choose your supported model to view its current repair option. A model with one trusted price shows the exact $X amount, models with valid repair variants show “From $X”, and models without a trusted exact price show “Custom Quote” before work begins.</p>
      <SharedRepairHierarchySections models={selectorModels} selectedBrandSlug={hierarchy.selectedBrandSlug} selectedModelSlug={hierarchy.selectedModelSlug} ariaLabel={`Supported ${bookingService} models`} />
    </div>
    <noscript><style>{`#${MODEL_SELECTOR_REGION_ID}[hidden] { display: block !important; }`}</style></noscript>
  </>;
}
