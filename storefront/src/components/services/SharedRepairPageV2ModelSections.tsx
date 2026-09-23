import Link from 'next/link';
import { getSharedRepairCandidateModelLabel, getSharedRepairCandidatePriceLabel, type SharedRepairPageCandidate, type SharedRepairPageSupportedModel, type SharedRepairPageV2PricingStrategy } from '@/lib/sharedRepairPageV2';
import { getSharedRepairBookingHref } from '@/lib/sharedRepairBooking';
import SharedRepairPageV2ModelListPresentation from './SharedRepairPageV2ModelListPresentation';
import listStyles from './SharedRepairPageV2ModelListPresentation.module.css';
import hubStyles from '@/components/repair-type-hubs/RepairTypeHub.module.css';

const SERVER_SELECTED_DEVICE_REPAIRS = new Set([
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
]);

export default function SharedRepairPageV2ModelSections({
  supportedModels,
  priceCandidates,
  repairName,
  repairSlug,
  pricingStrategy,
  selectedModelSlug,
}: {
  supportedModels: SharedRepairPageSupportedModel[];
  priceCandidates: SharedRepairPageCandidate[];
  repairName: string;
  repairSlug?: string;
  pricingStrategy?: SharedRepairPageV2PricingStrategy;
  selectedModelSlug?: string | null;
}) {
  if (supportedModels.length === 0) return null;

  const regionId = `shared-repair-model-list-${repairName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const selectedModelIndex = supportedModels.findIndex((model) => model.modelSlug === selectedModelSlug);
  const initiallyExpanded = selectedModelIndex >= 5;

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="shared-repair-models-heading">
      <div className="repair-workbench-heading">
        <span>Supported models</span>
        <h2 id="shared-repair-models-heading" className="scroll-mt-32">Google Pixel {repairName} by Model</h2>
        <p>Choose your model for its current repair option and booking details.</p>
      </div>
      <SharedRepairPageV2ModelListPresentation
        key={selectedModelSlug ?? 'no-selected-model'}
        regionId={regionId}
        initiallyExpanded={initiallyExpanded}
        modelCount={supportedModels.length}
      >
        {supportedModels.map((model) => {
          const priceCandidate = priceCandidates.find((candidate) => candidate.modelSlug === model.modelSlug) ?? null;
          const bookingHref = repairSlug && SERVER_SELECTED_DEVICE_REPAIRS.has(repairSlug)
            ? `?model=${encodeURIComponent(model.modelSlug)}`
            : getSharedRepairBookingHref({ repairName, repairSlug, selectedModel: model });
          const modelLabel = getSharedRepairCandidateModelLabel(model);
          const priceLabel = pricingStrategy?.mode === 'fixed'
            ? `$${pricingStrategy.fixedPrice}`
            : priceCandidate && priceCandidate.pricing.resolvedPrice !== null
              ? getSharedRepairCandidatePriceLabel(priceCandidate)
              : null;
          return (
            <article id={model.modelSlug} key={model.modelSlug} data-shared-repair-model-card className={`scroll-mt-28 ${listStyles.modelCard} ${hubStyles.brandAccordionItem}`}>
              <Link href={bookingHref} prefetch={false} className={hubStyles.brandToggle}>
                <div className={hubStyles.brandToggleCopy}>
                  <h3 className={hubStyles.brandHeading}>{modelLabel}</h3>
                  <p className={hubStyles.brandCount}>{repairName}</p>
                </div>
                {priceLabel ? <span className={hubStyles.modelCardArrow}>{priceLabel}</span> : null}
              </Link>
            </article>
          );
        })}
      </SharedRepairPageV2ModelListPresentation>
    </section>
  );
}
