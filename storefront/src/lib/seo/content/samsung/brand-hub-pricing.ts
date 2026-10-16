export const SAMSUNG_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-16",
  status: "owner-reviewed",
  rows: [
    { service: "Screen Replacement", range: "AUD $129–$490" },
    { service: "Battery Replacement", range: "AUD $60–$120" },
    { service: "Charging Port Repair", range: "AUD $60–$120" },
  ],
  heroQualification:
    "Indicative AUD prices. Z Fold and Z Flip models excluded.",
  faqQualification:
    "Indicative AUD prices for supported non-foldable Galaxy models. Excludes Z Fold and Z Flip. Select your model for exact pricing or a quote.",
} as const;

export function getSamsungBrandHubPricingFaqAnswer() {
  const ranges = SAMSUNG_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${SAMSUNG_BRAND_HUB_PRICING_REFERENCE.faqQualification} Published model pricing is shown where available; otherwise the repair is Quote on Request.`;
}
