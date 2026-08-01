/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import RepairOptionsGrid from "./RepairOptionsGrid";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/analytics", () => ({ analytics: { trackRepairView: vi.fn() } }));
vi.mock("@/lib/repairStartingPrices", () => ({ getStartingPrice: vi.fn(() => null) }));
vi.mock("@/lib/scopedRepairPriceLabel", () => ({
  formatScopedRepairPriceLabel: (_slug: string, _price: number, label: string) => label,
}));
vi.mock("@/lib/waterDamageRouting", () => ({
  getModelHubRepairHref: (_slug: string, fallback: string) => fallback,
}));
vi.mock("@/lib/virtualCameraLens", () => ({
  CAMERA_LENS_REPAIR_SLUG: "camera-lens-replacement",
  getCameraLensLandingHref: () => null,
}));
vi.mock("@/lib/virtualPhoneRepairs", () => ({
  getVirtualPhoneRepair: () => null,
  getVirtualPhoneRepairLandingHref: () => null,
}));

describe("RepairOptionsGrid", () => {
  it("renders model repair options through the centralized display order", () => {
    render(
      <RepairOptionsGrid
        repairTypes={[
          { slug: "water-damage-repair", name: "Water Damage", price: 0 },
          { slug: "keyboard-repair", name: "Keyboard Repair", price: 0 },
          { slug: "power-button-replacement", name: "Power Button", price: 0 },
          { slug: "battery-replacement", name: "Battery", price: 0 },
          { slug: "screen-replacement", name: "Screen", price: 0 },
        ]}
        categorySlug="phone"
        brandSlug="samsung"
        modelSlug="galaxy-s24"
        modelName="Galaxy S24"
      />
    );

    expect(screen.getAllByRole("link").map((link) =>
      link.querySelector(".repair-option-name")?.textContent
    )).toEqual(["Screen", "Battery", "Water Damage", "Power Button", "Keyboard Repair"]);
  });

  it('keeps the configured Apple Watch card on the charging-repair route with a visible diagnostic label', () => {
    render(
      <RepairOptionsGrid
        repairTypes={[
          { slug: 'charging-repair', name: 'Charging Repair', price: 0, sourceType: 'diagnostic' },
        ]}
        categorySlug="watch"
        brandSlug="apple"
        modelSlug="apple-watch-series-3-38mm"
        modelName="Apple Watch Series 3 38mm"
      />,
    );

    expect(screen.getByRole('link', { name: /charging repair/i })).toHaveAttribute(
      'href',
      '/repairs/watch/apple/apple-watch-series-3-38mm/charging-repair',
    );
    expect(screen.getByText('Final quote depends on the confirmed fault, parts and device condition.')).toBeInTheDocument();
  });
});
