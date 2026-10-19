import { getLenovoTabletModelConfig } from './lenovo-tablet/config';
import { getSamsungTabletIndicativePriceGuidance } from './samsung-tablet/pricing';

type StandardTabletRepairType =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement'
  | 'front-camera-replacement'
  | 'back-camera-replacement';

interface PriceBounds {
  minimum: number;
  maximum: number;
}

export interface TabletTypicalPriceGuidance {
  label: 'Typical Repair Range';
  amountLabel: string;
  explanation: string;
  faqQuestion: string;
  faqAnswer: string;
}

const REPAIR_LABELS: Record<StandardTabletRepairType, string> = {
  'screen-replacement': 'screen replacement',
  'battery-replacement': 'battery replacement',
  'charging-port-replacement': 'charging port replacement',
  'front-camera-replacement': 'front camera replacement',
  'back-camera-replacement': 'back camera replacement',
};

const LENOVO_TABLET_RANGES: Record<StandardTabletRepairType, PriceBounds> = {
  'screen-replacement': { minimum: 100, maximum: 250 },
  'battery-replacement': { minimum: 80, maximum: 150 },
  'charging-port-replacement': { minimum: 80, maximum: 150 },
  'front-camera-replacement': { minimum: 70, maximum: 150 },
  'back-camera-replacement': { minimum: 70, maximum: 150 },
};

function isStandardTabletRepairType(repairSlug: string): repairSlug is StandardTabletRepairType {
  return repairSlug in REPAIR_LABELS;
}

function buildGuidance({
  subject,
  repairType,
  range,
  extraContext,
}: {
  subject: string;
  repairType: StandardTabletRepairType;
  range: PriceBounds;
  extraContext?: string;
}): TabletTypicalPriceGuidance {
  const repairLabel = REPAIR_LABELS[repairType];
  const amountLabel = `AUD $${range.minimum}–$${range.maximum}`;
  const explanation = 'Exact pricing depends on the exact model, required part, part availability, device condition, and repair requirements.';

  return {
    label: 'Typical Repair Range',
    amountLabel,
    explanation,
    faqQuestion: `How much does a ${subject} ${repairLabel} cost?`,
    faqAnswer: `${subject} ${repairLabel} typically falls around ${amountLabel}, depending on the exact model, required part, part availability, device condition, and repair requirements.${extraContext ? ` ${extraContext}` : ''} If a current model-specific price is published, that exact price takes priority.`,
  };
}

export function getSamsungTabletTypicalPriceGuidance(
  modelSlug: string,
  repairSlug: string,
): TabletTypicalPriceGuidance | null {
  if (!isStandardTabletRepairType(repairSlug)) {
    return null;
  }
  const guidance = getSamsungTabletIndicativePriceGuidance(modelSlug, repairSlug);
  if (!guidance) return null;

  return buildGuidance({
    subject: guidance.familyLabel,
    repairType: repairSlug,
    range: { minimum: guidance.minimum, maximum: guidance.maximum },
    extraContext: guidance.family === 'galaxy-tab-s' && repairSlug === 'screen-replacement'
      ? 'Premium Tab S display assemblies can cost substantially more than Tab A parts.'
      : undefined,
  });
}

export function getLenovoTabletTypicalPriceGuidance(
  modelSlug: string,
  repairSlug: string,
): TabletTypicalPriceGuidance | null {
  const config = getLenovoTabletModelConfig(modelSlug);
  if (
    !config ||
    !isStandardTabletRepairType(repairSlug) ||
    !config.supportedRepairTypes.includes(repairSlug)
  ) {
    return null;
  }

  return buildGuidance({
    subject: 'Lenovo tablet',
    repairType: repairSlug,
    range: LENOVO_TABLET_RANGES[repairSlug],
  });
}
