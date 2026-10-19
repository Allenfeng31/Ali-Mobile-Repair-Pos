import { getSamsungTabletModelConfig } from './config';
import type { SamsungTabletFamily } from './types';

export const SAMSUNG_TABLET_STANDARD_REPAIR_TYPES = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
] as const;

export type SamsungTabletStandardRepairType = typeof SAMSUNG_TABLET_STANDARD_REPAIR_TYPES[number];

type PriceBounds = {
  minimum: number;
  maximum: number;
};

type PricingRepairOption = {
  slug: string;
  name: string;
  price: number;
  repairOrigin?: string;
  variants?: readonly {
    quality_grade: string;
    price: number;
    is_recommended?: boolean;
  }[];
};

const REPAIR_LABELS: Record<SamsungTabletStandardRepairType, string> = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Repair',
  'front-camera-replacement': 'Front Camera',
  'back-camera-replacement': 'Back Camera',
};

export const SAMSUNG_TABLET_INDICATIVE_PRICE_RANGES: Record<SamsungTabletFamily, Record<SamsungTabletStandardRepairType, PriceBounds>> = {
  'galaxy-tab-a': {
    'screen-replacement': { minimum: 139, maximum: 220 },
    'battery-replacement': { minimum: 90, maximum: 179 },
    'charging-port-replacement': { minimum: 85, maximum: 150 },
    'front-camera-replacement': { minimum: 99, maximum: 130 },
    'back-camera-replacement': { minimum: 99, maximum: 130 },
  },
  'galaxy-tab-s': {
    'screen-replacement': { minimum: 180, maximum: 550 },
    'battery-replacement': { minimum: 90, maximum: 220 },
    'charging-port-replacement': { minimum: 90, maximum: 150 },
    'front-camera-replacement': { minimum: 109, maximum: 130 },
    'back-camera-replacement': { minimum: 109, maximum: 130 },
  },
};

export type SamsungTabletIndicativePriceGuidance = {
  family: SamsungTabletFamily;
  familyLabel: 'Galaxy Tab A' | 'Galaxy Tab S';
  repairSlug: SamsungTabletStandardRepairType;
  service: string;
  minimum: number;
  maximum: number;
  amountLabel: string;
};

function isStandardRepairType(repairSlug: string): repairSlug is SamsungTabletStandardRepairType {
  return (SAMSUNG_TABLET_STANDARD_REPAIR_TYPES as readonly string[]).includes(repairSlug);
}

function positivePrice(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

export function getSamsungTabletIndicativePriceGuidance(
  modelSlug: string,
  repairSlug: string,
): SamsungTabletIndicativePriceGuidance | null {
  const config = getSamsungTabletModelConfig(modelSlug);
  if (!config || !isStandardRepairType(repairSlug)) return null;

  const range = SAMSUNG_TABLET_INDICATIVE_PRICE_RANGES[config.family][repairSlug];
  return {
    family: config.family,
    familyLabel: config.familyLabel,
    repairSlug,
    service: REPAIR_LABELS[repairSlug],
    minimum: range.minimum,
    maximum: range.maximum,
    amountLabel: `AUD $${range.minimum}–$${range.maximum}`,
  };
}

export function getSamsungTabletBrandHubPricingRows() {
  return (['galaxy-tab-a', 'galaxy-tab-s'] as const).flatMap((family) =>
    (['screen-replacement', 'battery-replacement'] as const).map((repairSlug) => {
      const range = SAMSUNG_TABLET_INDICATIVE_PRICE_RANGES[family][repairSlug];
      const familyLabel = family === 'galaxy-tab-a' ? 'Galaxy Tab A' : 'Galaxy Tab S';
      return {
        service: `${familyLabel} ${REPAIR_LABELS[repairSlug]}`,
        range: `$${range.minimum}–$${range.maximum}`,
      };
    }),
  );
}

function eligiblePublishedPosPrice(repair: PricingRepairOption): number | null {
  if (repair.repairOrigin !== 'pos') return null;

  const variantPrices = (repair.variants ?? [])
    .map((variant) => positivePrice(variant.price))
    .filter((price): price is number => price !== null);

  return variantPrices.length > 0
    ? Math.min(...variantPrices)
    : positivePrice(repair.price);
}

export type SamsungTabletModelHubPricing =
  | { kind: 'published'; price: number; repairName: string }
  | { kind: 'indicative'; rows: ReadonlyArray<{ service: 'Screen Replacement' | 'Battery Replacement'; range: string }> }
  | { kind: 'quote' };

export type SamsungTabletRepairOptionPricing =
  | { kind: 'published'; label: string; price: number }
  | { kind: 'indicative'; label: string; range: string }
  | { kind: 'quote'; label: 'Quote on Request' };

export function resolveSamsungTabletModelHubPricing({
  modelSlug,
  repairTypes,
}: {
  modelSlug: string;
  repairTypes: readonly PricingRepairOption[];
}): SamsungTabletModelHubPricing {
  const eligible = repairTypes.flatMap((repair) => {
    const price = eligiblePublishedPosPrice(repair);
    return price === null ? [] : [{ price, repairName: repair.name }];
  });

  if (eligible.length > 0) {
    const lowest = eligible.reduce((currentLowest, current) => current.price < currentLowest.price ? current : currentLowest);
    return { kind: 'published', ...lowest };
  }

  const screen = getSamsungTabletIndicativePriceGuidance(modelSlug, 'screen-replacement');
  const battery = getSamsungTabletIndicativePriceGuidance(modelSlug, 'battery-replacement');
  if (screen && battery) {
    return {
      kind: 'indicative',
      rows: [
        { service: 'Screen Replacement', range: screen.amountLabel },
        { service: 'Battery Replacement', range: battery.amountLabel },
      ],
    };
  }

  return { kind: 'quote' };
}

export function resolveSamsungTabletRepairOptionPricing({
  modelSlug,
  repair,
}: {
  modelSlug: string;
  repair: PricingRepairOption;
}): SamsungTabletRepairOptionPricing {
  const publishedPrice = eligiblePublishedPosPrice(repair);
  if (publishedPrice !== null) {
    return { kind: 'published', price: publishedPrice, label: `From $${publishedPrice}` };
  }

  const guidance = getSamsungTabletIndicativePriceGuidance(modelSlug, repair.slug);
  if (guidance) {
    return {
      kind: 'indicative',
      range: guidance.amountLabel,
      label: `Indicative ${guidance.amountLabel} · Quote on Request`,
    };
  }

  return { kind: 'quote', label: 'Quote on Request' };
}
