import { getLenovoTabletIndicativePriceGuidance } from './lenovo-tablet/pricing';
import { getSamsungTabletIndicativePriceGuidance } from './samsung-tablet/pricing';

type StandardTabletRepairType =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement'
  | 'front-camera-replacement'
  | 'back-camera-replacement';

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

function isStandardTabletRepairType(repairSlug: string): repairSlug is StandardTabletRepairType {
  return repairSlug in REPAIR_LABELS;
}

function buildGuidance({
  subject,
  repairType,
  amountLabel,
  extraContext,
}: {
  subject: string;
  repairType: StandardTabletRepairType;
  amountLabel: string;
  extraContext?: string;
}): TabletTypicalPriceGuidance {
  const repairLabel = REPAIR_LABELS[repairType];
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
    amountLabel: guidance.amountLabel,
    extraContext: guidance.family === 'galaxy-tab-s' && repairSlug === 'screen-replacement'
      ? 'Premium Tab S display assemblies can cost substantially more than Tab A parts.'
      : undefined,
  });
}

export function getLenovoTabletTypicalPriceGuidance(
  modelSlug: string,
  repairSlug: string,
): TabletTypicalPriceGuidance | null {
  if (!isStandardTabletRepairType(repairSlug)) {
    return null;
  }
  const guidance = getLenovoTabletIndicativePriceGuidance(modelSlug, repairSlug);
  if (!guidance) return null;

  return buildGuidance({
    subject: 'Lenovo tablet',
    repairType: repairSlug,
    amountLabel: guidance.amountLabel,
  });
}
