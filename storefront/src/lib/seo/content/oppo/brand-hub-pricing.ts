export const OPPO_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-17",
  status: "owner-reviewed",
  rows: [
    { service: "Screen Replacement", range: "$129–$320" },
    { service: "Battery Replacement", range: "$79–$149" },
    { service: "Charging Port Repair", range: "$70–$149" },
  ],
  qualification:
    "Indicative AUD prices for applicable models. Select your exact OPPO model for available pricing or a quote.",
} as const;

export const OPPO_BRAND_HUB_TIMING_REFERENCE = {
  title: "OPPO Repair Time",
  primaryValue: "30–45 Minutes",
  qualification:
    "Many standard repairs take 30–45 minutes. Timing depends on the repair type, diagnosis and parts availability.",
} as const;

export function getOppoBrandHubPricingFaqAnswer() {
  const ranges = OPPO_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${OPPO_BRAND_HUB_PRICING_REFERENCE.qualification}`;
}

export function getOppoBrandHubMetadataDescription(openingHours: string) {
  const [screen, battery, charging] = OPPO_BRAND_HUB_PRICING_REFERENCE.rows;

  return `OPPO phone repair in Ringwood. Screen ${screen.range}, battery ${battery.range}, charging ${charging.range} (indicative). Repairs often take 30–45 min. Open ${openingHours}.`;
}
