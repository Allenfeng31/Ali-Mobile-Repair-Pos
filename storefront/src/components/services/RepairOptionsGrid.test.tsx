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
  getModelHubWaterDamageHref: ({ category, brand, model, repairSlug }: { category: string; brand: string; model: string; repairSlug: string }) => {
    if (repairSlug !== 'water-damage-repair') return undefined;
    const path = `/repairs/${category}/${brand}/${model}/water-damage-repair`;
    return new Set([
      '/repairs/phone/iphone/iphone-17-pro-max/water-damage-repair',
      '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619/water-damage-repair',
      '/repairs/watch/apple/apple-watch-series-7-45mm/water-damage-repair',
      '/repairs/tablet/ipad/ipad-pro-13-inch-m4/water-damage-repair',
      '/repairs/laptop/macbook/macbook-air-m2-13-2022/water-damage-repair',
    ]).has(path) ? path : '/repairs/water-damage';
  },
}));
vi.mock("@/lib/virtualCameraLens", () => ({
  CAMERA_LENS_REPAIR_SLUG: "camera-lens-replacement",
  getCameraLensLandingHref: () => '/repairs/phone/google/camera-lens-replacement?model=pixel-8-pro',
}));
vi.mock("@/lib/virtualPhoneRepairs", () => ({
  getVirtualPhoneRepair: (slug: string) => slug === 'loudspeaker-replacement' ? { slug } : null,
  getVirtualPhoneRepairLandingHref: () => '/repairs/phone/google/loudspeaker-replacement?model=pixel-8-pro',
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

  it('uses a Server-resolved href without allowing client helpers to override it', () => {
    render(
      <RepairOptionsGrid
        repairTypes={[
          {
            slug: 'camera-lens-replacement',
            name: 'Camera Lens Replacement',
            price: 0,
            href: '/repairs/phone/camera-lens-replacement?brand=motorola&model=moto-g04',
          },
        ]}
        categorySlug="phone"
        brandSlug="motorola"
        modelSlug="moto-g04"
        modelName="Moto G04"
      />,
    );

    expect(screen.getByRole('link', { name: /camera lens replacement/i })).toHaveAttribute(
      'href',
      '/repairs/phone/camera-lens-replacement?brand=motorola&model=moto-g04',
    );
  });

  it.each([
    ['iPhone 17 Pro Max', 'phone', 'iphone', 'iphone-17-pro-max', '/repairs/phone/iphone/iphone-17-pro-max/water-damage-repair'],
    ['Galaxy Tab S6 Lite', 'tablet', 'samsung', 'galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619', '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619/water-damage-repair'],
    ['Apple Watch Series 7 45mm', 'watch', 'apple', 'apple-watch-series-7-45mm', '/repairs/watch/apple/apple-watch-series-7-45mm/water-damage-repair'],
    ['iPad Pro 13-inch M4', 'tablet', 'ipad', 'ipad-pro-13-inch-m4', '/repairs/tablet/ipad/ipad-pro-13-inch-m4/water-damage-repair'],
    ['MacBook Air M2 13', 'laptop', 'macbook', 'macbook-air-m2-13-2022', '/repairs/laptop/macbook/macbook-air-m2-13-2022/water-damage-repair'],
    ['Pixel 9', 'phone', 'google-pixel', 'pixel-9', '/repairs/water-damage'],
  ])('resolves the Water Damage card for %s through the model-hub resolver', (_name, categorySlug, brandSlug, modelSlug, href) => {
    render(
      <RepairOptionsGrid
        repairTypes={[{ slug: 'water-damage-repair', name: 'Water Damage', price: 0 }]}
        categorySlug={categorySlug}
        brandSlug={brandSlug}
        modelSlug={modelSlug}
        modelName={_name}
      />,
    );

    expect(screen.getByRole('link', { name: /water damage/i })).toHaveAttribute('href', href);
  });

  it('preserves an explicit Water Damage href from the server', () => {
    render(
      <RepairOptionsGrid
        repairTypes={[{
          slug: 'water-damage-repair',
          name: 'Water Damage',
          price: 0,
          href: '/repairs/water-damage',
        }]}
        categorySlug="phone"
        brandSlug="iphone"
        modelSlug="iphone-17-pro-max"
        modelName="iPhone 17 Pro Max"
      />,
    );

    expect(screen.getByRole('link', { name: /water damage/i })).toHaveAttribute('href', '/repairs/water-damage');
  });

  it('renders the Master-provided Motherboard quote label instead of a POS price', () => {
    render(
      <RepairOptionsGrid
        repairTypes={[{
          slug: 'logic-board-repair',
          name: 'Motherboard & Logic Board Repair',
          price: 499,
          priceLabel: 'Quote on Request',
          href: '/repairs/motherboard-repair?category=phone&brand=samsung&model=galaxy-s21',
        }]}
        categorySlug="phone"
        brandSlug="samsung"
        modelSlug="galaxy-s21"
        modelName="Galaxy S21"
      />,
    );

    expect(screen.getByRole('link', { name: /motherboard & logic board repair/i })).toHaveAttribute(
      'href',
      '/repairs/motherboard-repair?category=phone&brand=samsung&model=galaxy-s21',
    );
    expect(screen.getByText('Quote on Request')).toBeInTheDocument();
    expect(screen.queryByText(/499/)).not.toBeInTheDocument();
  });

  it('uses existing special route helpers only when the Server leaves unresolved repairs without href', () => {
    render(
      <RepairOptionsGrid
        repairTypes={[
          { slug: 'camera-lens-replacement', name: 'Camera Lens Replacement', price: 0 },
          { slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 0 },
          { slug: 'screen-replacement', name: 'Screen Replacement', price: 0 },
        ]}
        categorySlug="phone"
        brandSlug="google-pixel"
        modelSlug="pixel-8-pro"
        modelName="Pixel 8 Pro"
      />,
    );

    expect(screen.getByRole('link', { name: /camera lens replacement/i })).toHaveAttribute(
      'href',
      '/repairs/phone/google/camera-lens-replacement?model=pixel-8-pro',
    );
    expect(screen.getByRole('link', { name: /loudspeaker replacement/i })).toHaveAttribute(
      'href',
      '/repairs/phone/google/loudspeaker-replacement?model=pixel-8-pro',
    );
    expect(screen.getByRole('link', { name: /^screen replacement/i })).toHaveAttribute(
      'href',
      '/repairs/phone/google-pixel/pixel-8-pro/screen-replacement',
    );
  });
});
