import SharedRepairHierarchyPresentation from './SharedRepairHierarchyPresentation';
import {
  buildSharedRepairHierarchy,
  type SharedRepairHierarchyModel,
} from '@/lib/sharedRepairHierarchy';

interface SharedRepairHierarchySectionsProps {
  models: readonly SharedRepairHierarchyModel[];
  selectedBrandSlug?: string | null;
  selectedModelSlug?: string | null;
  ariaLabel?: string;
  showModelsImmediately?: boolean;
}

export default function SharedRepairHierarchySections({
  models,
  selectedBrandSlug,
  selectedModelSlug,
  ariaLabel = 'Supported repair models',
  showModelsImmediately = false,
}: SharedRepairHierarchySectionsProps) {
  if (models.length === 0) return null;

  const hierarchy = buildSharedRepairHierarchy(models, { selectedBrandSlug, selectedModelSlug });
  const isBrandOnly = showModelsImmediately && hierarchy.brands.length === 1;

  return (
    <section id="shared-repair-model-selection" className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-label={isBrandOnly ? undefined : ariaLabel} aria-labelledby={isBrandOnly ? 'shared-repair-models-heading' : undefined}>
      {isBrandOnly ? <div className="repair-workbench-heading">
        <span>Supported models</span>
        <h2 id="shared-repair-models-heading" className="scroll-mt-32">{hierarchy.brands[0].brandLabel} {models[0].repairLabel} by Model</h2>
        <p>Choose your model for its current repair option and booking details.</p>
      </div> : null}
      <SharedRepairHierarchyPresentation hierarchy={hierarchy} showModelsImmediately={isBrandOnly} />
    </section>
  );
}
