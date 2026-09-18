'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Clock3, PackageCheck, PhoneCall, ShieldCheck } from 'lucide-react';
import { getSharedRepairCandidateModelLabel, getSharedRepairCandidatePriceLabel, type SharedRepairPageCandidate, type SharedRepairPageSupportedModel } from '@/lib/sharedRepairPageV2';
import { getSharedRepairBookingHref, getValidatedSharedRepairModel } from '@/lib/sharedRepairBooking';

export type SharedRepairPageV2QuickAnswers = Readonly<{
  repairTime: string;
  partsSameDay: string;
  warranty: string;
}>;

interface SharedRepairPageV2BookingControlsProps {
  basePath: string;
  brandSlug: string;
  brandName: string;
  repairName: string;
  supportedModels: SharedRepairPageSupportedModel[];
  priceCandidates: SharedRepairPageCandidate[];
  quickAnswers: SharedRepairPageV2QuickAnswers;
}

export default function SharedRepairPageV2BookingControls({
  basePath,
  brandSlug,
  brandName,
  repairName,
  supportedModels,
  priceCandidates,
  quickAnswers,
}: SharedRepairPageV2BookingControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedModel = getValidatedSharedRepairModel(supportedModels, searchParams.get('model'), brandSlug);
  const selectedCandidate = priceCandidates.find((candidate) => candidate.modelSlug === selectedModel?.modelSlug) ?? null;
  const bookingHref = getSharedRepairBookingHref({
    repairName,
    selectedModel,
    fallbackBrandName: brandName,
  });

  const updateModel = (modelSlug: string) => {
    router.replace(modelSlug ? `${basePath}?model=${encodeURIComponent(modelSlug)}` : basePath, { scroll: false });
  };

  return (
    <div className="mt-8 w-full">
      <div className="!mx-auto flex w-full max-w-md flex-col items-center">
        <div className="w-full rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center shadow-sm shadow-blue-950/5 sm:p-6">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Price</span>
          <p className="mt-2 text-3xl font-black leading-tight text-blue-700">
            {selectedCandidate ? getSharedRepairCandidatePriceLabel(selectedCandidate) : selectedModel ? 'Quote on Request' : 'Select your model for exact pricing'}
          </p>
          {selectedCandidate ? <p className="mt-3 text-sm font-semibold text-slate-600">{getSharedRepairCandidateModelLabel(selectedCandidate)}</p> : null}
        </div>

        <div className="mt-5 flex w-full max-w-sm flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
            <label className="text-sm font-bold text-slate-800" htmlFor={`shared-page-v2-model-${repairName}`}>Choose your {brandName} model</label>
            <select
              id={`shared-page-v2-model-${repairName}`}
              className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
              value={selectedModel?.modelSlug ?? ''}
              onChange={(event) => updateModel(event.target.value)}
            >
              <option value="">Choose a model</option>
              {supportedModels.map((model) => <option key={model.modelSlug} value={model.modelSlug}>{model.model}</option>)}
            </select>
          </div>
          <Link href={bookingHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold !text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            Book Repair Now <ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <section className="mx-auto mt-6 grid w-full max-w-4xl gap-4 md:grid-cols-3" aria-label="Repair information">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5">
          <Clock3 className="mx-auto text-blue-600" size={22} aria-hidden="true" />
          <h2 className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-slate-600">Repair Time</h2>
          <p className="mt-2 text-xl font-black text-slate-950">{quickAnswers.repairTime}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5">
          <PackageCheck className="mx-auto text-blue-600" size={22} aria-hidden="true" />
          <h2 className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-slate-600">Parts / Same-Day</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{quickAnswers.partsSameDay}</p>
          <a href="tel:0481058514" className="mt-3 inline-flex items-center gap-2 font-black text-blue-700 hover:underline"><PhoneCall size={16} aria-hidden="true" />0481 058 514</a>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm shadow-blue-950/5">
          <ShieldCheck className="mx-auto text-blue-600" size={22} aria-hidden="true" />
          <h2 className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-slate-600">Warranty</h2>
          <p className="mt-2 text-xl font-black text-slate-950">{quickAnswers.warranty}</p>
        </article>
      </section>
    </div>
  );
}
