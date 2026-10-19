import { getLenovoTabletModelConfig } from './config';
import { LENOVO_TABLET_BRAND_HUB_PRICING_REFERENCE } from './brand-hub-pricing';

const APPROVED_REPAIR_SERVICES = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Repair',
} as const;

type ApprovedRepairSlug = keyof typeof APPROVED_REPAIR_SERVICES;

type PricingRepairOption = {
  slug: string;
  name: string;
  price: unknown;
  repairOrigin?: string;
  variants?: readonly {
    quality_grade: string;
    price: unknown;
    is_recommended?: boolean;
  }[];
};

function positivePrice(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function isApprovedRepairSlug(repairSlug: string): repairSlug is ApprovedRepairSlug {
  return repairSlug in APPROVED_REPAIR_SERVICES;
}

function approvedRangeFor(repairSlug: ApprovedRepairSlug): string | null {
  const service = APPROVED_REPAIR_SERVICES[repairSlug];
  return LENOVO_TABLET_BRAND_HUB_PRICING_REFERENCE.rows.find((row) => row.service === service)?.range ?? null;
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

export type LenovoTabletIndicativePriceGuidance = {
  repairSlug: ApprovedRepairSlug;
  service: typeof APPROVED_REPAIR_SERVICES[ApprovedRepairSlug];
  range: string;
  amountLabel: string;
};

export function getLenovoTabletIndicativePriceGuidance(
  modelSlug: string,
  repairSlug: string,
): LenovoTabletIndicativePriceGuidance | null {
  const config = getLenovoTabletModelConfig(modelSlug);
  if (!config || !isApprovedRepairSlug(repairSlug) || !config.supportedRepairTypes.includes(repairSlug)) {
    return null;
  }

  const range = approvedRangeFor(repairSlug);
  if (!range) return null;

  return {
    repairSlug,
    service: APPROVED_REPAIR_SERVICES[repairSlug],
    range,
    amountLabel: `AUD ${range}`,
  };
}

export type LenovoTabletModelHubPricing =
  | { kind: 'published'; price: number; repairName: string }
  | { kind: 'indicative'; rows: ReadonlyArray<{ service: 'Screen Replacement' | 'Battery Replacement'; range: string }> }
  | { kind: 'quote' };

export type LenovoTabletRepairOptionPricing =
  | { kind: 'published'; label: string; price: number }
  | { kind: 'indicative'; label: string; range: string }
  | { kind: 'quote'; label: 'Quote on Request' };

export function resolveLenovoTabletModelHubPricing({
  modelSlug,
  repairTypes,
}: {
  modelSlug: string;
  repairTypes: readonly PricingRepairOption[];
}): LenovoTabletModelHubPricing {
  const eligible = repairTypes.flatMap((repair) => {
    const price = eligiblePublishedPosPrice(repair);
    return price === null ? [] : [{ price, repairName: repair.name }];
  });

  if (eligible.length > 0) {
    const lowest = eligible.reduce((currentLowest, current) => current.price < currentLowest.price ? current : currentLowest);
    return { kind: 'published', ...lowest };
  }

  const screen = getLenovoTabletIndicativePriceGuidance(modelSlug, 'screen-replacement');
  const battery = getLenovoTabletIndicativePriceGuidance(modelSlug, 'battery-replacement');
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

export function resolveLenovoTabletRepairOptionPricing({
  modelSlug,
  repair,
}: {
  modelSlug: string;
  repair: PricingRepairOption;
}): LenovoTabletRepairOptionPricing {
  const publishedPrice = eligiblePublishedPosPrice(repair);
  if (publishedPrice !== null) {
    return { kind: 'published', price: publishedPrice, label: `From $${publishedPrice}` };
  }

  const guidance = getLenovoTabletIndicativePriceGuidance(modelSlug, repair.slug);
  if (guidance) {
    return {
      kind: 'indicative',
      range: guidance.amountLabel,
      label: `Indicative ${guidance.amountLabel} · Quote on Request`,
    };
  }

  return { kind: 'quote', label: 'Quote on Request' };
}
