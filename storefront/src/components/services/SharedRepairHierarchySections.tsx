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
}

export default function SharedRepairHierarchySections({
  models,
  selectedBrandSlug,
  selectedModelSlug,
  ariaLabel = 'Supported repair models',
}: SharedRepairHierarchySectionsProps) {
  if (models.length === 0) return null;

  const hierarchy = buildSharedRepairHierarchy(models, { selectedBrandSlug, selectedModelSlug });

  return (
    <section id="shared-repair-model-selection" className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" aria-label={ariaLabel}>
      <SharedRepairHierarchyPresentation hierarchy={hierarchy} />
    </section>
  );
}
