import { getSamsungTabletBrandHubPricingRows } from './pricing';

export const SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-19",
  status: "owner-reviewed",
  rows: getSamsungTabletBrandHubPricingRows(),
  qualification:
    "Prices are a guide and depend on your model. Choose your tablet to check pricing or request a quote.",
} as const;

export const SAMSUNG_TABLET_BRAND_HUB_TIMING_REFERENCE = {
  title: "Samsung Tablet Repair Time",
  primaryValue: "Around 1 Hour",
  qualification:
    "Many standard Samsung Tablet repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.",
} as const;

export function getSamsungTabletBrandHubPricingFaqAnswer() {
  const ranges = SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE.qualification}`;
}

export function getSamsungTabletBrandHubMetadataDescription(openingHours: string) {
  const tabAScreen = SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE.rows.find((row) => row.service === 'Galaxy Tab A Screen Replacement');
  const tabSScreen = SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE.rows.find((row) => row.service === 'Galaxy Tab S Screen Replacement');

  return `Samsung tablet repair in Ringwood. Galaxy Tab A screens ${tabAScreen?.range}; Tab S screens ${tabSScreen?.range} (indicative). Select your model for applicable pricing or a quote. Open ${openingHours}.`;
}
