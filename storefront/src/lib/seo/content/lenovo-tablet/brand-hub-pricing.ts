export const LENOVO_TABLET_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-17",
  status: "owner-reviewed",
  rows: [
    { service: "Screen Replacement", range: "$120–$240" },
    { service: "Battery Replacement", range: "$89–$149" },
    { service: "Charging Port Repair", range: "$79–$150" },
  ],
  qualification:
    "Indicative AUD prices for applicable Lenovo tablet models. Select your exact Lenovo tablet model for available pricing or a quote.",
} as const;

export const LENOVO_TABLET_BRAND_HUB_TIMING_REFERENCE = {
  title: "Lenovo Tablet Repair Time",
  primaryValue: "Around 1 Hour",
  qualification:
    "Many standard Lenovo tablet repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.",
} as const;

export function getLenovoTabletBrandHubPricingFaqAnswer() {
  const ranges = LENOVO_TABLET_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${LENOVO_TABLET_BRAND_HUB_PRICING_REFERENCE.qualification}`;
}

export function getLenovoTabletBrandHubMetadataDescription(openingHours: string) {
  const [screen, battery, charging] = LENOVO_TABLET_BRAND_HUB_PRICING_REFERENCE.rows;

  return `Lenovo tablet repair in Ringwood. Screen ${screen.range}, battery ${battery.range}, charging ${charging.range} (indicative). Open ${openingHours}.`;
}
