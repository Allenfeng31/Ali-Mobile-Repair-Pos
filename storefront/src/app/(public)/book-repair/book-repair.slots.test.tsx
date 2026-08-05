/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";

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
    clearCart: vi.fn(),
  }),
}));
vi.mock("@/lib/inventoryUtils", () => ({ formatDeviceTitle: (brand: string, model: string) => `${brand} ${model}` }));
vi.mock("@/lib/bookingPayload", () => ({ buildBookingPayload: vi.fn() }));
vi.mock("next/script", () => ({ default: () => null }));

import BookRepairPage from "./page";

describe("Book Repair time slots", () => {
  it("renders every 30-minute start from 09:00 through 16:30, but not 17:00", () => {
    const { container } = render(<BookRepairPage />);
    const availableDate = Array.from(container.querySelectorAll<HTMLButtonElement>(".booking-date-card"))
      .find((button) => !button.disabled);

    expect(availableDate).toBeDefined();
    fireEvent.click(availableDate!);

    for (const slot of ["09:00", "09:30", "16:00", "16:30"]) {
      expect(screen.getByRole("button", { name: slot })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: "17:00" })).not.toBeInTheDocument();
    expect(container.querySelectorAll(".booking-time-slot")).toHaveLength(16);
  });
});
