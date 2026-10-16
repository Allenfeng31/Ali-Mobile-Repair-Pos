export const IPHONE_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-16",
  status: "owner-reviewed",
  rows: [
    { service: "Screen Replacement", range: "AUD $50–$540" },
    { service: "Battery Replacement", range: "AUD $45–$250" },
    { service: "Charging Port Repair", range: "AUD $50–$220" },
  ],
  qualification:
    "Indicative AUD prices. Actual pricing depends on your iPhone model and available repair options. Select your model for the applicable price or Quote on Request.",
} as const;

export function getIphoneBrandHubPricingFaqAnswer() {
  const ranges = IPHONE_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${IPHONE_BRAND_HUB_PRICING_REFERENCE.qualification}`;
}
