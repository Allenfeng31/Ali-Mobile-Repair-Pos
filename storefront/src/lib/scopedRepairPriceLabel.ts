const STARTING_PRICE_REPAIR_SLUGS = new Set([
  'camera-lens-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
]);

export const DIAGNOSTIC_PRICE_LABEL = 'Inspection required';

function formatAmount(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

export function isStartingPriceRepair(repairSlug: string) {
  return STARTING_PRICE_REPAIR_SLUGS.has(repairSlug);
}

export function formatScopedRepairPriceLabel(
  repairSlug: string,
  price: number | null | undefined,
  unscopedLabel: string,
  sourceType?: 'real' | 'virtual' | 'diagnostic'
) {
  if (sourceType === 'diagnostic') return DIAGNOSTIC_PRICE_LABEL;
  if (sourceType === 'real' || !isStartingPriceRepair(repairSlug)) return unscopedLabel;

  return typeof price === 'number' && Number.isFinite(price) && price > 0
    ? `Starting from $${formatAmount(price)}`
    : 'Starting from';
}
