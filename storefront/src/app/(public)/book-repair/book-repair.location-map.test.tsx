/** @vitest-environment jsdom */
/* eslint-disable @next/next/no-img-element */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const clearCart = vi.fn();

vi.mock("@/components/GlobalRepairCart", () => ({ default: () => null }));
vi.mock("@/context/CartContext", () => ({
  formatOtherRepairServiceName: () => "Other repair",
  isOtherRepairService: () => false,
  useCart: () => ({
    devices: [{ isConfirmed: true, category: "phone", brand: "Apple", model: "iPhone", services: [] }],
    totalPrice: 100,
    subtotalPrice: 100,
    discountRate: 0,
    discountAmount: 0,
    qualifyingRepairItemCount: 1,
    hasConfirmedDevices: true,
    hasCustomQuote: false,
    clearCart,
  }),
}));
vi.mock("@/lib/inventoryUtils", () => ({ formatDeviceTitle: (brand: string, model: string) => `${brand} ${model}` }));
vi.mock("@/lib/bookingPayload", () => ({ buildBookingPayload: (input: object) => input }));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={typeof src === "string" ? src : undefined} alt={alt} {...props} />
  ),
}));

import BookRepairPage from "./page";

afterEach(() => {
  vi.unstubAllGlobals();
  clearCart.mockReset();
});

describe("BookRepairPage location map", () => {
  it("shows the shared map only after a booking succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    render(<BookRepairPage />);

    expect(screen.queryByRole("heading", { name: "How to find us" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "Taylor" } });
    fireEvent.change(screen.getByPlaceholderText("04xx xxx xxx"), { target: { value: "0400000000" } });
    const availableDate = Array.from(document.querySelectorAll<HTMLButtonElement>(".booking-date-card"))
      .find((button) => !button.disabled);
    fireEvent.click(availableDate!);
    fireEvent.click(screen.getByRole("button", { name: "09:00" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm Appointment" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm & Book" }));

    expect(await screen.findByRole("heading", { name: "Booking Confirmed" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How to find us" })).toBeInTheDocument();
    expect(screen.getByAltText("Ali Mobile & Repair location map inside Ringwood Square Shopping Centre showing Coles and Bunnings entrances")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open location map" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open full-size centre map" })).not.toBeInTheDocument();
  });
});
