import { getLenovoTabletModelConfig } from './lenovo-tablet/config';
import { getSamsungTabletModelConfig } from './samsung-tablet/config';

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

const SAMSUNG_TAB_A_RANGES: Record<StandardTabletRepairType, PriceBounds> = {
  'screen-replacement': { minimum: 150, maximum: 300 },
  'battery-replacement': { minimum: 110, maximum: 180 },
  'charging-port-replacement': { minimum: 85, maximum: 150 },
  'front-camera-replacement': { minimum: 99, maximum: 130 },
  'back-camera-replacement': { minimum: 99, maximum: 130 },
};

const SAMSUNG_TAB_S_RANGES: Record<StandardTabletRepairType, PriceBounds> = {
  'screen-replacement': { minimum: 250, maximum: 550 },
  'battery-replacement': { minimum: 110, maximum: 230 },
  'charging-port-replacement': { minimum: 95, maximum: 150 },
  'front-camera-replacement': { minimum: 109, maximum: 130 },
  'back-camera-replacement': { minimum: 109, maximum: 130 },
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
  const config = getSamsungTabletModelConfig(modelSlug);
  if (!config || !isStandardTabletRepairType(repairSlug)) {
    return null;
  }

  if (config.family === 'galaxy-tab-a') {
    return buildGuidance({
      subject: 'Galaxy Tab A',
      repairType: repairSlug,
      range: SAMSUNG_TAB_A_RANGES[repairSlug],
    });
  }

  if (config.family === 'galaxy-tab-s') {
    return buildGuidance({
      subject: 'Galaxy Tab S',
      repairType: repairSlug,
      range: SAMSUNG_TAB_S_RANGES[repairSlug],
      extraContext: repairSlug === 'screen-replacement'
        ? 'Premium Tab S display assemblies can cost substantially more than Tab A parts.'
        : undefined,
    });
  }

  return null;
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
