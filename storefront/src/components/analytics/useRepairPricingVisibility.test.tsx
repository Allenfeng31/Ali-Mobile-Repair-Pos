import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRepairPricingVisibility, type RepairPricingVisibilityEvent } from "./useRepairPricingVisibility";

const { trackRepairPricingVisibility } = vi.hoisted(() => ({
  trackRepairPricingVisibility: vi.fn(),
}));

vi.mock("@/lib/ga4RepairEvents", () => ({
  trackRepairPricingVisibility,
}));

let observerCallback: IntersectionObserverCallback | undefined;

class TestIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = "";
  thresholds = [0.5];
}

const numericEvent: RepairPricingVisibilityEvent = {
  eventName: "repair_price_view",
  stateKey: "screen-replacement:120",
  context: {
    pageType: "model_hub",
    repairBrand: "iphone",
    repairModel: "iphone-15",
    repairType: "screen-replacement",
    placement: "pricing",
    pricingState: "numeric",
    priceSource: "published_pos",
  },
};

function Probe({ events = [numericEvent] }: { events?: readonly RepairPricingVisibilityEvent[] }) {
  const ref = useRepairPricingVisibility(events);
  return <div ref={ref}>Pricing</div>;
}

describe("useRepairPricingVisibility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    observerCallback = undefined;
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("waits for stable visible pricing and deduplicates the same state", () => {
    const { container, rerender } = render(<Probe />);
    const target = container.firstElementChild!;

    observerCallback?.([{ target, isIntersecting: true, intersectionRatio: 0.5 } as IntersectionObserverEntry], {} as IntersectionObserver);
    vi.advanceTimersByTime(249);
    expect(trackRepairPricingVisibility).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(trackRepairPricingVisibility).toHaveBeenCalledWith("repair_price_view", numericEvent.context);

    observerCallback?.([{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], {} as IntersectionObserver);
    vi.runAllTimers();
    rerender(<Probe />);
    expect(trackRepairPricingVisibility).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending event when pricing leaves view and emits a new state once", () => {
    const { container, rerender } = render(<Probe />);
    const target = container.firstElementChild!;
    observerCallback?.([{ target, isIntersecting: true, intersectionRatio: 0.5 } as IntersectionObserverEntry], {} as IntersectionObserver);
    observerCallback?.([{ target, isIntersecting: false, intersectionRatio: 0 } as IntersectionObserverEntry], {} as IntersectionObserver);
    vi.runAllTimers();
    expect(trackRepairPricingVisibility).not.toHaveBeenCalled();

    const quoteEvent: RepairPricingVisibilityEvent = {
      eventName: "repair_quote_view",
      stateKey: "battery-replacement:quote",
      context: { ...numericEvent.context, repairType: "battery-replacement", pricingState: "quote", priceSource: undefined },
    };
    rerender(<Probe events={[quoteEvent]} />);
    observerCallback?.([{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry], {} as IntersectionObserver);
    vi.advanceTimersByTime(250);
    expect(trackRepairPricingVisibility).toHaveBeenCalledWith("repair_quote_view", quoteEvent.context);
  });
});
