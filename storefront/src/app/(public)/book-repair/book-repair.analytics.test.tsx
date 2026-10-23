/** @vitest-environment jsdom */
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendGAEvent, clearCart, cart } = vi.hoisted(() => ({
  sendGAEvent: vi.fn(),
  clearCart: vi.fn(),
  cart: {
    current: {
      devices: [{ isConfirmed: true, category: "phone", brand: "Google Pixel", model: "Pixel 10 Pro XL", services: [{ id: 1, name: "Charging Port Replacement", price: 120 }] }],
      totalPrice: 120,
      subtotalPrice: 120,
      discountRate: 0,
      discountAmount: 0,
      qualifyingRepairItemCount: 1,
      hasConfirmedDevices: true,
      hasCustomQuote: false,
    },
  },
}));

let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | undefined;

vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));
vi.mock("@/components/GlobalRepairCart", () => ({ default: () => null }));
vi.mock("@/components/RingwoodSquareLocationMap", () => ({ default: () => null }));
vi.mock("@/context/CartContext", () => ({
  formatOtherRepairServiceName: () => "Other repair",
  isOtherRepairService: () => false,
  useCart: () => ({ ...cart.current, clearCart }),
}));
vi.mock("@/lib/inventoryUtils", () => ({ formatDeviceTitle: (brand: string, model: string) => `${brand} ${model}` }));
vi.mock("@/lib/bookingPayload", () => ({ buildBookingPayload: (input: object) => input }));
vi.mock("@/lib/bookingCalendar", async () => {
  const actual = await vi.importActual<typeof import("@/lib/bookingCalendar")>("@/lib/bookingCalendar");
  return { ...actual, getMelbourneBookingCalendarDate: () => "2026-10-02" };
});
vi.mock("next/script", () => ({ default: () => null }));

import BookRepairPage from "./page";

function restoreNumericCart() {
  cart.current = {
    devices: [{ isConfirmed: true, category: "phone", brand: "Google Pixel", model: "Pixel 10 Pro XL", services: [{ id: 1, name: "Charging Port Replacement", price: 120 }] }],
    totalPrice: 120,
    subtotalPrice: 120,
    discountRate: 0,
    discountAmount: 0,
    qualifyingRepairItemCount: 1,
    hasConfirmedDevices: true,
    hasCustomQuote: false,
  };
}

function triggerPriceVisibility(isIntersecting: boolean) {
  act(() => {
    observerCallback?.([{ isIntersecting } as IntersectionObserverEntry]);
    vi.advanceTimersByTime(250);
  });
}

function openConfirmationDialog() {
  fireEvent.click(screen.getByRole("button", { name: /Fri.*2.*Oct/i }));
  fireEvent.click(screen.getByRole("button", { name: "12:30" }));
  fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "Taylor" } });
  fireEvent.change(screen.getByPlaceholderText("04xx xxx xxx"), { target: { value: "0400000000" } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm Appointment" }));
}

beforeEach(() => {
  restoreNumericCart();
  observerCallback = undefined;
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("BookRepairPage GA4 funnel", () => {
  it("does not count an empty or quote-only cart as a price view", () => {
    cart.current = { ...cart.current, devices: [], totalPrice: 0, subtotalPrice: 0, qualifyingRepairItemCount: 0, hasConfirmedDevices: false };
    render(<BookRepairPage />);
    expect(sendGAEvent).not.toHaveBeenCalled();

    cart.current = { ...cart.current, devices: [{ isConfirmed: true, category: "phone", brand: "Samsung", model: "Galaxy S21", services: [{ id: 1, name: "Logic Board Repair", price: 0 }] }], hasConfirmedDevices: true, hasCustomQuote: true };
    render(<BookRepairPage />);
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("records one visible numeric repair estimate after it remains in view", () => {
    const view = render(<BookRepairPage />);
    expect(sendGAEvent).not.toHaveBeenCalled();

    triggerPriceVisibility(true);
    expect(sendGAEvent).toHaveBeenCalledTimes(1);

    view.rerender(<BookRepairPage />);
    triggerPriceVisibility(true);
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "booking_price_view", {
      estimated_total: 120,
      priced_repair_count: 1,
    });

    triggerPriceVisibility(true);
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
  });

  it("does not count an off-screen numeric estimate", () => {
    render(<BookRepairPage />);
    triggerPriceVisibility(false);
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("does not count opening the confirmation dialog as a booking success", () => {
    render(<BookRepairPage />);
    openConfirmationDialog();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("does not count form validation failures as a booking success", () => {
    render(<BookRepairPage />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm Appointment" }));
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it.each([
    ["HTTP failure", { ok: false, json: async () => ({}) }],
    ["invalid JSON", { ok: true, json: async () => { throw new Error("invalid JSON"); } }],
  ])("does not count a %s as a booking success", async (_label, response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
    vi.stubGlobal("alert", vi.fn());
    render(<BookRepairPage />);
    openConfirmationDialog();
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Book" }));

    await act(async () => {});
    expect(sendGAEvent).not.toHaveBeenCalledWith("event", "booking_submit_success");
    expect(screen.queryByRole("heading", { name: "Booking Confirmed" })).not.toBeInTheDocument();
  });

  it("does not count failed booking responses as a booking success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }));
    vi.stubGlobal("alert", vi.fn());
    render(<BookRepairPage />);
    openConfirmationDialog();
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Book" }));

    await act(async () => {});
    expect(sendGAEvent).not.toHaveBeenCalledWith("event", "booking_submit_success");
    expect(screen.queryByRole("heading", { name: "Booking Confirmed" })).not.toBeInTheDocument();
  });

  it("counts exactly one verified booking creation without sending customer data", async () => {
    let resolveBooking: ((value: Response) => void) | undefined;
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise<Response>((resolve) => { resolveBooking = resolve; })));
    render(<BookRepairPage />);
    openConfirmationDialog();

    const confirmButton = screen.getByRole("button", { name: "Confirm & Book" });
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveBooking?.(new Response(JSON.stringify({ success: true, appointment: { id: "appointment-1", datetime: "2026-10-02T02:30:00.000Z" } }), { status: 200 }));
      await Promise.resolve();
    });

    expect(screen.getByRole("heading", { name: "Booking Confirmed" })).toBeInTheDocument();
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "booking_submit_success");
  });
});
