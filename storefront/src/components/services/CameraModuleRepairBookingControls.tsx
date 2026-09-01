'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import {
  resolveSharedRepairContext,
  type SharedRepairModelCandidate,
} from '@/lib/sharedRepairContext';
import { getSharedRepairBookingHref } from '@/lib/sharedRepairBooking';

type CameraModuleRepairBookingControlsProps = Readonly<{
  basePath: string;
  repairSlug: string;
  bookingService: string;
  candidates: readonly SharedRepairModelCandidate[];
}>;

function queryValue(params: URLSearchParams, key: 'brand' | 'model' | 'service') {
  const values = params.getAll(key);
  return values.length === 0 ? undefined : values.length === 1 ? values[0] : values;
}

export default function CameraModuleRepairBookingControls({
  basePath,
  repairSlug,
  bookingService,
  candidates,
}: CameraModuleRepairBookingControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = resolveSharedRepairContext({
    route: { scope: 'global' },
    repairSlug,
    bookingService,
    query: {
      brand: queryValue(searchParams, 'brand'),
      model: queryValue(searchParams, 'model'),
      service: queryValue(searchParams, 'service'),
    },
    candidates,
  });
  const selectedModel = context.isValid && context.modelSlug && context.displayBrand && context.displayModel
    ? { brand: context.displayBrand, brandSlug: context.canonicalBrandSlug!, model: context.displayModel, modelSlug: context.modelSlug }
    : null;
  const bookingHref = getSharedRepairBookingHref({ repairName: bookingService, selectedModel });

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <label className="w-full text-left text-sm font-bold text-slate-800" htmlFor={`camera-module-model-${repairSlug}`}>
        Choose your phone model (optional)
        <select
          id={`camera-module-model-${repairSlug}`}
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          value={selectedModel ? `${selectedModel.brandSlug}/${selectedModel.modelSlug}` : ''}
          onChange={(event) => {
            const [brand, model] = event.target.value.split('/');
            router.replace(brand && model ? `${basePath}?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}` : basePath, { scroll: false });
          }}
        >
          <option value="">Choose a supported phone model</option>
          {candidates.map((candidate) => (
            <option key={`${candidate.canonicalBrandSlug}/${candidate.modelSlug}`} value={`${candidate.canonicalBrandSlug}/${candidate.modelSlug}`}>
              {candidate.displayBrand} {candidate.displayModel}
            </option>
          ))}
        </select>
      </label>
      <Link
        href={bookingHref}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-center font-bold !text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Request an assessment
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
