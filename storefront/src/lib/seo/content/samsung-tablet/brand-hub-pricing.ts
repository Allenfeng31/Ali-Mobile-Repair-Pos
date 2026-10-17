export const SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-17",
  status: "owner-reviewed",
  rows: [
    { service: "Galaxy Tab A Screen Replacement", range: "$139–$220" },
    { service: "Galaxy Tab S Screen Replacement", range: "$180–$450" },
    { service: "Battery Replacement", range: "$90–$179" },
    { service: "Charging Port Repair", range: "$89–$150" },
  ],
  qualification:
    "Indicative AUD prices for applicable Galaxy Tab A and Galaxy Tab S models. Galaxy Tab Active and other Samsung tablets may need a model-specific price or Quote on Request.",
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
  const [tabA, tabS, battery, charging] = SAMSUNG_TABLET_BRAND_HUB_PRICING_REFERENCE.rows;

  return `Samsung tablet repair in Ringwood. Galaxy Tab A screens ${tabA.range}; Tab S screens ${tabS.range}; battery ${battery.range}; charging ${charging.range} (indicative). Open ${openingHours}.`;
}
