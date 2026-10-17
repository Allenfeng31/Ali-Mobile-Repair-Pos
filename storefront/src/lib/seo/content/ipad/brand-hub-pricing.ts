export const IPAD_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-17",
  status: "owner-reviewed",
  rows: [
    { service: "Screen Replacement", range: "$99–$420" },
    { service: "Battery Replacement", range: "$100–$190" },
    { service: "Charging Port Repair", range: "$120–$179" },
  ],
  qualification:
    "Indicative AUD prices for applicable models. Select your exact iPad model for available pricing or a quote.",
} as const;

export const IPAD_BRAND_HUB_TIMING_REFERENCE = {
  title: "iPad Repair Time",
  primaryValue: "Around 1 Hour",
  qualification:
    "Many standard repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.",
} as const;

export function getIPadBrandHubPricingFaqAnswer() {
  const ranges = IPAD_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${IPAD_BRAND_HUB_PRICING_REFERENCE.qualification}`;
}

export function getIPadBrandHubMetadataDescription(openingHours: string) {
  const [screen, battery, charging] = IPAD_BRAND_HUB_PRICING_REFERENCE.rows;

  return `iPad repair in Ringwood. Screen ${screen.range}, battery ${battery.range}, charging ${charging.range} (indicative). Around 1 hour for many repairs. Open ${openingHours}.`;
}
