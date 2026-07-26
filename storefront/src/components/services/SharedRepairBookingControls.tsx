'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import {
  getSharedRepairBookingHref,
  getValidatedSharedRepairModel,
  type SharedRepairModelOption,
} from '@/lib/sharedRepairBooking';

interface SharedRepairBookingControlsProps {
  basePath: string;
  brandSlug?: string;
  fallbackBookingBrand?: string;
  models: SharedRepairModelOption[];
  repairName: string;
  showModelControls?: boolean;
}

export default function SharedRepairBookingControls({
  basePath,
  brandSlug,
  fallbackBookingBrand,
  models,
  repairName,
  showModelControls = false,
}: SharedRepairBookingControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedModel = getValidatedSharedRepairModel(models, searchParams.get('model'), brandSlug);
  const bookingHref = getSharedRepairBookingHref({
    repairName,
    selectedModel,
    fallbackBrandName: fallbackBookingBrand,
  });

  const updateModel = (modelSlug: string) => {
    if (!modelSlug) {
      router.replace(basePath, { scroll: false });
      return;
    }

    router.replace(`${basePath}?model=${encodeURIComponent(modelSlug)}`, { scroll: false });
  };

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      {showModelControls ? (
        <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
          {selectedModel ? (
            <p className="text-sm font-bold text-slate-800">
              Selected model: {selectedModel.brand} {selectedModel.model}
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-700">
              Choose your {fallbackBookingBrand ?? 'phone'} model to prepare a more accurate enquiry.
            </p>
          )}
          <label className="sr-only" htmlFor={`shared-repair-model-${repairName}`}>Choose your {fallbackBookingBrand ?? 'phone'} model</label>
          <select
            id={`shared-repair-model-${repairName}`}
            className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
            value={selectedModel?.modelSlug ?? ''}
            onChange={(event) => updateModel(event.target.value)}
          >
            <option value="">Choose a {fallbackBookingBrand ?? 'phone'} model</option>
            {models.map((model) => (
              <option key={model.modelSlug} value={model.modelSlug}>{model.model}</option>
            ))}
          </select>
        </div>
      ) : null}
      <Link
        href={bookingHref}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-center text-lg font-bold !text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Book Repair Now
        <ArrowRight size={20} strokeWidth={2.6} aria-hidden="true" />
      </Link>
    </div>
  );
}
