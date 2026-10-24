import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendGAEvent } = vi.hoisted(() => ({ sendGAEvent: vi.fn() }));

vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));

import {
  getRepairPageContext,
  trackRepairCtaClick,
  trackRepairPricingVisibility,
} from "./ga4RepairEvents";

beforeEach(() => vi.clearAllMocks());

describe("GA4 repair event contract", () => {
  it("derives repair context only from the supported repair URL grammar", () => {
    expect(getRepairPageContext("/repairs/phone/google-pixel/pixel-9-pro/screen-replacement")).toEqual({
      pageType: "repair_detail",
      repairBrand: "google-pixel",
      repairModel: "pixel-9-pro",
      repairType: "screen-replacement",
    });
    expect(getRepairPageContext("/blog/google-pixel-repair")).toEqual({ pageType: "other" });
  });

  it("emits only the allowlisted CTA parameters", () => {
    trackRepairCtaClick({
      pageType: "brand_hub",
      repairBrand: "Google Pixel",
      action: "call",
      placement: "hero",
      customerName: "Must not be sent",
      appointmentId: "Must not be sent",
      unexpectedAction: "Must not be sent",
    } as never);

    expect(sendGAEvent).toHaveBeenCalledWith("event", "repair_cta_click", {
      page_type: "brand_hub",
      repair_brand: "google-pixel",
      action: "call",
      placement: "hero",
    });
  });

  it("drops invalid runtime values rather than accepting arbitrary event parameters", () => {
    trackRepairCtaClick({
      pageType: "brand_hub",
      repairBrand: "iPhone",
      action: "customer-message" as never,
      placement: "visitor-provided" as never,
    });

    expect(sendGAEvent).toHaveBeenCalledWith("event", "repair_cta_click", {
      page_type: "brand_hub",
      repair_brand: "iphone",
    });
  });

  it("keeps numeric and quote visibility as distinct, non-price-bearing events", () => {
    trackRepairPricingVisibility("repair_price_view", {
      pageType: "model_hub",
      repairBrand: "Samsung",
      repairModel: "Galaxy S24",
      repairType: "screen-replacement",
      placement: "pricing",
      pricingState: "numeric",
      priceSource: "published_pos",
    });
    trackRepairPricingVisibility("repair_quote_view", {
      pageType: "repair_detail",
      repairBrand: "Samsung",
      repairModel: "Galaxy S24",
      repairType: "logic-board-repair",
      placement: "pricing",
      pricingState: "quote",
    });

    expect(sendGAEvent).toHaveBeenNthCalledWith(1, "event", "repair_price_view", {
      page_type: "model_hub",
      repair_brand: "samsung",
      repair_model: "galaxy-s24",
      repair_type: "screen-replacement",
      placement: "pricing",
      pricing_state: "numeric",
      price_source: "published_pos",
    });
    expect(sendGAEvent).toHaveBeenNthCalledWith(2, "event", "repair_quote_view", {
      page_type: "repair_detail",
      repair_brand: "samsung",
      repair_model: "galaxy-s24",
      repair_type: "logic-board-repair",
      placement: "pricing",
      pricing_state: "quote",
    });
  });
});
