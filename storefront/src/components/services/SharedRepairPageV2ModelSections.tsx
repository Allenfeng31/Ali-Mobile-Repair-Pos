import Link from 'next/link';
import { getSharedRepairCandidateModelLabel, getSharedRepairCandidatePriceLabel, type SharedRepairPageCandidate, type SharedRepairPageSupportedModel } from '@/lib/sharedRepairPageV2';
import { getSharedRepairBookingHref } from '@/lib/sharedRepairBooking';

export default function SharedRepairPageV2ModelSections({
  supportedModels,
  priceCandidates,
  repairName,
}: {
  supportedModels: SharedRepairPageSupportedModel[];
  priceCandidates: SharedRepairPageCandidate[];
  repairName: string;
}) {
  if (supportedModels.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="shared-repair-models-heading">
      <div className="repair-workbench-heading">
        <span>Supported models</span>
        <h2 id="shared-repair-models-heading" className="scroll-mt-32">Google Pixel {repairName} by Model</h2>
        <p>Choose your model for its current repair option and booking details.</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {supportedModels.map((model) => {
          const priceCandidate = priceCandidates.find((candidate) => candidate.modelSlug === model.modelSlug) ?? null;
          const bookingHref = getSharedRepairBookingHref({ repairName, selectedModel: model });
          const modelLabel = getSharedRepairCandidateModelLabel(model);
          const normalizedRepairName = repairName.toLocaleLowerCase();
          const repairDescription = `${normalizedRepairName.charAt(0).toLocaleUpperCase()}${normalizedRepairName.slice(1)} for ${modelLabel}.`;
          return (
            <article id={model.modelSlug} key={model.modelSlug} className="scroll-mt-28 flex flex-col items-center text-center rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-blue-950/5">
              <h3 className="text-xl font-black text-slate-950">{modelLabel}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">{repairDescription}</p>
              <p className="mt-4 text-2xl font-black text-blue-700">{priceCandidate ? getSharedRepairCandidatePriceLabel(priceCandidate) : 'Quote on Request'}</p>
              <p className="mt-2 text-sm font-medium text-slate-600">Call to confirm parts availability.</p>
              <Link href={bookingHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-extrabold !text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Book Repair</Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
