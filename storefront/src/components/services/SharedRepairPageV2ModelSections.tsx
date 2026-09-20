import Link from 'next/link';
import { getSharedRepairCandidateModelLabel, getSharedRepairCandidatePriceLabel, type SharedRepairPageCandidate, type SharedRepairPageSupportedModel, type SharedRepairPageV2PricingStrategy } from '@/lib/sharedRepairPageV2';
import { getSharedRepairBookingHref } from '@/lib/sharedRepairBooking';
import styles from '@/components/repair-type-hubs/RepairTypeHub.module.css';

export default function SharedRepairPageV2ModelSections({
  supportedModels,
  priceCandidates,
  repairName,
  pricingStrategy,
}: {
  supportedModels: SharedRepairPageSupportedModel[];
  priceCandidates: SharedRepairPageCandidate[];
  repairName: string;
  pricingStrategy?: SharedRepairPageV2PricingStrategy;
}) {
  if (supportedModels.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-labelledby="shared-repair-models-heading">
      <div className="repair-workbench-heading">
        <span>Supported models</span>
        <h2 id="shared-repair-models-heading" className="scroll-mt-32">Google Pixel {repairName} by Model</h2>
        <p>Choose your model for its current repair option and booking details.</p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {supportedModels.map((model) => {
          const priceCandidate = priceCandidates.find((candidate) => candidate.modelSlug === model.modelSlug) ?? null;
          const bookingHref = getSharedRepairBookingHref({ repairName, selectedModel: model });
          const modelLabel = getSharedRepairCandidateModelLabel(model);
          const priceLabel = pricingStrategy?.mode === 'fixed'
            ? `$${pricingStrategy.fixedPrice}`
            : priceCandidate
              ? getSharedRepairCandidatePriceLabel(priceCandidate)
              : null;
          return (
            <article id={model.modelSlug} key={model.modelSlug} className={`scroll-mt-28 ${styles.brandAccordionItem}`}>
              <Link href={bookingHref} prefetch={false} className={styles.brandToggle}>
                <div className={styles.brandToggleCopy}>
                  <h3 className={styles.brandHeading}>{modelLabel}</h3>
                  <p className={styles.brandCount}>{repairName}</p>
                </div>
                {priceLabel ? <span className={styles.modelCardArrow}>{priceLabel}</span> : null}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
