export const GOOGLE_PIXEL_BRAND_HUB_PRICING_REFERENCE = {
  reviewDate: "2026-10-16",
  status: "owner-reviewed",
  rows: [
    { service: "Screen Replacement", range: "AUD $129–$450" },
    { service: "Battery Replacement", range: "AUD $65–$179" },
    { service: "Charging Port Repair", range: "AUD $65–$179" },
  ],
  qualification:
    "Indicative AUD prices for supported Google Pixel models, including Pixel Fold. Prices vary by model and repair options. Select your model for exact pricing or a quote.",
} as const;

export function getGooglePixelBrandHubPricingFaqAnswer() {
  const ranges = GOOGLE_PIXEL_BRAND_HUB_PRICING_REFERENCE.rows
    .map(({ service, range }) => `${service}: ${range}`)
    .join("; ");

  return `${ranges}. ${GOOGLE_PIXEL_BRAND_HUB_PRICING_REFERENCE.qualification} Published model pricing is shown where available; otherwise the repair is Quote on Request.`;
}
